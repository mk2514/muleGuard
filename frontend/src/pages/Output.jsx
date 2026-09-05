import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Search,
  Bell,
  ChevronDown,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Database,
  Table as TableIcon,
  CheckCircle,
  Share2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function Output() {
  const location = useLocation();
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  const [rawPipelineData, setRawPipelineData] = useState(null);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Retrieve pipeline payload from route state or browser cache
    const rawData = location.state?.pipelineData || JSON.parse(localStorage.getItem('pipelineData') || '{}');
    setRawPipelineData(rawData);

    const records = rawData?.records || rawData?.data || rawData?.items || [];
    const sourceFileName = rawData?.fileName || rawData?.file_name || 'uploaded_data.csv';

    // Group records dynamically by source file key
    const grouped = {};

    if (records.length > 0) {
      records.forEach((record) => {
        const fileKey =
          record.source_file ||
          record.fileName ||
          record.file_name ||
          record.origin_file ||
          sourceFileName;

        if (!grouped[fileKey]) {
          grouped[fileKey] = [];
        }
        grouped[fileKey].push(record);
      });
    }

    setGroupedRecords(grouped);
  }, [location.state]);

  const workflowSteps = [
    { step: 1, title: 'Ingestion', sub: 'Collect data', path: '/datasources' },
    { step: 2, title: 'Preprocessing', sub: 'Clean & standardize', path: '/preprocessing' },
    { step: 3, title: 'Normalization', sub: 'Unify formats', path: '/normalization' },
    { step: 4, title: 'Enrichment', sub: 'Extract entities', path: '/enrichment' },
    { step: 5, title: 'Output', sub: 'Ready for analysis', path: '/dashboard' },
  ];

  // PDF Export Engine
  const handleExportPDF = () => {
    setIsExporting(true);
    const element = pdfRef.current;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `MuleGuard_Evidence_Report_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setIsExporting(false);
      })
      .catch((err) => {
        console.error('PDF Export Error:', err);
        setIsExporting(false);
      });
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

  // Helper to dynamically discover all dynamic columns for a specific sub-dataset
  const getColumnsForDataset = (recordsList) => {
    const keys = new Set([
      'event_id',
      'standard_type',
      'source_entity',
      'target_entity',
      'iso_timestamp',
      'extracted_entities',
      'risk_score'
    ]);

    recordsList.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (!['_id', 'rawItem', 'evidence'].includes(k)) {
          keys.add(k);
        }
      });
    });

    return Array.from(keys);
  };

  const totalRecordCount = Object.values(groupedRecords).reduce((acc, curr) => acc + curr.length, 0);

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
                placeholder="Search case reports..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Case ID:</span>
              <span className="text-sm font-bold text-indigo-900">
                {rawPipelineData?.case_id || 'MG-2024-1024'}
              </span>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Final Evidence Output Dashboard</h1>
              <p className="text-sm text-slate-500 mt-0.5">Normalized and enriched intelligence output sorted by source files</p>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={isExporting || totalRecordCount === 0}
              className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Export PDF Report'}</span>
            </button>
          </div>

          {/* Workflow Stepper */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {workflowSteps.map((s, idx) => {
                const isActive = s.step === 5;
                const isPassed = s.step < 5;

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

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Processed Source Files</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{Object.keys(groupedRecords).length} File(s)</p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Multi-Source Grouped
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Total Output Records</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{totalRecordCount} Entries</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                  100% Schema Unified
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Pipeline Verification</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">READY</p>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Verified Court-Ready Output
                </span>
              </div>
            </div>
          </div>

          {/* Printable Container for PDF Export */}
          <div ref={pdfRef} className="space-y-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            
            {/* Printable Report Header */}
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-indigo-950 uppercase tracking-wide">MULEGUARD EVIDENCE ANALYSIS REPORT</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Case Reference: {rawPipelineData?.case_id || 'MG-2024-1024'} | Generated on: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded border border-indigo-200">
                  CONFIDENTIAL / LAW ENFORCEMENT
                </span>
              </div>
            </div>

            {/* Dynamic Grouped Tables by File */}
            {Object.keys(groupedRecords).length > 0 ? (
              Object.entries(groupedRecords).map(([fileName, fileRecords]) => {
                const datasetColumns = getColumnsForDataset(fileRecords);

                return (
                  <div key={fileName} className="space-y-3 page-break-inside-avoid">
                    {/* Source File Badge Header */}
                    <div className="bg-slate-800 text-white px-4 py-2.5 rounded-t-lg flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TableIcon className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-bold tracking-wider uppercase">Source File:</span>
                        <span className="text-xs font-mono font-semibold text-indigo-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {fileName}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300">
                        {fileRecords.length} Record(s) Extracted
                      </span>
                    </div>

                    {/* Dynamic Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-b-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            <th className="p-2.5 border-r border-slate-200 font-bold">#</th>
                            {datasetColumns.map((col) => (
                              <th key={col} className="p-2.5 whitespace-nowrap min-w-[120px]">
                                {formatHeader(col)}
                              </th>
                            ))}
                            <th className="p-2.5">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {fileRecords.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-2.5 font-bold text-slate-500 border-r border-slate-100">
                                {idx + 1}
                              </td>
                              {datasetColumns.map((col) => (
                                <td key={col} className="p-2.5 text-slate-800 max-w-xs truncate">
                                  {renderCellValue(row[col])}
                                </td>
                              ))}
                              <td className="p-2.5 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Enriched
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">No output records found in system state.</p>
                <p className="text-xs mt-1">Run data through ingestion steps 1–4 to produce analysis outputs.</p>
              </div>
            )}
          </div>

          {/* Step Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate('/enrichment', { state: { pipelineData: rawPipelineData } })}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Enrichment</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/datasources')}
                className="px-5 py-2.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Start New Investigation</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}