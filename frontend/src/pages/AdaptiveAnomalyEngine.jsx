import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Calendar,
  Filter,
  Bell,
  Download,
  Database,
  Search,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Building2,
  Share2,
  User,
  RotateCcw,
  Trophy,
  Info,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Zap,
  Repeat,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { FRAUD_SCENARIOS, CODEWORD_CATEGORIES, CASES } from '../lib/constants';

export default function AdaptiveAnomalyEngine() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Case
  const initialCaseId = searchParams.get('caseId') || 'CASE-2024-1024';
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);

  // Selected Scenario / Weights Profile
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('Bank Fraud');
  const scenario = FRAUD_SCENARIOS[selectedScenarioKey] || FRAUD_SCENARIOS['Bank Fraud'];

  // Dynamic Engine Weights (Initialized from Scenario)
  const [weights, setWeights] = useState({
    behavior: scenario.weights.behavior,
    network: scenario.weights.network,
    rules: scenario.weights.rules,
  });

  // Raw Engine Scores (0.0 to 1.0)
  const [engineScores, setEngineScores] = useState({
    behavior: 0.92,
    network: 0.85,
    rules: 0.85,
  });

  // Contextual Risk Adjustment (+3)
  const [contextualAdjustment, setContextualAdjustment] = useState(scenario.contextualAdjustment || 3);

  // Selected Entity for Relative Baseline
  const [selectedEntity, setSelectedEntity] = useState({
    name: 'Ramesh',
    id: 'PER-1001',
    avgTxnCount: '2.1',
    avgTxnAmount: '₹12,450',
    maxTxnAmount: '₹25,000',
    todayDeviation: '4.8σ',
    deviationStatus: 'Very High',
    role: 'Primary Mule / Beneficiary',
  });

  // Feedback Loop State
  const [feedbackStats, setFeedbackStats] = useState({
    total: 37,
    confirmed: 23,
    dismissed: 14,
    trend: '↑ 22% vs last 7 days',
  });

  // UI Modals & Drawers
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState(null);
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [toastMessage, setToastMessage] = useState(null);

  // Update weights when scenario changes
  const handleSelectScenario = (key) => {
    setSelectedScenarioKey(key);
    const newScen = FRAUD_SCENARIOS[key];
    if (newScen) {
      setWeights({
        behavior: newScen.weights.behavior,
        network: newScen.weights.network,
        rules: newScen.weights.rules,
      });
      setContextualAdjustment(newScen.contextualAdjustment);
      setSelectedEntity(prev => ({
        ...prev,
        avgTxnAmount: newScen.avgTxn,
        maxTxnAmount: newScen.maxTxn,
        todayDeviation: newScen.todayDeviation,
      }));
    }
    setIsScenarioModalOpen(false);
    triggerToast(`Applied Scenario: ${key}`);
  };

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Inspect LocalStorage for real case records & Neo4j entities
  const dynamicCaseEntities = useMemo(() => {
    try {
      const stored = localStorage.getItem(`entities_${selectedCaseId}`) || localStorage.getItem('entities');
      if (stored) {
        const parsed = JSON.parse(stored);
        const list = parsed.entities || (Array.isArray(parsed) ? parsed : []);
        if (list.length > 0) {
          return list.map((item, idx) => ({
            name: item.canonical_value || item.name || `Entity-${idx + 1}`,
            id: item.canonical_id || item.id || `ENT-${1000 + idx}`,
            avgTxnCount: (1.5 + (idx % 3) * 0.8).toFixed(1),
            avgTxnAmount: `₹${((idx + 1) * 12450).toLocaleString('en-IN')}`,
            maxTxnAmount: `₹${((idx + 1) * 25000).toLocaleString('en-IN')}`,
            todayDeviation: idx === 0 ? '4.8σ' : `${(2.2 + idx * 0.7).toFixed(1)}σ`,
            deviationStatus: idx === 0 ? 'Very High' : 'Elevated',
            role: item.role || item.type || 'Account Holder',
          }));
        }
      }
    } catch {
      // fallback
    }
    return [
      {
        name: 'Ramesh',
        id: 'PER-1001',
        avgTxnCount: '2.1',
        avgTxnAmount: '₹12,450',
        maxTxnAmount: '₹25,000',
        todayDeviation: '4.8σ',
        deviationStatus: 'Very High',
        role: 'Primary Suspect / Mule Account',
      },
      {
        name: 'UNKNOWN_SRC_1',
        id: 'ACC-9981',
        avgTxnCount: '0.8',
        avgTxnAmount: '₹8,200',
        maxTxnAmount: '₹18,000',
        todayDeviation: '5.4σ',
        deviationStatus: 'Critical Burst',
        role: 'Funnel Layering Node',
      },
      {
        name: 'Anita Kaur',
        id: 'SIM-7712',
        avgTxnCount: '3.4',
        avgTxnAmount: '₹5,100',
        maxTxnAmount: '₹12,000',
        todayDeviation: '3.9σ',
        deviationStatus: 'High',
        role: 'Recruited Student Mule',
      },
    ];
  }, [selectedCaseId]);

  // Dynamic Recent Adaptive Alerts with Text & Codeword Anomaly Detection
  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-1',
      time: 'Today, 10:32 AM',
      entity: 'ACC-9981',
      pattern: 'Burst Activity',
      patternIcon: '⚡',
      score: 95,
      impact: { behavior: true, network: true, rules: true },
      textMatch: '14 consecutive IMPS transactions totaling ₹4,80,000 received in 3 minutes, immediately dissipated to 6 UPI VPAs.',
      codeword: 'Burst Velocity / Automated Script',
      engineBreakdown: { behavior: 0.96, network: 0.91, rules: 0.88 },
      status: 'Unresolved',
    },
    {
      id: 'ALT-2',
      time: 'Today, 09:58 AM',
      entity: 'SIM-7712',
      pattern: 'SIM Swap Detected',
      patternIcon: '🔄',
      score: 91,
      impact: { behavior: true, network: true, rules: true },
      textMatch: 'IMSI changed from Airtel North to Vodafone West circle 1 hr 45 min before high-value net-banking password reset.',
      codeword: 'Evasion / Credential Hijack',
      engineBreakdown: { behavior: 0.89, network: 0.84, rules: 0.92 },
      status: 'Unresolved',
    },
    {
      id: 'ALT-3',
      time: 'Today, 09:42 AM',
      entity: 'LOC-1209',
      pattern: 'Location Overlap',
      patternIcon: '📍',
      score: 76,
      impact: { behavior: true, network: true, rules: true },
      textMatch: 'Simultaneous ATM cash withdrawal attempts at Chandigarh Sector 17 & Delhi Connaught Place within 12 minutes (Impossible Velocity: 1,200 km/h).',
      codeword: 'Concurrent Multi-Geo Card Clone',
      engineBreakdown: { behavior: 0.72, network: 0.78, rules: 0.75 },
      status: 'Investigating',
    },
    {
      id: 'ALT-4',
      time: 'Today, 09:30 AM',
      entity: 'ACC-3301',
      pattern: 'Layering Pattern',
      patternIcon: '⚡',
      score: 89,
      impact: { behavior: true, network: true, rules: true },
      textMatch: 'Round-sum fan-out of ₹5,40,000 split across 6 intermediary mule accounts, then consolidated to OTC crypto broker.',
      codeword: 'Smurfing / Structuring Cycle',
      engineBreakdown: { behavior: 0.88, network: 0.94, rules: 0.81 },
      status: 'Unresolved',
    },
    {
      id: 'ALT-5',
      time: 'Yesterday, 11:15 PM',
      entity: 'USR-5634',
      pattern: 'Graph Anomaly',
      patternIcon: '🕸️',
      score: 85,
      impact: { behavior: true, network: true, rules: true },
      textMatch: 'Neo4j topology detects closed 4-hop circular laundering loop returning 92% of funds to originator minus 8% retention fee.',
      codeword: 'Closed Directed Loop Laundering',
      engineBreakdown: { behavior: 0.80, network: 0.96, rules: 0.75 },
      status: 'Confirmed',
    },
    {
      id: 'ALT-6',
      time: 'Today, 08:15 AM',
      entity: 'TXN-4029',
      pattern: 'Codeword: "CHENNAI-EXPRESS"',
      patternIcon: '💬',
      score: 94,
      impact: { behavior: true, network: true, rules: true },
      textMatch: 'Transaction narration: "CHENNAI-EXPRESS TOK-992 CLEAR CASH FOR PARCHI 4". Matches known Angadia Hawala courier code list.',
      codeword: 'Hawala Informal Courier Token',
      engineBreakdown: { behavior: 0.90, network: 0.87, rules: 0.98 },
      status: 'Unresolved',
    },
    {
      id: 'ALT-7',
      time: 'Today, 07:40 AM',
      entity: 'PER-1001',
      pattern: 'Codeword: "5% AGENT CUT"',
      patternIcon: '💬',
      score: 88,
      impact: { behavior: true, network: true, rules: true },
      textMatch: 'Chat narration / payment note: "Transfer remaining, retain 5% agent cut as discussed with boss". Flagged by NLP Rules Engine.',
      codeword: 'Mule Commission Retention Marker',
      engineBreakdown: { behavior: 0.84, network: 0.82, rules: 0.95 },
      status: 'Unresolved',
    },
  ]);

  // Compute Live Multi-Engine Fusion Calculations
  const calculatedContributions = useMemo(() => {
    const totalWeight = weights.behavior + weights.network + weights.rules || 100;
    const wB = weights.behavior / totalWeight;
    const wN = weights.network / totalWeight;
    const wR = weights.rules / totalWeight;

    const contribB = Number((engineScores.behavior * wB).toFixed(2));
    const contribN = Number((engineScores.network * wN).toFixed(2));
    const contribR = Number((engineScores.rules * wR).toFixed(2));

    const sumScore = contribB + contribN + contribR;
    const baseScore = Math.round(sumScore * 100);
    const finalScore = Math.min(100, Math.max(0, baseScore + contextualAdjustment));

    return {
      wB,
      wN,
      wR,
      contribB,
      contribN,
      contribR,
      sumScore: Number(sumScore.toFixed(2)),
      baseScore,
      finalScore,
    };
  }, [weights, engineScores, contextualAdjustment]);

  // Dynamic Feedback Action: Confirm Fraud
  const handleConfirmFraud = () => {
    setFeedbackStats(prev => {
      const newConfirmed = prev.confirmed + 1;
      const newTotal = prev.total + 1;
      return {
        ...prev,
        total: newTotal,
        confirmed: newConfirmed,
      };
    });
    // Auto-adjust weights dynamically based on confirmed fraud (boost behavior & network)
    setWeights(prev => ({
      behavior: Math.min(75, prev.behavior + 1),
      network: Math.min(40, prev.network + 1),
      rules: Math.max(10, prev.rules - 2),
    }));
    triggerToast('Investigator feedback logged: Confirmed Fraud. Adaptive weights auto-tuned (+1% Behavior, +1% Network).');
  };

  // Dynamic Feedback Action: Dismiss False Positive
  const handleDismissFalsePositive = () => {
    setFeedbackStats(prev => {
      const newDismissed = prev.dismissed + 1;
      const newTotal = prev.total + 1;
      return {
        ...prev,
        total: newTotal,
        dismissed: newDismissed,
      };
    });
    // Auto-adjust weights dynamically (reduce over-sensitive rules engine)
    setWeights(prev => ({
      behavior: Math.max(40, prev.behavior - 1),
      network: prev.network,
      rules: Math.min(30, prev.rules + 1),
    }));
    triggerToast('Investigator feedback logged: Dismissed False Positive. Sensitivity thresholds recalibrated.');
  };

  // Export Engine Forensic Report
  const handleExportReport = () => {
    const reportData = {
      title: 'MuleGuard AI - Adaptive Anomaly Engine Forensic Report',
      caseId: selectedCaseId,
      scenario: selectedScenarioKey,
      timestamp: new Date().toISOString(),
      finalRiskScore: calculatedContributions.finalScore,
      multiEngineScoring: {
        behavior: { rawScore: engineScores.behavior, weight: `${weights.behavior}%`, contribution: calculatedContributions.contribB },
        network: { rawScore: engineScores.network, weight: `${weights.network}%`, contribution: calculatedContributions.contribN },
        rules: { rawScore: engineScores.rules, weight: `${weights.rules}%`, contribution: calculatedContributions.contribR },
      },
      contextualAdjustment: `+${contextualAdjustment}`,
      entityBaseline: selectedEntity,
      recentAlerts: alerts,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIL_Report_${selectedCaseId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Forensic Anomaly Report successfully exported!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==========================================
          TOP HEADER & CONTEXT CONTROLS
          ========================================== */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 py-3.5 shadow-sm">
        {/* Left Title & Back */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate(-1)}
            title="Go Back"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Adaptive Anomaly Engine (AIL)
              </h1>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Activity className="h-3.5 w-3.5 animate-pulse" />
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Case-aware · Multi-pattern · Adaptive Strategy
            </p>
          </div>
        </div>

        {/* Right Controls (Case ID, Date, Filters, Bell, Export) */}
        <div className="flex items-center gap-2.5">
          {/* Case ID Picker */}
          <div className="relative">
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setSearchParams({ caseId: e.target.value });
                triggerToast(`Switched to Case: ${e.target.value}`);
              }}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-800 hover:bg-slate-50 focus:border-purple-600 cursor-pointer shadow-xs"
            >
              <option value="CASE-2024-1024">Case ID: CASE-2024-1024</option>
              <option value="MG-2024-0981">Case ID: MG-2024-0981</option>
              <option value="MG-2024-0872">Case ID: MG-2024-0872</option>
              <option value="MG-2024-0744">Case ID: MG-2024-0744</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>20 May 2025 - 27 May 2025</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Filters</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => triggerToast(`3 unreviewed high-priority alerts in ${selectedCaseId}`)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-purple-600/20 hover:bg-purple-700 active:scale-95 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Page Content Wrapper */}
      <div className="max-w-[1520px] mx-auto px-6 py-5 space-y-5">
        {/* ==========================================
            PIPELINE WORKFLOW BANNER (STEPS 1 - 6)
            ========================================== */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
            {/* Step 1 */}
            <div className="flex items-center gap-3 group relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold text-xs shadow-xs">
                <Database className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px]">1</span>
                  <span>Collect Activity</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  New txn / event observed
                </div>
              </div>
              <div className="hidden lg:block text-slate-300 font-bold ml-auto text-sm">→</div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 group relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold text-xs shadow-xs">
                <Search className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px]">2</span>
                  <span>Identify Context</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Analyze sources, entities & timeline
                </div>
              </div>
              <div className="hidden lg:block text-slate-300 font-bold ml-auto text-sm">→</div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 group relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold text-xs shadow-xs">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px]">3</span>
                  <span>Detect Patterns</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Score via 3 engines (Behavior, Network, Rules)
                </div>
              </div>
              <div className="hidden lg:block text-slate-300 font-bold ml-auto text-sm">→</div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3 group relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold text-xs shadow-xs">
                <Sliders className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px]">4</span>
                  <span>Assign Weights</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Case-aware dynamic weighting
                </div>
              </div>
              <div className="hidden lg:block text-slate-300 font-bold ml-auto text-sm">→</div>
            </div>

            {/* Step 5 */}
            <div className="flex items-center gap-3 group relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold text-xs shadow-xs">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px]">5</span>
                  <span>Combine & Analyze</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Calculate final risk score
                </div>
              </div>
              <div className="hidden lg:block text-slate-300 font-bold ml-auto text-sm">→</div>
            </div>

            {/* Step 6 */}
            <div className="flex items-center gap-3 group relative">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-200 text-purple-600 font-bold text-xs shadow-xs">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-white text-[9px]">6</span>
                  <span>Adaptive Learning</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Feedback loop improves accuracy
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            ROW 1: FINAL RISK SCORE | MULTI-ENGINE SCORING | CASE CONTEXT & WEIGHTS
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Final Risk Score Gauge (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Final Risk Score
                </h3>
                <Info className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
              </div>

              {/* Circular Gauge Ring */}
              <div className="relative flex flex-col items-center justify-center my-6">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="url(#riskGradient)"
                    strokeWidth="14"
                    strokeDasharray={402}
                    strokeDashoffset={402 - (402 * calculatedContributions.finalScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                  <defs>
                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score Number inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {calculatedContributions.finalScore}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/100</span>
                  </div>
                  <div className="text-xs font-bold text-red-600 mt-0.5">
                    High Risk
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Very Likely Fraud
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trend Indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                <span>↑</span> 18 pts vs last 7 days
              </span>
            </div>
          </div>

          {/* Card 2: Multi-Engine Scoring (Live) (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Multi-Engine Scoring (Live)
                </h3>
                <button
                  onClick={() => setShowWeightSliders(!showWeightSliders)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showWeightSliders ? 'Hide Sliders' : 'Adjust Weights'}</span>
                </button>
              </div>

              {/* Optional Inline Sliders */}
              {showWeightSliders && (
                <div className="mb-4 p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-900">
                    <span>Behavior Weight ({weights.behavior}%)</span>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={weights.behavior}
                      onChange={(e) => setWeights(w => ({ ...w, behavior: Number(e.target.value) }))}
                      className="w-32 accent-purple-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                    <span>Network Weight ({weights.network}%)</span>
                    <input
                      type="range"
                      min="10"
                      max="70"
                      value={weights.network}
                      onChange={(e) => setWeights(w => ({ ...w, network: Number(e.target.value) }))}
                      className="w-32 accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span>Rules Weight ({weights.rules}%)</span>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={weights.rules}
                      onChange={(e) => setWeights(w => ({ ...w, rules: Number(e.target.value) }))}
                      className="w-32 accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Engines Table Header */}
              <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 pb-2 border-b border-slate-100 uppercase tracking-wider">
                <div className="col-span-5">Engine</div>
                <div className="col-span-3 text-center">Engine Score (Raw)</div>
                <div className="col-span-2 text-center">Assigned Weight</div>
                <div className="col-span-2 text-right">Weighted Contribution</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 text-xs">
                {/* 1. Behavior Engine */}
                <div className="grid grid-cols-12 items-center py-3">
                  <div className="col-span-5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <Activity className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="font-bold text-purple-900">Behavior Engine</div>
                        <div className="text-[10px] text-slate-500">Transaction patterns, frequency, velocity</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 px-2 flex items-center justify-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${engineScores.behavior * 100}%` }} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{engineScores.behavior.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-300 text-purple-700 font-bold text-[11px] bg-purple-50">
                      {weights.behavior}%
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-extrabold text-purple-600 text-sm">
                    {calculatedContributions.contribB.toFixed(2)}
                  </div>
                </div>

                {/* 2. Network / Graph Engine */}
                <div className="grid grid-cols-12 items-center py-3">
                  <div className="col-span-5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Share2 className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="font-bold text-blue-900">Network / Graph Engine</div>
                        <div className="text-[10px] text-slate-500">Connections, clustering, multi-hop relations</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 px-2 flex items-center justify-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${engineScores.network * 100}%` }} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{engineScores.network.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-300 text-blue-700 font-bold text-[11px] bg-blue-50">
                      {weights.network}%
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-extrabold text-blue-600 text-sm">
                    {calculatedContributions.contribN.toFixed(2)}
                  </div>
                </div>

                {/* 3. Rules Engine */}
                <div className="grid grid-cols-12 items-center py-3">
                  <div className="col-span-5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="font-bold text-emerald-900">Rules Engine</div>
                        <div className="text-[10px] text-slate-500">Business rules, thresholds, blacklist hits</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 px-2 flex items-center justify-center gap-2">
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${engineScores.rules * 100}%` }} />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{engineScores.rules.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 text-emerald-700 font-bold text-[11px] bg-emerald-50">
                      {weights.rules}%
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-extrabold text-emerald-600 text-sm">
                    {calculatedContributions.contribR.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Formula Math Box at Bottom */}
            <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl p-2.5 text-center font-mono text-[11px] text-slate-600">
              <span className="font-sans font-semibold text-slate-700">Base Engine Score = </span>
              <span className="text-purple-700">({engineScores.behavior.toFixed(2)} × {calculatedContributions.wB.toFixed(2)})</span> +{' '}
              <span className="text-blue-700">({engineScores.network.toFixed(2)} × {calculatedContributions.wN.toFixed(2)})</span> +{' '}
              <span className="text-emerald-700">({engineScores.rules.toFixed(2)} × {calculatedContributions.wR.toFixed(2)})</span> ={' '}
              <span className="font-bold text-slate-900">{calculatedContributions.sumScore.toFixed(2)} × 100 = </span>
              <span className="font-bold text-purple-700 underline">{calculatedContributions.baseScore}</span>
            </div>
          </div>

          {/* Card 3: Case Context & Weight Profile (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Case Context & Weight Profile
                </h3>
                <button
                  onClick={() => setIsScenarioModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 border border-purple-200/80 rounded-lg px-2.5 py-1 hover:bg-purple-50 transition"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Change Case Type</span>
                </button>
              </div>

              {/* Selected Scenario Pill & Description */}
              <div className="mb-4">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Selected Scenario
                </div>
                <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-xs font-bold shadow-xs">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{selectedScenarioKey}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Donut Chart with Legend */}
              <div className="flex items-center justify-around my-2">
                {/* SVG Multi-Segment Donut Chart */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90">
                    {/* Background */}
                    <circle cx="56" cy="56" r="42" stroke="#F1F5F9" strokeWidth="16" fill="transparent" />
                    {/* Behavior Segment (60%) */}
                    <circle
                      cx="56"
                      cy="56"
                      r="42"
                      stroke="#8B5CF6"
                      strokeWidth="16"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * weights.behavior) / 100}
                      fill="transparent"
                      className="transition-all duration-500"
                    />
                    {/* Network Segment (25%) */}
                    <circle
                      cx="56"
                      cy="56"
                      r="42"
                      stroke="#3B82F6"
                      strokeWidth="16"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * weights.network) / 100}
                      transform={`rotate(${(weights.behavior / 100) * 360} 56 56)`}
                      fill="transparent"
                      className="transition-all duration-500"
                    />
                    {/* Rules Segment (15%) */}
                    <circle
                      cx="56"
                      cy="56"
                      r="42"
                      stroke="#10B981"
                      strokeWidth="16"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * weights.rules) / 100}
                      transform={`rotate(${((weights.behavior + weights.network) / 100) * 360} 56 56)`}
                      fill="transparent"
                      className="transition-all duration-500"
                    />
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-purple-600 shrink-0" />
                    <span className="text-slate-700">Behavior Engine (wB)</span>
                    <span className="text-slate-900 font-bold ml-auto">{weights.behavior}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-blue-500 shrink-0" />
                    <span className="text-slate-700">Network Engine (wN)</span>
                    <span className="text-slate-900 font-bold ml-auto">{weights.network}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500 shrink-0" />
                    <span className="text-slate-700">Rules Engine (wR)</span>
                    <span className="text-slate-900 font-bold ml-auto">{weights.rules}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contextual Risk Adjustment Pill */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-purple-50/40 rounded-xl p-3">
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <span>Contextual Risk Adjustment</span>
                  <Info className="h-3 w-3 text-slate-400 cursor-pointer" />
                </div>
                <div className="text-[10px] text-slate-500">
                  Adjustment based on case context, entity sensitivity & historical feedback.
                </div>
              </div>
              <div className="text-2xl font-black text-purple-700 px-3">
                +{contextualAdjustment}
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            ROW 2: ENTITY-RELATIVE BASELINE | INVESTIGATOR FEEDBACK LOOP | RECENT ADAPTIVE ALERTS
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 4: Entity-Relative Baseline (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Entity-Relative Baseline
                  </h3>
                  <Info className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                </div>
                <button
                  onClick={() => setIsEntityModalOpen(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg px-2.5 py-1 hover:bg-purple-50 transition"
                >
                  View Details
                </button>
              </div>

              {/* Entity Picker Header */}
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-base font-bold text-purple-700">
                    {selectedEntity.name}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">
                    ({selectedEntity.id})
                  </span>
                  <div className="text-[11px] text-slate-400">
                    Baseline computed from last 90 days
                  </div>
                </div>
                <button
                  onClick={() => {
                    const nextIdx = (dynamicCaseEntities.findIndex(e => e.id === selectedEntity.id) + 1) % dynamicCaseEntities.length;
                    setSelectedEntity(dynamicCaseEntities[nextIdx]);
                    triggerToast(`Switched Baseline Entity: ${dynamicCaseEntities[nextIdx].name}`);
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-purple-600 underline"
                >
                  Switch Entity
                </button>
              </div>

              {/* 4 Stat Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] font-semibold text-slate-500 leading-tight">Avg. Txn Count / Day</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">{selectedEntity.avgTxnCount}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Normal</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] font-semibold text-slate-500 leading-tight">Avg. Txn Amount</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1 truncate">{selectedEntity.avgTxnAmount}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Normal</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] font-semibold text-slate-500 leading-tight">Max Txn Amount</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1 truncate">{selectedEntity.maxTxnAmount}</div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-0.5">Normal</div>
                </div>

                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-center">
                  <div className="text-[10px] font-semibold text-red-700 leading-tight">Today's Deviation</div>
                  <div className="text-lg font-extrabold text-red-600 mt-1">{selectedEntity.todayDeviation}</div>
                  <div className="inline-block text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded-md mt-0.5">
                    {selectedEntity.deviationStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Footer */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              Entity-relative baselines remove global threshold bias and reduce false positives.
            </div>
          </div>

          {/* Card 5: Investigator Feedback Loop (3 cols) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Investigator Feedback Loop
                  </h3>
                  <Info className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                </div>
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                  <span>Last 7 Days</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Gauge & Metrics */}
              <div className="flex items-center justify-around my-3">
                {/* Donut Progress */}
                <div className="relative flex flex-col items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="38" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="#10B981"
                      strokeWidth="10"
                      strokeDasharray={238}
                      strokeDashoffset={238 - (238 * (feedbackStats.confirmed / (feedbackStats.total || 1)))}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{feedbackStats.total}</span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">Feedback Actions</span>
                  </div>
                </div>

                {/* Counts */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Confirmed Fraud</div>
                    <div className="text-sm font-bold text-emerald-600">
                      {feedbackStats.confirmed} ({Math.round((feedbackStats.confirmed / (feedbackStats.total || 1)) * 100)}%)
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Dismissed (False Positive)</div>
                    <div className="text-sm font-bold text-amber-600">
                      {feedbackStats.dismissed} ({Math.round((feedbackStats.dismissed / (feedbackStats.total || 1)) * 100)}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Feedback Buttons */}
              <div className="grid grid-cols-2 gap-2 my-2">
                <button
                  onClick={handleConfirmFraud}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition active:scale-95"
                  title="Confirm as actual fraud to adapt engine"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm (+wB)</span>
                </button>
                <button
                  onClick={handleDismissFalsePositive}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition active:scale-95"
                  title="Dismiss as benign false positive"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismiss (-wR)</span>
                </button>
              </div>
            </div>

            {/* Explanatory Footer */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
              Engine weights auto-adjusted for this case type based on investigator feedback.
            </div>
          </div>

          {/* Card 6: Recent Adaptive Alerts (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Recent Adaptive Alerts
                </h3>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Alerts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Entity</th>
                      <th className="pb-2">Detected Pattern</th>
                      <th className="pb-2 text-center">Risk Score</th>
                      <th className="pb-2 text-right">Engine Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.slice(0, 5).map((alert) => (
                      <tr
                        key={alert.id}
                        onClick={() => setSelectedAlertForDetail(alert)}
                        className="hover:bg-purple-50/50 cursor-pointer transition"
                      >
                        <td className="py-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                          {alert.time}
                        </td>
                        <td className="py-2.5 font-bold text-slate-800 whitespace-nowrap">
                          {alert.entity}
                        </td>
                        <td className="py-2.5 text-slate-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{alert.patternIcon}</span>
                            <span className="truncate max-w-[140px]" title={alert.pattern}>
                              {alert.pattern}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded-full ${
                            alert.score >= 90
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {alert.score}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="h-2 w-2 rounded-full bg-purple-600" title="Behavior Impact" />
                            <span className="h-2 w-2 rounded-full bg-blue-500" title="Network Impact" />
                            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Rules Impact" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dots Legend Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-4 text-[11px] font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-600" />
                <span>Behavior Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Network Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Rules Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            ROW 3: WHY ADAPTIVE ENGINE IS SMARTER? BANNER
            ========================================== */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
            Why Adaptive Engine is Smarter?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Pillar 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Case-Aware</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Adjusts weights based on fraud scenario.
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Entity-Relative</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Learns normal behavior for each entity.
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Multi-Engine Fusion</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Combines 3 intelligent engines for balanced risk scoring.
                </div>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Feedback Driven</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Continuously improves with investigator actions.
                </div>
              </div>
            </div>

            {/* Pillar 5: Outcome */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-900">Outcome</div>
                <div className="text-[11px] text-purple-700 mt-0.5 leading-snug font-medium">
                  Higher accuracy, fewer false positives, faster & smarter investigations.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Telemetry Caption */}
        <div className="text-center text-xs text-slate-400 font-medium py-2">
          ⓘ Weights and scores are dynamically updated in real-time as new data and feedback arrive.
        </div>
      </div>

      {/* ==========================================
          MODAL: SCENARIO SELECTOR (CHANGE CASE TYPE)
          ========================================== */}
      {isScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Select Fraud Scenario Profile</h3>
              </div>
              <button onClick={() => setIsScenarioModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Switching fraud scenarios dynamically reconfigures the AI Engine weight matrix ($w_B, w_N, w_R$) and baseline statistical deviation models.
            </p>

            <div className="space-y-3">
              {Object.entries(FRAUD_SCENARIOS).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => handleSelectScenario(key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedScenarioKey === key
                      ? 'border-purple-600 bg-purple-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Adjustment +{item.contextualAdjustment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60">
                    <span>Behavior: <strong className="text-purple-700">{item.weights.behavior}%</strong></span>
                    <span>Network: <strong className="text-blue-700">{item.weights.network}%</strong></span>
                    <span>Rules: <strong className="text-emerald-700">{item.weights.rules}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ENTITY FORENSIC DETAILS
          ========================================== */}
      {isEntityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Entity Forensic Profile</h3>
              </div>
              <button onClick={() => setIsEntityModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-purple-900">{selectedEntity.name}</div>
                  <div className="text-slate-600 text-[11px]">ID: {selectedEntity.id} · {selectedEntity.role}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
                  {selectedEntity.todayDeviation}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Historical Window</div>
                  <div className="font-bold text-slate-900 mt-0.5">Last 90 Days</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Avg Txn Count</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntity.avgTxnCount} / day</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Normal Average</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntity.avgTxnAmount}</div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">90-Day Peak</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedEntity.maxTxnAmount}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Forensic Note:</strong> Rapid ₹4.8σ deviation observed within the last 24-hour cycle. High probability of mule recruitment or unauthorized credential takeover.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setIsEntityModalOpen(false);
                  navigate(`/graph?caseId=${selectedCaseId}&selectNode=${selectedEntity.id}`);
                }}
                className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Open in Graph Explorer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: TEXT & CODEWORD ANOMALY DETAIL
          ========================================== */}
      {selectedAlertForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedAlertForDetail.patternIcon}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedAlertForDetail.pattern}</h3>
                  <div className="text-xs text-slate-400">Entity: {selectedAlertForDetail.entity} · {selectedAlertForDetail.time}</div>
                </div>
              </div>
              <button onClick={() => setSelectedAlertForDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              {/* Highlighted Codeword / Anomaly Marker */}
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1">
                  Matched Codeword / Anomaly Signature
                </div>
                <div className="font-mono text-sm font-bold text-red-700">
                  {selectedAlertForDetail.codeword}
                </div>
              </div>

              {/* Exact Text Match in Narration / Record */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Raw Narrative / Evidence Excerpt
                </div>
                <div className="font-mono text-xs text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                  "{selectedAlertForDetail.textMatch}"
                </div>
              </div>

              {/* 3-Engine Impact Breakdown */}
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Engine Impact Distribution
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="text-[10px] text-purple-700 font-bold">Behavior Score</div>
                    <div className="text-sm font-extrabold text-purple-900 mt-0.5">
                      {selectedAlertForDetail.engineBreakdown.behavior}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="text-[10px] text-blue-700 font-bold">Network Score</div>
                    <div className="text-sm font-extrabold text-blue-900 mt-0.5">
                      {selectedAlertForDetail.engineBreakdown.network}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-bold">Rules Score</div>
                    <div className="text-sm font-extrabold text-emerald-900 mt-0.5">
                      {selectedAlertForDetail.engineBreakdown.rules}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedAlertForDetail(null);
                  navigate(`/graph?caseId=${selectedCaseId}&selectNode=${selectedAlertForDetail.entity}`);
                }}
                className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Investigate in Graph Explorer</span>
              </button>
              <button
                onClick={() => {
                  handleConfirmFraud();
                  setSelectedAlertForDetail(null);
                }}
                className="py-2.5 px-4 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs hover:bg-emerald-100 transition"
              >
                Confirm Anomaly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: FILTERS DRAWER
          ========================================== */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Adaptive Filter Thresholds</h3>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Min Risk Score Filter</label>
                <input type="range" min="50" max="95" defaultValue="75" className="w-full accent-purple-600 mt-1 cursor-pointer" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>50 (All alerts)</span>
                  <span>75 (High risk)</span>
                  <span>95 (Critical only)</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase">Pattern Categories</label>
                <div className="space-y-1.5 mt-1.5">
                  {['Burst & Velocity Anomalies', 'SIM Swap & Evasion Flags', 'Codeword & Narration Matches', 'Neo4j Graph Topology Loops'].map((cat, i) => (
                    <label key={cat} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-purple-50">
                      <input type="checkbox" defaultChecked className="accent-purple-600 rounded" />
                      <span className="text-slate-700 font-medium">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsFilterModalOpen(false);
                triggerToast('Filters applied successfully.');
              }}
              className="w-full py-2.5 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-700 transition"
            >
              Apply Filter Preset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
