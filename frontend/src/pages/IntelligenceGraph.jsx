import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Settings,
  Plus,
  Minus,
  Lock,
  Unlock,
  RotateCcw,
  User,
  Phone,
  Building2,
  Smartphone,
  Mail,
  MapPin,
  Monitor,
  Building,
  Check,
  X,
  Sparkles,
  ChevronRight,
  Share2,
  AlertTriangle,
  Layers,
  FileText,
  Calendar,
  Network,
  GitFork,
  ArrowRight,
  Database
} from 'lucide-react';

// ==========================================
// COLOR CONFIGURATION & VISUAL THEMES
// ==========================================
const TYPE_CONFIG = {
  'Person': {
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.45)',
    icon: User,
    badgeBg: 'bg-purple-950 text-purple-300 border-purple-800'
  },
  'Phone Number': {
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.45)',
    icon: Phone,
    badgeBg: 'bg-blue-950 text-blue-300 border-blue-800'
  },
  'Bank Account': {
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.45)',
    icon: Building2,
    badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-800'
  },
  'Device': {
    color: '#F97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    icon: Smartphone,
    badgeBg: 'bg-orange-950 text-orange-300 border-orange-800'
  },
  'Email': {
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.45)',
    icon: Mail,
    badgeBg: 'bg-violet-950 text-violet-300 border-violet-800'
  },
  'Location': {
    color: '#14B8A6',
    glow: 'rgba(20, 184, 166, 0.45)',
    icon: MapPin,
    badgeBg: 'bg-teal-950 text-teal-300 border-teal-800'
  },
  'IP Address': {
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.45)',
    icon: Monitor,
    badgeBg: 'bg-amber-950 text-amber-300 border-amber-800'
  },
  'Organization': {
    color: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.45)',
    icon: Building,
    badgeBg: 'bg-rose-950 text-rose-300 border-rose-800'
  }
};

const RELATIONSHIP_CONFIG = {
  'Calls / Communicates': { color: '#3B82F6', dashArray: '5 4' },
  'Transactions': { color: '#10B981', dashArray: '5 4' },
  'Owns / Uses': { color: '#F97316', dashArray: '5 4' },
  'Associated With': { color: '#A855F7', dashArray: '3 3' },
  'Located At': { color: '#14B8A6', dashArray: '5 4' },
  'Follows / Connected': { color: '#F59E0B', dashArray: '3 3' }
};

// ==========================================
// DEMO FALLBACK (Used if no user data uploaded yet)
// ==========================================
const DEMO_CONSOLIDATED_NODES = [
  {
    id: 'DEMO-P1',
    label: 'Ramesh',
    subLabel: '(Suspect)',
    type: 'Person',
    role: 'suspect',
    riskScore: 92,
    riskLevel: 'High Risk',
    x: 500,
    y: 340,
    details: {
      entityId: 'PER-1001',
      age: 32,
      gender: 'Male',
      phone: '+91 98765 45210',
      email: 'ramesh23@mail.com',
      remarks: 'Primary suspect in ATM fraud activity and mule network layering.',
      linkedCounts: { 'Phone Numbers': 2, 'Bank Accounts': 2, 'Email Addresses': 1, 'Devices': 1, 'Locations': 2, 'IP Addresses': 1, 'Other Persons': 2 },
      quickInsight: 'Ramesh is centrally connected to multiple accounts, devices, and locations. High transaction activity and frequent communication observed.'
    }
  },
  {
    id: 'DEMO-P2',
    label: 'Suresh',
    subLabel: '(Associate)',
    type: 'Person',
    role: 'associate',
    riskScore: 78,
    riskLevel: 'High Risk',
    x: 300,
    y: 490,
    details: {
      entityId: 'PER-1002',
      phone: '+91 98765 43210',
      remarks: 'Mule account handler; executes secondary cash withdrawals.',
      linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 1, 'Email Addresses': 0, 'Devices': 0, 'Locations': 1, 'IP Addresses': 0, 'Other Persons': 1 },
      quickInsight: 'Suresh received 8 layered transfers from Axis Bank XXXX 4578 and coordinated ATM cash extraction.'
    }
  },
  {
    id: 'DEMO-P3',
    label: 'Arun',
    subLabel: '(Associate)',
    type: 'Person',
    role: 'associate',
    riskScore: 74,
    riskLevel: 'Medium Risk',
    x: 700,
    y: 490,
    details: {
      entityId: 'PER-1003',
      phone: '+91 91234 56780',
      remarks: 'SIM card provider and digital banking access coordinator.',
      linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 1, 'Email Addresses': 0, 'Devices': 0, 'Locations': 1, 'IP Addresses': 0, 'Other Persons': 1 },
      quickInsight: 'Arun facilitated OTP relay operations and managed HDFC XXXX 9921 cash disbursement.'
    }
  },
  {
    id: 'DEMO-B1',
    label: 'XXXX 4578',
    subLabel: 'Axis Bank',
    type: 'Bank Account',
    role: 'normal',
    riskScore: 89,
    riskLevel: 'High Risk',
    x: 270,
    y: 330,
    details: {
      entityId: 'ACC-AX45',
      bankName: 'Axis Bank',
      accountHolder: 'Ramesh (Mule)',
      turnover: '₹42,50,000',
      remarks: 'Layering collection account used to aggregate stolen funds.'
    }
  },
  {
    id: 'DEMO-B2',
    label: 'XXXX 9921',
    subLabel: 'HDFC Bank',
    type: 'Bank Account',
    role: 'normal',
    riskScore: 84,
    riskLevel: 'High Risk',
    x: 730,
    y: 330,
    details: {
      entityId: 'ACC-HD99',
      bankName: 'HDFC Bank',
      accountHolder: 'Mule Shell Enterprise',
      turnover: '₹28,10,000',
      remarks: 'Secondary layer account for fast disbursement.'
    }
  },
  {
    id: 'DEMO-PH1',
    label: '+91 98765 43210',
    subLabel: 'Primary Phone',
    type: 'Phone Number',
    role: 'normal',
    riskScore: 85,
    riskLevel: 'High Risk',
    x: 340,
    y: 190,
    details: { entityId: 'PH-401', carrier: 'Airtel India', remarks: 'High-frequency communication with Suresh.' }
  },
  {
    id: 'DEMO-PH2',
    label: '+91 91234 56780',
    subLabel: 'Secondary Phone',
    type: 'Phone Number',
    role: 'normal',
    riskScore: 80,
    riskLevel: 'High Risk',
    x: 740,
    y: 190,
    details: { entityId: 'PH-402', carrier: 'Jio 5G', remarks: 'Used during ATM cashout runs.' }
  },
  {
    id: 'DEMO-DEV1',
    label: 'OnePlus 9',
    subLabel: 'IMEI: 8654 23XX',
    type: 'Device',
    role: 'normal',
    riskScore: 88,
    riskLevel: 'High Risk',
    x: 590,
    y: 180,
    details: { entityId: 'DEV-889', model: 'OnePlus 9 5G', remarks: 'Both suspect numbers active on this single device.' }
  },
  {
    id: 'DEMO-LOC1',
    label: 'T. Nagar ATM',
    subLabel: 'Chennai',
    type: 'Location',
    role: 'normal',
    riskScore: 95,
    riskLevel: 'High Risk',
    x: 500,
    y: 540,
    details: { entityId: 'LOC-701', locationType: 'Bank ATM', remarks: 'Epicenter of physical cash extractions.' }
  },
  {
    id: 'DEMO-IP1',
    label: '103.21.45.67',
    subLabel: 'IP Address',
    type: 'IP Address',
    role: 'normal',
    riskScore: 77,
    riskLevel: 'Medium Risk',
    x: 500,
    y: 660,
    details: { entityId: 'IP-502', isp: 'ACT Fibernet', remarks: 'Used for midnight net-banking transfers.' }
  }
];

