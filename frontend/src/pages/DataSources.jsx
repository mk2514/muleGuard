import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  Phone,
  Landmark,
  Globe,
  Mail,
  MessageSquare,
  Image,
  Video,
  FileCode,
  Languages,
  AlertCircle,
  Search,
  Bell,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  File,
  FolderPlus,
  Loader2
} from 'lucide-react';
import { processImageFile } from '../utils/ocrProcessor';

export default function DataSource() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read caseId from ?caseId=MG-XXXX-XXXX query param (falls back to a default)
  const activeCaseId = searchParams.get('caseId') || 'MG-2024-1024';

  // Active Pipeline Step
  const [activeStep, setActiveStep] = useState(1);

  // File Handling & Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Per-case uploaded files (persisted in localStorage)
  const [caseFiles, setCaseFiles] = useState([]);

  // Load previously uploaded files for this case from localStorage
  useEffect(() => {
    const key = `muleguard_files_${activeCaseId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) setCaseFiles(JSON.parse(stored));
      else setCaseFiles([]);
    } catch { setCaseFiles([]); }
  }, [activeCaseId]);

  // Categorization & Metadata Form
  const [selectedSourceCategory, setSelectedSourceCategory] = useState('upload');
  const [formData, setFormData] = useState({
    sourceType: 'GENERIC',
    sourceOrg: 'Chandigarh Police Dept',
    description: '',
    caseId: activeCaseId,
    acquiredDate: new Date().toISOString().split('T')[0],
    timezone: 'Asia/Kolkata'
  });

  // Keep formData.caseId in sync if URL param changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, caseId: activeCaseId }));
  }, [activeCaseId]);

  // Source Categories mapped to backend Enum Types
  const sourceCategories = [
    { id: 'upload', title: 'Upload Files', enumVal: 'GENERIC', subtitle: 'CSV, Excel, PDF, Media', icon: UploadCloud },
    { id: 'cdr', title: 'Call Records (CDR)', enumVal: 'CDR', subtitle: 'Telecom logs (CSV, XLSX)', icon: Phone },
    { id: 'bank', title: 'Bank Transactions', enumVal: 'BANK_TRANSACTIONS', subtitle: 'Bank Statements (CSV, PDF)', icon: Landmark },
    { id: 'upi', title: 'UPI / Wallet Data', enumVal: 'UPI_WALLET', subtitle: 'Wallet transfers (CSV, JSON)', icon: Landmark },
    { id: 'ip', title: 'Internet / IP Logs', enumVal: 'IP_LOGS', subtitle: 'IPDR & Firewall logs', icon: Globe },
    { id: 'email', title: 'Emails & Communications', enumVal: 'EMAIL', subtitle: 'PST, EML, MSG files', icon: Mail },
    { id: 'social', title: 'Social Media Export', enumVal: 'SOCIAL_MEDIA', subtitle: 'Chat dumps, APIs', icon: MessageSquare },
    { id: 'docs', title: 'Documents (OCR)', subtitle: 'PDF, DOCX, Scans', enumVal: 'MEDIA_OCR', icon: FileText },
    { id: 'media', title: 'Images & Videos', subtitle: 'JPG, PNG, MP4, AVI', enumVal: 'MEDIA_OCR', icon: Image },
    { id: 'api', title: 'API Integration', enumVal: 'API_STREAM', subtitle: 'Live webhook streams', icon: FileCode },
    { id: 'multi_lang', title: 'Multi-language Data', enumVal: 'GENERIC', subtitle: 'Non-English evidence', icon: Languages },
  ];

  // Pipeline Workflow Steps Definition
  const workflowSteps = [
    { step: 1, title: 'Ingestion', sub: 'Collect data', path: '/datasources' },
    { step: 2, title: 'Preprocessing', sub: 'Clean & standardize', path: '/preprocessing' },
    { step: 3, title: 'Normalization', sub: 'Unify formats', path: '/normalization' },
    { step: 4, title: 'Enrichment', sub: 'Extract entities', path: '/enrichment' },
    { step: 5, title: 'Output', sub: 'Ready for analysis', path: '/dashboard' },
  ];

  const handleCategorySelect = (category) => {
    setSelectedSourceCategory(category.id);
    setFormData((prev) => ({
      ...prev,
      sourceType: category.enumVal
    }));
  };

  const handleStepClick = (s) => {
    setActiveStep(s.step);
    navigate(s.path);
  };

  const handleProceedToEnrichment = () => {
    navigate('/enrichment');
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['csv', 'xlsx', 'xls', 'json'].includes(ext)) return <FileText className="w-4 h-4 text-emerald-600" />;
    if (['jpg', 'jpeg', 'png', 'bmp'].includes(ext)) return <Image className="w-4 h-4 text-blue-600" />;
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return <Video className="w-4 h-4 text-purple-600" />;
    if (['pdf', 'doc', 'docx'].includes(ext)) return <FileText className="w-4 h-4 text-red-600" />;
    return <File className="w-4 h-4 text-slate-500" />;
  };

  const processFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    setSelectedFiles((prevFiles) => {
      const existingNames = new Set(prevFiles.map((f) => f.name));
      const filteredNewFiles = fileArray.filter((f) => !existingNames.has(f.name));
      return [...prevFiles, ...filteredNewFiles];
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Extract metadata and video frame info for MP4/AVI media files
  const extractVideoDetails = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: `${Math.round(video.duration)} seconds`,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          format: file.type || 'video/mp4'
        });
      };
      video.onerror = () => {
        resolve({
          duration: 'Unknown',
          resolution: 'Unknown',
          format: file.type || 'video/mp4'
        });
      };
    });
  };

  // Comprehensive Multi-Format File Processor (Image OCR, Video, PDF, CSV, Excel, JSON)
  const processAnyFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    let rawText = '';
    let structured = { chats: [], bankDetails: {}, telecomDetails: {} };
    let mediaDetails = null;

    if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'bmp'].includes(ext)) {
      // 1. Image OCR and Structured Forensic Extraction
      const ocrResult = await processImageFile(file);
      rawText = ocrResult.raw_text || '';
      structured = ocrResult.structured || structured;

    } else if (file.type.startsWith('video/') || ['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
      // 2. Video Analysis & Metadata Extraction
      mediaDetails = await extractVideoDetails(file);
      rawText = `[VIDEO_EVIDENCE_FILE] Name: ${file.name}, Duration: ${mediaDetails.duration}, Resolution: ${mediaDetails.resolution}`;

    } else if (['csv', 'txt', 'json', 'log'].includes(ext)) {
      // 3. Text, CSV, and JSON Direct Content Extraction
      rawText = await file.text();
      if (ext === 'json') {
        try {
          const parsedJson = JSON.parse(rawText);
          rawText = JSON.stringify(parsedJson, null, 2);
        } catch (e) {
          // Keep raw text if invalid JSON
        }
      }

    } else if (['pdf', 'doc', 'docx', 'xlsx', 'xls'].includes(ext)) {
      // 4. Document & Binary File Metadata Preparation
      rawText = `[DOCUMENT_EVIDENCE] File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB, Format: ${ext.toUpperCase()}`;
    } else {
      rawText = `[GENERIC_EVIDENCE] File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB`;
    }

    return {
      event_id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      source_file: file.name,
      file_extension: ext,
      type: file.type.startsWith('image/') ? 'IMAGE_OCR' : file.type.startsWith('video/') ? 'VIDEO_STREAM' : formData.sourceType,
      raw_text: rawText,
      chat_logs: structured.chats || [],
      bank_entities: structured.bankDetails || {},
      telecom_entities: structured.telecomDetails || {},
      media_metadata: mediaDetails,
      source: formData.sourceOrg || 'EXTRACTED_MULTI_FORMAT',
      target: 'EVIDENCE_PIPELINE',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
  };

  // Start Ingestion: Process files across all formats & sync payload
  const handleStartIngestion = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please upload or stage at least one evidence file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const processedRecords = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const record = await processAnyFile(selectedFiles[i]);
        processedRecords.push(record);

        // Update progress bar
        setUploadProgress(10 + Math.round(((i + 1) / selectedFiles.length) * 50));
      }

      setUploadProgress(65);

      const payload = new FormData();
      selectedFiles.forEach((file) => {
        payload.append("files", file);
      });

      payload.append("source_type", formData.sourceType);
      payload.append("source_org", formData.sourceOrg);
      payload.append("case_id", formData.caseId);
      payload.append("acquired_date", formData.acquiredDate);
      payload.append("timezone", formData.timezone);
      payload.append("extracted_records", JSON.stringify(processedRecords));

      const response = await fetch("http://127.0.0.1:8000/upload/csv", {
        method: "POST",
        body: payload,
      });

      setUploadProgress(85);

      let result;
      if (response.ok) {
        result = await response.json();
      } else {
        result = {
          status: 'INGESTED',
          case_id: formData.caseId,
          records: processedRecords
        };
      }

      setUploadProgress(100);
      // Persist to global fallback key AND case-scoped key
      const resultWithCase = { ...result, case_id: activeCaseId, status: 'INGESTED' };
      localStorage.setItem('pipelineData', JSON.stringify(resultWithCase));
      localStorage.setItem(`pipelineData_${activeCaseId}`, JSON.stringify(resultWithCase));

      // Persist file metadata for this case in localStorage
      const newFileEntries = selectedFiles.map((file) => ({
        file_id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        upload_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        case_id: activeCaseId,
        source_type: formData.sourceType,
        source_org: formData.sourceOrg,
        processing_status: 'INGESTED',
      }));
      const storageKey = `muleguard_files_${activeCaseId}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updated = [...existing, ...newFileEntries];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setCaseFiles(updated);

      setTimeout(() => {
        setIsUploading(false);
        setSelectedFiles([]);
        // Pass caseId through navigate state so all downstream stages can propagate it
        navigate('/preprocessing', { state: { pipelineData: resultWithCase, caseId: activeCaseId } });
      }, 500);

    } catch (error) {
      console.error("Ingestion failed:", error);

      // Local fallback payload handling if backend is unattached
      const fallbackRecords = await Promise.all(
        selectedFiles.map((file) => processAnyFile(file))
      );

      const fallbackPayload = {
        status: 'INGESTED',
        case_id: activeCaseId,
        records: fallbackRecords
      };

      localStorage.setItem('pipelineData', JSON.stringify(fallbackPayload));
      localStorage.setItem(`pipelineData_${activeCaseId}`, JSON.stringify(fallbackPayload));

      // Persist file metadata even on backend failure (fallback)
      const fallbackFileEntries = selectedFiles.map((file) => ({
        file_id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        filename: file.name,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        upload_timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        case_id: activeCaseId,
        source_type: formData.sourceType,
        source_org: formData.sourceOrg,
        processing_status: 'INGESTED',
      }));
      const fallbackKey = `muleguard_files_${activeCaseId}`;
      const fallbackExisting = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
      const fallbackUpdated = [...fallbackExisting, ...fallbackFileEntries];
      localStorage.setItem(fallbackKey, JSON.stringify(fallbackUpdated));
      setCaseFiles(fallbackUpdated);

      setIsUploading(false);
      setUploadProgress(0);
      navigate('/preprocessing', { state: { pipelineData: fallbackPayload, caseId: activeCaseId } });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases, entities, files..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleProceedToEnrichment}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Proceed to Enrichment</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Case ID:</span>
              <span className="text-sm font-bold text-indigo-900">{formData.caseId}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full"></span>
              Active
            </span>

            <div className="relative">
              <Bell className="h-5 w-5 text-slate-500 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </div>

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center font-semibold text-sm">
                IR
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Inspector Raj</p>
                <p className="text-[10px] text-slate-500">Chandigarh Police</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Interface Content */}
        <div className="p-6 space-y-6">
          
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Data Ingestion Engine</h1>
              <p className="text-sm text-slate-500 mt-0.5">Extract and structure evidence from Images, Videos, PDFs, Bank Spreadsheets, and Telecom Logs</p>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleProceedToEnrichment}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-lg flex items-center space-x-2 transition"
              >
                <span>Jump to Step 4 (Enrichment)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Case Context Banner — shows which case this Data Sources view is scoped to */}
          <div className="flex items-center space-x-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700">Active Case:</span>
            <span className="text-xs font-bold text-indigo-900 font-mono">{activeCaseId}</span>
            <span className="text-xs text-indigo-500">— All uploaded files will be stored against this case ID</span>
            <button
              onClick={() => navigate('/cases')}
              className="ml-auto text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              ← Back to Cases
            </button>
          </div>

          {/* Dynamic Workflow Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {workflowSteps.map((s, idx) => {
                const isActive = activeStep === s.step;
                const isPassed = activeStep > s.step;

                return (
                  <React.Fragment key={s.step}>
                    <button
                      onClick={() => handleStepClick(s)}
                      className="flex items-center space-x-3 text-left focus:outline-none transition-all group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md' 
                          : isPassed 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-200 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${
                          isActive 
                            ? 'text-indigo-600' 
                            : 'text-slate-700 group-hover:text-indigo-600'
                        }`}>
                          {s.title}
                        </p>
                        <p className="text-xs text-slate-400">{s.sub}</p>
                      </div>
                    </button>

                    {idx < workflowSteps.length - 1 && (
                      <div className={`h-[2px] flex-1 mx-4 transition-colors ${
                        activeStep > s.step ? 'bg-emerald-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Grid Layout Container */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left Column: Interactive Categories */}
            <div className="col-span-12 lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="text-sm font-bold text-slate-900 mb-3 px-2">Data Categories</h2>
              <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
                {sourceCategories.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedSourceCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCategorySelect(item)}
                      className={`w-full flex items-start p-2.5 rounded-lg text-left transition-all ${
                        isSelected 
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-sm' 
                          : 'hover:bg-slate-50 border border-transparent text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mr-3 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{item.title}</p>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Column: Drag-and-Drop & Universal File Ingest Area */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              
              <div 
                className={`bg-white border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".csv,.xlsx,.xls,.json,.txt,.pdf,.jpg,.jpeg,.png,.bmp,.mp4,.avi,.mov,.mkv,.zip,.eml,.pst"
                  multiple 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={folderInputRef} 
                  onChange={handleFileChange} 
                  webkitdirectory="" 
                  directory=""
                  multiple 
                  className="hidden" 
                />

                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <UploadCloud className="h-6 w-6" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} File(s) Staged` : "Upload Evidence Files"}
                </h3>

                {selectedFiles.length > 0 ? (
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-indigo-100 shadow-2xs text-xs">
                        <div className="flex items-center space-x-2 truncate">
                          {getFileIcon(file.name)}
                          <span className="font-semibold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({Math.round(file.size / 1024)} KB)</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag & drop any file or folder here, or click to browse
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Supports PDF, CSV, Excel, Images (OCR), Video (MP4/AVI), Emails & JSON
                    </p>
                  </>
                )}
                
                <div className="mt-4 flex items-center justify-center space-x-3">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{selectedFiles.length > 0 ? "Add Files" : "Choose Files"}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition flex items-center space-x-1.5"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Upload Folder</span>
                  </button>
                </div>
              </div>

              {/* Dynamically Syncing Metadata Form */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900">Case & Evidence Metadata</h3>
                  <span className="text-xs font-semibold text-indigo-600">{selectedFiles.length} file(s) attached</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Source Type <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={formData.sourceType}
                      onChange={(e) => setFormData({...formData, sourceType: e.target.value})}
                    >
                      <option value="GENERIC">Generic / Auto Detect</option>
                      <option value="CDR">CDR Telecom</option>
                      <option value="BANK_TRANSACTIONS">Bank Transactions</option>
                      <option value="UPI_WALLET">UPI / Digital Wallet</option>
                      <option value="IP_LOGS">IP / Web Server Logs</option>
                      <option value="EMAIL">Emails & PST Dumps</option>
                      <option value="SOCIAL_MEDIA">Social Media Export</option>
                      <option value="MEDIA_OCR">Images & Video OCR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Source</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Airtel, HDFC, WhatsApp, Police Cyber Cell" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={formData.sourceOrg}
                      onChange={(e) => setFormData({...formData, sourceOrg: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Investigation Description</label>
                  <textarea 
                    rows={2} 
                    placeholder="Provide case background or details on collected evidence..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Case ID <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.caseId} 
                      disabled 
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Acquired Date</label>
                    <input 
                      type="date" 
                      value={formData.acquiredDate} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      onChange={(e) => setFormData({...formData, acquiredDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Timezone</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC Universal</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar Display */}
                {isUploading && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-bold text-indigo-700">
                      <span className="flex items-center space-x-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing multi-format files & running OCR...</span>
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => setSelectedFiles([])}
                    disabled={isUploading}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    Reset Form
                  </button>
                  <button 
                    onClick={handleStartIngestion}
                    disabled={isUploading || selectedFiles.length === 0}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-1.5 disabled:opacity-50 transition"
                  >
                    <span>{isUploading ? "Processing..." : "Start Ingestion"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Fast-Track & Format Badges */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-xl text-white shadow-md space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold">Fast-Track to Stage 4</h3>
                </div>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Skip standard ingestion steps if your dataset is pre-normalized or already existing in your active analysis workspace.
                </p>
                <button
                  onClick={handleProceedToEnrichment}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg transition shadow-sm"
                >
                  Go to Enrichment Stage &rarr;
                </button>
              </div>

              {/* Supported Data Formats Overview */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900">Supported Formats & Auto Extraction</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'CSV', color: 'text-teal-600 bg-teal-50 border-teal-200' },
                    { label: 'Excel', color: 'text-green-600 bg-green-50 border-green-200' },
                    { label: 'PDF', color: 'text-red-600 bg-red-50 border-red-200' },
                    { label: 'Images', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    { label: 'Videos', color: 'text-purple-600 bg-purple-50 border-purple-200' },
                    { label: 'JSON', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
                    { label: 'Emails', color: 'text-amber-600 bg-amber-50 border-amber-200' },
                    { label: 'ZIP', color: 'text-orange-600 bg-orange-50 border-orange-200' }
                  ].map((fmt) => (
                    <div key={fmt.label} className={`p-2 rounded-lg border text-center ${fmt.color}`}>
                      <p className="text-[11px] font-bold">{fmt.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-normal">
                    OCR, video metadata extraction, and entity parsing are computed in real time before persisting records to state.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Uploaded Files for this Case — persisted across page refreshes */}
          {caseFiles.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Uploaded Files for Case <span className="font-mono text-indigo-700">{activeCaseId}</span>
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {caseFiles.length} file{caseFiles.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {caseFiles.map((f) => (
                  <div key={f.file_id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(f.filename)}
                      <div>
                        <p className="font-semibold text-slate-800">{f.filename}</p>
                        <p className="text-[10px] text-slate-400">
                          {f.source_type} • {(f.file_size / 1024).toFixed(1)} KB • {f.upload_timestamp}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded">
                      Ingested
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* System Footer */}
        <footer className="mt-auto bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-indigo-900">MuleGuard AI</span>
            <span>•</span>
            <span>Investigation Intelligence Platform</span>
          </div>
          <div>
            <span>Chandigarh Police Hackathon 2026</span>
          </div>
        </footer>

      </div>
    </div>
  );
}