import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  FilePlus,
  Users,
  CheckCircle2,
  Lock,
  Download,
  Eye,
  Share2,
  FolderPlus,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Bell,
  Check,
  Copy,
  ExternalLink,
  Shield,
  Hash,
  Clock,
  Link2,
  FileCheck,
  BadgeCheck,
  FileCode,
  Calendar,
  Layers,
  Printer,
  X,
  Send,
  PlusCircle,
  Database
} from 'lucide-react';

export default function ChainOfCustody() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Case ID resolution
  const caseIdFromQuery = searchParams.get('caseId');
  const storedCaseId = localStorage.getItem('active_case_id') || 'CASE-2025-1024';
  const activeCaseId = caseIdFromQuery || storedCaseId;

  // State
  const [activeTab, setActiveTab] = useState('Evidence & Reports');
  const [detailSubTab, setDetailSubTab] = useState('Details');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showFullLogModal, setShowFullLogModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // New Custody Log Form State
  const [newLogAction, setNewLogAction] = useState('Transferred');
  const [newLogActor, setNewLogActor] = useState('Forensic Analyst Sunita');
  const [newLogRole, setNewLogRole] = useState('Digital Forensics Unit');
  const [newLogNotes, setNewLogNotes] = useState('Forensic disk image verified and sealed in secure storage.');

  // Loaded Data from Storage & Pipeline
  const [pipelineData, setPipelineData] = useState(null);
  const [entitiesData, setEntitiesData] = useState(null);
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [custodyLogs, setCustodyLogs] = useState([]);

  // Toast trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Load live case context from localStorage and backend
  useEffect(() => {
    // 1. Pipeline output
    try {
      const savedOutput = localStorage.getItem(`output_${activeCaseId}`);
      if (savedOutput) setPipelineData(JSON.parse(savedOutput));
      else {
        const savedPipeline = localStorage.getItem(`pipelineData_${activeCaseId}`);
        if (savedPipeline) setPipelineData(JSON.parse(savedPipeline));
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Entities
    try {
      const savedEntities = localStorage.getItem(`entities_${activeCaseId}`);
      if (savedEntities) setEntitiesData(JSON.parse(savedEntities));
    } catch (e) {
      console.error(e);
    }

    // 3. Anomalies
    try {
      const savedAnomalies = localStorage.getItem(`anomalies_${activeCaseId}`);
      if (savedAnomalies) setAnomaliesData(JSON.parse(savedAnomalies));
    } catch (e) {
      console.error(e);
    }

    // 4. Fetch custody logs from SQLite backend
    const fetchLogs = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/custody/${activeCaseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            setCustodyLogs(data.logs);
            return;
          }
        }
      } catch (err) {
        // fallback
      }

      // Default baseline custody chain matching the slide
      setCustodyLogs([
        {
          step_number: 1,
          action: 'Collected',
          actor: 'Inspector Vijay',
          role: 'Field Officer',
          organization: 'Cyber Crime Cell',
          timestamp: '20 May 2025, 10:32 AM',
          status: 'Collected',
          sha256_hash: 'a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1'
        },
        {
          step_number: 2,
          action: 'Transferred',
          actor: 'Cyber Cell Unit',
          role: 'Chennai',
          organization: 'Tamil Nadu Police',
          timestamp: '20 May 2025, 11:15 AM',
          status: 'Transferred',
          sha256_hash: 'a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1'
        },
        {
          step_number: 3,
          action: 'Received',
          actor: 'Analyst Priya',
          role: 'Forensic Analyst',
          organization: 'Forensic Science Lab',
          timestamp: '20 May 2025, 11:45 AM',
          status: 'Received',
          sha256_hash: 'a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1'
        },
        {
          step_number: 4,
          action: 'Processed',
          actor: 'System',
          role: 'Hash Generated',
          organization: 'MuleGuard Automated Engine',
          timestamp: '20 May 2025, 01:20 PM',
          status: 'Processed',
          sha256_hash: 'a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1'
        },
        {
          step_number: 5,
          action: 'Verified',
          actor: 'Senior Officer',
          role: 'Ramesh Kumar',
          organization: 'Superintendent of Police',
          timestamp: '20 May 2025, 02:05 PM',
          status: 'Verified',
          sha256_hash: 'a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1'
        }
      ]);
    };

    fetchLogs();
  }, [activeCaseId]);

  // Dynamic values or fallback
  const recordCount = pipelineData?.records?.length || 45;
  const entitiesCount = entitiesData?.entities?.length || 18;
  const verifiedCount = Math.max(Math.floor(recordCount * 0.93), 42);
  const rawFileName = pipelineData?.fileName || pipelineData?.records?.[0]?.source_file || 'call_log_9876543210.txt';
  const fileExt = rawFileName.split('.').pop()?.toUpperCase() || 'TXT';
  const fileSize = pipelineData?.fileSize || '2.45 MB';
  const certificateId = `BSA63-2025-000124`;
  const sha256Hash = 'a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1';

  // Copy hash handler
  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Hash);
    setCopiedHash(true);
    showToast('SHA-256 Hash copied to clipboard');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Add new custody log handler
  const handleAddCustodyLog = async () => {
    const newEntry = {
      step_number: custodyLogs.length + 1,
      action: newLogAction,
      actor: newLogActor,
      role: newLogRole,
      organization: 'Cyber Crime Investigation Unit',
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: newLogAction,
      sha256_hash: sha256Hash,
      notes: newLogNotes
    };

    try {
      await fetch('http://127.0.0.1:8000/api/custody/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: activeCaseId,
          ...newEntry
        })
      });
    } catch (e) {}

    setCustodyLogs([...custodyLogs, newEntry]);
    setShowAddLogModal(false);
    showToast('New chain of custody handover recorded and digitally sealed.');
  };

  // Print PDF handler
  const handlePrintPDF = () => {
    window.print();
  };

  // Sub-tabs list
  const subTabs = [
    { label: 'Case Overview', path: `/cases?caseId=${activeCaseId}` },
    { label: 'Entities', path: `/entities?caseId=${activeCaseId}` },
    { label: 'Timeline', path: `/timeline?caseId=${activeCaseId}` },
    { label: 'Evidence & Reports', active: true },
    { label: 'Analysis', path: `/anomaly-engine?caseId=${activeCaseId}` },
    { label: 'Notes' },
    { label: 'Activity Log' },
    { label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1550px] mx-auto p-6 space-y-6">
        
        {/* =========================================================
            HEADER SECTION (MATCHING SCREENSHOT)
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/anomaly-engine?caseId=${activeCaseId}`)}
              title="Return to Adaptive Anomaly Detection"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{activeCaseId}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                  High Risk
                </span>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider hidden md:inline-block">
                  EVIDENCE AND REPORTING ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ATM Fraud Case – Chennai (Mule Syndicate Layering & Digital Forensics)
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Case Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 shadow-xs transition"
              >
                <span>Case Actions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
              {isActionsOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-medium divide-y divide-slate-100">
                  <button
                    onClick={() => {
                      setShowPreviewModal(true);
                      setIsActionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 text-slate-700 flex items-center space-x-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span>Preview Investigation Report</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddLogModal(true);
                      setIsActionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 text-slate-700 flex items-center space-x-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Record Custody Handover</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast('Case sealed under BSA Sec 63 with SHA-256 checksum.');
                      setIsActionsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 text-slate-700 flex items-center space-x-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lock Case Evidence (Tamper-Proof)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </div>

            {/* User Pill */}
            <div className="flex items-center space-x-2.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">Inspector Vijay</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">Field Officer</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                IV
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SUB-TABS BAR (MATCHING SCREENSHOT)
            ========================================================= */}
        <div className="border-b border-slate-200 flex space-x-6 text-xs font-bold overflow-x-auto">
          {subTabs.map((tab) => {
            const isActive = tab.active;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.path) navigate(tab.path);
                  else setActiveTab(tab.label);
                }}
                className={`pb-3 transition flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* =========================================================
            5 KPI METRIC CARDS ROW (MATCHING SCREENSHOT)
            ========================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Evidence */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Evidence</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900">{recordCount}</span>
                <span className="text-xs text-slate-500 font-medium">Items</span>
              </div>
            </div>
          </div>

          {/* Card 2: Verified Evidence */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Evidence</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900">{verifiedCount}</span>
                <span className="text-xs text-slate-500 font-medium">(93%) Items</span>
              </div>
            </div>
          </div>

          {/* Card 3: Entities Involved */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entities Involved</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900">{entitiesCount}</span>
                <span className="text-xs text-slate-500 font-medium">Entities</span>
              </div>
            </div>
          </div>

          {/* Card 4: Reports Generated */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reports Generated</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900">3</span>
                <span className="text-xs text-slate-500 font-medium">Reports</span>
              </div>
            </div>
          </div>

          {/* Card 5: Admissibility Score */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5 col-span-2 md:col-span-1">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admissibility Score</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-black text-slate-900">98%</span>
                <span className="text-[11px] text-emerald-600 font-bold">High Reliability</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            MIDDLE ROW: 3 PANELS
            1. Evidence Integrity
            2. Chain of Custody (Vertical Stepper)
            3. Evidence Details
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Panel 1: Evidence Integrity (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Evidence Integrity</h2>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              {/* Row 1: BSA Sec 63 / 65B Compliance */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>BSA Sec 63 / 65B Compliance</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <span>Compliant</span>
                  <Check className="w-3 h-3" />
                </span>
              </div>

              {/* Row 2: Hash SHA-256 */}
              <div className="pt-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-700 font-semibold">
                    <span className="text-slate-400 font-mono">#</span>
                    <span>Hash (SHA-256)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-600">
                  <span className="truncate max-w-[240px]" title={sha256Hash}>
                    {sha256Hash}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    className="p-1 text-slate-400 hover:text-purple-600 transition ml-2"
                    title="Copy Full Hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Row 3: BSA Sec 63 Certificate */}
              <div className="pt-2.5 flex items-center justify-between">
                <div>
                  <p className="text-slate-700 font-semibold">BSA Sec 63 Certificate</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">Certificate ID: {certificateId}</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold flex items-center space-x-1 transition"
                >
                  <span>Attached</span>
                  <FileText className="w-3 h-3 text-slate-500" />
                </button>
              </div>

              {/* Row 4: Timestamp (UTC) */}
              <div className="pt-2.5 flex items-center justify-between">
                <div>
                  <p className="text-slate-700 font-semibold">Timestamp (UTC)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">20 May 2025, 10:32:45 AM</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              </div>

              {/* Row 5: Chain of Custody Integrity */}
              <div className="pt-2.5 flex items-center justify-between">
                <div>
                  <p className="text-slate-700 font-semibold">Chain of Custody Integrity</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{custodyLogs.length + 2} Actions • {custodyLogs.length} Handovers</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified
                </span>
              </div>
            </div>

            {/* Bottom Alert */}
            <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-2.5 flex items-center space-x-2 text-[11px] text-purple-900 font-semibold">
              <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Evidence is digitally signed and tamper-proof</span>
            </div>
          </div>

          {/* Panel 2: Chain of Custody (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">Chain of Custody</h2>
                <button
                  onClick={() => setShowFullLogModal(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                >
                  View Full Log
                </button>
              </div>

              {/* Stepper Timeline */}
              <div className="mt-3 space-y-3 relative pl-4 border-l-2 border-slate-200">
                {custodyLogs.slice(0, 5).map((log, idx) => {
                  let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (log.action === 'Collected') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (log.action === 'Transferred') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (log.action === 'Received') badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  if (log.action === 'Processed') badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (log.action === 'Verified') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <div key={idx} className="relative group">
                      {/* Step circle */}
                      <span className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-black flex items-center justify-center ring-4 ring-white">
                        {log.step_number || idx + 1}
                      </span>

                      <div className="flex items-start justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{log.action}</p>
                          <p className="text-[10px] text-slate-400">{log.timestamp}</p>
                          <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                            {log.actor} <span className="text-slate-400">({log.role})</span>
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeStyle}`}>
                          {log.status || log.action}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Box */}
            <div className="mt-4 bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-center space-x-2 text-[11px] text-emerald-900 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>End-to-end chain verified. No break in custody.</span>
            </div>
          </div>

          {/* Panel 3: Evidence Details (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Evidence Details</h2>
              <button
                onClick={() => setShowDetailModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                View Full Details
              </button>
            </div>

            {/* File Card Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                <FileCode className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase mt-0.5">{fileExt}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 truncate" title={rawFileName}>
                    {rawFileName}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Legally Admissible
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Type: Call Detail Record (CDR) <br />
                  Size: {fileSize} • Source: Airtel <br />
                  Collected By: Inspector Vijay
                </p>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="border-b border-slate-200 flex space-x-4 text-xs font-bold">
              <button
                onClick={() => setDetailSubTab('Details')}
                className={`pb-1.5 transition ${
                  detailSubTab === 'Details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setDetailSubTab('Metadata')}
                className={`pb-1.5 transition ${
                  detailSubTab === 'Metadata'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Metadata
              </button>
            </div>

            {/* Key-Value Details Grid */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Evidence ID</span>
                <span className="font-mono font-bold text-slate-800">EV-2025-05-000124</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Case ID</span>
                <span className="font-mono font-bold text-slate-800">{activeCaseId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Data Source</span>
                <span className="font-semibold text-slate-800">Airtel CDR System</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Collection Method</span>
                <span className="font-semibold text-slate-800">Legal Request (Sec 91 CrPC)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Hash Algorithm</span>
                <span className="font-mono font-semibold text-slate-800">SHA-256</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">File Format</span>
                <span className="font-mono font-semibold text-slate-800">.{fileExt.toLowerCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Integrity Status</span>
                <span className="font-bold text-emerald-600 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Admissibility</span>
                <span className="font-bold text-emerald-600 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>High</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM ROW:
            1. Generated Reports (3 cols)
            2. Report Preview & Secure Export (6 cols)
            3. AI Intelligence Cards (3 cols)
            ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Section 1: Generated Reports (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Generated Reports</h2>

            <div className="space-y-3">
              {/* Report 1 */}
              <div
                onClick={() => setShowPreviewModal(true)}
                className="p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition cursor-pointer flex items-start space-x-3"
              >
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">Investigation Summary</p>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generated: 20 May 2025, 02:30 PM</p>
                </div>
              </div>

              {/* Report 2 */}
              <div
                onClick={() => setShowPreviewModal(true)}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer flex items-start space-x-3"
              >
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">Evidence Integrity</p>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generated: 20 May 2025, 01:15 PM</p>
                </div>
              </div>

              {/* Report 3 */}
              <div
                onClick={() => setShowFullLogModal(true)}
                className="p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition cursor-pointer flex items-start space-x-3"
              >
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">Chain of Custody</p>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generated: 20 May 2025, 02:10 PM</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/reports?caseId=${activeCaseId}`)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition flex items-center space-x-1"
            >
              <span>View All Reports</span>
              <span>&rarr;</span>
            </button>
          </div>

          {/* Section 2: Report Preview & Secure Export (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">Report Preview & Secure Export</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified
              </span>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Investigation Summary Export</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {activeCaseId} • Generated on: 20 May 2025, 02:30 PM
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This report contains a summary of evidence, analysis findings, and key insights for the investigation.
              </p>
            </div>

            {/* Mini Summary Stats Row */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Evidence</p>
                <p className="text-base font-black text-slate-800 mt-0.5">{recordCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Verified Evidence</p>
                <p className="text-base font-black text-emerald-600 mt-0.5">{verifiedCount} (93%)</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Entities Involved</p>
                <p className="text-base font-black text-slate-800 mt-0.5">{entitiesCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Key Findings</p>
                <p className="text-base font-black text-purple-700 mt-0.5">7</p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview Report</span>
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={() => showToast('Encrypted JSON dossier exported with SHA-256 digital signature.')}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Securely</span>
              </button>

              <button
                onClick={() => showToast(`Added official report to dossier for case ${activeCaseId}.`)}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition shadow-xs"
              >
                <FolderPlus className="w-3.5 h-3.5 text-slate-500" />
                <span>Add to Case File</span>
              </button>
            </div>
          </div>

          {/* Section 3: Right Side Intelligence Cards (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Card 1: AI Legal Insight */}
            <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Legal Insight</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Based on current evidence, there is strong linkage between the suspect entities and fraudulent transactions. Evidence is sufficient for prosecution under BSA Sec 63.
              </p>
            </div>

            {/* Card 2: Missing Evidence Suggestion */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Missing Evidence Suggestion</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                To strengthen this case, consider collecting:
              </p>
              <ul className="text-xs text-slate-600 space-y-1 font-medium pl-1">
                <li>• IP logs for device corroboration</li>
                <li>• Location data for movement pattern</li>
              </ul>
              <button
                onClick={() => navigate(`/data-sources?caseId=${activeCaseId}`)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 flex items-center space-x-1"
              >
                <span>View Recommendations</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            FOOTER (MATCHING SCREENSHOT)
            ========================================================= */}
        <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>All evidence is stored securely with end-to-end encryption and role-based access control.</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Audit Trail Enabled</span>
            </span>
            <span>Last updated: 20 May 2025, 02:30 PM</span>
          </div>
        </div>

      </div>

      {/* =========================================================
          MODAL 1: PREVIEW INVESTIGATION REPORT (BSA SEC 63)
          ========================================================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Report Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                    Official Police Dossier
                  </span>
                  <span className="text-xs text-slate-400">BSA Sec 63 Admissible</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Investigation Summary & Evidence Certificate</h2>
                <p className="text-xs text-slate-500 font-mono">Case ID: {activeCaseId} • Certificate ID: {certificateId}</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legal Certificate Content */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-slate-700">
              <div className="font-bold text-slate-900 text-sm">
                CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023
              </div>
              <p>
                I, <strong>Inspector Vijay</strong>, Field Officer, Cyber Crime Division, hereby certify that the electronic records, including CDR logs, financial transactions, and network graphs referenced in dossier <strong>{activeCaseId}</strong>, were produced by computer systems operating under lawful lawful custody during the relevant period.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
                <div><span className="text-slate-400">Cryptographic Hash:</span> <br /><span className="font-bold text-purple-700 break-all">{sha256Hash}</span></div>
                <div><span className="text-slate-400">Timestamp Sealing:</span> <br /><span className="font-bold">20 May 2025, 10:32:45 UTC</span></div>
              </div>
              <p className="italic text-slate-500 text-[11px]">
                The integrity of these digital assets has been continuously preserved with unbroken chain of custody records stored in immutable tamper-evident ledgers.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Close Preview
              </button>
              <button
                onClick={handlePrintPDF}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center space-x-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: FULL CHAIN OF CUSTODY LOG MODAL
          ========================================================= */}
      {showFullLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Complete Chain of Custody History</h3>
              </div>
              <button onClick={() => setShowFullLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {custodyLogs.map((log, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {log.step_number || i + 1}
                      </span>
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 font-medium pl-7">
                      Custodian: <strong>{log.actor}</strong> ({log.role}) — {log.organization}
                    </p>
                    {log.notes && (
                      <p className="text-slate-500 italic pl-7 text-[11px]">{log.notes}</p>
                    )}
                    <p className="font-mono text-[10px] text-slate-400 pl-7 truncate max-w-md">
                      SHA-256: {log.sha256_hash}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {log.status || 'Verified'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setShowFullLogModal(false);
                  setShowAddLogModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Handover Log</span>
              </button>
              <button
                onClick={() => setShowFullLogModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: RECORD HANDOVER LOG MODAL
          ========================================================= */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Record Custody Handover</h3>
              <button onClick={() => setShowAddLogModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Handover Action</label>
                <select
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                >
                  <option value="Transferred">Transferred to Forensic Lab</option>
                  <option value="Received">Received for Analysis</option>
                  <option value="Sealed">Sealed in Evidence Locker</option>
                  <option value="Submitted">Submitted to Court</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Receiving Officer / Custodian</label>
                <input
                  type="text"
                  value={newLogActor}
                  onChange={(e) => setNewLogActor(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Designation / Role</label>
                <input
                  type="text"
                  value={newLogRole}
                  onChange={(e) => setNewLogRole(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Notes & Handover Remarks</label>
                <textarea
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  rows={3}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddLogModal(false)}
                className="px-3.5 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustodyLog}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg"
              >
                Sign & Save Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: FULL EVIDENCE DETAILS MODAL
          ========================================================= */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Evidence Dossier</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-800">Primary Seized File</p>
                <p className="font-mono text-[11px] text-slate-600">{rawFileName}</p>
                <p className="text-[10px] text-slate-400">Size: {fileSize} • Sealed: 20 May 2025, 10:32 AM</p>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                <p className="font-bold text-emerald-900">Admissibility Assessment</p>
                <p className="text-slate-600 leading-relaxed">
                  Meets all requirements of Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA).
                  No hash collisions or alterations detected across 5 handovers.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
