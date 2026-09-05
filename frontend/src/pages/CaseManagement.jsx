import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  FileText,
  Clock,
  Shield,
  Folder,
  Database,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Default initial cases if localStorage is empty
const DEFAULT_CASES = [
  {
    case_id: 'MG-2026-1024',
    title: 'Phishing Network Investigation - Axis Bank Mules',
    description: 'Investigation into organized cyber financial fraud ring utilizing fake KYC accounts across Chandigarh region.',
    police_ref_id: 'POL-2026-0891',
    officer: 'Inspector Raj',
    rank: 'Inspector',
    department: 'Cyber Crime Cell',
    branch: 'Sector 17, Chandigarh',
    fir_no: 'FIR-045/2026',
    location: 'Chandigarh Central',
    incident_date: '2026-02-14',
    priority: 'High',
    status: 'In Progress',
    created_at: '2026-02-15 10:30:00'
  },
  {
    case_id: 'MG-2026-1025',
    title: 'UPI Layering Fraud & Money Laundering',
    description: 'Rapid movement of stolen funds through multiple fast-node UPI VPAs within short time windows.',
    police_ref_id: 'POL-2026-0912',
    officer: 'SI Vikram Sharma',
    rank: 'Sub-Inspector',
    department: 'Economic Offences Wing',
    branch: 'Mohali Phase 7',
    fir_no: 'FIR-102/2026',
    location: 'Mohali',
    incident_date: '2026-03-01',
    priority: 'Medium',
    status: 'Open',
    created_at: '2026-03-02 14:15:00'
  }
];

