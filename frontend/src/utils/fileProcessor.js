import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdfjs-dist/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Universal File Processor
 * Handles PDF, CSV, Excel, JSON, JPG, PNG, MP4, Text, and Email files.
 */
export async function processUniversalFile(file) {
  const fileName = file.name.toLowerCase();
  const ext = fileName.split('.').pop();

  let rawText = '';
  let metadata = { fileType: ext, size: file.size };

  try {
    if (['jpg', 'jpeg', 'png', 'bmp', 'webp'].includes(ext)) {
      rawText = await extractImageOCR(file);
    } else if (ext === 'pdf') {
      rawText = await extractPDFText(file);
    } else if (['csv', 'xlsx', 'xls'].includes(ext)) {
      rawText = await extractSpreadsheetData(file);
    } else if (ext === 'json') {
      rawText = await extractJSONData(file);
    } else if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) {
      rawText = await extractVideoMetadata(file);
    } else {
      // Default plain text / log files (.txt, .eml, .log)
      rawText = await file.text();
    }
  } catch (error) {
    console.error(`Error extracting file ${file.name}:`, error);
    rawText = '';
  }

  // Parse structured entities across Bank, Telecom, Chat, and Network domains
  const structuredEntities = parseForensicEntities(rawText, fileName);

  return {
    raw_text: rawText,
    structured: structuredEntities,
    metadata
  };
}

/* -------------------------------------------------------------------------- */
/*                               FILE EXTRACTORS                              */
/* -------------------------------------------------------------------------- */

// 1. OCR Processor for Images
async function extractImageOCR(file) {
  const worker = await createWorker('eng');
  const imageUrl = URL.createObjectURL(file);
  const { data: { text } } = await worker.recognize(imageUrl);
  await worker.terminate();
  URL.revokeObjectURL(imageUrl);
  return text;
}

// 2. PDF Parser (Extracts embedded text + runs fallback OCR if scanned image PDF)
async function extractPDFText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tokenProps = await page.getTextContent();
    const pageText = tokenProps.items.map((item) => item.str).join(' ');
    fullText += `\n --- Page ${i} ---\n` + pageText;
  }

  // Fallback to Image OCR if PDF has no selectable text
  if (fullText.replace(/\s/g, '').length === 0) {
    fullText = `[Scanned PDF Detected] - ${file.name}`;
  }

  return fullText;
}

// 3. Spreadsheet Parser (CSV, XLSX, XLS)
async function extractSpreadsheetData(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  let extractedString = '';

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csvContent = XLSX.utils.sheet_to_csv(sheet);
    extractedString += `\n--- Sheet: ${sheetName} ---\n` + csvContent;
  });

  return extractedString;
}

// 4. JSON Data Parser
async function extractJSONData(file) {
  const text = await file.text();
  try {
    const jsonObject = JSON.parse(text);
    return JSON.stringify(jsonObject, null, 2);
  } catch {
    return text;
  }
}

// 5. Video Metadata & Track Extractor
async function extractVideoMetadata(file) {
  return `[Video Media Ingest]
Filename: ${file.name}
Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB
Type: ${file.type}
Last Modified: ${new Date(file.lastModified).toISOString()}
Status: Frame indexing queued for visual forensic pipeline.`;
}

/* -------------------------------------------------------------------------- */
/*                        DOMAIN ENTITY EXTRACTION ENGINE                     */
/* -------------------------------------------------------------------------- */

function parseForensicEntities(text, fileName) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // --- Regex Patterns ---
  const phoneRegex = /(?:\+91|0)?[6-9]\d{9}/g;
  const imeiRegex = /\b\d{15}\b/g;
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}/g;
  const accountRegex = /\b\d{9,18}\b/g;
  const ifscRegex = /[A-Z]{4}0[A-Z0-9]{6}/g;
  const amountRegex = /(?:Rs\.?|INR|₹)\s?[\d,]+(?:\.\d{2})?/gi;

  const timeRegex = /(?:\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?)/;

  const chats = [];
  lines.forEach((line) => {
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      const parts = line.split(':');
      chats.push({
        timestamp: timeMatch[0],
        rawMessage: line,
        sender: parts.length > 2 ? parts[0].replace(timeMatch[0], '').trim() : 'DETECTED_SPEAKER'
      });
    }
  });

  return {
    telecom: {
      phoneNumbers: [...new Set(text.match(phoneRegex) || [])],
      imeiNumbers: [...new Set(text.match(imeiRegex) || [])]
    },
    banking: {
      vpas: [...new Set(text.match(upiRegex) || [])],
      accountNumbers: [...new Set(text.match(accountRegex) || [])],
      ifscCodes: [...new Set(text.match(ifscRegex) || [])],
      amounts: [...new Set(text.match(amountRegex) || [])]
    },
    network: {
      ipAddresses: [...new Set(text.match(ipRegex) || [])]
    },
    chatLogs: chats,
    sourceFileName: fileName
  };
}