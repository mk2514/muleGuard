import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
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
  ChevronLeft,
  Share2,
  Layers,
  FileText,
  Calendar,
  Network,
  Filter,
  SlidersHorizontal,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Radio,
  Zap,
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

// Demo Case (ATM Fraud Investigation) used as sample fallback
const DEMO_CASE_NODES = [
  {
    id: 'DEMO-P1',
    label: 'Ramesh',
    subLabel: '(Suspect)',
    type: 'Person',
    role: 'suspect',
    riskScore: 92,
    riskLevel: 'High Risk',
    daysAgo: 2,
    x: 500,
    y: 330,
    details: {
      entityId: 'PER-1001',
      age: 32,
      gender: 'Male',
      phone: '+91 98765 45210',
      email: 'ramesh23@mail.com',
      remarks: 'Primary suspect in ATM fraud activity across Chennai.',
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
    daysAgo: 5,
    x: 310,
    y: 470,
    details: {
      entityId: 'PER-1002',
      phone: '+91 98765 43210',
      remarks: 'Mule account handler; executes secondary cash withdrawals.',
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
    daysAgo: 12,
    x: 690,
    y: 470,
    details: {
      entityId: 'PER-1003',
      phone: '+91 91234 56780',
      remarks: 'SIM card provider and digital banking access coordinator.',
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
    daysAgo: 4,
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
    daysAgo: 15,
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
    daysAgo: 3,
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
    daysAgo: 18,
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
    daysAgo: 1,
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
    daysAgo: 2,
    x: 500,
    y: 520,
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
    daysAgo: 6,
    x: 500,
    y: 640,
    details: { entityId: 'IP-502', isp: 'ACT Fibernet', remarks: 'Used for midnight net-banking transfers.' }
  }
];

const DEMO_CASE_EDGES = [
  { id: 'de1', source: 'DEMO-P1', target: 'DEMO-PH1', type: 'Calls / Communicates', label: 'CALLS', daysAgo: 3, details: '47 outgoing voice calls recorded' },
  { id: 'de2', source: 'DEMO-P1', target: 'DEMO-PH2', type: 'Calls / Communicates', label: 'CALLS', daysAgo: 18, details: '12 coordination calls' },
  { id: 'de3', source: 'DEMO-P1', target: 'DEMO-DEV1', type: 'Owns / Uses', label: 'USES', daysAgo: 1, details: 'Primary handset active during fraud operations' },
  { id: 'de4', source: 'DEMO-P1', target: 'DEMO-B1', type: 'Owns / Uses', label: 'OWNS', daysAgo: 4, details: 'KYC verified mule account' },
  { id: 'de5', source: 'DEMO-P1', target: 'DEMO-B2', type: 'Owns / Uses', label: 'OWNS', daysAgo: 15, details: 'Corporate signatory access' },
  { id: 'de6', source: 'DEMO-P1', target: 'DEMO-LOC1', type: 'Located At', label: 'LOCATED AT', daysAgo: 2, details: 'Cell tower triangulation match' },
  { id: 'de7', source: 'DEMO-B1', target: 'DEMO-P2', type: 'Transactions', label: '₹14,20,000', daysAgo: 5, details: 'RTGS layer transfer split across 3 tranches' },
  { id: 'de8', source: 'DEMO-P2', target: 'DEMO-PH1', type: 'Calls / Communicates', label: 'CALLS', daysAgo: 5, details: 'Immediate call prior to ATM cash collection' },
  { id: 'de9', source: 'DEMO-P2', target: 'DEMO-LOC1', type: 'Located At', label: 'LOCATED AT', daysAgo: 2, details: 'CCTV physical camera recognition confirmed' },
  { id: 'de10', source: 'DEMO-B2', target: 'DEMO-P3', type: 'Transactions', label: '₹8,50,000', daysAgo: 12, details: 'IMPS rapid distribution payments' },
  { id: 'de11', source: 'DEMO-P3', target: 'DEMO-PH2', type: 'Calls / Communicates', label: 'CALLS', daysAgo: 14, details: 'SMS verification relay' },
  { id: 'de12', source: 'DEMO-P3', target: 'DEMO-LOC1', type: 'Located At', label: 'LOCATED AT', daysAgo: 12, details: 'Location ping near ATM site' },
  { id: 'de13', source: 'DEMO-LOC1', target: 'DEMO-IP1', type: 'Follows / Connected', label: 'CONNECTED', daysAgo: 6, details: 'Net-banking session initiated from ATM router IP' }
];

export default function IntelligenceGraph() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const caseId =
    searchParams.get('caseId') ||
    location.state?.caseId ||
    localStorage.getItem('active_case_id') ||
    'CASE-2025-1024';

  // State: Has Entity Resolution completed or is running demo?
  const [hasResolvedEntities, setHasResolvedEntities] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Nodes & Edges
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Selection & Hover
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [layoutMode, setLayoutMode] = useState('concentric'); // 'concentric' | 'orbit' | 'clustered'
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | '7days' | '30days'
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

  // Canvas Viewport Transforms & Dynamic Dimensions
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Modals & Panels (Open/Close according to user wish)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  // Refs
  const canvasContainerRef = useRef(null);
  const svgRef = useRef(null);
  const viewportRef = useRef(null);
  const searchInputRef = useRef(null);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Dragging Nodes
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Modals
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [showAllRelModal, setShowAllRelModal] = useState(false);
  const [addMode, setAddMode] = useState('new_entity'); // 'new_entity' | 'link_existing'

  const [newEntityForm, setNewEntityForm] = useState({
    label: '',
    subLabel: '',
    type: 'Person',
    role: 'associate',
    connectTo: '',
    relType: 'Transactions',
    relLabel: 'TRANSACTIONS'
  });

  const [linkExistingForm, setLinkExistingForm] = useState({
    sourceId: '',
    targetId: '',
    relType: 'Transactions',
    relLabel: 'TRANSACTIONS'
  });

  // Theme definition object for pristine contrast & visibility
  const theme = useMemo(() => isDarkMode ? {
    bg: 'bg-[#070B19]',
    canvasBg: '#070B19',
    gridDot: '#182245',
    cardBg: 'bg-[#0D1533]',
    sidebarBg: 'bg-[#090F24]',
    headerBg: 'bg-[#080D20]',
    border: 'border-[#151D3B]',
    borderHighlight: 'border-[#223164]',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    inputBg: 'bg-[#0C132E]',
    buttonBg: 'bg-[#0E1636]',
    buttonHover: 'hover:bg-[#15204C]',
    nodeBg: '#0B112B',
    selectedRing: '#FFFFFF',
    textContrast: '#FFFFFF'
  } : {
    bg: 'bg-slate-100',
    canvasBg: '#F8FAFC',
    gridDot: '#CBD5E1',
    cardBg: 'bg-white',
    sidebarBg: 'bg-white',
    headerBg: 'bg-white',
    border: 'border-slate-200',
    borderHighlight: 'border-purple-300',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    inputBg: 'bg-slate-100',
    buttonBg: 'bg-white',
    buttonHover: 'hover:bg-slate-100',
    nodeBg: '#FFFFFF',
    selectedRing: '#1E1B4B',
    textContrast: '#0F172A'
  }, [isDarkMode]);

  // ==========================================
  // VIEWPORT MEASUREMENT & RESIZE OBSERVER
  // ==========================================
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          });
        }
      }
    };

    handleResize();

    let resizeObserver = null;
    if (window.ResizeObserver && canvasContainerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvasContainerRef.current);
    }
    window.addEventListener('resize', handleResize);

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const currentPanRef = useRef(pan);
  currentPanRef.current = pan;
  const lastNodeDragPosRef = useRef({ x: 0, y: 0 });

  // ==========================================
  // PRECISE CENTERING & AUTO-FIT TO SCREEN
  // ==========================================
  const fitGraphToScreen = useCallback((nodeList) => {
    const targetNodes = (nodeList && nodeList.length > 0) ? nodeList : nodesRef.current;
    if (!targetNodes || targetNodes.length === 0) return;

    const w = canvasContainerRef.current?.clientWidth || dimensions.width || 1000;
    const h = canvasContainerRef.current?.clientHeight || dimensions.height || 700;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    targetNodes.forEach(n => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    // Add adequate margin for text labels and node glows
    const marginX = 160;
    const marginY = 140;
    const graphW = Math.max(200, maxX - minX + marginX);
    const graphH = Math.max(200, maxY - minY + marginY);

    const fitScale = Math.min((w - 60) / graphW, (h - 60) / graphH, 1.25);
    const safeZoom = Math.min(Math.max(fitScale, 0.45), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newX = Math.round(w / 2 - centerX * safeZoom);
    const newY = Math.round(h / 2 - centerY * safeZoom);

    setZoom(safeZoom);
    setPan({ x: newX, y: newY });
    panRef.current = { x: newX, y: newY };
    currentPanRef.current = { x: newX, y: newY };

    if (viewportRef.current) {
      viewportRef.current.setAttribute('transform', `translate(${newX}, ${newY}) scale(${safeZoom})`);
    }
  }, [dimensions]);

  // ==========================================
  // SMART MULTI-RING COLLISION-FREE LAYOUT
  // ==========================================
  const calculateLayout = useCallback((nodeList, edgeList, mode) => {
    const count = nodeList.length;
    if (count === 0) return [];

    const cx = Math.round(dimensions.width / 2) || 500;
    const cy = Math.round(dimensions.height / 2) || 350;

    if (mode === 'concentric') {
      const suspect = nodeList.find(n => n.role === 'suspect') || nodeList[0];
      const others = nodeList.filter(n => n.id !== suspect.id);
      
      const associates = others.filter(n => n.type === 'Person');
      const financial = others.filter(n => n.type === 'Bank Account' || n.type === 'Phone Number');
      const infra = others.filter(n => n.type !== 'Person' && n.type !== 'Bank Account' && n.type !== 'Phone Number');

      return nodeList.map(node => {
        if (node.id === suspect.id) {
          return { ...node, x: cx, y: cy };
        }

        // Ring 1: Direct Associates
        if (node.type === 'Person') {
          const aIdx = associates.findIndex(a => a.id === node.id);
          const totalA = Math.max(1, associates.length);
          const angle = (aIdx / totalA) * Math.PI + Math.PI * 0.5;
          const r = Math.max(180, 160 + totalA * 15);
          return {
            ...node,
            x: Math.round(cx + Math.cos(angle) * r),
            y: Math.round(cy + Math.sin(angle) * r)
          };
        }

        // Ring 2: Financial & Comms
        const fIdx = financial.findIndex(f => f.id === node.id);
        if (fIdx !== -1) {
          const totalF = Math.max(1, financial.length);
          const angle = (fIdx / totalF) * 2 * Math.PI - Math.PI * 0.25;
          const r = 260 + (fIdx % 2) * 45;
          return {
            ...node,
            x: Math.round(cx + Math.cos(angle) * r),
            y: Math.round(cy + Math.sin(angle) * r)
          };
        }

        // Ring 3: Infrastructure / Auxiliary
        const iIdx = infra.findIndex(i => i.id === node.id);
        const totalI = Math.max(1, infra.length);
        if (totalI > 8) {
          // Multi-tiered staggered rings for cases with many entities (e.g. 22 locations)
          const tier = iIdx % 3;
          const tierRadius = 310 + tier * 130;
          const tierCount = Math.ceil(totalI / 3);
          const tierIdx = Math.floor(iIdx / 3);
          const angle = (tierIdx / Math.max(1, tierCount)) * 2 * Math.PI + tier * 0.45;
          return {
            ...node,
            x: Math.round(cx + Math.cos(angle) * tierRadius),
            y: Math.round(cy + Math.sin(angle) * tierRadius)
          };
        }
        const angle = (iIdx / totalI) * 2 * Math.PI;
        const r = 320 + (iIdx % 2) * 50;
        return {
          ...node,
          x: Math.round(cx + Math.cos(angle) * r),
          y: Math.round(cy + Math.sin(angle) * r)
        };
      });
    }

    if (mode === 'orbit') {
      // Golden angle spiral orbit (Phyllotaxis) - zero collision guaranteed!
      const goldenAngle = 2.39996; // ~137.5 degrees
      return nodeList.map((node, idx) => {
        if (idx === 0 && node.role === 'suspect') {
          return { ...node, x: cx, y: cy };
        }
        const r = 160 + Math.sqrt(idx) * 65;
        const angle = idx * goldenAngle;
        return {
          ...node,
          x: Math.round(cx + Math.cos(angle) * r),
          y: Math.round(cy + Math.sin(angle) * r)
        };
      });
    }

    // mode === 'clustered' (Categorical clusters grouped by Entity Type)
    const types = Array.from(new Set(nodeList.map(n => n.type)));
    const typeCenters = {};
    const clusterRadius = Math.max(220, count * 10);
    types.forEach((t, tIdx) => {
      const theta = (tIdx / types.length) * 2 * Math.PI - Math.PI / 2;
      typeCenters[t] = {
        cx: Math.round(cx + Math.cos(theta) * clusterRadius),
        cy: Math.round(cy + Math.sin(theta) * clusterRadius)
      };
    });

    const typeItemCount = {};
    return nodeList.map(node => {
      const center = typeCenters[node.type] || { cx, cy };
      const indexInType = typeItemCount[node.type] || 0;
      typeItemCount[node.type] = indexInType + 1;

      if (indexInType === 0) {
        return { ...node, x: center.cx, y: center.cy };
      }
      const localAngle = (indexInType * 1.5);
      const localR = 60 + indexInType * 25;
      return {
        ...node,
        x: Math.round(center.cx + Math.cos(localAngle) * localR),
        y: Math.round(center.cy + Math.sin(localAngle) * localR)
      };
    });
  }, [dimensions]);

  // ==========================================
  // DYNAMIC GRAPH SYNTHESIS
  // ==========================================
  const loadDynamicGraph = useCallback(() => {
    const rawEntitiesStr = localStorage.getItem(`entities_${caseId}`);
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
          setIsDemoMode(false);

          let parsedRecords = [];
          if (rawOutputStr) {
            try {
              const parsedOut = JSON.parse(rawOutputStr);
              parsedRecords = parsedOut.records || parsedOut.data || parsedOut.items || [];
            } catch { parsedRecords = []; }
          }

          // Build dynamic nodes and edges
          const dynamicNodes = synthesizeNodes(resolvedEntities, parsedRecords);
          const dynamicEdges = synthesizeEdges(resolvedEntities, parsedRecords, dynamicNodes);
          const positionedNodes = calculateLayout(dynamicNodes, dynamicEdges, layoutMode);

          setNodes(positionedNodes);
          setEdges(dynamicEdges);

          // Set primary node reference without forcing details panel open on load
          const primary = positionedNodes.find(n => n.role === 'suspect') || positionedNodes[0];
          if (primary) setSelectedNodeId(primary.id);
          setIsDetailsOpen(false); // DEFAULT TO CLOSED (Opens according to user wish)

          setTimeout(() => fitGraphToScreen(positionedNodes), 100);
          return true;
        }
      } catch (err) {
        console.error('Error hydrating dynamic graph:', err);
      }
    }

    setHasResolvedEntities(false);
    return false;
  }, [caseId, layoutMode, calculateLayout, fitGraphToScreen]);

  useEffect(() => {
    if (!isDemoMode) {
      loadDynamicGraph();
    }
  }, [caseId, isDemoMode]);

  // Fallback demo loader
  const loadDemoData = () => {
    setIsDemoMode(true);
    setHasResolvedEntities(true);
    const positioned = calculateLayout(DEMO_CASE_NODES, DEMO_CASE_EDGES, layoutMode);
    setNodes(positioned);
    setEdges(DEMO_CASE_EDGES);
    setSelectedNodeId('DEMO-P1');
    setTimeout(() => fitGraphToScreen(positioned), 50);
  };

  // Change layout without breaking state
  const handleSwitchLayout = useCallback((newMode) => {
    setLayoutMode(newMode);
    const updated = calculateLayout(nodes, edges, newMode);
    setNodes(updated);
    setTimeout(() => fitGraphToScreen(updated), 50);
  }, [nodes, edges, calculateLayout, fitGraphToScreen]);

  // ==========================================
  // SYNTHESIZE NODES FROM REAL RESOLVED ENTITIES
  // ==========================================
  function synthesizeNodes(entities, records) {
    const frequencyMap = {};
    records.forEach(r => {
      Object.values(r).forEach(v => {
        if (!v) return;
        const norm = String(v).trim().toLowerCase();
        frequencyMap[norm] = (frequencyMap[norm] || 0) + 1;
      });
    });

    // Detect suspect by centrality & frequency
    let highestScore = -1;
    let primarySuspectId = null;

    entities.forEach(ent => {
      const isPerson = ent.type?.toLowerCase().includes('person') || ent.type?.toLowerCase() === 'user';
      if (isPerson) {
        const val = String(ent.canonical_value).trim().toLowerCase();
        const score = (frequencyMap[val] || 0) * 3 + (ent.linked_records?.length || 0) * 2 + (ent.related_canonical_ids?.length || 0) * 4;
        if (score > highestScore) {
          highestScore = score;
          primarySuspectId = ent.canonical_id;
        }
      }
    });

    return entities.map((ent, idx) => {
      let mappedType = 'Person';
      const rawType = (ent.type || '').toLowerCase();
      if (rawType.includes('phone') || rawType.includes('mobile')) mappedType = 'Phone Number';
      else if (rawType.includes('bank') || rawType.includes('account') || rawType.includes('upi')) mappedType = 'Bank Account';
      else if (rawType.includes('device') || rawType.includes('imei')) mappedType = 'Device';
      else if (rawType.includes('email')) mappedType = 'Email';
      else if (rawType.includes('location') || rawType.includes('atm') || rawType.includes('tower')) mappedType = 'Location';
      else if (rawType.includes('ip')) mappedType = 'IP Address';
      else if (rawType.includes('org') || rawType.includes('company')) mappedType = 'Organization';

      const isSuspect = ent.canonical_id === primarySuspectId || (mappedType === 'Person' && idx === 0);
      const isAssociate = mappedType === 'Person' && !isSuspect;

      const recordCount = ent.linked_records?.length || 1;
      const relatedCount = ent.related_canonical_ids?.length || 0;
      let calculatedRisk = isSuspect ? 92 : Math.min(94, 50 + recordCount * 4 + relatedCount * 5);
      if (mappedType === 'Bank Account' && recordCount > 3) calculatedRisk = 85;

      const riskLevel = calculatedRisk >= 80 ? 'High Risk' : calculatedRisk >= 60 ? 'Medium Risk' : 'Low Risk';

      return {
        id: ent.canonical_id,
        label: ent.canonical_value,
        subLabel: isSuspect ? '(Suspect)' : isAssociate ? '(Associate)' : mappedType === 'Bank Account' ? 'Mule Account' : '',
        type: mappedType,
        role: isSuspect ? 'suspect' : isAssociate ? 'associate' : 'normal',
        riskScore: calculatedRisk,
        riskLevel,
        daysAgo: (idx % 20) + 1,
        x: 500,
        y: 350,
        details: {
          entityId: ent.canonical_id,
          originalValues: ent.original_values || [ent.canonical_value],
          linkedRecordsCount: recordCount,
          remarks: `Synthesized from ${recordCount} processed record(s) in case ${caseId}.`,
          linkedCounts: {
            'Records Linked': recordCount,
            'Connected Entities': relatedCount
          },
          quickInsight: isSuspect
            ? `${ent.canonical_value} is the primary node in this network with ${relatedCount} direct connections across uploaded case files.`
            : `${ent.canonical_value} is linked to ${relatedCount} entities in this case.`
        }
      };
    });
  }

  // ==========================================
  // SYNTHESIZE EDGES FROM REAL PROCESSED RECORDS
  // ==========================================
  function synthesizeEdges(entities, records, dynamicNodes) {
    const edgesList = [];
    const seenEdges = new Set();

    // Mapping lookup: exact, digits-only, and lowercase
    const lookup = new Map();
    dynamicNodes.forEach(n => {
      const raw = String(n.label).trim().toLowerCase();
      lookup.set(raw, n.id);
      const digitsOnly = raw.replace(/\D/g, '');
      if (digitsOnly.length >= 6) lookup.set(digitsOnly, n.id);

      if (n.details?.originalValues) {
        n.details.originalValues.forEach(v => {
          const vRaw = String(v).trim().toLowerCase();
          lookup.set(vRaw, n.id);
          const vDigits = vRaw.replace(/\D/g, '');
          if (vDigits.length >= 6) lookup.set(vDigits, n.id);
        });
      }
    });

    // Match entities against records
    records.forEach((rec, idx) => {
      const srcVal = String(rec.source || rec.sender || rec.caller || rec.src_ip || rec.from || '').trim().toLowerCase();
      const tgtVal = String(rec.target || rec.receiver || rec.called || rec.dest_ip || rec.to || '').trim().toLowerCase();

      let srcId = lookup.get(srcVal) || lookup.get(srcVal.replace(/\D/g, ''));
      let tgtId = lookup.get(tgtVal) || lookup.get(tgtVal.replace(/\D/g, ''));

      if (srcId && tgtId && srcId !== tgtId) {
        const key1 = `${srcId}->${tgtId}`;
        const key2 = `${tgtId}->${srcId}`;

        if (!seenEdges.has(key1) && !seenEdges.has(key2)) {
          seenEdges.add(key1);

          let relType = 'Calls / Communicates';
          let relLabel = 'CALLS';

          const ev = String(rec.event_type || rec.type || '').toLowerCase();
          const amt = rec.amount || rec.txn_amount;

          if (amt || ev.includes('trans') || ev.includes('bank') || ev.includes('upi')) {
            relType = 'Transactions';
            relLabel = amt ? `₹${Number(amt).toLocaleString()}` : 'TRANSACTIONS';
          } else if (ev.includes('call') || ev.includes('voice')) {
            relType = 'Calls / Communicates';
            relLabel = rec.duration ? `${rec.duration}s` : 'CALLS';
          } else if (ev.includes('sms')) {
            relType = 'Calls / Communicates';
            relLabel = 'SMS';
          } else if (ev.includes('location') || ev.includes('tower') || ev.includes('atm')) {
            relType = 'Located At';
            relLabel = 'LOCATED AT';
          }

          edgesList.push({
            id: `edge_rec_${idx}`,
            source: srcId,
            target: tgtId,
            type: relType,
            label: relLabel,
            daysAgo: (idx % 25) + 1,
            details: rec.description || rec.notes || `Direct activity logged in record #${idx + 1}`
          });
        }
      }
    });

    // Add co-occurrences resolved from Entity Resolution
    entities.forEach((ent, i) => {
      if (ent.related_canonical_ids && Array.isArray(ent.related_canonical_ids)) {
        ent.related_canonical_ids.forEach((relId, j) => {
          const key1 = `${ent.canonical_id}->${relId}`;
          const key2 = `${relId}->${ent.canonical_id}`;

          if (!seenEdges.has(key1) && !seenEdges.has(key2)) {
            seenEdges.add(key1);
            edgesList.push({
              id: `edge_res_${i}_${j}`,
              source: ent.canonical_id,
              target: relId,
              type: 'Associated With',
              label: 'ASSOCIATED WITH',
              daysAgo: (i + j) % 20 + 2,
              details: 'Entity resolution co-occurrence cluster linkage'
            });
          }
        });
      }
    });

    return edgesList;
  }

  // ==========================================
  // REAL-TIME METRICS & FUNCTIONAL FILTERING
  // ==========================================
  // Filter by Date Range (Functional!)
  const dateFilteredEdges = useMemo(() => {
    return edges.filter(e => {
      if (dateFilter === '7days') return (e.daysAgo || 0) <= 7;
      if (dateFilter === '30days') return (e.daysAgo || 0) <= 30;
      return true;
    });
  }, [edges, dateFilter]);

  const activeConnectedNodeIds = useMemo(() => {
    if (dateFilter === 'all') return new Set(nodes.map(n => n.id));
    const ids = new Set();
    dateFilteredEdges.forEach(e => {
      ids.add(e.source);
      ids.add(e.target);
    });
    return ids;
  }, [nodes, dateFilteredEdges, dateFilter]);

  const visibleNodes = useMemo(() => {
    return nodes.filter(n => {
      if (!activeEntityFilters[n.type]) return false;
      if (dateFilter !== 'all' && !activeConnectedNodeIds.has(n.id)) return false;
      return true;
    });
  }, [nodes, activeEntityFilters, dateFilter, activeConnectedNodeIds]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(n => n.id)), [visibleNodes]);

  const visibleEdges = useMemo(() => {
    return dateFilteredEdges.filter(e => {
      if (!activeRelFilters[e.type]) return false;
      return visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target);
    });
  }, [dateFilteredEdges, activeRelFilters, visibleNodeIds]);

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedEdge = useMemo(() => {
    return edges.find(e => e.id === selectedEdgeId) || null;
  }, [edges, selectedEdgeId]);

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

  const graphMetrics = useMemo(() => {
    const counts = {};
    Object.keys(TYPE_CONFIG).forEach(t => { counts[t] = 0; });
    visibleNodes.forEach(n => {
      if (counts[n.type] !== undefined) counts[n.type]++;
    });

    const relCounts = {};
    Object.keys(RELATIONSHIP_CONFIG).forEach(r => { relCounts[r] = 0; });
    visibleEdges.forEach(e => {
      if (relCounts[e.type] !== undefined) relCounts[e.type]++;
    });

    return { counts, relCounts, totalNodes: visibleNodes.length, totalEdges: visibleEdges.length };
  }, [visibleNodes, visibleEdges]);

  // Search match logic: instead of deleting nodes, highlights match
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set();
    const q = searchQuery.toLowerCase().trim();
    const matches = nodes.filter(n =>
      n.label.toLowerCase().includes(q) ||
      (n.subLabel && n.subLabel.toLowerCase().includes(q)) ||
      (n.details?.entityId && n.details.entityId.toLowerCase().includes(q))
    );
    return new Set(matches.map(m => m.id));
  }, [nodes, searchQuery]);

  // Auto-pan to searched entity
  useEffect(() => {
    if (searchQuery.trim() && matchingNodeIds.size > 0) {
      const firstMatched = nodes.find(n => matchingNodeIds.has(n.id));
      if (firstMatched) {
        setSelectedNodeId(firstMatched.id);
        const w = dimensions.width || 1000;
        const h = dimensions.height || 700;
        setPan({
          x: Math.round(w / 2 - firstMatched.x * zoom),
          y: Math.round(h / 2 - firstMatched.y * zoom)
        });
      }
    }
  }, [searchQuery, matchingNodeIds, nodes, zoom, dimensions]);

  // ==========================================
  // ==========================================
  // CURSOR-ANCHORED ZOOMING & PANNING
  // ==========================================
  const applyZoom = useCallback((factor, clientX, clientY) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();

    const mouseX = clientX !== undefined ? clientX - rect.left : rect.width / 2;
    const mouseY = clientY !== undefined ? clientY - rect.top : rect.height / 2;

    setZoom(prevZoom => {
      const newZoom = Math.min(Math.max(prevZoom * factor, 0.15), 4.5);
      if (Math.abs(newZoom - prevZoom) < 0.001) return prevZoom;

      setPan(prevPan => {
        const scaleChange = newZoom / prevZoom;
        return {
          x: Math.round(mouseX - (mouseX - prevPan.x) * scaleChange),
          y: Math.round(mouseY - (mouseY - prevPan.y) * scaleChange)
        };
      });

      return newZoom;
    });
  }, []);

  const handleZoomSliderChange = (e) => {
    const targetZoom = parseFloat(e.target.value);
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setZoom(prevZoom => {
      const scaleChange = targetZoom / prevZoom;
      setPan(prevPan => ({
        x: Math.round(centerX - (centerX - prevPan.x) * scaleChange),
        y: Math.round(centerY - (centerY - prevPan.y) * scaleChange)
      }));
      return targetZoom;
    });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    // Exponential smoothing for natural feel on both trackpads & notched mouse wheels
    const intensity = e.ctrlKey ? 0.015 : 0.0025;
    const factor = Math.exp(-e.deltaY * intensity);
    applyZoom(factor, e.clientX, e.clientY);
  };

  const panRef = useRef(pan);
  panRef.current = pan;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;

  const isPanningRef = useRef(false);
  const draggingNodeRef = useRef(null);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const panStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Toggle Entity Details with guaranteed auto-selection of suspect node if none selected
  const handleToggleDetails = useCallback(() => {
    setIsDetailsOpen(prev => {
      const next = !prev;
      if (next && !selectedNodeId && nodes.length > 0) {
        const primary = nodes.find(n => n.role === 'suspect') || nodes[0];
        if (primary) setSelectedNodeId(primary.id);
      }
      return next;
    });
  }, [selectedNodeId, nodes]);

  // Canvas Panning via Pointer Events for robust tracking
  const handlePointerDownCanvas = (e) => {
    if (isLockedRef.current) return;
    // Don't pan if clicking on interactive controls
    if (
      e.target.closest('[data-node-id]') ||
      e.target.closest('[data-edge-id]') ||
      e.target.closest('button') ||
      e.target.closest('input') ||
      e.target.closest('select')
    ) return;

    // Deselect edges on canvas click
    setSelectedEdgeId(null);

    isPanningRef.current = true;
    hasMovedRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    panStartPosRef.current = { x: currentPanRef.current.x, y: currentPanRef.current.y };
    setIsPanning(true);
  };

  const handleStartNodeDrag = (e, nodeId, nodeX, nodeY) => {
    e.stopPropagation();
    draggingNodeRef.current = nodeId;
    hasMovedRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    lastNodeDragPosRef.current = { x: nodeX, y: nodeY };

    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const currentPan = currentPanRef.current;
      const mouseGraphX = (e.clientX - rect.left - currentPan.x) / zoomRef.current;
      const mouseGraphY = (e.clientY - rect.top - currentPan.y) / zoomRef.current;
      dragOffsetRef.current = {
        x: mouseGraphX - nodeX,
        y: mouseGraphY - nodeY
      };
    }
    setDraggingNodeId(nodeId);
  };

  const handleNodePointerUp = () => {
    setDraggingNodeId(null);
  };

  // Dedicated Canvas Nudge/Move Function for Arrow Keys & Directional Buttons
  const moveCanvas = useCallback((dx, dy) => {
    setPan(prev => {
      const nextX = prev.x + dx;
      const nextY = prev.y + dy;
      panRef.current = { x: nextX, y: nextY };
      currentPanRef.current = { x: nextX, y: nextY };
      if (viewportRef.current) {
        viewportRef.current.setAttribute(
          'transform',
          `translate(${nextX}, ${nextY}) scale(${zoomRef.current})`
        );
      }
      return { x: nextX, y: nextY };
    });
  }, []);

  // High-performance window-level listener with zero-lag DOM updates
  useEffect(() => {
    const onWindowPointerMove = (e) => {
      if (isPanningRef.current && !isLockedRef.current) {
        const dx = e.clientX - pointerStartRef.current.x;
        const dy = e.clientY - pointerStartRef.current.y;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) hasMovedRef.current = true;

        const newX = Math.round(panStartPosRef.current.x + dx);
        const newY = Math.round(panStartPosRef.current.y + dy);
        currentPanRef.current = { x: newX, y: newY };
        panRef.current = { x: newX, y: newY };

        // Instant hardware-accelerated transform update on the SVG viewport group
        if (viewportRef.current) {
          viewportRef.current.setAttribute(
            'transform',
            `translate(${newX}, ${newY}) scale(${zoomRef.current})`
          );
        }
      } else if (draggingNodeRef.current && canvasContainerRef.current) {
        const dx = e.clientX - pointerStartRef.current.x;
        const dy = e.clientY - pointerStartRef.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMovedRef.current = true;

        const rect = canvasContainerRef.current.getBoundingClientRect();
        const currentPan = currentPanRef.current;
        const currentZoom = zoomRef.current;
        const mouseGraphX = (e.clientX - rect.left - currentPan.x) / currentZoom;
        const mouseGraphY = (e.clientY - rect.top - currentPan.y) / currentZoom;
        const newX = Math.round(mouseGraphX - dragOffsetRef.current.x);
        const newY = Math.round(mouseGraphY - dragOffsetRef.current.y);
        lastNodeDragPosRef.current = { x: newX, y: newY };

        const currentDragId = draggingNodeRef.current;
        const nodeEl = document.querySelector(`[data-node-id="${currentDragId}"]`);
        if (nodeEl) {
          nodeEl.setAttribute('transform', `translate(${newX}, ${newY})`);
        }
      }
    };

    const onWindowPointerUp = (e) => {
      if (isPanningRef.current) {
        const finalX = currentPanRef.current.x;
        const finalY = currentPanRef.current.y;
        setPan({ x: finalX, y: finalY });
        isPanningRef.current = false;
        setIsPanning(false);
      }

      if (draggingNodeRef.current) {
        const nodeId = draggingNodeRef.current;
        draggingNodeRef.current = null;
        setDraggingNodeId(null);

        if (hasMovedRef.current) {
          // Permanently commit the dragged node position so it stays where placed
          const finalPos = lastNodeDragPosRef.current;
          if (finalPos && finalPos.x !== undefined) {
            setNodes(prev =>
              prev.map(n => (n.id === nodeId ? { ...n, x: finalPos.x, y: finalPos.y } : n))
            );
          }
        } else {
          // Intentional click! Open details dialog!
          setSelectedNodeId(nodeId);
          setSelectedEdgeId(null);
          setIsDetailsOpen(true);
        }
      }
    };

    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', onWindowPointerUp);
    window.addEventListener('pointercancel', onWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', onWindowPointerMove);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
    };
  }, []);

  // Neo4j Integration & Cypher Export Handlers
  const [isSyncingNeo4j, setIsSyncingNeo4j] = useState(false);
  const [neo4jFeedback, setNeo4jFeedback] = useState(null);

  const handleExportCypher = useCallback(() => {
    const lines = [
      `// ========================================================`,
      `// MuleGuard AI - Automated Neo4j Cypher Import Script`,
      `// Case ID: ${caseId}`,
      `// Generated from Live Consolidated Intelligence Graph`,
      `// ========================================================\n`,
      `CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;\n`,
      `// 1. Merge Nodes`
    ];

    nodes.forEach(n => {
      const id = String(n.id).replace(/'/g, "\\'");
      const name = String(n.label || n.name || id).replace(/'/g, "\\'");
      const type = String(n.type || n.role || "ENTITY").toUpperCase().replace(/\s+/g, "_");
      const score = Number(n.riskScore || 0);
      lines.push(`MERGE (e:Entity {id: '${id}', case_id: '${caseId}'}) ON CREATE SET e.name = '${name}', e.type = '${type}', e.risk_score = ${score};`);
    });

    lines.push(`\n// 2. Merge Relationships`);
    edges.forEach(e => {
      const src = String(e.source).replace(/'/g, "\\'");
      const tgt = String(e.target).replace(/'/g, "\\'");
      const amt = String(e.amount || e.label || "0").replace(/[₹,]/g, "").trim();
      const rel = String(e.type || "TRANSACTED_WITH").toUpperCase().replace(/\s+/g, "_");
      lines.push(`MERGE (s:Entity {id: '${src}', case_id: '${caseId}'}) MERGE (t:Entity {id: '${tgt}', case_id: '${caseId}'}) CREATE (s)-[:${rel} {amount: '${amt}', case_id: '${caseId}'}]->(t);`);
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${caseId}_neo4j_graph.cypher`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges, caseId]);

  const handleSyncNeo4j = useCallback(async () => {
    setIsSyncingNeo4j(true);
    setNeo4jFeedback(null);
    try {
      const apiUrls = ['http://127.0.0.1:8000/api/neo4j/sync', '/api/neo4j/sync'];
      let synced = false;
      for (const url of apiUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              case_id: caseId,
              records: edges.map(e => ({
                source: e.source,
                target: e.target,
                amount: e.amount || e.label,
                type: e.type,
                timestamp: e.timestamp,
              })),
              entities: nodes.map(n => ({
                canonical_id: n.id,
                canonical_value: n.label || n.name,
                entity_type: n.type || n.role,
                risk_score: n.riskScore || 0,
              })),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setNeo4jFeedback({
              type: data.neo4j_online ? 'success' : 'info',
              message: data.message,
            });
            synced = true;
            break;
          }
        } catch { /* try next */ }
      }
      if (!synced) {
        setNeo4jFeedback({
          type: 'info',
          message: 'Backend offline. Export Neo4j Cypher script available for manual import.',
        });
      }
    } catch {
      setNeo4jFeedback({
        type: 'info',
        message: 'Cypher script is ready for download and direct execution in Neo4j Browser.',
      });
    } finally {
      setIsSyncingNeo4j(false);
    }
  }, [caseId, nodes, edges]);

  // ==========================================
  // KEYBOARD SHORTCUTS ENGINE (ARROW KEYS & HOTKEYS)
  // ==========================================
  const handleKeyDown = useCallback((e) => {
    // Do not trigger hotkeys when typing in search or input fields
    const targetTag = e.target.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
      if (e.key === 'Escape') {
        e.target.blur();
        setSearchQuery('');
      }
      return;
    }

    switch (e.key) {
      case '+':
      case '=':
        e.preventDefault();
        applyZoom(1.2);
        break;
      case '-':
      case '_':
        e.preventDefault();
        applyZoom(0.83);
        break;
      case '0':
      case 'r':
      case 'R':
        e.preventDefault();
        fitGraphToScreen();
        break;
      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          fitGraphToScreen();
        }
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        moveCanvas(0, 60);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        moveCanvas(0, -60);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        moveCanvas(60, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        moveCanvas(-60, 0);
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setIsDetailsOpen(false);
        setSearchQuery('');
        setIsAddEntityOpen(false);
        setShowAllRelModal(false);
        setIsShortcutsOpen(false);
        break;
      case 'i':
      case 'I':
        e.preventDefault();
        setIsDetailsOpen(prev => !prev);
        break;
      case 'l':
      case 'L':
        e.preventDefault();
        setIsLocked(prev => !prev);
        break;
      case 'h':
      case 'H':
        e.preventDefault();
        setShowLabels(prev => !prev);
        break;
      case 't':
      case 'T':
        e.preventDefault();
        setIsDarkMode(prev => !prev);
        break;
      case '1':
        e.preventDefault();
        handleSwitchLayout('concentric');
        break;
      case '2':
        e.preventDefault();
        handleSwitchLayout('orbit');
        break;
      case '3':
        e.preventDefault();
        handleSwitchLayout('clustered');
        break;
      case '/':
        e.preventDefault();
        searchInputRef.current?.focus();
        break;
      case '?':
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        break;
      default:
        break;
    }
  }, [applyZoom, fitGraphToScreen, handleSwitchLayout, moveCanvas]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Reset Filters & Re-Fit View
  const handleResetFiltersAndLayout = () => {
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
    setDateFilter('all');
    setSelectedEdgeId(null);
    fitGraphToScreen(nodes);
  };

  // Toggle or Isolate an Entity Type from Bottom Legend or Sidebar
  const handleToggleEntityType = (type, isAltKey = false) => {
    if (isAltKey) {
      // Isolate this type exclusively
      const allOtherDisabled = Object.keys(activeEntityFilters).every(t => t === type ? activeEntityFilters[t] : !activeEntityFilters[t]);
      if (allOtherDisabled) {
        // If already isolated, turn all back on
        const reset = {};
        Object.keys(activeEntityFilters).forEach(t => { reset[t] = true; });
        setActiveEntityFilters(reset);
      } else {
        const isolated = {};
        Object.keys(activeEntityFilters).forEach(t => { isolated[t] = (t === type); });
        setActiveEntityFilters(isolated);
      }
    } else {
      setActiveEntityFilters(prev => ({ ...prev, [type]: !prev[type] }));
    }
  };

  // Select all or deselect all entity types
  const handleToggleAllEntityTypes = (enableAll) => {
    const updated = {};
    Object.keys(activeEntityFilters).forEach(t => { updated[t] = enableAll; });
    setActiveEntityFilters(updated);
  };

  // Export handlers
  const handleExport = (format) => {
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ caseId, nodes, edges }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `MuleGuard_Graph_${caseId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const svgEl = svgRef.current;
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

  // Add Dynamic Entity or Link
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (addMode === 'new_entity') {
      if (!newEntityForm.label) return;
      const newId = `E-MANUAL-${Date.now().toString().slice(-4)}`;
      const newNode = {
        id: newId,
        label: newEntityForm.label,
        subLabel: newEntityForm.subLabel || `(${newEntityForm.role})`,
        type: newEntityForm.type,
        role: newEntityForm.role,
        riskScore: newEntityForm.role === 'suspect' ? 90 : 65,
        riskLevel: newEntityForm.role === 'suspect' ? 'High Risk' : 'Medium Risk',
        daysAgo: 1,
        x: Math.round(dimensions.width / 2) + (Math.random() - 0.5) * 160,
        y: Math.round(dimensions.height / 2) + (Math.random() - 0.5) * 140,
        details: {
          entityId: newId,
          remarks: 'Manually augmented entity in case evidence.',
          linkedCounts: { 'Direct Links': 1 },
          quickInsight: `Added by investigator, connected to ${newEntityForm.connectTo}.`
        }
      };

      const newEdge = {
        id: `edge_m_${Date.now()}`,
        source: newEntityForm.connectTo || nodes[0]?.id,
        target: newId,
        type: newEntityForm.relType,
        label: newEntityForm.relLabel,
        daysAgo: 1,
        details: 'Manually augmented evidence linkage'
      };

      setNodes(prev => [...prev, newNode]);
      setEdges(prev => [...prev, newEdge]);
      setSelectedNodeId(newId);
    } else {
      if (!linkExistingForm.sourceId || !linkExistingForm.targetId) return;
      const newEdge = {
        id: `edge_link_${Date.now()}`,
        source: linkExistingForm.sourceId,
        target: linkExistingForm.targetId,
        type: linkExistingForm.relType,
        label: linkExistingForm.relLabel,
        daysAgo: 1,
        details: 'Manually verified inter-entity connection'
      };
      setEdges(prev => [...prev, newEdge]);
      setSelectedEdgeId(newEdge.id);
    }
    setIsAddEntityOpen(false);
  };

  // ==========================================
  // GATEKEEPER VIEW: IF ENTITY RESOLUTION NOT RUN
  // ==========================================
  if (!hasResolvedEntities) {
    return (
      <div className={`flex h-full w-full ${theme.bg} ${theme.textPrimary} flex-col items-center justify-center p-6 select-none`}>
        <div className={`max-w-md w-full ${theme.cardBg} border ${theme.borderHighlight} rounded-2xl p-8 text-center shadow-2xl space-y-5`}>
          <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-700/60 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-900/40">
            <Network className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Entity Resolution Required
            </h2>
            <p className={`text-xs ${theme.textSecondary} mt-2 leading-relaxed`}>
              The Intelligence Graph synthesizes directly from the unified and deduplicated entities produced in the <strong>Entity Resolution</strong> step.
            </p>
          </div>

          <div className={`p-3.5 rounded-xl ${theme.inputBg} border ${theme.border} text-left text-xs space-y-2`}>
            <div className="flex items-center justify-between text-[11px]">
              <span className={theme.textMuted}>Target Case ID:</span>
              <span className="font-mono text-purple-400 font-bold">{caseId}</span>
            </div>
            <div className={`text-[11px] ${theme.textSecondary} leading-normal`}>
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
              className={`w-full py-2 px-4 ${theme.buttonBg} ${theme.buttonHover} border ${theme.border} ${theme.textSecondary} hover:${theme.textPrimary} text-xs font-semibold rounded-xl transition`}
            >
              Load Sample Consolidated Case (Chennai ATM Fraud)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN WORKSPACE INTERFACE
  // ==========================================
  return (
    <div
      className={`flex h-full w-full overflow-hidden font-sans select-none relative ${theme.bg} ${theme.textPrimary}`}
    >
      {/* ==========================================
          LEFT SIDEBAR: METRICS & CONTROLS
          ========================================== */}
      <aside
        className={`${
          isLeftSidebarOpen ? 'w-64' : 'w-0 overflow-hidden border-r-0'
        } shrink-0 flex flex-col border-r ${theme.border} ${theme.sidebarBg} z-20 transition-all duration-300`}
      >
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${theme.border}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 shadow-md shadow-purple-900/40">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">MuleGuard AI</div>
            <div className={`text-[11px] ${theme.textMuted} font-medium`}>Knowledge Graph Explorer</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar text-xs">
          {/* Data Source Indicator */}
          <div className={`${theme.cardBg} border ${theme.border} rounded-lg p-2.5 space-y-1`}>
            <span className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider block`}>
              Consolidated Case
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-purple-400">{caseId}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {isDemoMode ? 'DEMO CASE' : 'LIVE UPLOAD'}
              </span>
            </div>
            <p className={`text-[10px] ${theme.textSecondary}`}>
              {isDemoMode
                ? 'Sample ATM fraud investigation network.'
                : 'Derived directly from uploaded files & resolved entities.'}
            </p>
          </div>

          {/* Graph Overview Counts */}
          <div>
            <div className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider mb-2`}>
              Graph Overview
            </div>
            <div className="space-y-1.5">
              <div className={`flex items-center justify-between ${theme.cardBg} px-3 py-1.5 rounded-lg border ${theme.border}`}>
                <span className={`flex items-center gap-2 ${theme.textSecondary} text-[11px]`}>
                  <User className="w-3.5 h-3.5 text-purple-400" /> Visible Nodes
                </span>
                <span className="font-bold text-xs">{graphMetrics.totalNodes}</span>
              </div>
              <div className={`flex items-center justify-between ${theme.cardBg} px-3 py-1.5 rounded-lg border ${theme.border}`}>
                <span className={`flex items-center gap-2 ${theme.textSecondary} text-[11px]`}>
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Visible Links
                </span>
                <span className="font-bold text-xs">{graphMetrics.totalEdges}</span>
              </div>
              <div className={`flex items-center justify-between ${theme.cardBg} px-3 py-1.5 rounded-lg border ${theme.border}`}>
                <span className={`flex items-center gap-2 ${theme.textSecondary} text-[11px]`}>
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Entity Types
                </span>
                <span className="font-bold text-xs">
                  {Object.values(graphMetrics.counts).filter(c => c > 0).length}
                </span>
              </div>
            </div>
          </div>

          {/* Entity Type Toggles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider`}>
                Entity Types
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleAllEntityTypes(true)}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold"
                >
                  All
                </button>
                <span className="text-[10px] text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => handleToggleAllEntityTypes(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  None
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                const IconComp = cfg.icon;
                const isChecked = !!activeEntityFilters[type];
                const count = graphMetrics.counts[type] || 0;
                return (
                  <div
                    key={type}
                    onClick={(e) => handleToggleEntityType(type, e.altKey)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:${theme.buttonHover} cursor-pointer transition text-[11px] group ${
                      !isChecked ? 'opacity-40' : ''
                    }`}
                    title="Click to toggle, Alt+Click to isolate"
                  >
                    <div className="flex items-center gap-2">
                      <IconComp className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      <span className={`transition ${isChecked ? theme.textPrimary : theme.textMuted}`}>
                        {type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] ${theme.textMuted}`}>{count}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                          isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relationship Type Toggles */}
          <div>
            <div className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider mb-2`}>
              Relationship Types
            </div>
            <div className="space-y-1">
              {Object.entries(RELATIONSHIP_CONFIG).map(([rel, cfg]) => {
                const isChecked = !!activeRelFilters[rel];
                const count = graphMetrics.relCounts[rel] || 0;
                return (
                  <div
                    key={rel}
                    onClick={() => setActiveRelFilters(prev => ({ ...prev, [rel]: !prev[rel] }))}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:${theme.buttonHover} cursor-pointer transition text-[11px] group ${
                      !isChecked ? 'opacity-40' : ''
                    }`}
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
                      <span className={`transition ${isChecked ? theme.textPrimary : theme.textMuted}`}>
                        {rel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] ${theme.textMuted}`}>{count}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                          isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`p-3 border-t ${theme.border} space-y-2`}>
          <button
            onClick={handleResetFiltersAndLayout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border ${theme.border} ${theme.buttonBg} ${theme.buttonHover} text-xs font-semibold transition`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters & Fit View (R)</span>
          </button>
          
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 text-[11px] font-semibold transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Keyboard Shortcuts (?)</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          CENTER GRAPH CANVAS
          ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className={`h-14 shrink-0 flex items-center justify-between px-5 border-b ${theme.border} ${theme.headerBg} z-10`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/entities?caseId=${caseId}`)}
              className={`flex items-center gap-1.5 text-xs ${theme.textSecondary} hover:${theme.textPrimary} transition font-medium`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Entities</span>
            </button>

            <div className="h-4 w-px bg-slate-700/50" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide">{caseId}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-700/60">
                Active Syndicate
              </span>
            </div>

            <span className={`text-xs ${theme.textMuted} hidden lg:inline`}>
              Consolidated Intelligence Network
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Functional Date Range Selector */}
            <div className="relative flex items-center">
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className={`rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-1.5 text-xs ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
              >
                <option value="all">All Events (Full Timeline)</option>
                <option value="7days">Last 7 Days Only</option>
                <option value="30days">Last 30 Days Only</option>
              </select>
            </div>

            {/* Layout Mode Switcher */}
            <div className={`flex items-center ${theme.cardBg} border ${theme.border} rounded-lg p-0.5 text-xs`}>
              <button
                onClick={() => handleSwitchLayout('concentric')}
                title="Concentric Layout (Key: 1)"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  layoutMode === 'concentric' ? 'bg-purple-600 text-white' : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Concentric
              </button>
              <button
                onClick={() => handleSwitchLayout('orbit')}
                title="Radial Orbit Layout (Key: 2)"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  layoutMode === 'orbit' ? 'bg-purple-600 text-white' : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Radial Orbit
              </button>
              <button
                onClick={() => handleSwitchLayout('clustered')}
                title="Clustered Layout (Key: 3)"
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  layoutMode === 'clustered' ? 'bg-purple-600 text-white' : `${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Clustered
              </button>
            </div>

            {/* Add Evidence / Link */}
            {/* Add Evidence / Link */}
            <button
              onClick={() => setIsAddEntityOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${theme.border} ${theme.buttonBg} ${theme.buttonHover} text-xs font-semibold transition`}
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Evidence</span>
            </button>

            {/* Neo4j Live Sync Button */}
            <button
              onClick={handleSyncNeo4j}
              disabled={isSyncingNeo4j}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold shadow-sm transition disabled:opacity-60"
              title="Sync graph nodes and edges to Neo4j instance"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSyncingNeo4j ? "Syncing Neo4j..." : "Sync Neo4j"}</span>
            </button>

            {/* Export */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition">
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <div className={`absolute right-0 top-full mt-1 hidden group-hover:block w-52 rounded-lg ${theme.cardBg} border ${theme.border} shadow-xl p-1 z-30`}>
                <button
                  onClick={handleExportCypher}
                  className={`w-full text-left px-3 py-1.5 text-xs text-emerald-300 hover:${theme.buttonHover} hover:text-emerald-200 rounded flex items-center gap-2 font-medium`}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Export Cypher (.cypher)
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className={`w-full text-left px-3 py-1.5 text-xs ${theme.textSecondary} hover:${theme.buttonHover} hover:${theme.textPrimary} rounded flex items-center gap-2`}
                >
                  <FileText className="w-3 h-3 text-purple-400" /> Export Vector (SVG)
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className={`w-full text-left px-3 py-1.5 text-xs ${theme.textSecondary} hover:${theme.buttonHover} hover:${theme.textPrimary} rounded flex items-center gap-2`}
                >
                  <Share2 className="w-3 h-3 text-blue-400" /> Export JSON Network
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Neo4j Sync Status Notification */}
        {neo4jFeedback && (
          <div className="px-5 py-2 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200 z-10 animate-fade-in">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{neo4jFeedback.message}</span>
            </div>
            <button
              onClick={() => setNeo4jFeedback(null)}
              className="text-emerald-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-Header / Search & Quick Keys */}
        <div className={`h-12 shrink-0 flex items-center justify-between px-6 border-b ${theme.border} ${theme.headerBg}/90 backdrop-blur-sm z-10`}>
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>Neo4j Knowledge Graph</span>
              <span className={`text-[11px] font-normal ${theme.textMuted}`}>
                Interactive relationship mapping derived from consolidated records.
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Functional Search Entity Input */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search entity (Press '/' to focus)"
                className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} py-1.5 pl-8 pr-7 text-xs ${theme.textPrimary} placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
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

            {/* Viewport Quick Buttons */}
            <div className={`flex items-center gap-1 border-l ${theme.border} pl-3`}>
              {/* Left sidebar toggle */}
              <button
                onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                title={isLeftSidebarOpen ? 'Hide Left Panel' : 'Show Left Panel'}
                className={`p-1.5 rounded-lg transition ${
                  isLeftSidebarOpen ? 'text-purple-400 bg-purple-950/40' : `${theme.textMuted} hover:${theme.buttonHover}`
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Labels Toggle Key */}
              <button
                onClick={() => setShowLabels(!showLabels)}
                title={showLabels ? 'Hide Labels (H)' : 'Show Labels (H)'}
                className={`p-1.5 rounded-lg transition ${
                  showLabels ? 'text-purple-400 bg-purple-950/40' : `${theme.textMuted} hover:${theme.buttonHover}`
                }`}
              >
                {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* Center & Fit All Entities */}
              <button
                onClick={() => fitGraphToScreen(visibleNodes)}
                title="Fit All Entities to Screen (0 or R or F)"
                className="px-2.5 py-1 rounded-lg text-xs text-purple-400 bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900/60 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fit All (F)</span>
              </button>

              {/* Entity Details Open/Close Toggle Button */}
              <button
                onClick={handleToggleDetails}
                title={isDetailsOpen ? 'Close Entity Details' : 'Open Entity Details'}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
                  isDetailsOpen
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                    : 'bg-purple-950/40 border-purple-800/50 text-purple-300 hover:bg-purple-900/50'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Entity Details</span>
                {selectedNode && (
                  <span className="max-w-[90px] truncate text-[10px] px-1.5 py-0.5 bg-purple-900/80 rounded border border-purple-700 text-white">
                    {selectedNode.label}
                  </span>
                )}
              </button>

              {/* Quick Jump to Adaptive Anomaly Engine */}
              <button
                onClick={() => navigate(`/anomaly-engine?caseId=${caseId}`)}
                title="Open Adaptive Anomaly Engine (AIL)"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Anomaly Engine</span>
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="Toggle Theme (T)"
                className={`p-1.5 rounded-lg ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.buttonHover} transition`}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
              </button>

              <button
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }}
                title="Toggle Fullscreen"
                className={`p-1.5 rounded-lg ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.buttonHover} transition`}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            RESPONSIVE SVG CANVAS (DYNAMIC VIEWBOX, PAN & ZOOM)
            ========================================== */}
        <div
          ref={canvasContainerRef}
          id="graph-canvas-bg"
          tabIndex={0}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none outline-none"
          style={{
            backgroundColor: theme.canvasBg,
            backgroundImage: `radial-gradient(${theme.gridDot} 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            touchAction: 'none'
          }}
          onPointerDown={handlePointerDownCanvas}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          onDoubleClick={(e) => {
            e.preventDefault();
            applyZoom(e.shiftKey ? 0.75 : 1.35, e.clientX, e.clientY);
          }}
        >
          {/* Quick Helpful Navigation Hint Badge */}
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 ${theme.cardBg}/90 backdrop-blur-md border ${theme.borderHighlight} px-3.5 py-1 rounded-full text-[11px] ${theme.textSecondary} shadow-xl flex items-center gap-2 pointer-events-none z-10`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Click & Drag Canvas to Pan • Drag Any Entity to Move • Scroll to Zoom</span>
          </div>

          <svg
            ref={svgRef}
            id="knowledge-graph-svg"
            width="100%"
            height="100%"
            className="w-full h-full block select-none"
            style={{ pointerEvents: 'all' }}
            onPointerDown={handlePointerDownCanvas}
          >
            <defs>
              <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#EF4444" floodOpacity="0.8" />
              </filter>
              <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.7" />
              </filter>
              <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#F59E0B" floodOpacity="0.8" />
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

            {/* Click-capturing transparent backdrop inside SVG */}
            <rect
              width="100%"
              height="100%"
              fill="transparent"
              pointerEvents="all"
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDownCanvas}
            />

            {/* Master Transform Group for Pan & Zoom */}
            <g
              ref={viewportRef}
              id="viewport-group"
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
              style={{ transition: isPanning || draggingNodeId ? 'none' : 'transform 0.08s ease-out' }}
            >
              {/* EDGES LAYER */}
              <g id="edges-layer">
                {visibleEdges.map(edge => {
                  const src = nodeMap.get(edge.source);
                  const tgt = nodeMap.get(edge.target);
                  if (!src || !tgt) return null;

                  const relCfg = RELATIONSHIP_CONFIG[edge.type] || { color: '#94A3B8', dashArray: 'none' };
                  const isSelectedEdge = selectedEdgeId === edge.id;
                  const isNodeConnectedEdge =
                    selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

                  const midX = (src.x + tgt.x) / 2;
                  const midY = (src.y + tgt.y) / 2;
                  const markerId = `arrow-${edge.type.replace(/\s+/g, '-').toLowerCase()}`;

                  return (
                    <g
                      key={edge.id}
                      data-edge-id={edge.id}
                      opacity={isSelectedEdge || isNodeConnectedEdge ? 1 : 0.7}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEdgeId(edge.id);
                        setIsDetailsOpen(true);
                      }}
                    >
                      {/* Wider invisible stroke for easy clicking */}
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke="transparent"
                        strokeWidth={14}
                      />
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={isSelectedEdge ? '#FFFFFF' : isNodeConnectedEdge ? '#A855F7' : relCfg.color}
                        strokeWidth={isSelectedEdge ? 3.2 : isNodeConnectedEdge ? 2.4 : 1.5}
                        strokeDasharray={relCfg.dashArray}
                        markerEnd={`url(#${markerId})`}
                      />

                      {/* Edge Text Label Badge */}
                      {showLabels && edge.label && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={-(edge.label.length * 3.8 + 8)}
                            y="-9"
                            width={edge.label.length * 7.6 + 16}
                            height="18"
                            rx="4"
                            fill={isDarkMode ? '#080D21' : '#FFFFFF'}
                            stroke={isSelectedEdge ? '#FFFFFF' : relCfg.color}
                            strokeWidth={isSelectedEdge ? '1.5' : '0.8'}
                            opacity="0.95"
                          />
                          <text
                            x="0"
                            y="3.5"
                            textAnchor="middle"
                            fontSize="8.5"
                            fontWeight="bold"
                            letterSpacing="0.5"
                            fill={isSelectedEdge ? (isDarkMode ? '#FFFFFF' : '#0F172A') : relCfg.color}
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
                  const isSearchMatched = matchingNodeIds.has(node.id);
                  const isDimmed = matchingNodeIds.size > 0 && !isSearchMatched;
                  const IconComponent = typeCfg.icon;
                  const nodeRadius = isCulprit ? 27 : 22;

                  return (
                    <g
                      key={node.id}
                      data-node-id={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className={`transition-opacity ${draggingNodeId === node.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{ touchAction: 'none' }}
                      opacity={isDimmed ? 0.25 : 1}
                      onPointerDown={e => handleStartNodeDrag(e, node.id, node.x, node.y)}
                      onPointerUp={handleNodePointerUp}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        setSelectedEdgeId(null);
                        setIsDetailsOpen(true);
                      }}
                    >
                      {/* Pulsing Aura for Primary Suspect / Search Match */}
                      {(isCulprit || isSearchMatched) && (
                        <circle
                          r={nodeRadius + 14}
                          fill="none"
                          stroke={isCulprit ? '#EF4444' : '#F59E0B'}
                          strokeWidth="2"
                          opacity="0.5"
                          className="animate-ping"
                        />
                      )}

                      {/* Outer Glow Halo Ring */}
                      <circle
                        r={nodeRadius + 4}
                        fill="none"
                        stroke={isCulprit ? '#EF4444' : isSearchMatched ? '#F59E0B' : isSelected ? theme.selectedRing : typeCfg.color}
                        strokeWidth={isSelected || isSearchMatched ? 3 : 1.5}
                        filter={
                          isCulprit
                            ? 'url(#glow-red)'
                            : isSearchMatched
                            ? 'url(#glow-gold)'
                            : isSelected
                            ? 'url(#glow-purple)'
                            : undefined
                        }
                      />

                      {/* Central Node Body Circle */}
                      <circle
                        r={nodeRadius}
                        fill={isCulprit ? 'url(#grad-red)' : isSelected ? (isDarkMode ? '#1E1B4B' : '#EDE9FE') : theme.nodeBg}
                        stroke={isCulprit ? '#DC2626' : isSearchMatched ? '#F59E0B' : typeCfg.color}
                        strokeWidth="2.2"
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
                          <rect
                            x={-(node.label.length * 3.6 + 10)}
                            y="-9"
                            width={node.label.length * 7.2 + 20}
                            height="18"
                            rx="4"
                            fill={isDarkMode ? '#080D21' : '#FFFFFF'}
                            stroke={isSelected ? (isDarkMode ? '#FFFFFF' : '#8B5CF6') : typeCfg.color}
                            strokeWidth={isSelected ? '1.2' : '0.7'}
                            opacity="0.95"
                          />
                          <text
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill={isDarkMode ? '#FFFFFF' : '#0F172A'}
                            y="3"
                          >
                            {node.label}
                          </text>

                          {node.subLabel && (
                            <text
                              y="18"
                              textAnchor="middle"
                              fontSize="8.5"
                              fontWeight={node.role === 'suspect' ? 'bold' : 'normal'}
                              fill={
                                node.role === 'suspect'
                                  ? '#EF4444'
                                  : node.role === 'associate'
                                  ? '#A855F7'
                                  : isDarkMode ? '#94A3B8' : '#64748B'
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
            </g>
          </svg>

          {/* Floating Canvas Controls (Bottom-Left) - Rich Zoom Hub */}
          <div className={`absolute bottom-6 left-6 flex items-center gap-2 ${theme.cardBg}/95 backdrop-blur-md px-3 py-2 rounded-2xl border ${theme.borderHighlight} shadow-2xl z-20`}>
            {/* Zoom Out Button */}
            <button
              onClick={() => applyZoom(0.8)}
              title="Zoom Out (- or Scroll Down)"
              className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.buttonHover} rounded-xl transition active:scale-95`}
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Interactive Zoom Slider */}
            <div className="flex items-center gap-2 px-1">
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={handleZoomSliderChange}
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                title={`Zoom Level: ${Math.round(zoom * 100)}%`}
              />
              {/* Zoom Percentage Reset Pill */}
              <button
                onClick={() => {
                  if (!canvasContainerRef.current) return;
                  const rect = canvasContainerRef.current.getBoundingClientRect();
                  applyZoom(1.0 / zoom, rect.width / 2, rect.height / 2);
                }}
                title="Click to Reset Zoom to 100%"
                className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:bg-purple-900 transition"
              >
                {Math.round(zoom * 100)}%
              </button>
            </div>

            {/* Zoom In Button */}
            <button
              onClick={() => applyZoom(1.25)}
              title="Zoom In (+ or Scroll Up)"
              className={`p-2 ${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.buttonHover} rounded-xl transition active:scale-95`}
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className={`h-6 w-px ${theme.border}`} />

            {/* Quick Zoom Presets */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => fitGraphToScreen(visibleNodes)}
                title="Fit All Entities to Screen (F or 0)"
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${theme.border} ${theme.buttonBg} ${theme.buttonHover} text-slate-200 transition flex items-center gap-1`}
              >
                <RotateCcw className="w-3 h-3 text-purple-400" />
                <span>Fit</span>
              </button>

              <button
                onClick={() => {
                  if (!canvasContainerRef.current) return;
                  const rect = canvasContainerRef.current.getBoundingClientRect();
                  applyZoom(0.5 / zoom, rect.width / 2, rect.height / 2);
                }}
                title="Zoom 50%"
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${theme.buttonBg} hover:${theme.buttonHover} ${theme.textSecondary} transition`}
              >
                50%
              </button>

              <button
                onClick={() => {
                  if (!canvasContainerRef.current) return;
                  const rect = canvasContainerRef.current.getBoundingClientRect();
                  applyZoom(1.5 / zoom, rect.width / 2, rect.height / 2);
                }}
                title="Zoom 150%"
                className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${theme.buttonBg} hover:${theme.buttonHover} ${theme.textSecondary} transition`}
              >
                150%
              </button>
            </div>

            <div className={`h-6 w-px ${theme.border}`} />

            {/* Directional Canvas Pan Controls */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => moveCanvas(80, 0)}
                title="Pan Left (A or Left Arrow)"
                className={`p-1.5 rounded-lg ${theme.buttonBg} hover:${theme.buttonHover} ${theme.textSecondary} hover:${theme.textPrimary} transition`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveCanvas(0, 80)}
                title="Pan Up (W or Up Arrow)"
                className={`p-1.5 rounded-lg ${theme.buttonBg} hover:${theme.buttonHover} ${theme.textSecondary} hover:${theme.textPrimary} transition`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveCanvas(0, -80)}
                title="Pan Down (S or Down Arrow)"
                className={`p-1.5 rounded-lg ${theme.buttonBg} hover:${theme.buttonHover} ${theme.textSecondary} hover:${theme.textPrimary} transition`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveCanvas(-80, 0)}
                title="Pan Right (D or Right Arrow)"
                className={`p-1.5 rounded-lg ${theme.buttonBg} hover:${theme.buttonHover} ${theme.textSecondary} hover:${theme.textPrimary} transition`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className={`h-6 w-px ${theme.border}`} />

            {/* Pan Lock Toggle */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              title={isLocked ? 'Unlock Canvas Panning (L)' : 'Lock Canvas Panning (L)'}
              className={`p-2 rounded-xl transition ${
                isLocked ? 'text-amber-400 bg-amber-950/50 border border-amber-800/60' : `${theme.textSecondary} hover:${theme.textPrimary} hover:${theme.buttonHover}`
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Center Interactive Legend Keys */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 ${theme.cardBg}/90 backdrop-blur-md px-4 py-2 rounded-full border ${theme.border} shadow-xl flex items-center gap-3 text-[11px] z-10 hidden md:flex`}>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const isActive = !!activeEntityFilters[type];
              const count = graphMetrics.counts[type] || 0;
              return (
                <button
                  key={type}
                  onClick={(e) => handleToggleEntityType(type, e.altKey)}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full transition ${
                    isActive
                      ? `${theme.textPrimary} bg-purple-500/10 hover:bg-purple-500/20`
                      : 'opacity-40 hover:opacity-75 text-slate-500'
                  }`}
                  title={`${type} (${count}) - Click to toggle, Alt+Click to isolate`}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="font-medium">{type}</span>
                  <span className="text-[9px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Live Mini-Map */}
          <div className={`absolute bottom-6 right-6 w-36 h-28 ${theme.cardBg}/90 backdrop-blur-md rounded-xl border ${theme.border} shadow-2xl p-2 hidden lg:flex flex-col z-10`}>
            <div className={`flex justify-between items-center text-[9px] ${theme.textMuted} font-semibold mb-1`}>
              <span>MINI MAP</span>
              <span className="font-mono">{Math.round(zoom * 100)}%</span>
            </div>
            <div className={`flex-1 relative ${isDarkMode ? 'bg-[#060A1A]' : 'bg-slate-200'} rounded border ${theme.border} overflow-hidden`}>
              <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="w-full h-full opacity-60">
                {visibleEdges.map(e => {
                  const s = nodeMap.get(e.source);
                  const t = nodeMap.get(e.target);
                  if (!s || !t) return null;
                  return <line key={e.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#475569" strokeWidth="2" />;
                })}
                {visibleNodes.map(n => (
                  <circle
                    key={n.id}
                    cx={n.x}
                    cy={n.y}
                    r={n.role === 'suspect' ? 14 : 9}
                    fill={n.role === 'suspect' ? '#EF4444' : TYPE_CONFIG[n.type]?.color || '#8B5CF6'}
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Toggle Drawer Tab on Right Edge */}
      <button
        onClick={handleToggleDetails}
        title={isDetailsOpen ? "Close Entity Details Panel" : "Open Entity Details Panel"}
        className={`fixed md:absolute right-0 top-1/2 -translate-y-1/2 z-40 px-2 py-3.5 rounded-l-xl ${theme.cardBg}/95 backdrop-blur-md border-l border-t border-b ${theme.borderHighlight} ${theme.textPrimary} shadow-2xl hover:bg-purple-900/40 flex flex-col items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase transition cursor-pointer`}
      >
        {isDetailsOpen ? <ChevronRight className="w-4 h-4 text-purple-400" /> : <ChevronLeft className="w-4 h-4 text-purple-400" />}
        <span style={{ writingMode: 'vertical-rl' }} className="rotate-180 text-[10px] text-purple-300">
          {isDetailsOpen ? 'HIDE' : 'DETAILS'}
        </span>
      </button>

      {/* ==========================================
          RIGHT DRAWER: ENTITY / EDGE DETAILS & DOSSIER
          Slides in/out cleanly without resizing the canvas or pushing the graph!
          ========================================== */}
      <aside
        className={`fixed md:absolute right-0 top-0 bottom-0 w-80 md:w-96 flex flex-col border-l ${theme.border} ${theme.sidebarBg} shadow-2xl z-50 transition-all duration-300 ease-in-out ${
          isDetailsOpen
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className={`flex items-center justify-between px-4 py-3.5 border-b ${theme.border}`}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" />
            <span className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>
              {selectedEdge ? 'Relationship Details' : 'Entity Details'}
            </span>
          </div>
          <button
            onClick={() => setIsDetailsOpen(false)}
            title="Close Details Panel"
            className={`${theme.textSecondary} hover:${theme.textPrimary} hover:bg-white/10 p-1 rounded-lg transition`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
          {/* If an Edge is selected */}
          {selectedEdge ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                  Relationship Link
                </span>
                <h3 className="text-base font-bold">{selectedEdge.label || selectedEdge.type}</h3>
                <p className={`text-xs ${theme.textSecondary}`}>
                  Type: <strong className="text-purple-400">{selectedEdge.type}</strong>
                </p>
              </div>

              <div className={`${theme.cardBg} rounded-lg border ${theme.border} divide-y ${theme.panelDivide}`}>
                <div className="p-3">
                  <span className={`text-[10px] uppercase font-bold ${theme.textMuted} block mb-1`}>Source Node</span>
                  <div className="font-semibold">{nodeMap.get(selectedEdge.source)?.label || selectedEdge.source}</div>
                  <div className={`text-[10px] ${theme.textSecondary}`}>{nodeMap.get(selectedEdge.source)?.type}</div>
                </div>
                <div className="p-3">
                  <span className={`text-[10px] uppercase font-bold ${theme.textMuted} block mb-1`}>Target Node</span>
                  <div className="font-semibold">{nodeMap.get(selectedEdge.target)?.label || selectedEdge.target}</div>
                  <div className={`text-[10px] ${theme.textSecondary}`}>{nodeMap.get(selectedEdge.target)?.type}</div>
                </div>
                {selectedEdge.details && (
                  <div className="p-3">
                    <span className={`text-[10px] uppercase font-bold ${theme.textMuted} block mb-1`}>Evidence Log</span>
                    <p className={`leading-relaxed ${theme.textSecondary}`}>{selectedEdge.details}</p>
                  </div>
                )}
                <div className="p-3 flex justify-between">
                  <span className={theme.textMuted}>Activity Recency</span>
                  <span className="font-semibold text-purple-400">{selectedEdge.daysAgo || 1} day(s) ago</span>
                </div>
              </div>
            </div>
          ) : selectedNode ? (
            <>
              {/* Profile Header */}
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
                    <h3 className="text-base font-bold truncate">{selectedNode.label}</h3>
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
                  <div className={`text-[11px] ${theme.textSecondary} font-medium`}>
                    {selectedNode.type} {selectedNode.subLabel}
                  </div>
                </div>
              </div>

              {/* Attributes Key-Value */}
              <div className={`${theme.cardBg} rounded-lg border ${theme.border} divide-y ${theme.panelDivide}`}>
                <div className="flex justify-between px-3 py-2 text-[11px]">
                  <span className={theme.textMuted}>Canonical ID</span>
                  <span className="font-mono font-semibold">{selectedNode.details?.entityId}</span>
                </div>
                <div className="flex justify-between px-3 py-2 text-[11px]">
                  <span className={theme.textMuted}>Risk Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
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
                    <span className={`${theme.textMuted} block font-medium`}>Remarks</span>
                    <p className={`leading-relaxed ${theme.textSecondary}`}>{selectedNode.details.remarks}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Linked Relationships Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider`}>
                    Linked Relationships ({selectedNodeRelationships.length})
                  </span>
                </div>
                <div className="space-y-1.5">
                  {selectedNodeRelationships.length > 0 ? (
                    selectedNodeRelationships.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedEdgeId(item.edge.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg ${theme.cardBg} border ${theme.border} hover:${theme.buttonHover} cursor-pointer text-[11px] transition`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-purple-400 font-bold font-mono">
                            {item.edge.label || item.edge.type}
                          </span>
                          <span className="font-semibold truncate">
                            {item.connectedNode.label}
                          </span>
                        </div>
                        <span className={`text-[10px] ${theme.textMuted} capitalize`}>{item.direction}</span>
                      </div>
                    ))
                  ) : (
                    <div className={`p-3 ${theme.cardBg} rounded-lg border ${theme.border} ${theme.textMuted} text-center`}>
                      No connected links found for this entity.
                    </div>
                  )}
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

              {/* AI Intelligence Insight */}
              <div className="bg-purple-950/20 border border-purple-800/50 rounded-xl p-3.5 space-y-2 shadow-lg shadow-purple-950/20">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>INTELLIGENCE INSIGHT</span>
                </div>
                <p className={`text-[11px] ${theme.textSecondary} leading-relaxed`}>
                  {selectedNode.details?.quickInsight ||
                    `${selectedNode.label} exhibits strong centrality in this investigation. High degree of correlation with criminal infrastructure.`}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-500 text-purple-400 flex items-center justify-center mx-auto shadow-lg">
                <User className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold">No Entity Selected</div>
              <p className={`text-xs ${theme.textSecondary}`}>
                Select an entity node on the graph to inspect its full dossier, risk score, and relationships.
              </p>
              {nodes.length > 0 && (
                <button
                  onClick={() => {
                    const primary = nodes.find(n => n.role === 'suspect') || nodes[0];
                    if (primary) setSelectedNodeId(primary.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition"
                >
                  Select Primary Suspect ({nodes.find(n => n.role === 'suspect')?.label || nodes[0]?.label})
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ==========================================
          MODAL: KEYBOARD SHORTCUTS REFERENCE (?)
          ========================================== */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} border ${theme.borderHighlight} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.border}`}>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold">Knowledge Graph Hotkeys</h3>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className={`${theme.textMuted} hover:${theme.textPrimary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs divide-y divide-slate-700/40">
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Zoom In / Out</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  + / -
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Fit / Center All Nodes</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  0, R, or F
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Pan Canvas</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  W A S D / Arrow Keys
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Toggle Concentric / Orbit / Cluster</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  1, 2, or 3
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Search Entity Focus</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  /
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Toggle Labels</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  H
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Lock / Unlock Canvas Drag</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  L
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Toggle Theme (Dark / Light)</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  T
                </span>
              </div>
              <div className="flex justify-between py-1.5 items-center">
                <span className={theme.textSecondary}>Deselect / Close Modals</span>
                <span className="font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-bold">
                  Escape
                </span>
              </div>
            </div>

            <div className={`p-4 border-t ${theme.border} flex justify-end`}>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD EVIDENCE / LINK
          ========================================== */}
      {isAddEntityOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className={`${theme.cardBg} border ${theme.borderHighlight} rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col`}
          >
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold">Add Evidence / Link</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEntityOpen(false)}
                className={`${theme.textMuted} hover:${theme.textPrimary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${theme.border} text-xs`}>
              <button
                type="button"
                onClick={() => setAddMode('new_entity')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition ${
                  addMode === 'new_entity'
                    ? 'border-purple-500 text-purple-400 bg-purple-950/30'
                    : `border-transparent ${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Add New Entity & Link
              </button>
              <button
                type="button"
                onClick={() => setAddMode('link_existing')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 transition ${
                  addMode === 'link_existing'
                    ? 'border-purple-500 text-purple-400 bg-purple-950/30'
                    : `border-transparent ${theme.textSecondary} hover:${theme.textPrimary}`
                }`}
              >
                Link Two Existing Entities
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              {addMode === 'new_entity' ? (
                <>
                  <div>
                    <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>
                      Entity Identifier / Value
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 99887 76655 or Axis Bank XXXX"
                      value={newEntityForm.label}
                      onChange={e => setNewEntityForm(prev => ({ ...prev, label: e.target.value }))}
                      className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Type</label>
                      <select
                        value={newEntityForm.type}
                        onChange={e => setNewEntityForm(prev => ({ ...prev, type: e.target.value }))}
                        className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                      >
                        {Object.keys(TYPE_CONFIG).map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Role</label>
                      <select
                        value={newEntityForm.role}
                        onChange={e => setNewEntityForm(prev => ({ ...prev, role: e.target.value }))}
                        className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                      >
                        <option value="suspect">Suspect</option>
                        <option value="associate">Associate / Mule</option>
                        <option value="normal">Witness / Regular</option>
                      </select>
                    </div>
                  </div>

                  <div className={`pt-2 border-t ${theme.border}`}>
                    <span className={`text-[10px] font-bold ${theme.textMuted} uppercase tracking-wider block mb-2`}>
                      Connect to Existing Entity
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Connect To</label>
                        <select
                          value={newEntityForm.connectTo}
                          onChange={e => setNewEntityForm(prev => ({ ...prev, connectTo: e.target.value }))}
                          className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                        >
                          <option value="">Select node...</option>
                          {nodes.map(n => (
                            <option key={n.id} value={n.id}>
                              {n.label} ({n.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Relationship</label>
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
                          className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
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
                </>
              ) : (
                <>
                  <div>
                    <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Source Entity</label>
                    <select
                      value={linkExistingForm.sourceId}
                      onChange={e => setLinkExistingForm(prev => ({ ...prev, sourceId: e.target.value }))}
                      className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                    >
                      <option value="">Select source...</option>
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.label} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Target Entity</label>
                    <select
                      value={linkExistingForm.targetId}
                      onChange={e => setLinkExistingForm(prev => ({ ...prev, targetId: e.target.value }))}
                      className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                    >
                      <option value="">Select target...</option>
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.label} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Relationship</label>
                      <select
                        value={linkExistingForm.relType}
                        onChange={e => {
                          const val = e.target.value;
                          let lbl = 'TRANSACTIONS';
                          if (val.includes('Call')) lbl = 'CALLS';
                          else if (val.includes('Owns')) lbl = 'OWNS';
                          else if (val.includes('Located')) lbl = 'LOCATED AT';
                          else if (val.includes('Associated')) lbl = 'ASSOCIATED WITH';
                          setLinkExistingForm(prev => ({ ...prev, relType: val, relLabel: lbl }));
                        }}
                        className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                      >
                        {Object.keys(RELATIONSHIP_CONFIG).map(r => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`text-[11px] font-bold ${theme.textMuted} block mb-1`}>Label / Details</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹50,000 or 12 calls"
                        value={linkExistingForm.relLabel}
                        onChange={e => setLinkExistingForm(prev => ({ ...prev, relLabel: e.target.value }))}
                        className={`w-full rounded-lg border ${theme.border} ${theme.inputBg} px-3 py-2 ${theme.textPrimary} focus:border-purple-500 focus:outline-none`}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEntityOpen(false)}
                  className={`px-4 py-2 border ${theme.border} ${theme.buttonHover} ${theme.textSecondary} rounded-lg text-xs font-semibold`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Save to Network
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL: ALL RELATIONSHIPS TABLE
          ========================================== */}
      {showAllRelModal && selectedNode && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} border ${theme.borderHighlight} rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.border}`}>
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold">
                  All Relationships for {selectedNode.label}
                </h3>
              </div>
              <button
                onClick={() => setShowAllRelModal(false)}
                className={`${theme.textMuted} hover:${theme.textPrimary}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${theme.border} ${theme.textMuted}`}>
                    <th className="pb-2.5 font-semibold">Direction</th>
                    <th className="pb-2.5 font-semibold">Relationship</th>
                    <th className="pb-2.5 font-semibold">Connected Entity</th>
                    <th className="pb-2.5 font-semibold">Type</th>
                    <th className="pb-2.5 font-semibold">Risk Level</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.panelDivide}`}>
                  {selectedNodeRelationships.map((item, idx) => (
                    <tr key={idx} className={`hover:${theme.buttonHover} transition`}>
                      <td className={`py-2.5 ${theme.textMuted} capitalize`}>{item.direction}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/40 text-purple-400 border border-purple-800/40">
                          {item.edge.label || item.edge.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-semibold">{item.connectedNode.label}</td>
                      <td className={`py-2.5 ${theme.textSecondary}`}>{item.connectedNode.type}</td>
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

            <div className={`p-4 border-t ${theme.border} flex justify-end`}>
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
