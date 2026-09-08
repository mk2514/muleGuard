import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Filter,
  Download,
  Clock,
  MapPin,
  Users,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Radio,
  Building2,
  ArrowRightLeft,
  CreditCard,
  Globe,
  Zap,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Sliders,
  Layers,
  BarChart3,
  GitCommit,
  Share2
} from 'lucide-react';

export default function Timeline() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Case ID resolution
  const caseIdFromQuery = searchParams.get('caseId');
  const storedCaseId = localStorage.getItem('active_case_id') || 'CASE-2025-1024';
  const activeCaseId = caseIdFromQuery || storedCaseId;

  // View mode: 'Timeline' | 'Event Flow' | 'Time Chart'
  const [viewMode, setViewMode] = useState('Timeline');

  // Timeline & Backend Data State
  const [timelineData, setTimelineData] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  const [expandedEventIds, setExpandedEventIds] = useState(new Set());

  // Filter State
  const [riskFilter, setRiskFilter] = useState('ALL'); // ALL, High, Medium, Low
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('20 May 2025 - 27 May 2025');

  // Playback / Scrubber State
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrubberIndex, setScrubberIndex] = useState(100); // 0 - 100 percentage
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch timeline data from Backend SQLite API with local fallback
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/timeline/${activeCaseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.events && data.events.length > 0) {
            setTimelineData(data);
            setEvents(data.events);
            // Default select ATM Withdrawal or first high-risk event
            const atmEv = data.events.find(e => e.event_type?.includes('ATM')) || data.events.find(e => e.risk_level === 'High') || data.events[0];
            if (atmEv) setSelectedEventId(atmEv.id || 6);
            return;
          }
        }
      } catch (err) {
        // Fallback to local storage
      }

      // Local synthesis fallback
      const savedOutputStr = localStorage.getItem(`output_${activeCaseId}`);
      let fallbackEvents = [];
      if (savedOutputStr) {
        try {
          const parsed = JSON.parse(savedOutputStr);
          if (parsed.records && parsed.records.length > 0) {
            fallbackEvents = parsed.records.map((r, i) => ({
              id: i + 1,
              time_str: r.timestamp ? (r.timestamp.length > 8 ? r.timestamp.slice(-8) : r.timestamp) : `10:${i < 10 ? '0' + i : i} AM`,
              event_type: r.type || (r.amount ? 'Fund Transfer' : 'Activity'),
              description: r.extracted_text || `${r.source || 'Sender'} transacted with ${r.target || 'Beneficiary'}`,
              entity_or_account: `${r.source || '+91 98765 43210'} -> ${r.target || 'Account'}`,
              location: r.location || 'Chennai',
              risk_level: (r.amount && parseFloat(String(r.amount).replace(/[^\d.]/g, '')) >= 100000) ? 'High' : (i % 2 === 0 ? 'Medium' : 'Low'),
              risk_score: (r.amount && parseFloat(String(r.amount).replace(/[^\d.]/g, '')) >= 100000) ? 85 : 55,
              amount: r.amount ? `₹${r.amount}` : '',
              device_or_sim: r.phone || '+91 98765 43210',
              remarks: 'Ingested from evidence pipeline'
            }));
          }
        } catch (e) {}
      }

      if (fallbackEvents.length === 0) {
        fallbackEvents = [
          { id: 1, time_str: "08:05 AM", event_type: "SIM Change Detected", description: "SIM swapped in device +91 98765 43210", entity_or_account: "+91 98765 43210", location: "Anna Nagar", risk_level: "Low", risk_score: 25, amount: "", device_or_sim: "+91 98765 43210", remarks: "SIM card swap reported on telecom switch" },
          { id: 2, time_str: "08:17 AM", event_type: "Call Connected", description: "Outgoing call to +91 91234 56780", entity_or_account: "+91 98765 43210", location: "Anna Nagar", risk_level: "Low", risk_score: 20, amount: "", device_or_sim: "+91 98765 43210", remarks: "Cellular CDR call connection duration: 42s" },
          { id: 3, time_str: "09:25 AM", event_type: "Cash Deposit", description: "₹45,000 deposited in A/C XXXX 4578", entity_or_account: "XXXX 4578", location: "T. Nagar Branch", risk_level: "Medium", risk_score: 60, amount: "₹45,000", device_or_sim: "+91 98765 43210", remarks: "Cash counter branch deposit with KYC alert" },
          { id: 4, time_str: "09:47 AM", event_type: "Location Change", description: "Device moved to T. Nagar, Chennai", entity_or_account: "+91 98765 43210", location: "T. Nagar", risk_level: "Low", risk_score: 30, amount: "", device_or_sim: "+91 98765 43210", remarks: "Base station handover recorded" },
          { id: 5, time_str: "10:05 AM", event_type: "Fund Transfer", description: "₹2,45,000 transferred to A/C XXXX 9921", entity_or_account: "XXXX 4578 -> XXXX 9921", location: "T. Nagar", risk_level: "High", risk_score: 82, amount: "₹2,45,000", device_or_sim: "+91 98765 43210", remarks: "Rapid layering IMPS transfer to mule node" },
          { id: 6, time_str: "10:21 AM", event_type: "ATM Withdrawal", description: "₹2,45,000 withdrawn from ATM", entity_or_account: "XXXX 9978", location: "T. Nagar ATM, Chennai", risk_level: "High", risk_score: 85, amount: "₹2,45,000", device_or_sim: "+91 98765 43210", remarks: "Large cash withdrawal after fund transfer" },
          { id: 7, time_str: "11:32 AM", event_type: "IP Login Detected", description: "Login from IP 103.21.45.67", entity_or_account: "103.21.45.67", location: "Chennai, India", risk_level: "Medium", risk_score: 58, amount: "", device_or_sim: "+91 98765 43210", remarks: "Web banking access from unverified IP range" },
          { id: 8, time_str: "02:18 PM", event_type: "Call Connected", description: "Incoming call from +91 99887 76655", entity_or_account: "+91 98765 43210", location: "Adyar", risk_level: "Low", risk_score: 22, amount: "", device_or_sim: "+91 98765 43210", remarks: "Incoming encrypted telecom audio session" },
          { id: 9, time_str: "04:45 PM", event_type: "Online Transfer", description: "₹60,000 transferred to A/C XXXX 1144", entity_or_account: "XXXX 9921 -> XXXX 1144", location: "Adyar", risk_level: "Medium", risk_score: 68, amount: "₹60,000", device_or_sim: "+91 98765 43210", remarks: "Secondary fast-node fan out to mule intermediary" },
          { id: 10, time_str: "08:53 PM", event_type: "Device Located", description: "Last location captured", entity_or_account: "+91 98765 43210", location: "Besant Nagar", risk_level: "Low", risk_score: 28, amount: "", device_or_sim: "+91 98765 43210", remarks: "Terminal cell tower ping before device turned offline" }
        ];
      }

      setEvents(fallbackEvents);
      setSelectedEventId(fallbackEvents[5]?.id || fallbackEvents[0]?.id);
      setTimelineData({
        time_span: "12h 48m",
        time_range_label: "20 May 08:05 AM - 08:53 PM",
        total_events: 18,
        key_locations: 5,
        entities_involved: 7,
        high_risk_events: 4,
        events: fallbackEvents
      });
    };

    fetchTimeline();
  }, [activeCaseId]);

  // Automated Timeline Playback Loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setScrubberIndex((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 5;
        });
      }, 600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Filtered Events based on Risk and Scrubber Range
  const visibleEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    const maxIdx = Math.max(1, Math.ceil((scrubberIndex / 100) * events.length));
    const sliced = events.slice(0, maxIdx);
    if (riskFilter === 'ALL') return sliced;
    return sliced.filter(e => e.risk_level?.toLowerCase() === riskFilter.toLowerCase());
  }, [events, scrubberIndex, riskFilter]);

  // Active inspected event object
  const selectedEvent = useMemo(() => {
    return events.find(e => (e.id || e.event_id) === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  // Related events (temporally proximal or shared account)
  const relatedEvents = useMemo(() => {
    if (!selectedEvent) return [];
    return events
      .filter(e => (e.id || e.event_id) !== (selectedEvent.id || selectedEvent.event_id))
      .slice(0, 3);
  }, [events, selectedEvent]);

  // Helper for Event Type Icons & Colors
  const getEventVisuals = (type, risk) => {
    const t = String(type || '').toUpperCase();
    if (t.includes('SIM')) return { icon: <Smartphone className="w-3.5 h-3.5" />, bg: 'bg-blue-50 text-blue-600 border-blue-200' };
    if (t.includes('CALL') || t.includes('TOWER')) return { icon: <Radio className="w-3.5 h-3.5" />, bg: 'bg-purple-50 text-purple-600 border-purple-200' };
    if (t.includes('DEPOSIT') || t.includes('CASH')) return { icon: <Building2 className="w-3.5 h-3.5" />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    if (t.includes('LOCATION') || t.includes('DEVICE')) return { icon: <MapPin className="w-3.5 h-3.5" />, bg: 'bg-rose-50 text-rose-600 border-rose-200' };
    if (t.includes('TRANSFER') || t.includes('DRAIN')) return { icon: <ArrowRightLeft className="w-3.5 h-3.5" />, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
    if (t.includes('ATM')) return { icon: <CreditCard className="w-3.5 h-3.5" />, bg: 'bg-amber-50 text-amber-600 border-amber-200' };
    if (t.includes('IP') || t.includes('LOGIN')) return { icon: <Globe className="w-3.5 h-3.5" />, bg: 'bg-purple-50 text-purple-600 border-purple-200' };
    return { icon: <Activity className="w-3.5 h-3.5" />, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  // Toggle single event accordion expansion
  const toggleExpandEvent = (id) => {
    const next = new Set(expandedEventIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedEventIds(next);
  };

  // Toggle expand/collapse all
  const handleToggleExpandAll = () => {
    if (isExpandedAll) {
      setExpandedEventIds(new Set());
      setIsExpandedAll(false);
    } else {
      setExpandedEventIds(new Set(events.map(e => e.id || e.event_id)));
      setIsExpandedAll(true);
    }
  };

  // Export handler
  const handleExportTimeline = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Time,Event Type,Description,Entity/Account,Location,Risk Level,Amount,Remarks"]
      .concat(events.map(e => `"${e.time_str}","${e.event_type}","${e.description}","${e.entity_or_account}","${e.location}","${e.risk_level}","${e.amount || ''}","${e.remarks || ''}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MuleGuard_Temporal_Timeline_${activeCaseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Timeline export generated for case ${activeCaseId}`);
  };

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
            HEADER SECTION (MATCHING REFERENCE SLIDE)
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/cases')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center space-x-1 mb-1 transition"
            >
              <span>&larr; Back to Cases</span>
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{activeCaseId}</h1>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider hidden md:inline-block">
                TEMPORAL INTELLIGENCE ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ATM Fraud Case – Chennai
            </p>
          </div>

          {/* Right Header Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Picker */}
            <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-2 shadow-xs">
              <span>{dateRange}</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 shadow-xs transition"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filters</span>
              {riskFilter !== 'ALL' && (
                <span className="ml-1 w-2 h-2 rounded-full bg-purple-600" />
              )}
            </button>

            {/* Export Timeline Button */}
            <button
              onClick={handleExportTimeline}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Timeline</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            SUB-HEADER & VIEW MODE TOGGLE (MATCHING SLIDE)
            ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Temporal Intelligence Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconstruct events in chronological order and analyze patterns over time.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-lg shadow-xs text-xs font-bold text-slate-600 self-start sm:self-auto">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider px-2">View Mode:</span>
            <button
              onClick={() => setViewMode('Timeline')}
              className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                viewMode === 'Timeline'
                  ? 'bg-purple-100 text-purple-800 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('Event Flow')}
              className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                viewMode === 'Event Flow'
                  ? 'bg-purple-100 text-purple-800 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <GitCommit className="w-3 h-3" />
              <span>Event Flow</span>
            </button>
            <button
              onClick={() => setViewMode('Time Chart')}
              className={`px-3 py-1 rounded-md transition flex items-center space-x-1 ${
                viewMode === 'Time Chart'
                  ? 'bg-purple-100 text-purple-800 shadow-xs'
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Time Chart</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            5 TOP KPI METRIC CARDS ROW (MATCHING SLIDE)
            ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Time Span */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Time Span</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{timelineData?.time_span || '12h 48m'}</p>
              <p className="text-[10px] text-slate-500 font-medium">{timelineData?.time_range_label || '20 May 08:05 AM - 08:53 PM'}</p>
            </div>
          </div>

          {/* Card 2: Total Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-full">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{timelineData?.total_events || 18}</p>
              <p className="text-[10px] text-slate-500 font-medium">All activities in this case</p>
            </div>
          </div>

          {/* Card 3: Key Locations */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-full">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Locations</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{timelineData?.key_locations || 5}</p>
              <p className="text-[10px] text-slate-500 font-medium">Unique locations visited</p>
            </div>
          </div>

          {/* Card 4: Entities Involved */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-full">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entities Involved</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{timelineData?.entities_involved || 7}</p>
              <p className="text-[10px] text-slate-500 font-medium">People, accounts, devices</p>
            </div>
          </div>

          {/* Card 5: High Risk Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center space-x-3.5 col-span-2 sm:col-span-1">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-full">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High Risk Events</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{timelineData?.high_risk_events || 4}</p>
              <p className="text-[10px] text-slate-500 font-medium">Events flagged as high risk</p>
            </div>
          </div>
        </div>

        {/* =========================================================
            MAIN CONTENT AREA (TIMELINE / EVENT FLOW / TIME CHART)
            ========================================================= */}
        {viewMode === 'Timeline' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Chronological Timeline (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Chronological Timeline
                </h3>
                <button
                  onClick={handleToggleExpandAll}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{isExpandedAll ? 'Collapse All' : 'Expand All'}</span>
                </button>
              </div>

              {/* Interactive Vertical Timeline */}
              <div className="relative pl-6 space-y-4">
                {/* Continuous Connecting Vertical Line */}
                <div className="absolute left-[102px] top-3 bottom-3 w-0.5 bg-slate-200" />

                {visibleEvents.map((ev, idx) => {
                  const isSelected = (ev.id || ev.event_id) === (selectedEvent?.id || selectedEvent?.event_id);
                  const isExpanded = isExpandedAll || expandedEventIds.has(ev.id || ev.event_id);
                  const visuals = getEventVisuals(ev.event_type, ev.risk_level);

                  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (ev.risk_level === 'Medium') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (ev.risk_level === 'High') badgeColor = 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <div
                      key={ev.id || idx}
                      onClick={() => setSelectedEventId(ev.id || ev.event_id)}
                      className={`relative flex items-start gap-4 p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-50/60 border border-purple-200 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      {/* Left: Timestamp */}
                      <div className="w-16 text-right shrink-0 pt-0.5">
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          {ev.time_str}
                        </span>
                      </div>

                      {/* Center Node Icon */}
                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${visuals.bg} shadow-xs ring-4 ring-white`}>
                        {visuals.icon}
                      </div>

                      {/* Middle: Event Title & Description */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline space-x-2">
                          <p className="text-xs font-bold text-slate-900">{ev.event_type}</p>
                          {ev.amount && (
                            <span className="text-xs font-extrabold text-slate-900">{ev.amount}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5" title={ev.description}>
                          {ev.description}
                        </p>

                        {/* Accordion detail if expanded */}
                        {isExpanded && (
                          <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                            <p><strong>Device / SIM:</strong> {ev.device_or_sim || '—'}</p>
                            <p><strong>Remarks:</strong> {ev.remarks || 'Standard telemetry capture'}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Entity / Account & Location */}
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-mono text-slate-700">{ev.entity_or_account}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{ev.location}</p>
                      </div>

                      {/* Far Right: Risk Badge & Accordion Toggle */}
                      <div className="flex items-center space-x-1.5 shrink-0 pl-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                          {ev.risk_level || 'Low'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandEvent(ev.id || ev.event_id);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Caption */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Timeline shows all events in chronological order. Click on any event to view details and connections.</span>
              </div>
            </div>

            {/* Right Column: Event Details & Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Box 1: Event Details */}
              {selectedEvent && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Event Details
                    </h3>
                    <button
                      onClick={() => setSelectedEventId(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Header Title with Icon & Risk Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{selectedEvent.event_type}</h4>
                        <p className="text-[10px] text-slate-400">{selectedEvent.full_timestamp || '20 May 2025, 10:21 AM'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                      {selectedEvent.risk_level === 'High' ? 'High Risk' : `${selectedEvent.risk_level} Risk`}
                    </span>
                  </div>

                  {/* Metadata Table */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Event Type</span>
                      <span className="font-bold text-slate-800">{selectedEvent.event_type}</span>
                    </div>
                    {selectedEvent.amount && (
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-mono font-bold text-slate-900">{selectedEvent.amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">From Account</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedEvent.entity_or_account || 'XXXX 9921'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">ATM Location</span>
                      <span className="font-semibold text-slate-800">{selectedEvent.location || 'T. Nagar ATM, Chennai'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Device / SIM</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedEvent.device_or_sim || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Time</span>
                      <span className="font-semibold text-slate-800">20 May 2025, {selectedEvent.time_str}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Risk Score</span>
                      <span className="font-black text-red-600">{selectedEvent.risk_score || 85}%</span>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-400 block mb-0.5">Remarks</span>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {selectedEvent.remarks || 'Large cash withdrawal after fund transfer'}
                      </p>
                    </div>
                  </div>

                  {/* View on Map Button */}
                  <button
                    onClick={() => navigate(`/map?caseId=${activeCaseId}&location=${encodeURIComponent(selectedEvent.location || 'Chennai')}`)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>View on Map</span>
                  </button>
                </div>
              )}

              {/* Box 2: Related Events */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Related Events ({relatedEvents.length})
                </h3>

                <div className="space-y-2">
                  {relatedEvents.map((rel, i) => {
                    const visuals = getEventVisuals(rel.event_type);
                    return (
                      <div
                        key={rel.id || i}
                        onClick={() => setSelectedEventId(rel.id || rel.event_id)}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/20 transition cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${visuals.bg}`}>
                            {visuals.icon}
                          </div>
                          <div>
                            <span className="font-mono text-[10px] text-slate-400 block">{rel.time_str}</span>
                            <span className="font-bold text-slate-800">{rel.event_type}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-600">
                          {rel.amount || rel.location}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 3: Timeline Controls & Interactive Scrubber */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Timeline Controls
                  </h3>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
                    title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Range Scrubber Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={scrubberIndex}
                    onChange={(e) => setScrubberIndex(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                    <span>08:05 AM</span>
                    <span className="text-indigo-600">20 May 2025</span>
                    <span>08:53 PM</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : viewMode === 'Event Flow' ? (
          /* Event Flow / Sankey View */
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Event Sequence Flow</h3>
            <p className="text-xs text-slate-500">Directed flow of actions from initial SIM swap to multi-point fund dispersion.</p>
            <div className="flex items-center space-x-3 overflow-x-auto py-6">
              {events.map((e, idx) => (
                <React.Fragment key={idx}>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[170px] shrink-0 text-xs shadow-xs space-y-1">
                    <span className="text-[10px] font-mono text-purple-700 font-bold">{e.time_str}</span>
                    <p className="font-bold text-slate-900">{e.event_type}</p>
                    <p className="text-[11px] text-slate-500 truncate">{e.location}</p>
                    {e.amount && <p className="font-mono font-bold text-slate-800">{e.amount}</p>}
                  </div>
                  {idx < events.length - 1 && (
                    <span className="text-slate-300 font-bold text-lg shrink-0">&rarr;</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          /* Time Chart View */
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900">Activity Distribution Over Time</h3>
            <p className="text-xs text-slate-500">Hourly density of telecom, financial, and movement events.</p>
            <div className="h-64 flex items-end justify-between gap-2 pt-6 border-b border-slate-200 px-4">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((h, i) => {
                const height = [40, 65, 95, 45, 30, 20, 50, 35, 70, 25, 85, 30, 55][i];
                const isPeak = height >= 85;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isPeak ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                      title={`${h} - ${height} relative activity units`}
                    />
                    <span className="text-[10px] font-mono text-slate-500">{h}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Filter Timeline Events</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Risk Severity Filter</label>
                <div className="grid grid-cols-4 gap-2 mt-1.5">
                  {['ALL', 'High', 'Medium', 'Low'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setRiskFilter(lvl)}
                      className={`py-1.5 rounded-lg font-bold border transition ${
                        riskFilter === lvl
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Active Investigation Window</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setRiskFilter('ALL');
                  setIsFilterModalOpen(false);
                }}
                className="px-3.5 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setIsFilterModalOpen(false);
                  showToast('Timeline filters applied successfully');
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
