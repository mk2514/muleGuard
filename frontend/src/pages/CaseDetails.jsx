import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Folder,
  Database,
  Clock,
  FileText,
  Shield,
  User,
  Building,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('muleguard_cases');
    if (stored) {
      try {
        const cases = JSON.parse(stored);
        const match = cases.find((c) => c.case_id === caseId);
        if (match) {
          setCaseData(match);
          setStatus(match.status);
        }
      } catch (err) {
        console.error('Failed to parse cases:', err);
      }
    }
  }, [caseId]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    const stored = localStorage.getItem('muleguard_cases');
    if (stored) {
      const cases = JSON.parse(stored);
      const updated = cases.map((c) =>
        c.case_id === caseId ? { ...c, status: newStatus } : c
      );
      localStorage.setItem('muleguard_cases', JSON.stringify(updated));
    }
  };

  // Case Not Found Guard
  if (!caseData) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 font-sans flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Case Not Found</h2>
            <p className="text-xs text-slate-500 mt-1">
              No record exists for Case ID: <span className="font-mono font-semibold">{caseId}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/cases')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 transition"
          >
            Return to Case Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation */}
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Case Directory</span>
        </button>

        {/* TOP CARD */}
        <div className="bg-white border border-slate-200 rounded p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-blue-600 font-mono">{caseData.case_id}</span>
                <span className="text-xs font-mono text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-500 font-mono">{caseData.police_ref_id}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{caseData.title}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="text-right">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </span>
                <span
                  className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded border ${
                    caseData.priority === 'High'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : caseData.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {caseData.priority}
                </span>
              </div>
            </div>
          </div>

          {/* DETAIL GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div className="border border-slate-100 p-3 rounded bg-slate-50/50">
              <span className="text-slate-400 font-medium block text-[11px] mb-0.5">Investigating Officer</span>
              <span className="font-bold text-slate-800">{caseData.rank} {caseData.officer}</span>
            </div>
            <div className="border border-slate-100 p-3 rounded bg-slate-50/50">
              <span className="text-slate-400 font-medium block text-[11px] mb-0.5">Department & Branch</span>
              <span className="font-semibold text-slate-800">{caseData.department} ({caseData.branch || 'Main'})</span>
            </div>
            <div className="border border-slate-100 p-3 rounded bg-slate-50/50">
              <span className="text-slate-400 font-medium block text-[11px] mb-0.5">FIR Number</span>
              <span className="font-semibold text-slate-800">{caseData.fir_no || 'N/A'}</span>
            </div>
            <div className="border border-slate-100 p-3 rounded bg-slate-50/50">
              <span className="text-slate-400 font-medium block text-[11px] mb-0.5">Location</span>
              <span className="font-semibold text-slate-800">{caseData.location || 'N/A'}</span>
            </div>
            <div className="border border-slate-100 p-3 rounded bg-slate-50/50">
              <span className="text-slate-400 font-medium block text-[11px] mb-0.5">Date of Incident</span>
              <span className="font-semibold text-slate-800">{caseData.incident_date || 'N/A'}</span>
            </div>
            <div className="border border-slate-100 p-3 rounded bg-slate-50/50">
              <span className="text-slate-400 font-medium block text-[11px] mb-0.5">Created Date</span>
              <span className="font-semibold text-slate-800">{caseData.created_at?.split(' ')[0] || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="border-b border-slate-200 flex space-x-6 text-xs font-semibold">
          {['Overview', 'Evidence', 'Data Sources', 'Timeline', 'Notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition border-b-2 ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB PANELS */}
        <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
          {activeTab === 'Overview' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Case Narrative & Summary</h3>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded text-xs text-slate-700 leading-relaxed">
                {caseData.description || 'No descriptive narrative attached to this case file.'}
              </div>
            </div>
          )}

          {activeTab === 'Evidence' && (
            <div className="text-center py-10 text-xs text-slate-400 space-y-2">
              <Folder className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No linked forensic evidence attached.</p>
            </div>
          )}

          {activeTab === 'Data Sources' && (
            <div className="text-center py-10 text-xs text-slate-400 space-y-2">
              <Database className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No ingestion files associated with Case ID {caseData.case_id}.</p>
            </div>
          )}

          {activeTab === 'Timeline' && (
            <div className="border-l-2 border-blue-600 pl-4 py-1 text-xs space-y-1">
              <p className="font-bold text-slate-800">Case Log Created</p>
              <p className="text-[11px] text-slate-500">Registered by {caseData.rank} {caseData.officer}</p>
              <p className="text-[10px] text-slate-400">{caseData.created_at}</p>
            </div>
          )}

          {activeTab === 'Notes' && (
            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="Enter official investigation note..."
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs focus:outline-none focus:border-blue-600 resize-none"
              />
              <button className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded hover:bg-blue-700 transition">
                Add Note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}