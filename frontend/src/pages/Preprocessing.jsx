import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Filter,
  RefreshCw,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  Zap,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Table as TableIcon
} from 'lucide-react';

export default function Preprocessing() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rawPipelineData, setRawPipelineData] = useState(null);
  const [processedRecords, setProcessedRecords] = useState([]);
  const [removedRecords, setRemovedRecords] = useState([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // 1. Retrieve real backend payload from navigation state or localStorage
    const rawData = location.state?.pipelineData || JSON.parse(localStorage.getItem('pipelineData') || '{}');
    setRawPipelineData(rawData);

    // Extract dynamic dataset array (supports 'data', 'records', or 'processed_data')
    const rawRecords = rawData?.data || rawData?.records || rawData?.processed_data || [];

    setIsProcessing(true);

    setTimeout(() => {
      if (rawRecords.length > 0) {
        // 2. DYNAMIC COLUMN DISCOVERY: Extract every unique key across all records
        const discoveredKeys = new Set();
        rawRecords.forEach((item) => {
          if (item && typeof item === 'object') {
            // Include raw row keys as well as nested keys if present
            Object.keys(item).forEach((key) => {
              if (key !== 'evidence' && key !== 'rawItem') {
                discoveredKeys.add(key);
              }
            });
          }
        });

        const columnList = Array.from(discoveredKeys);
        setDynamicColumns(columnList);

        // 3. Process records without dropping unmapped fields
        const clean = [];
        const dirty = [];

        rawRecords.forEach((item, index) => {
          // Check for empty/corrupt records
          const hasData = Object.values(item).some(
            (val) => val !== null && val !== undefined && String(val).trim() !== ''
          );

          if (!hasData) {
            dirty.push({
              _id: item.event_id || item.id || `#${index + 1}`,
              _reason: 'Empty / Null Record',
              ...item
            });
          } else {
            // AFTER (In Preprocessing.jsx)
clean.push({
  _id: item.event_id || item.id || item.chat_id || `#${index + 1}`,
  source_file: item.source_file || item.fileName || item.file_name || rawData.fileName || 'file_1.csv',
  ...item
});
          }
        });

        setProcessedRecords(clean);
        setRemovedRecords(dirty);
      } else {
        setProcessedRecords([]);
        setRemovedRecords([]);
        setDynamicColumns([]);
      }

      setIsProcessing(false);
    }, 300);
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
    records: processedRecords,
    columns: dynamicColumns,
    files: rawPipelineData?.files || [], // Preserves the array of uploaded file metadata
    status: 'PREPROCESSED'
  };
  localStorage.setItem('pipelineData', JSON.stringify(updatedPayload));
  navigate('/normalization', { state: { pipelineData: updatedPayload } });
};

  // Helper to format key headers into readable labels
  const formatHeader = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toUpperCase();
  };

  // Helper to safely render complex cell values (arrays, objects, primitives)
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
        
        {/* Top Header */}
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic Preprocessing Engine</h1>
            <p className="text-sm text-slate-500 mt-0.5">Automated field discovery, schema adaptation, and structure normalization</p>
          </div>

          {/* Workflow Stepper */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {workflowSteps.map((s, idx) => {
                const isActive = s.step === 2;
                const isPassed = s.step < 2;

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

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Loaded Records</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{processedRecords.length} Entries</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                  All Fields Extracted
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                <TableIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Discovered Schema Fields</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{dynamicColumns.length} Attributes</p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Auto-Mapped
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
                <Filter className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Dataset Classification</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5 uppercase">
                  {rawPipelineData?.detected_type || 'UNSTRUCTURED'}
                </p>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                  {isProcessing ? 'Analyzing...' : 'Ready for Normalization'}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Data Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-indigo-600" />
                <span>Live Discovered Field Matrix</span>
              </h3>
              {isProcessing && (
                <span className="text-xs text-indigo-600 font-bold flex items-center space-x-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" /> Reading all dataset attributes...
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {processedRecords.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">#</th>
                      {dynamicColumns.map((col) => (
                        <th key={col} className="p-3 whitespace-nowrap min-w-[120px]">
                          {formatHeader(col)}
                        </th>
                      ))}
                      <th className="p-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processedRecords.map((row, idx) => (
                      <tr key={row._id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-500 font-mono sticky left-0 bg-white border-r border-slate-100 z-10">
                          {row._id}
                        </td>
                        {dynamicColumns.map((col) => (
                          <td key={col} className="p-3 text-slate-800 max-w-xs truncate font-mono">
                            {renderCellValue(row[col])}
                          </td>
                        ))}
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Valid
                          </span>
                        </td>
                      </tr>
                    ))}

                    {removedRecords.map((row, idx) => (
                      <tr key={`dirty-${idx}`} className="bg-amber-50/40 hover:bg-amber-50 transition">
                        <td className="p-3 font-bold text-slate-400 font-mono sticky left-0 bg-amber-50 border-r border-slate-200 z-10">
                          {row._id}
                        </td>
                        {dynamicColumns.map((col) => (
                          <td key={col} className="p-3 text-slate-400 max-w-xs truncate font-mono line-through">
                            {renderCellValue(row[col])}
                          </td>
                        ))}
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 mr-1" /> {row._reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No data records found in backend payload.</p>
                  <p className="text-xs mt-1">Please return to Ingestion (Step 1) and upload a CSV/JSON file.</p>
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => navigate('/datasources')}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Ingestion</span>
              </button>

              <button 
                onClick={handleNextStep}
                disabled={isProcessing || processedRecords.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Proceed to Normalization (Step 3)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}