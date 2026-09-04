import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CheckCircle2
} from 'lucide-react';

export default function DataSource() {
  const navigate = useNavigate();

  // Active Pipeline Step Track (1: Ingestion, 2: Preprocessing, 3: Normalization, 4: Enrichment, 5: Output)
  const [activeStep, setActiveStep] = useState(1);

  // File Handling & Backend State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Active Category & Metadata Form State
  const [selectedSource, setSelectedSource] = useState('Call Records (CDR)');
  const [formData, setFormData] = useState({
    sourceType: 'CDR',
    sourceOrg: 'Airtel',
    description: '',
    caseId: 'MG-2024-1024',
    acquiredDate: '2024-05-12',
    timezone: 'Asia/Kolkata'
  });

  // 1. Interactive Workflow Definition
  const workflowSteps = [
    { step: 1, title: 'Ingestion', sub: 'Collect data', path: '/datasources' },
    { step: 2, title: 'Preprocessing', sub: 'Clean & standardize', path: '/preprocessing' },
    { step: 3, title: 'Normalization', sub: 'Unify formats', path: '/normalization' },
    { step: 4, title: 'Enrichment', sub: 'Extract entities', path: '/enrichment' },
    { step: 5, title: 'Output', sub: 'Ready for analysis', path: '/dashboard' },
  ];

  // Handler to allow clicking directly on any Workflow Step
  const handleStepClick = (s) => {
    setActiveStep(s.step);
    navigate(s.path);
  };

  // 2. File Drag & Drop Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
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
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  // 3. API Ingestion Dispatch to FastAPI Backend
  const handleStartIngestion = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    setIsUploading(true);

    const payload = new FormData();
    // Append EVERY file using the key "files" to match backend List[UploadFile]
    selectedFiles.forEach((file) => {
      payload.append("files", file);
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/upload/csv", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Pipeline Multi-File Output:", result);

      alert(`Ingestion Successful! Processed ${result.processed.valid} total records across ${selectedFiles.length} file(s).`);
      setSelectedFiles([]);

      // Persist full multi-file result to LocalStorage
      localStorage.setItem('pipelineData', JSON.stringify(result));

      // Redirect to Preprocessing page with full dataset
      navigate('/preprocessing', { state: { pipelineData: result } });
    } catch (error) {
      console.error("Error executing pipeline ingestion:", error);
      alert("Ingestion failed. Ensure the FastAPI server is running at http://127.0.0.1:8000.");
    } finally {
      setIsUploading(false);
    }
  };

  // UI Categories Definition
  const sourceCategories = [
    { id: 'upload', title: 'Upload Files', subtitle: 'CSV, Excel, PDF, Images, Videos, etc.', icon: UploadCloud },
    { id: 'api', title: 'API Integration', subtitle: 'Connect via API endpoints', icon: FileCode },
    { id: 'cdr', title: 'Call Records (CDR)', subtitle: 'Telecom data (CSV, XLSX)', icon: Phone },
    { id: 'bank', title: 'Bank Transactions', subtitle: 'Bank statements (CSV, PDF)', icon: Landmark },
    { id: 'upi', title: 'UPI / Wallet Data', subtitle: 'UPI transactions (CSV, JSON)', icon: Landmark },
    { id: 'ip', title: 'Internet / IP Logs', subtitle: 'IPDR, firewall, server logs', icon: Globe },
    { id: 'email', title: 'Emails', subtitle: 'PST, EML, MSG files', icon: Mail },
    { id: 'social', title: 'Social Media Data', subtitle: 'APIs, exported data', icon: MessageSquare },
    { id: 'docs', title: 'Documents (OCR)', subtitle: 'PDF, DOCX, TXT, Reports', icon: FileText },
    { id: 'media', title: 'Images & Videos', subtitle: 'JPG, PNG (Text extraction)', icon: Image },
    { id: 'video_ocr', title: 'Videos (Frame + OCR)', subtitle: 'MP4, AVI, MOV', icon: Video },
    { id: 'unstructured', title: 'Unstructured Text', subtitle: 'TXT, Notes, Chat exports', icon: FileText },
    { id: 'multi_lang', title: 'Multi-language Data', subtitle: 'English, Hindi, Tamil, etc.', icon: Languages },
  ];

  const supportedFormats = [
    { label: 'CSV', icon: FileText, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { label: 'Excel', icon: FileText, color: 'text-green-600 bg-green-50 border-green-200' },
    { label: 'PDF', icon: FileText, color: 'text-red-600 bg-red-50 border-red-200' },
    { label: 'Images', icon: Image, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Videos', icon: Video, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { label: 'JSON', icon: FileCode, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'TXT', icon: FileText, color: 'text-gray-600 bg-gray-50 border-gray-200' },
    { label: 'ZIP', icon: FileText, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  ];

  const recentUploads = [
    { name: 'cdr_data_may.csv', source: 'Airtel', type: 'CDR', records: '12,543 records', status: 'Completed' },
    { name: 'sbi_statement.pdf', source: 'SBI', type: 'Bank Transactions', records: '8,732 records', status: 'Completed' },
    { name: 'whatsapp_chat.zip', source: 'WhatsApp', type: 'Social Media', records: '3,447 records', status: 'Processing' },
    { name: 'ip_logs.json', source: 'Firewall', type: 'IP Logs', records: '4,891 records', status: 'Completed' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header Bar */}
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

          <div className="flex items-center space-x-6">
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

        {/* Main Content Area */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Data Ingestion</h1>
            <p className="text-sm text-slate-500 mt-0.5">Upload and collect data from multiple sources to begin investigation</p>
          </div>

          {/* VISIBLE & CLICKABLE 5-STEP WORKFLOW BAR */}
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

          {/* Three Column Ingestion Grid */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left Source Categories */}
            <div className="col-span-12 lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="text-sm font-bold text-slate-900 mb-3 px-2">Select Data Source</h2>
              <div className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
                {sourceCategories.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedSource === item.title;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSource(item.title)}
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

            {/* Center File Upload Area + Metadata Form */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              
              {/* FILE DRAG & DROP ZONE */}
              <div 
                className={`bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  multiple 
                  className="hidden" 
                />

                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
                  <UploadCloud className="h-6 w-6" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {selectedFiles.length > 0 ? "Files Staged for Ingestion" : "Upload Files"}
                </h3>

                {selectedFiles.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, idx) => (
                      <p key={idx} className="text-xs font-semibold text-indigo-700 truncate max-w-xs mx-auto">
                        📄 {file.name} ({Math.round(file.size / 1024)} KB)
                      </p>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag and drop files here, or <span className="text-indigo-600 font-semibold underline">click to browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Supports CSV, XLSX, PDF, DOCX, TXT, JPG, PNG, MP4, ZIP (Max 2GB)
                    </p>
                  </>
                )}
                
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 px-5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
                >
                  {selectedFiles.length > 0 ? "Change Files" : "Choose Files"}
                </button>
              </div>

              {/* METADATA FORM */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Additional Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Source Type <span className="text-red-500">*</span></label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.sourceType}
                      onChange={(e) => setFormData({...formData, sourceType: e.target.value})}
                    >
                      <option value="CDR">CDR</option>
                      <option value="BANK_TRANSACTIONS">Bank Transactions</option>
                      <option value="UPI_WALLET">UPI / Wallet Data</option>
                      <option value="IP_LOGS">IP Logs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Source Organization</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Airtel, SBI, WhatsApp" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.sourceOrg}
                      onChange={(e) => setFormData({...formData, sourceOrg: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea 
                    rows={2} 
                    placeholder="Brief description of the data..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
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
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Acquired Date</label>
                    <input 
                      type="date" 
                      value={formData.acquiredDate} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                      onChange={(e) => setFormData({...formData, acquiredDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Timezone</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </select>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => setSelectedFiles([])}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleStartIngestion}
                    disabled={isUploading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <span>{isUploading ? "Processing..." : "Start Ingestion"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Information Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 mb-3">Supported Data Formats</h3>
                <div className="grid grid-cols-4 gap-2">
                  {supportedFormats.map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <div key={fmt.label} className={`p-2 rounded-lg border text-center ${fmt.color}`}>
                        <Icon className="h-4 w-4 mx-auto mb-1" />
                        <p className="text-[11px] font-bold">{fmt.label}</p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 p-2.5 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-normal">
                    All uploaded data is securely processed via backend API engines.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Recent Uploads</h3>
                  <button className="text-[11px] text-indigo-600 font-bold hover:underline">View All &rarr;</button>
                </div>

                <div className="divide-y divide-slate-100">
                  {recentUploads.map((file, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{file.source} • {file.type}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          file.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {file.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{file.records}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
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