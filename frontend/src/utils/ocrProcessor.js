import { createWorker } from 'tesseract.js';

/**
 * Extracts raw text from an image file using Tesseract OCR
 * and parses domain-specific forensic entities (Chats, Bank, Telecom).
 * 
 * @param {File} file - Image file object uploaded by user
 * @returns {Promise<Object>} Extracted raw text and structured data payloads
 */
export async function processImageFile(file) {
  try {
    const worker = await createWorker('eng');
    const imageUrl = URL.createObjectURL(file);
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    // Extract domain-specific structured metadata from the raw OCR string
    const structuredData = parseForensicEntities(text);

    return {
      raw_text: text,
      structured: structuredData
    };
  } catch (error) {
    console.error('OCR Processing Failed:', error);
    return {
      raw_text: '',
      structured: { chats: [], bankDetails: [], telecomDetails: [] }
    };
  }
}

/**
 * Parses raw OCR text to extract structured details across Chat, Bank, and Telecom domains.
 */
function parseForensicEntities(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  // --- 1. TELECOM & PHONE PATTERNS ---
  const phoneRegex = /(?:\+91|0)?[6-9]\d{9}/g;
  const imeiRegex = /\b\d{15}\b/g;
  const telecomDetails = {
    phoneNumbers: [...new Set(text.match(phoneRegex) || [])],
    imeiNumbers: [...new Set(text.match(imeiRegex) || [])]
  };

  // --- 2. BANK & FINANCIAL PATTERNS ---
  const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}/g;
  const accountRegex = /\b\d{9,18}\b/g;
  const ifscRegex = /[A-Z]{4}0[A-Z0-9]{6}/g;
  const amountRegex = /(?:Rs\.?|INR|₹)\s?[\d,]+(?:\.\d{2})?/gi;

  const bankDetails = {
    vpas: [...new Set(text.match(upiRegex) || [])],
    accountNumbers: [...new Set(text.match(accountRegex) || [])],
    ifscCodes: [...new Set(text.match(ifscRegex) || [])],
    amounts: [...new Set(text.match(amountRegex) || [])]
  };

  // --- 3. CHAT LOG & SCREENSHOT PATTERNS ---
  // Detects timestamps like [10:45 AM], 14:30, or 09:15:20
  const timeRegex = /(?:\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?)/;
  const chats = [];

  lines.forEach((line) => {
    const timeMatch = line.match(timeRegex);
    if (timeMatch) {
      // Splits line into Speaker and Message content if standard chat layout (e.g., "John: Hey, send money")
      const chatParts = line.split(':');
      chats.push({
        timestamp: timeMatch[0],
        rawMessage: line,
        sender: chatParts.length > 2 ? chatParts[0].replace(timeMatch[0], '').trim() : 'UNKNOWN'
      });
    }
  });

  return {
    chats,
    bankDetails,
    telecomDetails
  };
}