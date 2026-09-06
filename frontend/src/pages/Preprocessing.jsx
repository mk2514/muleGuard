import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  Check,
  Zap,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Table as TableIcon
} from 'lucide-react';

export default function Preprocessing() {
  const navigate = useNavigate();
  const location = useLocation();

  // Workflow Pipeline Tracking
  const activeStep = 2;
  const workflowSteps = [
    { step: 1, title: 'Ingestion', sub: 'Collect data', path: '/datasources' },
    { step: 2, title: 'Preprocessing', sub: 'Clean & standardize', path: '/preprocessing' },
    { step: 3, title: 'Normalization', sub: 'Unify formats', path: '/normalization' },
    { step: 4, title: 'Enrichment', sub: 'Extract entities', path: '/enrichment' },
    { step: 5, title: 'Output', sub: 'Ready for analysis', path: '/dashboard' },
  ];

  // Raw Pipeline Context & Processing States
  const [rawPipelineData, setRawPipelineData] = useState(null);
  const [rawRecords, setRawRecords] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  
  const [cleanOptions, setCleanOptions] = useState({
    removeNulls: true,
    stripWhitespace: true,
    standardizePhoneFormat: true,
    filterCorruptedRows: true,
    autoDeduplicate: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedStatus, setProcessedStatus] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

  // 1. Retrieve Payload and Discover All Dynamic Keys Across Any Input
  useEffect(() => {
    // Extract caseId from navigate state (passed from DataSources)
    const caseId = location.state?.caseId || localStorage.getItem('active_case_id');

    // Load from case-scoped key first, then route state, then global fallback
    let rawData;
    if (caseId) {
      const caseScoped = localStorage.getItem(`pipelineData_${caseId}`);
      rawData = caseScoped
        ? JSON.parse(caseScoped)
        : (location.state?.pipelineData || JSON.parse(localStorage.getItem('pipelineData') || '{}'));
    } else {
      rawData = location.state?.pipelineData || JSON.parse(localStorage.getItem('pipelineData') || '{}');
    }
    setRawPipelineData(rawData);

    // Extract dynamic array from backend/ingestion payload (supports multiple key conventions)
    const records = rawData?.data || rawData?.records || rawData?.processed_data || [];
    setRawRecords(records);

    if (records.length > 0) {
      const discoveredKeys = new Set();
      records.forEach((item) => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach((key) => {
            if (!['_id', '_reason', 'rawItem', 'evidence'].includes(key)) {
              discoveredKeys.add(key);
            }
          });
        }
      });
      setDynamicColumns(Array.from(discoveredKeys));
    }
  }, [location.state]);

  // 2. Dynamic Cleaning Engine Logic
  const { processedRecords, removedRecords, stats } = useMemo(() => {
    const startTime = performance.now();
    
    if (!rawRecords || rawRecords.length === 0) {
      return { 
        processedRecords: [], 
        removedRecords: [], 
        stats: { total: 0, nulls: 0, corrupted: 0, duplicates: 0 } 
      };
    }

    const clean = [];
    const dirty = [];
    const seenHashes = new Set();

    let nullCount = 0;
    let corruptedCount = 0;
    let duplicateCount = 0;

    rawRecords.forEach((item, index) => {
      let currentItem = { ...item };
      let isCorrupted = false;
      let isNullOrEmpty = false;

      // Rule A: Check for Completely Empty / Null Values
      const values = Object.values(currentItem);
      const hasValidData = values.some((val) => val !== null && val !== undefined && String(val).trim() !== '');

      if (!hasValidData) {
        isNullOrEmpty = true;
        nullCount++;
      }

      // Rule B: Trim Whitespace and Handle Strings
      if (cleanOptions.stripWhitespace) {
        Object.keys(currentItem).forEach((k) => {
          if (typeof currentItem[k] === 'string') {
            currentItem[k] = currentItem[k].trim().replace(/\s+/g, ' ');
          }
        });
      }

      // Rule C: Standardize Phone Number Formats to E.164 (+91 format for India)
      if (cleanOptions.standardizePhoneFormat) {
        Object.keys(currentItem).forEach((k) => {
          if (/phone|mobile|caller|receiver|contact|num/i.test(k) && currentItem[k]) {
            let str = String(currentItem[k]).replace(/[^\d+]/g, '');
            if (str.length === 10) {
              str = `+91${str}`;
            } else if (str.startsWith('0') && str.length === 11) {
              str = `+91${str.slice(1)}`;
            } else if (str.length === 12 && str.startsWith('91')) {
              str = `+${str}`;
            }
            currentItem[k] = str;
          }
        });
      }

      // Rule D: Detect Syntax Corruption
      if (typeof item !== 'object' || item === null) {
        isCorrupted = true;
        corruptedCount++;
      }

      // Rule E: Deduplicate Unique Event Signatures
      const rowHash = JSON.stringify(currentItem);
      if (cleanOptions.autoDeduplicate && seenHashes.has(rowHash)) {
        duplicateCount++;
        dirty.push({
          _id: currentItem.event_id || currentItem.id || `#${index + 1}`,
          _reason: 'Duplicate Entry',
          ...currentItem
        });
        return;
      }

      // Routing logic based on user toggle configurations
      if (cleanOptions.removeNulls && isNullOrEmpty) {
        dirty.push({
          _id: currentItem.event_id || currentItem.id || `#${index + 1}`,
          _reason: 'Missing Core Data',
          ...currentItem
        });
      } else if (cleanOptions.filterCorruptedRows && isCorrupted) {
        dirty.push({
          _id: `#${index + 1}`,
          _reason: 'Corrupted Syntax',
          ...currentItem
        });
      } else {
        seenHashes.add(rowHash);
        clean.push({
          _id: currentItem.event_id || currentItem.id || currentItem.chat_id || `#${index + 1}`,
          source_file: currentItem.source_file || currentItem.fileName || rawPipelineData?.fileName || 'ingested_file.csv',
          ...currentItem
        });
      }
    });

    const endTime = performance.now();
    setExecutionTime(((endTime - startTime) / 1000).toFixed(2));

    return {
      processedRecords: clean,
      removedRecords: dirty,
      stats: {
        total: rawRecords.length,
        nulls: nullCount,
        corrupted: corruptedCount,
        duplicates: duplicateCount,
      }
    };
  }, [rawRecords, cleanOptions, rawPipelineData]);

  const handleToggle = (key) => {
    setCleanOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunPreprocessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessedStatus(true);
    }, 600);
  };

  const handleProceedToNormalization = () => {
    const caseId = location.state?.caseId || rawPipelineData?.case_id;
    const updatedPayload = {
      ...rawPipelineData,
      records: processedRecords,
      columns: dynamicColumns,
      files: rawPipelineData?.files || [],
      status: 'PREPROCESSED',
      case_id: caseId,
    };
    // Write to both global fallback and case-scoped key
    localStorage.setItem('pipelineData', JSON.stringify(updatedPayload));
    if (caseId) {
      localStorage.setItem(`pipelineData_${caseId}`, JSON.stringify(updatedPayload));
    }
    navigate('/normalization', { state: { pipelineData: updatedPayload, caseId } });
  };

  const formatHeader = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toUpperCase();
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-slate-300 font-mono">N/A</span>;
    }
    if (typeof value === 'object') {
      return <span className="font-mono text-[11px] text-indigo-700">{JSON.stringify(value)}</span>;
    }
    return String(value);
  };

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
                placeholder="Search raw pipeline fields..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/enrichment')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Jump to Enrichment</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Case ID:</span>
              <span className="text-sm font-bold text-indigo-900">MG-2024-1024</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

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

        {/* Main Content Body */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dynamic Preprocessing Engine</h1>
              <p className="text-sm text-slate-500 mt-0.5">Automated field discovery, schema cleaning, and structure validation</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleProceedToNormalization}
                disabled={processedRecords.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                <span>Proceed to Step 3 (Normalization)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {workflowSteps.map((s, idx) => {
                const isActive = activeStep === s.step;
                const isPassed = activeStep > s.step;

                return (
                  <React.Fragment key={s.step}>
                    <button
                      onClick={() => navigate(s.path, { state: { pipelineData: rawPipelineData } })}
                      className="flex items-center space-x-3 text-left focus:outline-none group"
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
                          isActive ? 'text-indigo-600' : 'text-slate-700 group-hover:text-indigo-600'
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

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left Controls Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* Dataset Health Overview Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span>Raw Ingested Dataset Health</span>
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {stats.total.toLocaleString()} Records
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                    <p className="text-base font-bold text-amber-700">{stats.nulls}</p>
                    <p className="text-[10px] font-semibold text-amber-900 mt-0.5">Null / Empty</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                    <p className="text-base font-bold text-red-700">{stats.corrupted}</p>
                    <p className="text-[10px] font-semibold text-red-900 mt-0.5">Malformed</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                    <p className="text-base font-bold text-blue-700">{stats.duplicates}</p>
                    <p className="text-[10px] font-semibold text-blue-900 mt-0.5">Duplicates</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Rules Configuration Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Cleaning Toggles</span>
                </h2>

                <div className="space-y-3">
                  {[
                    { key: 'removeNulls', label: 'Strip Null & Empty Values', desc: 'Isolate entries missing mandatory attributes' },
                    { key: 'stripWhitespace', label: 'Trim Whitespace & Format Strings', desc: 'Remove leading/trailing spaces and multi-spaces' },
                    { key: 'standardizePhoneFormat', label: 'Standardize Phone Numbers (+91)', desc: 'Auto-format phone keys into international E.164 standard' },
                    { key: 'autoDeduplicate', label: 'Deduplicate Equivalent Records', desc: 'Merge and discard identical raw event rows' },
                    { key: 'filterCorruptedRows', label: 'Quarantine Malformed Rows', desc: 'Filter out unparseable object shapes' },
                  ].map((rule) => (
                    <div 
                      key={rule.key} 
                      onClick={() => handleToggle(rule.key)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                        cleanOptions[rule.key] 
                          ? 'bg-indigo-50/60 border-indigo-200' 
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="pr-3">
                        <p className="text-xs font-bold text-slate-800">{rule.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rule.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                        cleanOptions[rule.key] ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {cleanOptions[rule.key] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunPreprocessing}
                    disabled={isProcessing || rawRecords.length === 0}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Applying Cleaning Rules...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Re-Apply Preprocessing Engine</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Live Preview Column */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <TableIcon className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Live Processed Output Matrix</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{processedRecords.length} Clean Records Ready</span>
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                      {dynamicColumns.length} Discovered Fields
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[420px]">
                  {rawRecords.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                          <th className="p-2.5 sticky left-0 bg-slate-100 z-20 border-r border-slate-200"># ID</th>
                          {dynamicColumns.map((col) => (
                            <th key={col} className="p-2.5 whitespace-nowrap min-w-[130px]">
                              {formatHeader(col)}
                            </th>
                          ))}
                          <th className="p-2.5">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Valid Processed Records */}
                        {processedRecords.map((row, idx) => (
                          <tr key={row._id || idx} className="hover:bg-slate-50 transition">
                            <td className="p-2.5 font-bold text-slate-500 font-mono sticky left-0 bg-white border-r border-slate-100 z-10">
                              {row._id}
                            </td>
                            {dynamicColumns.map((col) => (
                              <td key={col} className="p-2.5 text-slate-800 max-w-xs truncate font-mono">
                                {renderCellValue(row[col])}
                              </td>
                            ))}
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Clean
                              </span>
                            </td>
                          </tr>
                        ))}

                        {/* Quarantined Records */}
                        {removedRecords.map((row, idx) => (
                          <tr key={`dirty-${idx}`} className="bg-amber-50/40 hover:bg-amber-50 transition">
                            <td className="p-2.5 font-bold text-slate-400 font-mono sticky left-0 bg-amber-50 border-r border-slate-200 z-10">
                              {row._id}
                            </td>
                            {dynamicColumns.map((col) => (
                              <td key={col} className="p-2.5 text-slate-400 max-w-xs truncate font-mono line-through">
                                {renderCellValue(row[col])}
                              </td>
                            ))}
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-3 h-3 mr-1" /> {row._reason}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-16 text-center text-slate-400">
                      <p className="text-sm font-semibold">No active data stream in pipeline memory.</p>
                      <p className="text-xs mt-1">Go back to Ingestion (Step 1) to upload a file.</p>
                    </div>
                  )}
                </div>

                {/* Status Bar */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Real-time execution latency: <strong>{executionTime}s</strong></span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => navigate('/datasources')}
                      className="font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Ingestion</span>
                    </button>
                    <button 
                      onClick={handleProceedToNormalization}
                      disabled={processedRecords.length === 0}
                      className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center space-x-1 disabled:opacity-50"
                    >
                      <span>Proceed to Normalization</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}