export default function CaseManagement() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    police_ref_id: '',
    officer: '',
    rank: 'Inspector',
    department: 'Cyber Crime',
    branch: '',
    fir_no: '',
    location: '',
    incident_date: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    status: 'Open'
  });

  // Load from localStorage on mount
  useEffect(() => {
    const storedCases = localStorage.getItem('muleguard_cases');
    if (storedCases) {
      try {
        setCases(JSON.parse(storedCases));
      } catch (e) {
        setCases(DEFAULT_CASES);
      }
    } else {
      setCases(DEFAULT_CASES);
      localStorage.setItem('muleguard_cases', JSON.stringify(DEFAULT_CASES));
    }
  }, []);

  // Save cases to localStorage on state change
  const saveCasesToStorage = (updatedCases) => {
    setCases(updatedCases);
    localStorage.setItem('muleguard_cases', JSON.stringify(updatedCases));
  };

  // Generate Police Ref ID and Case ID
  const openCreateModal = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      title: '',
      description: '',
      police_ref_id: `POL-${year}-${randomNum}`,
      officer: '',
      rank: 'Inspector',
      department: 'Cyber Crime',
      branch: '',
      fir_no: '',
      location: '',
      incident_date: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Open'
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateCase = (e) => {
    e.preventDefault();
    const year = new Date().getFullYear();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    
    const newCase = {
      ...formData,
      case_id: `MG-${year}-${randomId}`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    const updatedCases = [newCase, ...cases];
    saveCasesToStorage(updatedCases);
    setIsCreateModalOpen(false);
  };

  const handleStatusChange = (caseId, newStatus) => {
    const updatedCases = cases.map((c) => 
      c.case_id === caseId ? { ...c, status: newStatus } : c
    );
    saveCasesToStorage(updatedCases);
    if (activeCase && activeCase.case_id === caseId) {
      setActiveCase({ ...activeCase, status: newStatus });
    }
  };

  // Filter & Search Logic
  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.police_ref_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Case Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Law Enforcement Records & Incident Tracking System</p>
        </div>
        {!activeCase && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded border border-blue-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Case</span>
          </button>
        )}
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        
        {/* VIEW MODE: DETAILED CASE DETAIL */}
        {activeCase ? (
          <div className="space-y-6">
            
            {/* Top Navigation Back */}
            <button
              onClick={() => setActiveCase(null)}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Case Directory</span>
            </button>

            {/* Case Overview Card */}
            <div className="bg-white border border-slate-200 rounded p-6 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-blue-600 font-mono">{activeCase.case_id}</span>
                    <span className="text-xs font-mono text-slate-400">|</span>
                    <span className="text-xs font-semibold text-slate-500 font-mono">{activeCase.police_ref_id}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{activeCase.title}</h2>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Update Status</label>
                    <select
                      value={activeCase.status}
                      onChange={(e) => handleStatusChange(activeCase.case_id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Priority</span>
                    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${
                      activeCase.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                      activeCase.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {activeCase.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Attributes */}
              <div className="grid grid-cols-4 gap-4 text-xs pt-2">
                <div>
                  <span className="text-slate-400 font-medium block">Investigating Officer</span>
                  <span className="font-bold text-slate-800">{activeCase.rank} {activeCase.officer}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Department / Branch</span>
                  <span className="font-semibold text-slate-800">{activeCase.department} ({activeCase.branch})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">FIR Reference</span>
                  <span className="font-semibold text-slate-800">{activeCase.fir_no || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Incident Location</span>
                  <span className="font-semibold text-slate-800">{activeCase.location}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
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

            {/* Tab Contents */}
            <div className="bg-white border border-slate-200 rounded p-6">
              {activeTab === 'Overview' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Incident Summary</h3>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 border border-slate-100 rounded">
                    {activeCase.description || 'No detailed narrative recorded for this case.'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                    <div className="border border-slate-100 p-3 rounded">
                      <span className="text-slate-400 block font-medium">Incident Date</span>
                      <span className="font-semibold text-slate-800">{activeCase.incident_date}</span>
                    </div>
                    <div className="border border-slate-100 p-3 rounded">
                      <span className="text-slate-400 block font-medium">Record Logged At</span>
                      <span className="font-semibold text-slate-800">{activeCase.created_at}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Evidence' && (
                <div className="text-center py-8 text-xs text-slate-400">
                  <Folder className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-slate-600">No physical evidence attached to this case directory.</p>
                  <p className="mt-0.5">Use the Ingestion Module to attach forensic images or documents.</p>
                </div>
              )}

              {activeTab === 'Data Sources' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Linked Ingested Files</span>
                    <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">Link New Source +</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <Database className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-semibold text-slate-800">CDR_Airtel_Target_01.csv</p>
                        <p className="text-[10px] text-slate-400">Type: Telecom Call Records • 12,543 records</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded">Normalized</span>
                  </div>
                </div>
              )}

              {activeTab === 'Timeline' && (
                <div className="space-y-3 text-xs">
                  <div className="border-l-2 border-blue-600 pl-3 space-y-1">
                    <p className="font-bold text-slate-800">Case Registered</p>
                    <p className="text-[11px] text-slate-500">Log created by {activeCase.rank} {activeCase.officer}</p>
                    <p className="text-[10px] text-slate-400">{activeCase.created_at}</p>
                  </div>
                </div>
              )}

              {activeTab === 'Notes' && (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Enter official investigation note..."
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-blue-700">
                    Add Note
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          
          /* VIEW MODE: MAIN CASE DIRECTORY TABLE */
          <div className="space-y-4">
            
            {/* Filter and Search Bar */}
            <div className="bg-white border border-slate-200 rounded p-4 flex flex-wrap items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Case ID, Title, or Police Ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-600">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-600"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-600">Priority:</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-600"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Cases Table */}
            <div className="bg-white border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Police Ref ID</th>
                    <th className="py-3 px-4">Officer Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredCases.length > 0 ? (
                    filteredCases.map((c) => (
                      <tr key={c.case_id} className="hover:bg-slate-50 transition">

                        {/* Clickable Case ID */}
                        <td
                          onClick={() => navigate(`/data-sources?caseId=${c.case_id}`)}
                          className="py-3 px-4 font-mono font-bold text-blue-600 hover:underline cursor-pointer whitespace-nowrap"
                        >
                          {c.case_id}
                        </td>

                        {/* Clickable Case Title → opens Data Sources scoped to this case */}
                        <td
                          onClick={() => navigate(`/data-sources?caseId=${c.case_id}`)}
                          className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate hover:text-blue-600 hover:underline cursor-pointer"
                          title={`Open Data Sources for ${c.case_id}`}
                        >
                          {c.title}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{c.police_ref_id}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{c.officer}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">{c.department}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            c.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            c.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                            c.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                            c.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400">{c.created_at?.split(' ')[0]}</td>

                        {/* View → Data Sources for this case */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/data-sources?caseId=${c.case_id}`)}
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No cases match the specified search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* CREATE CASE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded shadow-lg w-full max-w-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Register New Investigation Case</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCase} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Case Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Cyber Financial Fraud - Axis Bank Mules"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Brief</label>
                <textarea
                  rows={3}
                  placeholder="Summary of incident or referral details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Police Ref ID (Auto)</label>
                  <input
                    type="text"
                    disabled
                    value={formData.police_ref_id}
                    className="w-full bg-slate-100 border border-slate-200 rounded p-2 font-mono text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Officer Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Inspector Raj"
                    value={formData.officer}
                    onChange={(e) => setFormData({...formData, officer: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rank</label>
                  <select
                    value={formData.rank}
                    onChange={(e) => setFormData({...formData, rank: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Inspector">Inspector</option>
                    <option value="Sub-Inspector">Sub-Inspector (SI)</option>
                    <option value="ASI">Assistant SI (ASI)</option>
                    <option value="DSP">DSP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Cyber Crime"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch / Station</label>
                  <input
                    type="text"
                    placeholder="Sector 17, Chandigarh"
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">FIR Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="FIR-045/2026"
                    value={formData.fir_no}
                    onChange={(e) => setFormData({...formData, fir_no: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Chandigarh"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Incident</label>
                  <input
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 border border-blue-700"
                >
                  Save Case
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}