const DEMO_CONSOLIDATED_EDGES = [
  { id: 'de1', source: 'DEMO-P1', target: 'DEMO-PH1', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'de2', source: 'DEMO-P1', target: 'DEMO-PH2', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'de3', source: 'DEMO-P1', target: 'DEMO-DEV1', type: 'Owns / Uses', label: 'USES' },
  { id: 'de4', source: 'DEMO-P1', target: 'DEMO-B1', type: 'Owns / Uses', label: 'OWNS' },
  { id: 'de5', source: 'DEMO-P1', target: 'DEMO-B2', type: 'Owns / Uses', label: 'OWNS' },
  { id: 'de6', source: 'DEMO-P1', target: 'DEMO-LOC1', type: 'Located At', label: 'LOCATED AT' },
  { id: 'de7', source: 'DEMO-B1', target: 'DEMO-P2', type: 'Transactions', label: 'TRANSACTIONS' },
  { id: 'de8', source: 'DEMO-P2', target: 'DEMO-PH1', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'de9', source: 'DEMO-P2', target: 'DEMO-LOC1', type: 'Located At', label: 'LOCATED AT' },
  { id: 'de10', source: 'DEMO-B2', target: 'DEMO-P3', type: 'Transactions', label: 'TRANSACTIONS' },
  { id: 'de11', source: 'DEMO-P3', target: 'DEMO-PH2', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'de12', source: 'DEMO-P3', target: 'DEMO-LOC1', type: 'Located At', label: 'LOCATED AT' },
  { id: 'de13', source: 'DEMO-LOC1', target: 'DEMO-IP1', type: 'Follows / Connected', label: 'CONNECTED' }
];

