import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  Cpu,
  Fingerprint,
  Tag
} from 'lucide-react';

export default function Enrichment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [rawPipelineData, setRawPipelineData] = useState(null);
  const [enrichedRecords, setEnrichedRecords] = useState([]);
  const [extractedEntities, setExtractedEntities] = useState({
    ips: new Set(),
    upis: new Set(),
    phones: new Set(),
    keywords: new Set()
  });
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // 1. Retrieve normalized data from location state or localStorage
    const rawData = location.state?.pipelineData || JSON.parse(localStorage.getItem('pipelineData') || '{}');
    setRawPipelineData(rawData);

    const records = rawData?.records || rawData?.data || [];

    setIsProcessing(true);

    setTimeout(() => {
      if (records.length > 0) {
        // Dynamic Column Discovery
        const discoveredKeys = new Set(['event_id', 'extracted_entities', 'risk_score']);
        
        const ipSet = new Set();
        const upiSet = new Set();
        const phoneSet = new Set();
        const keywordSet = new Set();

        // Entity Regex Patterns
        const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
        const upiRegex = /[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}/g;
        const phoneRegex = /\+?[0-9]{10,12}/g;
        const highRiskTerms = ['crypto', 'usdt', 'mule', 'commission', 'withdrawal', 'delete', 'transfer', 'upi', 'cash'];

        // 2. Perform AI / Heuristic Enrichment across all fields
        const processed = records.map((item, index) => {
          Object.keys(item).forEach((k) => {
            if (!['_id', 'rawItem', 'evidence'].includes(k)) {
              discoveredKeys.add(k);
            }
          });

          // Convert entire row content into search text for entity extraction
          const rowText = Object.values(item).map(v => String(v)).join(' ');

          // Extract Entities
          const foundIPs = rowText.match(ipRegex) || [];
          const foundUPIs = rowText.match(upiRegex) || [];
          const foundPhones = rowText.match(phoneRegex) || [];
          const foundKeywords = highRiskTerms.filter(term => rowText.toLowerCase().includes(term));

          foundIPs.forEach(ip => ipSet.add(ip));
          foundUPIs.forEach(upi => upiSet.add(upi));
          foundPhones.forEach(ph => phoneSet.add(ph));
          foundKeywords.forEach(kw => keywordSet.add(kw));

          // Calculate Dynamic Risk Score
          let riskScore = 15; // Baseline
          if (foundKeywords.length > 0) riskScore += foundKeywords.length * 25;
          if (foundIPs.length > 0) riskScore += 20;
          if (foundUPIs.length > 0) riskScore += 15;
          if (riskScore > 99) riskScore = 99;

          return {
            ...item,
            event_id: item.event_id || item.id || `ENRICH-${index + 1}`,
            extracted_entities: [
              ...foundIPs.map(i => `IP: ${i}`),
              ...foundUPIs.map(u => `UPI: ${u}`),
              ...foundKeywords.map(k => `TAG: ${k.toUpperCase()}`)
            ].join(', ') || 'NONE_DETECTED',
            risk_score: `${riskScore}%`
          };
        });

        setDynamicColumns(Array.from(discoveredKeys));
        setEnrichedRecords(processed);
        setExtractedEntities({
          ips: ipSet,
          upis: upiSet,
          phones: phoneSet,
          keywords: keywordSet
        });
      } else {
        setEnrichedRecords([]);
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
      records: enrichedRecords,
      columns: dynamicColumns,
      entities: {
        ips: Array.from(extractedEntities.ips),
        upis: Array.from(extractedEntities.upis),
        phones: Array.from(extractedEntities.phones),
        keywords: Array.from(extractedEntities.keywords)
      },
      status: 'ENRICHED'
    };
    localStorage.setItem('pipelineData', JSON.stringify(updatedPayload));
    navigate('/output', { state: { pipelineData: updatedPayload } });

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
        
        {/* Navigation Bar */}
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Entity Extraction & Intelligence Enrichment</h1>
            <p className="text-sm text-slate-500 mt-0.5">Automated entity identification, threat scoring, and risk tag attribution</p>
          </div>

          {/* Stepper */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {workflowSteps.map((s, idx) => {
                const isActive = s.step === 4;
                const isPassed = s.step < 4;

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

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Flagged Threat Terms</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{extractedEntities.keywords.size} Unique Tags</p>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">
                  High Risk Intelligence
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl">
                <Fingerprint className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Extracted IP/Network Nodes</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{extractedEntities.ips.size} IPs</p>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Network Artifacts
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Extracted VPAs / UPIs</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{extractedEntities.upis.size} Endpoints</p>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Financial Targets
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-purple-50 border border-purple-200 text-purple-600 rounded-xl">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold">Enrichment Status</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{isProcessing ? 'Enriching...' : 'Complete'}</p>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                  Ready for Output
                </span>
              </div>
            </div>
          </div>

          {/* Enriched Dynamic Data Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-indigo-600" />
                <span>Enriched Data Matrix</span>
              </h3>
              {isProcessing && (
                <span className="text-xs text-indigo-600 font-bold flex items-center space-x-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" /> Executing NLP entity identification...
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {enrichedRecords.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">#</th>
                      {dynamicColumns.map((col) => (
                        <th key={col} className="p-3 whitespace-nowrap min-w-[130px]">
                          {formatHeader(col)}
                        </th>
                      ))}
                      <th className="p-3">RISK SCORE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrichedRecords.map((row, idx) => (
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            parseInt(row.risk_score) > 50 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <CheckCircle className="w-3 h-3 mr-1" /> {row.risk_score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-semibold">No records available for enrichment.</p>
                  <p className="text-xs mt-1">Please process files through Step 3 (Normalization) first.</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button 
                onClick={() => navigate('/normalization', { state: { pipelineData: rawPipelineData } })}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Normalization</span>
              </button>

              <button 
                onClick={handleNextStep}
                disabled={isProcessing || enrichedRecords.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Proceed to Output Dashboard (Step 5)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
// At the end of Enrichment.jsx handleNextStep:
