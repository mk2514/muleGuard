import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Ensure react-router-dom in your setup
import {
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
  Database,
  Sliders,
  Layers,
  Code
} from 'lucide-react';

export default function Normalization() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rawPipelineData, setRawPipelineData] = useState(null);
  const [normalizedRecords, setNormalizedRecords] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // 1. Fetch preprocessed pipeline state
    const rawData = location.state?.pipelineData || JSON.parse(localStorage.getItem('pipelineData') || '{}');
    setRawPipelineData(rawData);

    const records = rawData?.records || rawData?.data || [];

    setIsProcessing(true);

    setTimeout(() => {
      if (records.length > 0) {
        // 2. Discover all unique attributes (including standard + non-standard fields)
        const discoveredKeys = new Set(['event_id', 'standard_type', 'source_entity', 'target_entity', 'iso_timestamp']);
        
        records.forEach((item) => {
          Object.keys(item).forEach((k) => {
            if (!['_id', 'rawItem', 'evidence'].includes(k)) {
              discoveredKeys.add(k);
            }
          });
        });

        const columnList = Array.from(discoveredKeys);
        setDynamicColumns(columnList);

        // 3. Perform Canonical Normalization without dropping custom attributes
       // AFTER (In Normalization.jsx)
const unified = records.map((item, index) => {
  const source = item.source || item.sender || item.sender_phone || item.caller || item.src_ip || 'UNKNOWN_SRC';
  const target = item.target || item.receiver || item.receiver_phone || item.called || item.dest_ip || 'UNKNOWN_TGT';
  const timestamp = item.timestamp || item.iso_timestamp || item.event_timestamp || item.txn_date || new Date().toISOString();
  const eventType = item.type || item.detected_type || item.message_type || 'GENERAL_LOG';

  return {
    ...item, // Spread raw properties first
    source_file: item.source_file || item.fileName || item.file_name || 'uploaded_data.csv', // Preserve source filename
    event_id: item.event_id || item.id || item._id || `NORM-${index + 1}`,
    standard_type: String(eventType).toUpperCase(),
    source_entity: source,
    target_entity: target,
    iso_timestamp: timestamp
  };
});

        setNormalizedRecords(unified);
      } else {
        setNormalizedRecords([]);
        setDynamicColumns([]);
      }

      setIsProcessing(false);
    }, 400);
  }, [location.state]);

  const workflowSteps = [
    { step: 1, title: 'Ingestion', sub: 'Collect data', path: '/datasources' },
    { step: 2, title: 'Preprocessing', sub: 'Clean & standardize', path: '/preprocessing' },
    { step: 3, title: 'Normalization', sub: 'Unify formats', path: '/normalization' },
    { step: 4, title: 'Enrichment', sub: 'Extract entities', path: '/enrichment' },
    { step: 5, title: 'Output', sub: 'Ready for analysis', path: '/dashboard' },
  ];

 const handleNextStep = () => {
  const updatedPayload = {
    ...rawPipelineData,
    records: normalizedRecords,
    columns: dynamicColumns,
    files: rawPipelineData?.files || [], // Retain file list metadata
    status: 'NORMALIZED'
  };
  localStorage.setItem('pipelineData', JSON.stringify(updatedPayload));
  navigate('/enrichment', { state: { pipelineData: updatedPayload } });
};

  const formatHeader = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toUpperCase();
  };

  const renderCellValue = (val) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-300 font-mono">N/A</span>;
    }
    if (typeof val === 'object') {
      return <span className="font-mono text-[11px] text-indigo-700">{JSON.stringify(val)}</span>;
    }
    return String(val);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search case entities..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
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

        {/* Page Content */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schema Normalization Engine</h1>
            <p className="text-sm text-slate-500 mt-0.5">Unifying heterogeneous evidence logs into a canonical data structure</p>
          </div>

          {/* Stepper */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {workflowSteps.map((s, idx) => {
                const isActive = s.step === 3;
                const isPassed = s.step < 3;

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
                      <div className={`h-[2px] flex-1 mx-4 ${isPassed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Normalized Records</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{normalizedRecords.length} Entries</p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Unified Schema
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-xl">
                <Sliders className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Attributes Preserved</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{dynamicColumns.length} Fields</p>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Zero Data Loss
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Canonical Engine Status</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{isProcessing ? 'Mapping...' : 'Aligned'}</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Ready for AI Enrichment
                </span>
              </div>
            </div>
          </div>

          {/* Unified Matrix Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Code className="h-5 w-5 text-indigo-600" />
                <span>Unified Standard Schema Matrix</span>
              </h3>
              {isProcessing && (
                <span className="text-xs text-indigo-600 font-bold flex items-center space-x-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" /> Re-indexing data keys...
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {normalizedRecords.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">#</th>
                      {dynamicColumns.map((col) => (
                        <th key={col} className="p-3 whitespace-nowrap min-w-[130px]">
                          {formatHeader(col)}
                        </th>
                      ))}
                      <th className="p-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {normalizedRecords.map((row, idx) => (
                      <tr key={row.event_id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-500 font-mono sticky left-0 bg-white border-r border-slate-100 z-10">
                          {idx + 1}
                        </td>
                        {dynamicColumns.map((col) => (
                          <td key={col} className="p-3 text-slate-800 max-w-xs truncate font-mono">
                            {renderCellValue(row[col])}
                          </td>
                        ))}
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Unified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No records available for normalization.</p>
                  <p className="text-xs mt-1">Please process files through Step 2 (Preprocessing) first.</p>
                </div>
              )}
            </div>

            {/* Step Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => navigate('/preprocessing', { state: { pipelineData: rawPipelineData } })}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Preprocessing</span>
              </button>

              <button 
                onClick={handleNextStep}
                disabled={isProcessing || normalizedRecords.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Proceed to Enrichment (Step 4)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}