export default function IntelligenceGraph() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Case ID from route or persistent store
  const caseId =
    searchParams.get('caseId') ||
    location.state?.caseId ||
    localStorage.getItem('active_case_id') ||
    'CASE-2025-1024';

  // State: Has Entity Resolution been completed for this case?
  const [hasResolvedEntities, setHasResolvedEntities] = useState(false);
  const [isDemoFallback, setIsDemoFallback] = useState(false);

  // Dynamic Nodes & Edges
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Selection & Details
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Filters & Display Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [layoutMode, setLayoutMode] = useState('concentric'); // 'concentric' | 'grid' | 'flow'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeEntityFilters, setActiveEntityFilters] = useState({
    'Person': true,
    'Phone Number': true,
    'Bank Account': true,
    'Device': true,
    'Email': true,
    'Location': true,
    'IP Address': true,
    'Organization': true
  });
  const [activeRelFilters, setActiveRelFilters] = useState({
    'Calls / Communicates': true,
    'Transactions': true,
    'Owns / Uses': true,
    'Associated With': true,
    'Located At': true,
    'Follows / Connected': true
  });

  // Canvas Navigation (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Interactive Node Dragging
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Modals
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [showAllRelModal, setShowAllRelModal] = useState(false);
  const [newEntityForm, setNewEntityForm] = useState({
    label: '',
    subLabel: '',
    type: 'Person',
    role: 'associate',
    connectTo: '',
    relType: 'Transactions',
    relLabel: 'TRANSACTIONS'
  });

  // ==========================================
  // DYNAMIC GRAPH SYNTHESIS ENGINE
  // (Builds strictly from consolidated uploaded data)
  // ==========================================
  useEffect(() => {
    // 1. Fetch resolved entities from Entity Resolution step
    const rawEntitiesStr = localStorage.getItem(`entities_${caseId}`);
    // 2. Fetch processed consolidated records from Output step
    const rawOutputStr =
      localStorage.getItem(`output_${caseId}`) ||
      localStorage.getItem(`pipelineData_${caseId}`) ||
      localStorage.getItem('pipelineData');

    if (rawEntitiesStr) {
      try {
        const parsedEntities = JSON.parse(rawEntitiesStr);
        const resolvedEntities = parsedEntities.entities || [];

        if (resolvedEntities.length > 0) {
          setHasResolvedEntities(true);
          setIsDemoFallback(false);

          let parsedRecords = [];
          if (rawOutputStr) {
            try {
              const parsedOut = JSON.parse(rawOutputStr);
              parsedRecords = parsedOut.records || parsedOut.data || parsedOut.items || [];
            } catch { parsedRecords = []; }
          }

          // Build dynamic nodes
          const dynamicNodes = synthesizeNodesFromEntities(resolvedEntities, parsedRecords);
          // Build dynamic edges from relationships and consolidated records
          const dynamicEdges = synthesizeEdgesFromRecords(resolvedEntities, parsedRecords, dynamicNodes);

          // Apply layout positioning
          const positionedNodes = applyLayout(dynamicNodes, dynamicEdges, layoutMode);

          setNodes(positionedNodes);
          setEdges(dynamicEdges);

          // Select primary suspect or highest-degree node
          const suspect = positionedNodes.find(n => n.role === 'suspect') || positionedNodes[0];
          if (suspect) setSelectedNodeId(suspect.id);
          return;
        }
      } catch (err) {
        console.error('Error synthesizing graph from entity resolution data:', err);
      }
    }

    // If no resolved entities exist yet for this case
    setHasResolvedEntities(false);
  }, [caseId, layoutMode]);

  // Helper to load demonstration case
  const loadDemoData = () => {
    setIsDemoFallback(true);
    setHasResolvedEntities(true);
    setNodes(DEMO_CONSOLIDATED_NODES);
    setEdges(DEMO_CONSOLIDATED_EDGES);
    setSelectedNodeId('DEMO-P1');
  };

  // ==========================================
  // NODE SYNTHESIS ALGORITHM
  // ==========================================
  function synthesizeNodesFromEntities(entities, records) {
    // Calculate entity frequencies from records
    const entityFrequency = {};
    records.forEach(r => {
      Object.values(r).forEach(val => {
        if (!val) return;
        const s = String(val).toLowerCase();
        entityFrequency[s] = (entityFrequency[s] || 0) + 1;
      });
    });

    // Find highest frequency/connectivity person to assign primary suspect role
    let maxPersonFreq = -1;
    let candidateSuspectId = null;

    entities.forEach(ent => {
      if (ent.type.toLowerCase().includes('person') || ent.type.toLowerCase() === 'user') {
        const valKey = String(ent.canonical_value).toLowerCase();
        const score = (entityFrequency[valKey] || 0) + (ent.linked_records?.length || 0) + (ent.related_canonical_ids?.length || 0) * 2;
        if (score > maxPersonFreq) {
          maxPersonFreq = score;
          candidateSuspectId = ent.canonical_id;
        }
      }
    });

    return entities.map((ent, idx) => {
      // Map entity types into standard display categories
      let displayType = 'Person';
      const rawType = (ent.type || '').toLowerCase();
      if (rawType.includes('phone') || rawType.includes('mobile')) displayType = 'Phone Number';
      else if (rawType.includes('bank') || rawType.includes('account') || rawType.includes('upi')) displayType = 'Bank Account';
      else if (rawType.includes('device') || rawType.includes('imei')) displayType = 'Device';
      else if (rawType.includes('email')) displayType = 'Email';
      else if (rawType.includes('location') || rawType.includes('atm') || rawType.includes('tower')) displayType = 'Location';
      else if (rawType.includes('ip')) displayType = 'IP Address';
      else if (rawType.includes('org') || rawType.includes('company')) displayType = 'Organization';

      const isSuspect = ent.canonical_id === candidateSuspectId || (displayType === 'Person' && idx === 0);
      const isAssociate = displayType === 'Person' && !isSuspect;

      // Risk score calculation based on record connections and type
      const recordCount = ent.linked_records?.length || 1;
      const relatedCount = ent.related_canonical_ids?.length || 0;
      let calculatedRisk = isSuspect ? 92 : Math.min(95, 55 + recordCount * 4 + relatedCount * 6);
      if (displayType === 'Bank Account' && recordCount > 5) calculatedRisk = 88;

      const riskLevel = calculatedRisk >= 80 ? 'High Risk' : calculatedRisk >= 60 ? 'Medium Risk' : 'Low Risk';

      return {
        id: ent.canonical_id,
        label: ent.canonical_value,
        subLabel: isSuspect ? '(Suspect)' : isAssociate ? '(Associate)' : displayType === 'Bank Account' ? 'Mule Account' : '',
        type: displayType,
        role: isSuspect ? 'suspect' : isAssociate ? 'associate' : 'normal',
        riskScore: calculatedRisk,
        riskLevel,
        x: 500,
        y: 350,
        details: {
          entityId: ent.canonical_id,
          originalValues: ent.original_values || [ent.canonical_value],
          linkedRecordsCount: recordCount,
          remarks: `Extracted from ${recordCount} consolidated record(s) during ingestion & entity resolution.`,
          linkedCounts: {
            'Records Linked': recordCount,
            'Connected Entities': relatedCount
          },
          quickInsight: isSuspect
            ? `${ent.canonical_value} is the primary focal point of this investigation with ${relatedCount} direct connections across the consolidated case files.`
            : `${ent.canonical_value} colludes within the network, linked to ${relatedCount} entities in case ${caseId}.`
        }
      };
    });
  }

  // ==========================================
  // EDGE SYNTHESIS ALGORITHM
  // ==========================================
  function synthesizeEdgesFromRecords(entities, records, dynamicNodes) {
    const edgesList = [];
    const edgeKeySet = new Set();
    const nodeValueMap = new Map();

    dynamicNodes.forEach(n => {
      nodeValueMap.set(String(n.label).toLowerCase(), n.id);
      if (n.details?.originalValues) {
        n.details.originalValues.forEach(v => nodeValueMap.set(String(v).toLowerCase(), n.id));
      }
    });

    // 1. Trace relationships from processed records (calls, transactions, locations)
    records.forEach((rec, idx) => {
      const srcVal = String(rec.source || rec.sender || rec.caller || rec.src_ip || rec.from || '').toLowerCase();
      const tgtVal = String(rec.target || rec.receiver || rec.called || rec.dest_ip || rec.to || '').toLowerCase();

      const srcId = nodeValueMap.get(srcVal);
      const tgtId = nodeValueMap.get(tgtVal);

      if (srcId && tgtId && srcId !== tgtId) {
        const edgeKey = `${srcId}->${tgtId}`;
        const reverseKey = `${tgtId}->${srcId}`;

        if (!edgeKeySet.has(edgeKey) && !edgeKeySet.has(reverseKey)) {
          edgeKeySet.add(edgeKey);

          let relType = 'Calls / Communicates';
          let relLabel = 'CALLS';

          const eventType = String(rec.event_type || rec.type || '').toLowerCase();
          const amount = rec.amount || rec.txn_amount;

          if (amount || eventType.includes('trans') || eventType.includes('bank') || eventType.includes('upi')) {
            relType = 'Transactions';
            relLabel = amount ? `₹${Number(amount).toLocaleString()}` : 'TRANSACTIONS';
          } else if (eventType.includes('call') || eventType.includes('voice')) {
            relType = 'Calls / Communicates';
            relLabel = rec.duration ? `${rec.duration}s` : 'CALLS';
          } else if (eventType.includes('sms')) {
            relType = 'Calls / Communicates';
            relLabel = 'SMS';
          } else if (eventType.includes('location') || eventType.includes('tower') || eventType.includes('atm')) {
            relType = 'Located At';
            relLabel = 'LOCATED AT';
          }

          edgesList.push({
            id: `edge_rec_${idx}`,
            source: srcId,
            target: tgtId,
            type: relType,
            label: relLabel
          });
        }
      }
    });

    // 2. Ensure all related_canonical_ids from entity resolution have visible edges
    entities.forEach((ent, i) => {
      if (ent.related_canonical_ids && Array.isArray(ent.related_canonical_ids)) {
        ent.related_canonical_ids.forEach((relId, j) => {
          const edgeKey = `${ent.canonical_id}->${relId}`;
          const reverseKey = `${relId}->${ent.canonical_id}`;

          if (!edgeKeySet.has(edgeKey) && !edgeKeySet.has(reverseKey)) {
            edgeKeySet.add(edgeKey);
            edgesList.push({
              id: `edge_res_${i}_${j}`,
              source: ent.canonical_id,
              target: relId,
              type: 'Associated With',
              label: 'ASSOCIATED WITH'
            });
          }
        });
      }
    });

    return edgesList;
  }

  // ==========================================
  // INTELLIGENT POSITIONING & RESOLUTION ENGINE
  // ==========================================
  function applyLayout(nodeList, edgeList, mode) {
    const total = nodeList.length;
    if (total === 0) return [];

    const centerX = 500;
    const centerY = 350;

    if (mode === 'concentric') {
      // Concentric: Suspect at center, associates in middle ring, accounts/phones in outer ring
      const suspect = nodeList.find(n => n.role === 'suspect') || nodeList[0];
      const others = nodeList.filter(n => n.id !== suspect.id);

      const associates = others.filter(n => n.type === 'Person');
      const infrastructure = others.filter(n => n.type !== 'Person');

      return nodeList.map(node => {
        if (node.id === suspect.id) {
          return { ...node, x: centerX, y: centerY };
        }

        const isAssoc = node.type === 'Person';
        if (isAssoc) {
          const aIdx = associates.findIndex(a => a.id === node.id);
          const angle = (aIdx / Math.max(1, associates.length)) * Math.PI + Math.PI * 0.5;
          const radius = 190;
          return {
            ...node,
            x: Math.round(centerX + Math.cos(angle) * radius),
            y: Math.round(centerY + Math.sin(angle) * radius)
          };
        } else {
          const iIdx = infrastructure.findIndex(i => i.id === node.id);
          const angle = (iIdx / Math.max(1, infrastructure.length)) * 2 * Math.PI;
          const radius = 260 + (iIdx % 2) * 50;
          return {
            ...node,
            x: Math.round(Math.max(100, Math.min(900, centerX + Math.cos(angle) * radius))),
            y: Math.round(Math.max(100, Math.min(620, centerY + Math.sin(angle) * radius)))
          };
        }
      });
    }

    // Default radial circle with collision spreading
    return nodeList.map((node, idx) => {
      const angle = (idx / total) * 2 * Math.PI;
      const radius = 220 + (idx % 3) * 40;
      return {
        ...node,
        x: Math.round(Math.max(100, Math.min(900, centerX + Math.cos(angle) * radius))),
        y: Math.round(Math.max(100, Math.min(620, centerY + Math.sin(angle) * radius)))
      };
    });
  }

  // ==========================================
  // REAL-TIME METRICS & FILTERED GRAPH SLICE
  // ==========================================
  const graphMetrics = useMemo(() => {
    const counts = {};
    Object.keys(TYPE_CONFIG).forEach(t => { counts[t] = 0; });
    nodes.forEach(n => {
      if (counts[n.type] !== undefined) counts[n.type]++;
    });

    const relCounts = {};
    Object.keys(RELATIONSHIP_CONFIG).forEach(r => { relCounts[r] = 0; });
    edges.forEach(e => {
      if (relCounts[e.type] !== undefined) relCounts[e.type]++;
    });

    return { counts, relCounts, totalNodes: nodes.length, totalEdges: edges.length };
  }, [nodes, edges]);

  // Filtered nodes based on active checkboxes and search query
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => {
      if (!activeEntityFilters[n.type]) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.label.toLowerCase().includes(q) ||
          (n.subLabel && n.subLabel.toLowerCase().includes(q)) ||
          n.type.toLowerCase().includes(q) ||
          (n.details?.entityId && n.details.entityId.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [nodes, activeEntityFilters, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return edges.filter(e => {
      if (!activeRelFilters[e.type]) return false;
      return visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target);
    });
  }, [edges, activeRelFilters, visibleNodeIds]);

  // Selected Node and its incident links
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  const selectedNodeRelationships = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
      .map(e => {
        const otherId = e.source === selectedNode.id ? e.target : e.source;
        const otherNode = nodes.find(n => n.id === otherId);
        return {
          edge: e,
          direction: e.source === selectedNode.id ? 'outgoing' : 'incoming',
          connectedNode: otherNode
        };
      })
      .filter(item => item.connectedNode);
  }, [selectedNode, edges, nodes]);

  // ==========================================
  // MOUSE & CANVAS CONTROLS (PAN, ZOOM, DRAG)
  // ==========================================
  const handleMouseDownCanvas = (e) => {
    if (isLocked) return;
    if (e.target.tagName === 'svg' || e.target.id === 'graph-canvas-bg') {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && !isLocked) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
    } else if (draggingNodeId) {
      const svg = document.getElementById('knowledge-graph-svg');
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const scaleX = 1000 / rect.width;
        const scaleY = 700 / rect.height;
        const mouseSvgX = (e.clientX - rect.left) * scaleX / zoom - pan.x / zoom;
        const mouseSvgY = (e.clientY - rect.top) * scaleY / zoom - pan.y / zoom;

        setNodes(prev =>
          prev.map(n => {
            if (n.id === draggingNodeId) {
              return {
                ...n,
                x: Math.round(mouseSvgX - dragOffsetRef.current.x),
                y: Math.round(mouseSvgY - dragOffsetRef.current.y)
              };
            }
            return n;
          })
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleStartNodeDrag = (e, nodeId, nodeX, nodeY) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const svg = document.getElementById('knowledge-graph-svg');
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const scaleX = 1000 / rect.width;
      const scaleY = 700 / rect.height;
      const mouseSvgX = (e.clientX - rect.left) * scaleX / zoom - pan.x / zoom;
      const mouseSvgY = (e.clientY - rect.top) * scaleY / zoom - pan.y / zoom;
      dragOffsetRef.current = {
        x: mouseSvgX - nodeX,
        y: mouseSvgY - nodeY
      };
    }
  };

  // Reset Filters and View
  const handleResetFilters = () => {
    setActiveEntityFilters({
      'Person': true,
      'Phone Number': true,
      'Bank Account': true,
      'Device': true,
      'Email': true,
      'Location': true,
      'IP Address': true,
      'Organization': true
    });
    setActiveRelFilters({
      'Calls / Communicates': true,
      'Transactions': true,
      'Owns / Uses': true,
      'Associated With': true,
      'Located At': true,
      'Follows / Connected': true
    });
    setSearchQuery('');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export handlers
  const handleExport = (format) => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ caseId, nodes, edges }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `MuleGuard_KnowledgeGraph_${caseId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const svgEl = document.getElementById('knowledge-graph-svg');
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `MuleGuard_Graph_${caseId}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
      }
    }
  };

  // Add Dynamic Entity
  const handleAddNewEntity = (e) => {
    e.preventDefault();
    if (!newEntityForm.label) return;

    const newId = `E-MANUAL-${Date.now().toString().slice(-4)}`;
    const x = 500 + (Math.random() - 0.5) * 260;
    const y = 350 + (Math.random() - 0.5) * 200;

    const newNode = {
      id: newId,
      label: newEntityForm.label,
      subLabel: newEntityForm.subLabel || `(${newEntityForm.role})`,
      type: newEntityForm.type,
      role: newEntityForm.role,
      riskScore: newEntityForm.role === 'suspect' ? 90 : 70,
      riskLevel: newEntityForm.role === 'suspect' ? 'High Risk' : 'Medium Risk',
      x,
      y,
      details: {
        entityId: newId,
        remarks: 'Manually augmented entity during live forensic analysis.',
        linkedCounts: { 'Direct Links': 1 },
        quickInsight: `Added by investigator to track new lead connected to ${newEntityForm.connectTo}.`
      }
    };

    const newEdge = {
      id: `edge_manual_${Date.now()}`,
      source: newEntityForm.connectTo || nodes[0]?.id,
      target: newId,
      type: newEntityForm.relType,
      label: newEntityForm.relLabel
    };

    setNodes(prev => [...prev, newNode]);
    setEdges(prev => [...prev, newEdge]);
    setSelectedNodeId(newId);
    setIsAddEntityOpen(false);
  };

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // ==========================================
  // GATEKEEPER VIEW: IF ENTITY RESOLUTION NOT RUN
  // ==========================================
  if (!hasResolvedEntities) {
    return (
      <div className="flex h-screen w-screen bg-[#070B19] text-white flex-col items-center justify-center p-6 select-none">
        <div className="max-w-md w-full bg-[#0D1533] border border-[#1E2B58] rounded-2xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
            <Network className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Entity Resolution Required
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              The Intelligence Graph synthesizes directly from the unified and deduplicated entities produced in the <strong>Entity Resolution</strong> step.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090F24] border border-[#17203E] text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Target Case ID:</span>
              <span className="font-mono text-purple-300 font-bold">{caseId}</span>
            </div>
            <div className="text-[11px] text-slate-400 leading-normal">
              Run Entity Resolution for this case to generate canonical identities, phone links, and bank co-occurrences.
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => navigate(`/entities?caseId=${caseId}`)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 transition"
            >
              <span>Proceed to Entity Resolution</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={loadDemoData}
              className="w-full py-2 px-4 bg-[#121A38] hover:bg-[#18234B] border border-[#202E5C] text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition"
            >
              Load Sample Consolidated Case (Chennai ATM Fraud)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // FULL KNOWLEDGE GRAPH EXPLORER WORKSPACE
  // ==========================================
  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans select-none ${
        isDarkMode ? 'bg-[#070B19] text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ==========================================
          LEFT SIDEBAR: DYNAMIC OVERVIEW & FILTERS
          ========================================== */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#151D3B] bg-[#090F24] z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#151D3B]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 shadow-md shadow-purple-900/40">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">MuleGuard AI</div>
            <div className="text-[11px] text-slate-400 font-medium">Knowledge Graph Explorer</div>
          </div>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar text-xs">
          {/* Data Source Indicator */}
          <div className="bg-[#0D1533] border border-[#1C264D] rounded-lg p-2.5 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Consolidated Case
            </span>
            <div className="flex items-center justify-between text-xs text-slate-200">
              <span className="font-mono font-bold text-purple-300">{caseId}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {isDemoFallback ? 'DEMO' : 'LIVE'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isDemoFallback
                ? 'Synthesized from ATM fraud investigation records.'
                : 'Synthesized directly from uploaded case records & resolved entities.'}
            </p>
          </div>

          {/* GRAPH OVERVIEW (DYNAMIC COUNTS) */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Graph Overview
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-1.5 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Total Nodes
                </span>
                <span className="font-bold text-white text-xs">{graphMetrics.totalNodes}</span>
              </div>
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-1.5 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Total Relationships
                </span>
                <span className="font-bold text-white text-xs">{graphMetrics.totalEdges}</span>
              </div>
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-1.5 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Entity Types
                </span>
                <span className="font-bold text-white text-xs">
                  {Object.values(graphMetrics.counts).filter(c => c > 0).length}
                </span>
              </div>
            </div>
          </div>

          {/* ENTITY TYPES (FUNCTIONAL TOGGLES) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Entity Types
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Show Labels</span>
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`w-7 h-4 flex items-center rounded-full p-0.5 transition ${
                    showLabels ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                const IconComp = cfg.icon;
                const isChecked = !!activeEntityFilters[type];
                const count = graphMetrics.counts[type] || 0;
                return (
                  <label
                    key={type}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#0D1533] cursor-pointer transition text-[11px] group"
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      <span className="text-slate-200 group-hover:text-white transition">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{count}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setActiveEntityFilters(prev => ({ ...prev, [type]: !prev[type] }))
                        }
                        className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0 w-3.5 h-3.5"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* RELATIONSHIP TYPES (FUNCTIONAL TOGGLES) */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Relationship Types
            </div>
            <div className="space-y-1">
              {Object.entries(RELATIONSHIP_CONFIG).map(([rel, cfg]) => {
                const isChecked = !!activeRelFilters[rel];
                const count = graphMetrics.relCounts[rel] || 0;
                return (
                  <label
                    key={rel}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#0D1533] cursor-pointer transition text-[11px] group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 flex items-center justify-center">
                        <div
                          className="w-3 h-0.5"
                          style={{
                            backgroundColor: cfg.color,
                            borderStyle: cfg.dashArray ? 'dashed' : 'solid'
                          }}
                        />
                      </div>
                      <span className="text-slate-200 group-hover:text-white transition">{rel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{count}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setActiveRelFilters(prev => ({ ...prev, [rel]: !prev[rel] }))
                        }
                        className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-0 w-3.5 h-3.5"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reset Filters CTA */}
        <div className="p-3 border-t border-[#151D3B]">
          <button
            onClick={handleResetFilters}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#202B52] bg-[#0E1636] hover:bg-[#15204C] text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters & Layout</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          MAIN WORKSPACE: HEADER + GRAPH CANVAS
          ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-[#151D3B] bg-[#080D20] z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/entities?caseId=${caseId}`)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Entities</span>
            </button>

            <div className="h-4 w-px bg-[#1F294D]" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{caseId}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-700/60">
                Active Inquiry
              </span>
            </div>

            <span className="text-xs text-slate-400 hidden lg:inline">
              Consolidated Intelligence Network
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Layout Switcher */}
            <div className="flex items-center bg-[#0D1533] border border-[#1F2A52] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setLayoutMode('concentric')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  layoutMode === 'concentric' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Concentric
              </button>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  layoutMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Radial Orbit
              </button>
            </div>

            {/* Add Dynamic Lead / Entity */}
            <button
              onClick={() => setIsAddEntityOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1F2A52] bg-[#0D1533] hover:bg-[#14204A] text-slate-200 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Lead / Entity</span>
            </button>

            {/* Export Graph Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition">
                <Download className="w-3.5 h-3.5" />
                <span>Export Graph</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-44 rounded-lg bg-[#0E1738] border border-[#233160] shadow-xl p-1 z-30">
                <button
                  onClick={() => handleExport('svg')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#1B2754] hover:text-white rounded flex items-center gap-2"
                >
                  <FileText className="w-3 h-3 text-purple-400" /> Export Vector (SVG)
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#1B2754] hover:text-white rounded flex items-center gap-2"
                >
                  <Share2 className="w-3 h-3 text-blue-400" /> Export JSON Network
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-Header / Search & Quick Actions */}
        <div className="h-12 shrink-0 flex items-center justify-between px-6 border-b border-[#121933] bg-[#070B1B]/80 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Neo4j Knowledge Graph</span>
              <span className="text-[11px] font-normal text-slate-400">
                Interactive relationship mapping derived from consolidated records.
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Real Search Entity Input */}
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search entity (e.g., phone, account, email, name)"
                className="w-full rounded-lg border border-[#1C264D] bg-[#0C132E] py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 border-l border-[#1C264D] pl-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Theme"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141E44] transition"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                  } else {
                    document.exitFullscreen();
                    setIsFullscreen(false);
                  }
                }}
                title="Toggle Fullscreen"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141E44] transition"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            MAIN GRAPH SVG CANVAS (HIGH RESOLUTION)
            ========================================== */}
        <div
          id="graph-canvas-bg"
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#070B19]"
          onMouseDown={handleMouseDownCanvas}
          style={{
            backgroundImage: 'radial-gradient(#151E3D 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        >
          <svg
            id="knowledge-graph-svg"
            viewBox="0 0 1000 700"
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '500px 350px',
              transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            {/* Filters and Marker Arrows */}
            <defs>
              <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#EF4444" floodOpacity="0.75" />
              </filter>
              <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.65" />
              </filter>
              <radialGradient id="grad-red" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </radialGradient>

              {Object.entries(RELATIONSHIP_CONFIG).map(([name, cfg]) => (
                <marker
                  key={`arrow-${name}`}
                  id={`arrow-${name.replace(/\s+/g, '-').toLowerCase()}`}
                  viewBox="0 0 10 10"
                  refX="26"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill={cfg.color} />
                </marker>
              ))}
            </defs>

            {/* EDGES LAYER */}
            <g id="edges-layer">
              {visibleEdges.map(edge => {
                const src = nodeMap.get(edge.source);
                const tgt = nodeMap.get(edge.target);
                if (!src || !tgt) return null;

                const relCfg = RELATIONSHIP_CONFIG[edge.type] || { color: '#94A3B8', dashArray: 'none' };
                const isSelectedEdge =
                  selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;
                const markerId = `arrow-${edge.type.replace(/\s+/g, '-').toLowerCase()}`;

                return (
                  <g key={edge.id} opacity={isSelectedEdge ? 1 : 0.8}>
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isSelectedEdge ? '#FFFFFF' : relCfg.color}
                      strokeWidth={isSelectedEdge ? 2.2 : 1.5}
                      strokeDasharray={relCfg.dashArray}
                      markerEnd={`url(#${markerId})`}
                    />

                    {/* Edge Label Badge */}
                    {showLabels && edge.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-38"
                          y="-8"
                          width="76"
                          height="16"
                          rx="4"
                          fill="#080D21"
                          stroke={isSelectedEdge ? '#FFFFFF' : relCfg.color}
                          strokeWidth="0.8"
                          opacity="0.95"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          letterSpacing="0.5"
                          fill={isSelectedEdge ? '#FFFFFF' : relCfg.color}
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* NODES LAYER */}
            <g id="nodes-layer">
              {visibleNodes.map(node => {
                const typeCfg = TYPE_CONFIG[node.type] || { color: '#94A3B8', icon: User };
                const isSelected = selectedNodeId === node.id;
                const isCulprit = node.role === 'suspect';
                const IconComponent = typeCfg.icon;
                const nodeRadius = isCulprit ? 26 : 22;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform"
                    onMouseDown={e => handleStartNodeDrag(e, node.id, node.x, node.y)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {/* Pulsing Aura for Primary Suspect */}
                    {isCulprit && (
                      <circle
                        r={nodeRadius + 12}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Glow Halo Ring */}
                    <circle
                      r={nodeRadius + 4}
                      fill="none"
                      stroke={isCulprit ? '#EF4444' : isSelected ? '#FFFFFF' : typeCfg.color}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      filter={isCulprit ? 'url(#glow-red)' : isSelected ? 'url(#glow-purple)' : undefined}
                    />

                    {/* Central Node Body Circle */}
                    <circle
                      r={nodeRadius}
                      fill={isCulprit ? 'url(#grad-red)' : isSelected ? '#1E1B4B' : '#0B112B'}
                      stroke={isCulprit ? '#DC2626' : typeCfg.color}
                      strokeWidth="2"
                    />

                    {/* Node Icon */}
                    <foreignObject
                      x={-nodeRadius + 5}
                      y={-nodeRadius + 5}
                      width={(nodeRadius - 5) * 2}
                      height={(nodeRadius - 5) * 2}
                      className="pointer-events-none"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: isCulprit ? '#FFFFFF' : typeCfg.color }}
                        />
                      </div>
                    </foreignObject>

                    {/* High-Resolution Node Labels */}
                    {showLabels && (
                      <g transform={`translate(0, ${nodeRadius + 14})`}>
                        <text
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#FFFFFF"
                          className="drop-shadow-md"
                        >
                          {node.label}
                        </text>
                        {node.subLabel && (
                          <text
                            y="13"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight={node.role === 'suspect' ? 'bold' : 'normal'}
                            fill={
                              node.role === 'suspect'
                                ? '#F87171'
                                : node.role === 'associate'
                                ? '#C084FC'
                                : '#94A3B8'
                            }
                          >
                            {node.subLabel}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Canvas Controls (Bottom-Left) */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 bg-[#090F24]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#1C264D] shadow-xl z-10">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
              title="Zoom In"
              className="p-2 text-slate-300 hover:text-white hover:bg-[#152048] rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.4))}
              title="Zoom Out"
              className="p-2 text-slate-300 hover:text-white hover:bg-[#152048] rounded-lg transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="h-px w-full bg-[#1C264D]" />
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              title="Fit to Screen"
              className="p-2 text-slate-300 hover:text-white hover:bg-[#152048] rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsLocked(!isLocked)}
              title={isLocked ? 'Unlock Canvas Drag' : 'Lock Canvas Drag'}
              className={`p-2 rounded-lg transition ${
                isLocked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-300 hover:text-white hover:bg-[#152048]'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>

          {/* Legend (Bottom-Center) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#090F24]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#1C264D] shadow-xl flex items-center gap-4 text-[11px] text-slate-300 z-10 hidden md:flex">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span>{type}</span>
              </div>
            ))}
          </div>

          {/* Live Mini-Map (Bottom-Right) */}
          <div className="absolute bottom-6 right-6 w-36 h-28 bg-[#090F24]/90 backdrop-blur-md rounded-xl border border-[#1C264D] shadow-2xl p-2 hidden lg:flex flex-col z-10">
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold mb-1">
              <span>MINI MAP</span>
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex-1 relative bg-[#060A1A] rounded border border-[#141E3D] overflow-hidden">
              <svg viewBox="0 0 1000 700" className="w-full h-full opacity-60">
                {visibleEdges.map(e => {
                  const s = nodeMap.get(e.source);
                  const t = nodeMap.get(e.target);
                  if (!s || !t) return null;
                  return <line key={e.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#475569" strokeWidth="3" />;
                })}
                {visibleNodes.map(n => (
                  <circle
                    key={n.id}
                    cx={n.x}
                    cy={n.y}
                    r={n.role === 'suspect' ? 18 : 12}
                    fill={n.role === 'suspect' ? '#EF4444' : TYPE_CONFIG[n.type]?.color || '#8B5CF6'}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* ==========================================
          RIGHT SIDEBAR: ENTITY DETAILS & AI SYNOPSIS
          ========================================== */}
      {selectedNode && (
        <aside className="w-80 shrink-0 flex flex-col border-l border-[#151D3B] bg-[#090F24] z-20">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#151D3B]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Entity Details
            </span>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            {/* Profile Avatar */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg ${
                  selectedNode.role === 'suspect'
                    ? 'bg-red-950/80 border-red-500 text-red-400 shadow-red-900/40'
                    : 'bg-purple-950/80 border-purple-500 text-purple-400 shadow-purple-900/40'
                }`}
              >
                {React.createElement(TYPE_CONFIG[selectedNode.type]?.icon || User, { className: 'w-6 h-6' })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white truncate">{selectedNode.label}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedNode.riskLevel === 'High Risk'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {selectedNode.riskLevel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {selectedNode.type} {selectedNode.subLabel}
                </div>
              </div>
            </div>

            {/* Key-Value Attributes */}
            <div className="bg-[#0D1533] rounded-lg border border-[#17203E] divide-y divide-[#17203E]">
              <div className="flex justify-between px-3 py-2 text-[11px]">
                <span className="text-slate-400">Canonical ID</span>
                <span className="font-mono text-white font-semibold">{selectedNode.details?.entityId}</span>
              </div>
              <div className="flex justify-between px-3 py-2 text-[11px]">
                <span className="text-slate-400">Risk Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${selectedNode.riskScore}%` }}
                    />
                  </div>
                  <span className="font-bold text-red-400">{selectedNode.riskScore}%</span>
                </div>
              </div>
              {selectedNode.details?.remarks && (
                <div className="px-3 py-2 text-[11px] space-y-1">
                  <span className="text-slate-400 block font-medium">Forensic Remarks</span>
                  <p className="text-slate-200 leading-relaxed">{selectedNode.details.remarks}</p>
                </div>
              )}
            </div>

            {/* Linked Entities Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Linked Relationships ({selectedNodeRelationships.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedNodeRelationships.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0D1533] border border-[#17203E] text-[11px]"
                  >
                    <div className="flex items-center gap-2 text-slate-300 truncate">
                      <span className="text-purple-400 font-bold font-mono">
                        {item.edge.label || item.edge.type}
                      </span>
                      <span className="text-white font-semibold truncate">
                        {item.connectedNode.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">{item.direction}</span>
                  </div>
                ))}
              </div>

              {selectedNodeRelationships.length > 5 && (
                <button
                  onClick={() => setShowAllRelModal(true)}
                  className="w-full mt-2 py-2 text-center text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-lg border border-purple-800/40 transition flex items-center justify-center gap-1.5"
                >
                  <span>View All {selectedNodeRelationships.length} Relationships</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* AI QUICK INSIGHT */}
            <div className="bg-[#12112C] border border-purple-800/60 rounded-xl p-3.5 space-y-2 shadow-lg shadow-purple-950/20">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>INTELLIGENCE INSIGHT</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {selectedNode.details?.quickInsight ||
                  `${selectedNode.label} exhibits strong centrality in this investigation. High degree of correlation with criminal infrastructure.`}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* ==========================================
          MODAL: ADD DYNAMIC LEAD / ENTITY
          ========================================== */}
      {isAddEntityOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewEntity}
            className="bg-[#0D1533] border border-[#223164] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A264E]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Add Entity & Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEntityOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Entity Value / Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 99887 76655 or HDFC Account"
                  value={newEntityForm.label}
                  onChange={e => setNewEntityForm(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Type</label>
                  <select
                    value={newEntityForm.type}
                    onChange={e => setNewEntityForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    {Object.keys(TYPE_CONFIG).map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Role</label>
                  <select
                    value={newEntityForm.role}
                    onChange={e => setNewEntityForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="suspect">Suspect</option>
                    <option value="associate">Associate / Mule</option>
                    <option value="normal">Witness / Channel</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1C264D]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Connect To Existing Entity
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Connect To</label>
                    <select
                      value={newEntityForm.connectTo}
                      onChange={e => setNewEntityForm(prev => ({ ...prev, connectTo: e.target.value }))}
                      className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.label} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Relationship</label>
                    <select
                      value={newEntityForm.relType}
                      onChange={e => {
                        const val = e.target.value;
                        let lbl = 'TRANSACTIONS';
                        if (val.includes('Call')) lbl = 'CALLS';
                        else if (val.includes('Owns')) lbl = 'OWNS';
                        else if (val.includes('Located')) lbl = 'LOCATED AT';
                        else if (val.includes('Associated')) lbl = 'ASSOCIATED WITH';
                        setNewEntityForm(prev => ({ ...prev, relType: val, relLabel: lbl }));
                      }}
                      className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    >
                      {Object.keys(RELATIONSHIP_CONFIG).map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEntityOpen(false)}
                  className="px-4 py-2 border border-[#1F2A52] hover:bg-[#14204A] text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Add to Graph
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL: VIEW ALL RELATIONSHIPS
          ========================================== */}
      {showAllRelModal && selectedNode && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1533] border border-[#223164] rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A264E]">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  All Relationships for {selectedNode.label}
                </h3>
              </div>
              <button
                onClick={() => setShowAllRelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2B54] text-slate-400">
                    <th className="pb-2.5 font-semibold">Direction</th>
                    <th className="pb-2.5 font-semibold">Relationship</th>
                    <th className="pb-2.5 font-semibold">Connected Entity</th>
                    <th className="pb-2.5 font-semibold">Type</th>
                    <th className="pb-2.5 font-semibold">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162142]">
                  {selectedNodeRelationships.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#121C42] transition">
                      <td className="py-2.5 text-slate-400 capitalize">{item.direction}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1C264D] text-purple-300">
                          {item.edge.label || item.edge.type}
                        </span>
                      </td>
                      <td className="py-2.5 text-white font-semibold">{item.connectedNode.label}</td>
                      <td className="py-2.5 text-slate-300">{item.connectedNode.type}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.connectedNode.riskLevel === 'High Risk'
                              ? 'bg-red-950 text-red-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {item.connectedNode.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-[#1A264E] flex justify-end">
              <button
                onClick={() => setShowAllRelModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
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
