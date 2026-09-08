import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
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
  Eye,
  EyeOff,
  AlertTriangle,
  GitBranch,
  Layers,
  PhoneCall,
  ArrowRightLeft,
  Compass,
  FileText,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  Network
} from 'lucide-react';

// ==========================================
// PRESET 1: SCREENSHOT REPLICA (Chennai ATM Fraud Case)
// ==========================================
const CHENNAI_NODES = [
  {
    id: 'ramesh',
    label: 'Ramesh',
    subLabel: '(Suspect)',
    type: 'Person',
    role: 'suspect',
    riskScore: 92,
    riskLevel: 'High Risk',
    x: 500,
    y: 360,
    details: {
      entityId: 'PER-1001',
      age: 32,
      gender: 'Male',
      phone: '+91 98765 45210',
      email: 'ramesh23@mail.com',
      remarks: 'Main suspect in ATM fraud activity across Chennai.',
      linkedCounts: {
        'Phone Numbers': 3,
        'Bank Accounts': 2,
        'Email Addresses': 1,
        'Devices': 1,
        'Locations': 3,
        'IP Addresses': 1,
        'Other Persons': 2
      },
      quickInsight: 'Ramesh is centrally connected to multiple accounts, devices, and locations. High transaction activity and frequent communication observed.'
    }
  },
  {
    id: 'suresh',
    label: 'Suresh',
    subLabel: '(Associate)',
    type: 'Person',
    role: 'associate',
    riskScore: 78,
    riskLevel: 'High Risk',
    x: 320,
    y: 530,
    details: {
      entityId: 'PER-1002',
      age: 29,
      gender: 'Male',
      phone: '+91 98765 43210',
      email: 'suresh.k@fastmail.com',
      remarks: 'Primary money mule handler and ATM cash collector.',
      linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 1, 'Email Addresses': 0, 'Devices': 0, 'Locations': 1, 'IP Addresses': 0, 'Other Persons': 2 },
      quickInsight: 'Suresh operates collection accounts and communicates with Ramesh immediately prior to high-volume ATM withdrawals.'
    }
  },
  {
    id: 'arun',
    label: 'Arun',
    subLabel: '(Associate)',
    type: 'Person',
    role: 'associate',
    riskScore: 74,
    riskLevel: 'Medium Risk',
    x: 680,
    y: 530,
    details: {
      entityId: 'PER-1003',
      age: 26,
      gender: 'Male',
      phone: '+91 91234 56780',
      email: 'arun.tech@gmail.com',
      remarks: 'SIM card supplier and digital banking access point.',
      linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 1, 'Email Addresses': 0, 'Devices': 0, 'Locations': 1, 'IP Addresses': 0, 'Other Persons': 2 },
      quickInsight: 'Arun facilitated OTP bypass and coordinated secondary cash withdrawals from HDFC mule accounts.'
    }
  },
  {
    id: 'phone1',
    label: '+91 98765 43210',
    subLabel: '',
    type: 'Phone Number',
    role: 'normal',
    riskScore: 85,
    riskLevel: 'High Risk',
    x: 320,
    y: 210,
    details: {
      entityId: 'PH-401',
      carrier: 'Airtel India',
      circle: 'Tamil Nadu & Chennai',
      status: 'Burner SIM (Fake KYC)',
      callsCount: 142,
      remarks: 'Direct command channel between Ramesh and Suresh.'
    }
  },
  {
    id: 'phone2',
    label: '+91 91234 56780',
    subLabel: '',
    type: 'Phone Number',
    role: 'normal',
    riskScore: 80,
    riskLevel: 'High Risk',
    x: 770,
    y: 220,
    details: {
      entityId: 'PH-402',
      carrier: 'Jio 5G',
      circle: 'Chennai Metropolitan',
      status: 'Active',
      callsCount: 89,
      remarks: 'Used during ATM cash layering operations.'
    }
  },
  {
    id: 'email1',
    label: 'ramesh23@mail.com',
    subLabel: '',
    type: 'Email',
    role: 'normal',
    riskScore: 68,
    riskLevel: 'Medium Risk',
    x: 480,
    y: 160,
    details: {
      entityId: 'EM-109',
      domain: 'mail.com',
      creationDate: '14 Feb 2024',
      remarks: 'Linked to fake net-banking credential registration.'
    }
  },
  {
    id: 'device1',
    label: 'OnePlus 9',
    subLabel: 'IMEI: 8654 23XX 1123XX',
    type: 'Device',
    role: 'normal',
    riskScore: 88,
    riskLevel: 'High Risk',
    x: 600,
    y: 190,
    details: {
      entityId: 'DEV-889',
      model: 'OnePlus 9 5G (LE2111)',
      imei: '8654 2390 1123 481',
      simSlots: 'Dual SIM',
      remarks: 'Both suspect numbers were alternately active on this single device.'
    }
  },
  {
    id: 'bank_axis',
    label: 'XXXX 4578',
    subLabel: 'Axis Bank',
    type: 'Bank Account',
    role: 'normal',
    riskScore: 89,
    riskLevel: 'High Risk',
    x: 270,
    y: 360,
    details: {
      entityId: 'ACC-331',
      bankName: 'Axis Bank',
      branch: 'T. Nagar Branch, Chennai',
      accountHolder: 'Ramesh (Proxy/Mule)',
      turnover: '₹42,50,000',
      remarks: 'Aggregated fraud funds before dispatch to ATM cashouts.'
    }
  },
  {
    id: 'bank_hdfc',
    label: 'XXXX 9921',
    subLabel: 'HDFC Bank',
    type: 'Bank Account',
    role: 'normal',
    riskScore: 84,
    riskLevel: 'High Risk',
    x: 740,
    y: 370,
    details: {
      entityId: 'ACC-332',
      bankName: 'HDFC Bank',
      branch: 'Anna Nagar West, Chennai',
      accountHolder: 'Mule Shell Enterprise',
      turnover: '₹28,10,000',
      remarks: 'Secondary layer account used for quick UPI disbursements.'
    }
  },
  {
    id: 'atm_tnagar',
    label: 'T. Nagar ATM',
    subLabel: 'Chennai',
    type: 'Location',
    role: 'normal',
    riskScore: 95,
    riskLevel: 'High Risk',
    x: 480,
    y: 570,
    details: {
      entityId: 'LOC-701',
      locationType: 'Automated Teller Machine',
      atmId: 'ATM-TN-404',
      coordinates: '13.0418° N, 80.2341° E',
      cctvMatches: '3 confirmed camera hits',
      remarks: 'Epicenter of physical ATM fraud cash extraction.'
    }
  },
  {
    id: 'loc_adyar',
    label: 'Adyar',
    subLabel: 'Chennai',
    type: 'Location',
    role: 'normal',
    riskScore: 60,
    riskLevel: 'Medium Risk',
    x: 320,
    y: 690,
    details: {
      entityId: 'LOC-702',
      locationType: 'Cell Tower Sector',
      towerId: 'CHN-ADY-09',
      remarks: 'First hop location during cash runner transit.'
    }
  },
  {
    id: 'ip1',
    label: '103.21.45.67',
    subLabel: 'IP Address',
    type: 'IP Address',
    role: 'normal',
    riskScore: 77,
    riskLevel: 'Medium Risk',
    x: 480,
    y: 700,
    details: {
      entityId: 'IP-502',
      isp: 'ACT Fibernet Chennai',
      proxyVpn: 'Identified SOCKS5 Tunnel',
      loginsCount: 312,
      remarks: 'Used to initiate bulk IMPS transfers at 02:00-04:00 AM.'
    }
  },
  {
    id: 'loc_annanagar',
    label: 'Anna Nagar',
    subLabel: 'Chennai',
    type: 'Location',
    role: 'normal',
    riskScore: 65,
    riskLevel: 'Medium Risk',
    x: 640,
    y: 690,
    details: {
      entityId: 'LOC-703',
      locationType: 'Cell Tower Sector',
      towerId: 'CHN-ANN-02',
      remarks: 'Safehouse staging area identified from CDR triangulation.'
    }
  }
];

const CHENNAI_EDGES = [
  // Center Suspect Ramesh Outgoing/Incoming
  { id: 'e1', source: 'ramesh', target: 'phone1', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'e2', source: 'ramesh', target: 'email1', type: 'Associated With', label: 'ASSOCIATED WITH', style: 'dashed' },
  { id: 'e3', source: 'ramesh', target: 'device1', type: 'Owns / Uses', label: 'USES' },
  { id: 'e4', source: 'ramesh', target: 'phone2', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'e5', source: 'ramesh', target: 'bank_axis', type: 'Owns / Uses', label: 'OWNS' },
  { id: 'e6', source: 'ramesh', target: 'bank_hdfc', type: 'Owns / Uses', label: 'OWNS' },
  { id: 'e7', source: 'ramesh', target: 'atm_tnagar', type: 'Located At', label: 'LOCATED AT' },

  // Suresh Collusion
  { id: 'e8', source: 'bank_axis', target: 'suresh', type: 'Transactions', label: 'TRANSACTIONS' },
  { id: 'e9', source: 'suresh', target: 'phone1', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'e10', source: 'suresh', target: 'ramesh', type: 'Associated With', label: 'ASSOCIATED WITH', style: 'dashed' },
  { id: 'e11', source: 'suresh', target: 'atm_tnagar', type: 'Located At', label: 'LOCATED AT' },

  // Arun Collusion
  { id: 'e12', source: 'bank_hdfc', target: 'arun', type: 'Transactions', label: 'TRANSACTIONS' },
  { id: 'e13', source: 'arun', target: 'phone2', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'e14', source: 'arun', target: 'ramesh', type: 'Associated With', label: 'ASSOCIATED WITH', style: 'dashed' },
  { id: 'e15', source: 'arun', target: 'atm_tnagar', type: 'Located At', label: 'LOCATED AT' },

  // Location and IP Infrastructure
  { id: 'e16', source: 'atm_tnagar', target: 'loc_adyar', type: 'Follows / Connected', label: 'CONNECTED' },
  { id: 'e17', source: 'atm_tnagar', target: 'ip1', type: 'Follows / Connected', label: 'CONNECTED' },
  { id: 'e18', source: 'atm_tnagar', target: 'loc_annanagar', type: 'Follows / Connected', label: 'CONNECTED' }
];

// ==========================================
// PRESET 2: PERSON A, B, C MULTI-PERSON SYNDICATE
// ==========================================
const PERSON_ABC_NODES = [
  {
    id: 'person_a',
    label: 'Person A',
    subLabel: '(Kingpin / Mastermind)',
    type: 'Person',
    role: 'suspect',
    riskScore: 96,
    riskLevel: 'High Risk',
    x: 500,
    y: 340,
    details: {
      entityId: 'PER-A01',
      age: 38,
      gender: 'Male',
      phone: '+91 99880 11223',
      email: 'a.organizer@crypto-vault.io',
      remarks: 'Primary orchestrator of layering pipeline. Transferred ₹12,50,000 to Person B and coordinated Person C.',
      linkedCounts: { 'Phone Numbers': 2, 'Bank Accounts': 2, 'Email Addresses': 1, 'Devices': 2, 'Locations': 2, 'IP Addresses': 1, 'Other Persons': 2 },
      quickInsight: 'Person A acts as the nexus hub. High inbound criminal proceeds converted into mule transactions to B and coordinated via encrypted calls to C.'
    }
  },
  {
    id: 'person_b',
    label: 'Person B',
    subLabel: '(Mule Account Holder)',
    type: 'Person',
    role: 'associate',
    riskScore: 82,
    riskLevel: 'High Risk',
    x: 320,
    y: 500,
    details: {
      entityId: 'PER-B02',
      age: 27,
      gender: 'Male',
      phone: '+91 98450 77889',
      email: 'b.student@mule.net',
      remarks: 'Opened bank accounts used for layering transactions from Person A, linked with Person C via shared bank branch and phone calls.',
      linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 2, 'Email Addresses': 0, 'Devices': 1, 'Locations': 1, 'IP Addresses': 1, 'Other Persons': 2 },
      quickInsight: 'Person B received 14 transactions from Person A totaling ₹8,40,000, immediately disbursing 90% to Person C.'
    }
  },
  {
    id: 'person_c',
    label: 'Person C',
    subLabel: '(Cashout Agent / SIM Runner)',
    type: 'Person',
    role: 'associate',
    riskScore: 79,
    riskLevel: 'High Risk',
    x: 680,
    y: 500,
    details: {
      entityId: 'PER-C03',
      age: 24,
      gender: 'Male',
      phone: '+91 91234 44556',
      email: 'c.runner@protonmail.com',
      remarks: 'Connected to Person A via CDR calls and shared ATM visits, and to Person B via direct transactions and shared bank.',
      linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 1, 'Email Addresses': 1, 'Devices': 1, 'Locations': 2, 'IP Addresses': 0, 'Other Persons': 2 },
      quickInsight: 'Person C physically withdrew cash at the ATM moments after receiving alerts from Person B, with telemetry showing co-location.'
    }
  },
  {
    id: 'bank_shared',
    label: 'SBI ••4921',
    subLabel: 'Mule Pool Account',
    type: 'Bank Account',
    role: 'normal',
    riskScore: 91,
    riskLevel: 'High Risk',
    x: 270,
    y: 340,
    details: {
      entityId: 'ACC-SB49',
      bankName: 'State Bank of India',
      branch: 'Sector 17, Chandigarh',
      turnover: '₹55,00,000',
      remarks: 'Common conduit account funded by Person A and accessed by Person B.'
    }
  },
  {
    id: 'bank_c',
    label: 'HDFC ••8810',
    subLabel: 'Cashout Account',
    type: 'Bank Account',
    role: 'normal',
    riskScore: 86,
    riskLevel: 'High Risk',
    x: 730,
    y: 350,
    details: {
      entityId: 'ACC-HD88',
      bankName: 'HDFC Bank',
      branch: 'Phase 7, Mohali',
      turnover: '₹34,00,000',
      remarks: 'Direct cash disbursement point linked to Person C.'
    }
  },
  {
    id: 'phone_a',
    label: '+91 99880 11223',
    subLabel: 'Command Line',
    type: 'Phone Number',
    role: 'normal',
    riskScore: 90,
    riskLevel: 'High Risk',
    x: 340,
    y: 190,
    details: {
      entityId: 'PH-A01',
      carrier: 'Airtel',
      callsCount: 210,
      remarks: 'Hub phone initiating calls to both B and C.'
    }
  },
  {
    id: 'phone_bc',
    label: '+91 91234 44556',
    subLabel: 'Field SIM',
    type: 'Phone Number',
    role: 'normal',
    riskScore: 82,
    riskLevel: 'High Risk',
    x: 760,
    y: 200,
    details: {
      entityId: 'PH-C03',
      carrier: 'Vi Mobile',
      callsCount: 165,
      remarks: 'Direct communication line between B and C during cashout runs.'
    }
  },
  {
    id: 'device_shared',
    label: 'Redmi Note 12',
    subLabel: 'Shared Device',
    type: 'Device',
    role: 'normal',
    riskScore: 87,
    riskLevel: 'High Risk',
    x: 580,
    y: 180,
    details: {
      entityId: 'DEV-R12',
      model: 'Redmi Note 12 5G',
      imei: '8690 1204 9912 341',
      remarks: 'Device used by Person A to access accounts, later handed to Person B.'
    }
  },
  {
    id: 'atm_hub',
    label: 'Sector 17 ATM',
    subLabel: 'Chandigarh',
    type: 'Location',
    role: 'normal',
    riskScore: 94,
    riskLevel: 'High Risk',
    x: 480,
    y: 560,
    details: {
      entityId: 'LOC-S17',
      locationType: 'Bank ATM Hub',
      atmId: 'ATM-CHD-17',
      remarks: 'Point where Person C withdrew ₹4,50,000 cash with Person A waiting in getaway vehicle.'
    }
  },
  {
    id: 'ip_vpn',
    label: '185.220.101.5',
    subLabel: 'Tor Exit Node',
    type: 'IP Address',
    role: 'normal',
    riskScore: 98,
    riskLevel: 'High Risk',
    x: 480,
    y: 690,
    details: {
      entityId: 'IP-TOR',
      isp: 'Secure Hosting Ltd',
      remarks: 'Used by Person A to log into net-banking and authorize RTGS to B.'
    }
  }
];

const PERSON_ABC_EDGES = [
  { id: 'ab_e1', source: 'person_a', target: 'bank_shared', type: 'Owns / Uses', label: 'OWNS' },
  { id: 'ab_e2', source: 'bank_shared', target: 'person_b', type: 'Transactions', label: 'TRANSACTIONS' },
  { id: 'ab_e3', source: 'person_b', target: 'bank_c', type: 'Transactions', label: 'TRANSACTIONS' },
  { id: 'ab_e4', source: 'bank_c', target: 'person_c', type: 'Owns / Uses', label: 'OWNS' },
  { id: 'ab_e5', source: 'person_a', target: 'phone_a', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'ab_e6', source: 'phone_a', target: 'person_b', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'ab_e7', source: 'person_b', target: 'phone_bc', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'ab_e8', source: 'phone_bc', target: 'person_c', type: 'Calls / Communicates', label: 'CALLS' },
  { id: 'ab_e9', source: 'person_a', target: 'device_shared', type: 'Owns / Uses', label: 'USES' },
  { id: 'ab_e10', source: 'device_shared', target: 'person_b', type: 'Owns / Uses', label: 'USES' },
  { id: 'ab_e11', source: 'person_a', target: 'atm_hub', type: 'Located At', label: 'LOCATED AT' },
  { id: 'ab_e12', source: 'person_c', target: 'atm_hub', type: 'Located At', label: 'LOCATED AT' },
  { id: 'ab_e13', source: 'atm_hub', target: 'ip_vpn', type: 'Follows / Connected', label: 'CONNECTED' },
  { id: 'ab_e14', source: 'person_a', target: 'person_c', type: 'Associated With', label: 'ASSOCIATED WITH', style: 'dashed' }
];

// Color mapping matching the screenshot exactly
const TYPE_CONFIG = {
  'Person': {
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.45)',
    icon: User,
    count: 156
  },
  'Phone Number': {
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.45)',
    icon: Phone,
    count: 320
  },
  'Bank Account': {
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.45)',
    icon: Building2,
    count: 248
  },
  'Device': {
    color: '#F97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    icon: Smartphone,
    count: 186
  },
  'Email': {
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.45)',
    icon: Mail,
    count: 197
  },
  'Location': {
    color: '#14B8A6',
    glow: 'rgba(20, 184, 166, 0.45)',
    icon: MapPin,
    count: 85
  },
  'IP Address': {
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.45)',
    icon: Monitor,
    count: 36
  },
  'Organization': {
    color: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.45)',
    icon: Building,
    count: 20
  }
};

const RELATIONSHIP_CONFIG = {
  'Calls / Communicates': {
    color: '#3B82F6',
    style: 'dashed',
    dashArray: '5 4',
    count: 892
  },
  'Transactions': {
    color: '#10B981',
    style: 'dashed',
    dashArray: '5 4',
    count: 684
  },
  'Owns / Uses': {
    color: '#F97316',
    style: 'dashed',
    dashArray: '5 4',
    count: 512
  },
  'Associated With': {
    color: '#A855F7',
    style: 'dashed',
    dashArray: '3 3',
    count: 356
  },
  'Located At': {
    color: '#14B8A6',
    style: 'dashed',
    dashArray: '5 4',
    count: 232
  },
  'Follows / Connected': {
    color: '#F59E0B',
    style: 'dashed',
    dashArray: '3 3',
    count: 180
  }
};

export default function IntelligenceGraph() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Active Case metadata
  const caseId =
    searchParams.get('caseId') ||
    location.state?.caseId ||
    localStorage.getItem('active_case_id') ||
    'CASE-2025-1024';

  const [activePreset, setActivePreset] = useState('chennai'); // 'chennai' | 'person_abc' | 'pipeline'
  const [nodes, setNodes] = useState(CHENNAI_NODES);
  const [edges, setEdges] = useState(CHENNAI_EDGES);

  // Selected Entity for Right Sidebar
  const [selectedNodeId, setSelectedNodeId] = useState('ramesh');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
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

  // Canvas Viewport Transforms (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Dragging Nodes
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Dynamic Collusion Path Tracer Tool Modal/State
  const [isPathTracerOpen, setIsPathTracerOpen] = useState(false);
  const [pathStartNode, setPathStartNode] = useState('person_a');
  const [pathEndNode, setPathEndNode] = useState('person_c');
  const [activePathNodeIds, setActivePathNodeIds] = useState(new Set());
  const [activePathEdgeIds, setActivePathEdgeIds] = useState(new Set());
  const [tracedPathSteps, setTracedPathSteps] = useState([]);

  // Dynamic Entity Addition Modal
  const [isAddEntityOpen, setIsAddEntityOpen] = useState(false);
  const [newEntityForm, setNewEntityForm] = useState({
    label: '',
    subLabel: '',
    type: 'Person',
    role: 'associate',
    connectTo: 'ramesh',
    relType: 'Transactions',
    relLabel: 'TRANSACTIONS'
  });

  // Full Relationship View Modal
  const [showAllRelModal, setShowAllRelModal] = useState(false);

  // Ingest from previous pipeline function if available
  useEffect(() => {
    const rawPipeline = localStorage.getItem(`output_${caseId}`) || localStorage.getItem('pipelineData');
    const rawEntities = localStorage.getItem(`entities_${caseId}`);

    if (activePreset === 'pipeline' && (rawPipeline || rawEntities)) {
      try {
        let loadedEntities = [];
        if (rawEntities) {
          const parsed = JSON.parse(rawEntities);
          loadedEntities = parsed.entities || [];
        }

        if (loadedEntities.length > 0) {
          // Construct dynamic graph from real pipeline output!
          const width = 1000;
          const height = 700;
          const centerX = width / 2;
          const centerY = height / 2;

          const pipelineNodes = loadedEntities.map((ent, idx) => {
            const angle = (idx / loadedEntities.length) * 2 * Math.PI;
            const radius = idx === 0 ? 0 : 200 + (idx % 3) * 60;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            let mappedType = 'Person';
            if (ent.type.includes('Phone')) mappedType = 'Phone Number';
            else if (ent.type.includes('Bank') || ent.type.includes('UPI')) mappedType = 'Bank Account';
            else if (ent.type.includes('Device')) mappedType = 'Device';
            else if (ent.type.includes('Email')) mappedType = 'Email';
            else if (ent.type.includes('Location')) mappedType = 'Location';
            else if (ent.type.includes('IP')) mappedType = 'IP Address';

            const isPrimary = idx === 0 || ent.canonical_value.toLowerCase().includes('suspect') || ent.canonical_value.toLowerCase().includes('ramesh');

            return {
              id: ent.canonical_id || `n_${idx}`,
              label: ent.canonical_value.slice(0, 18),
              subLabel: isPrimary ? '(Primary Suspect)' : `(${ent.type})`,
              type: mappedType,
              role: isPrimary ? 'suspect' : 'associate',
              riskScore: isPrimary ? 94 : 65 + (idx * 4) % 25,
              riskLevel: isPrimary ? 'High Risk' : 'Medium Risk',
              x: Math.max(120, Math.min(880, x)),
              y: Math.max(120, Math.min(580, y)),
              details: {
                entityId: ent.canonical_id || `E-${idx}`,
                remarks: `Extracted from case ${caseId} data sources.`,
                linkedCounts: {
                  'Phone Numbers': 2,
                  'Bank Accounts': 1,
                  'Email Addresses': 1,
                  'Devices': 1,
                  'Locations': 1,
                  'IP Addresses': 1,
                  'Other Persons': 2
                },
                quickInsight: `Central entity discovered during entity resolution of ${caseId}. Linked to multiple records across ingested datasets.`
              }
            };
          });

          // Generate co-occurrence edges
          const pipelineEdges = [];
          loadedEntities.forEach((ent, i) => {
            if (ent.related_canonical_ids && Array.isArray(ent.related_canonical_ids)) {
              ent.related_canonical_ids.forEach((relId, j) => {
                if (relId !== ent.canonical_id) {
                  pipelineEdges.push({
                    id: `pe_${i}_${j}`,
                    source: ent.canonical_id,
                    target: relId,
                    type: i % 2 === 0 ? 'Transactions' : 'Calls / Communicates',
                    label: i % 2 === 0 ? 'TRANSACTIONS' : 'CALLS'
                  });
                }
              });
            }
          });

          if (pipelineNodes.length > 0) {
            setNodes(pipelineNodes);
            if (pipelineEdges.length > 0) setEdges(pipelineEdges);
            setSelectedNodeId(pipelineNodes[0].id);
          }
        }
      } catch (err) {
        console.error('Error hydrating pipeline graph:', err);
      }
    } else if (activePreset === 'person_abc') {
      setNodes(PERSON_ABC_NODES);
      setEdges(PERSON_ABC_EDGES);
      setSelectedNodeId('person_a');
    } else {
      setNodes(CHENNAI_NODES);
      setEdges(CHENNAI_EDGES);
      setSelectedNodeId('ramesh');
    }
  }, [activePreset, caseId]);

  // Culprit Identification & Graph Metrics Engine
  const graphMetrics = useMemo(() => {
    const nodeDegree = {};
    nodes.forEach(n => { nodeDegree[n.id] = 0; });
    edges.forEach(e => {
      if (nodeDegree[e.source] !== undefined) nodeDegree[e.source]++;
      if (nodeDegree[e.target] !== undefined) nodeDegree[e.target]++;
    });

    // Find highest degree Person as likely culprit
    let candidateCulprit = null;
    let maxScore = -1;
    nodes.filter(n => n.type === 'Person').forEach(p => {
      const degree = nodeDegree[p.id] || 0;
      const score = (p.riskScore || 50) + degree * 5;
      if (score > maxScore) {
        maxScore = score;
        candidateCulprit = p;
      }
    });

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeDegree,
      candidateCulprit
    };
  }, [nodes, edges]);

  // Filtered nodes and edges
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

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Linked relationships for selected node
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

  // Breadth-First-Search Path Tracing between Person A, B, C...
  const handleTracePath = (startId, endId) => {
    if (!startId || !endId || startId === endId) return;

    // Build adjacency graph
    const adj = {};
    nodes.forEach(n => { adj[n.id] = []; });
    edges.forEach(e => {
      if (adj[e.source] && adj[e.target]) {
        adj[e.source].push({ target: e.target, edge: e });
        adj[e.target].push({ target: e.source, edge: e });
      }
    });

    // BFS queue: [currentId, pathOfNodes, pathOfEdges]
    const queue = [[startId, [startId], []]];
    const visited = new Set([startId]);
    let foundPath = null;

    while (queue.length > 0) {
      const [curr, nodePath, edgePath] = queue.shift();

      if (curr === endId) {
        foundPath = { nodes: nodePath, edges: edgePath };
        break;
      }

      for (const neighbor of adj[curr] || []) {
        if (!visited.has(neighbor.target)) {
          visited.add(neighbor.target);
          queue.push([
            neighbor.target,
            [...nodePath, neighbor.target],
            [...edgePath, neighbor.edge]
          ]);
        }
      }
    }

    if (foundPath) {
      setActivePathNodeIds(new Set(foundPath.nodes));
      setActivePathEdgeIds(new Set(foundPath.edges.map(e => e.id)));

      // Build step narrative
      const steps = [];
      for (let i = 0; i < foundPath.nodes.length - 1; i++) {
        const u = nodes.find(n => n.id === foundPath.nodes[i]);
        const v = nodes.find(n => n.id === foundPath.nodes[i + 1]);
        const e = foundPath.edges[i];
        steps.push({
          from: u?.label || foundPath.nodes[i],
          to: v?.label || foundPath.nodes[i + 1],
          type: e?.label || e?.type || 'LINK',
          desc: `${u?.label} is linked to ${v?.label} via ${e?.label || e?.type}.`
        });
      }
      setTracedPathSteps(steps);
    } else {
      setActivePathNodeIds(new Set());
      setActivePathEdgeIds(new Set());
      setTracedPathSteps([{ desc: 'No direct or indirect multi-hop path found between selected entities.' }]);
    }
  };

  // Add Dynamic Node & Edge
  const handleAddNewEntity = (e) => {
    e.preventDefault();
    if (!newEntityForm.label) return;

    const newId = `node_${Date.now()}`;
    const x = 500 + (Math.random() - 0.5) * 300;
    const y = 350 + (Math.random() - 0.5) * 250;

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
        entityId: `DYN-${Math.floor(1000 + Math.random() * 9000)}`,
        remarks: 'Dynamically added during live investigation analysis.',
        linkedCounts: { 'Phone Numbers': 1, 'Bank Accounts': 1, 'Email Addresses': 0, 'Devices': 1, 'Locations': 1, 'IP Addresses': 0, 'Other Persons': 1 },
        quickInsight: `Newly mapped connection for ${newEntityForm.label}. Links into existing criminal network via ${newEntityForm.connectTo}.`
      }
    };

    const newEdge = {
      id: `edge_${Date.now()}`,
      source: newEntityForm.connectTo,
      target: newId,
      type: newEntityForm.relType,
      label: newEntityForm.relLabel
    };

    setNodes(prev => [...prev, newNode]);
    setEdges(prev => [...prev, newEdge]);
    setSelectedNodeId(newId);
    setIsAddEntityOpen(false);
    setNewEntityForm({
      label: '',
      subLabel: '',
      type: 'Person',
      role: 'associate',
      connectTo: 'ramesh',
      relType: 'Transactions',
      relLabel: 'TRANSACTIONS'
    });
  };

  // Mouse Interaction Handlers for Pan and Drag
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
        // Convert screen coordinates to SVG viewBox coordinates
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

  // Reset Filters
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
    setActivePathNodeIds(new Set());
    setActivePathEdgeIds(new Set());
    setTracedPathSteps([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Export Graph handler
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
      // SVG download
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

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans select-none ${
        isDarkMode ? 'bg-[#070B19] text-slate-100' : 'bg-slate-900 text-slate-100'
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* ==========================================
          LEFT SIDEBAR: OVERVIEW & FILTERS
          ========================================== */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-[#151D3B] bg-[#090F24] z-20">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#151D3B]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 shadow-md shadow-purple-900/40">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-1">
              MuleGuard AI
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Knowledge Graph Explorer</div>
          </div>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar text-xs">
          {/* Preset Switcher */}
          <div className="bg-[#0D1533] border border-[#1C264D] rounded-lg p-2.5 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Case Dataset / Mode
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                onClick={() => setActivePreset('chennai')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition flex items-center justify-between ${
                  activePreset === 'chennai'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400 hover:bg-[#152044] hover:text-slate-200'
                }`}
              >
                <span>ATM Fraud Syndicate</span>
                {activePreset === 'chennai' && <Check className="w-3 h-3 text-purple-400" />}
              </button>
              <button
                onClick={() => setActivePreset('person_abc')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition flex items-center justify-between ${
                  activePreset === 'person_abc'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                    : 'text-slate-400 hover:bg-[#152044] hover:text-slate-200'
                }`}
              >
                <span>Person A, B, C Collusion</span>
                {activePreset === 'person_abc' && <Check className="w-3 h-3 text-blue-400" />}
              </button>
              <button
                onClick={() => setActivePreset('pipeline')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-semibold transition flex items-center justify-between ${
                  activePreset === 'pipeline'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                    : 'text-slate-400 hover:bg-[#152044] hover:text-slate-200'
                }`}
              >
                <span>Live Pipeline Data</span>
                {activePreset === 'pipeline' && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* GRAPH OVERVIEW */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Graph Overview
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-2 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Total Nodes
                </span>
                <span className="font-bold text-white text-xs">{graphMetrics.totalNodes.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-2 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Total Relationships
                </span>
                <span className="font-bold text-white text-xs">{graphMetrics.totalEdges.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-2 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Entity Types
                </span>
                <span className="font-bold text-white text-xs">8</span>
              </div>
              <div className="flex items-center justify-between bg-[#0D1533] px-3 py-2 rounded-lg border border-[#17203E]">
                <span className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <Network className="w-3.5 h-3.5 text-blue-400" /> Communities
                </span>
                <span className="font-bold text-white text-xs">6</span>
              </div>
            </div>
          </div>

          {/* ENTITY TYPES */}
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
                      <span className="text-slate-400 font-mono text-[10px]">{cfg.count}</span>
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

          {/* RELATIONSHIP TYPES */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Relationship Types
            </div>
            <div className="space-y-1">
              {Object.entries(RELATIONSHIP_CONFIG).map(([rel, cfg]) => {
                const isChecked = !!activeRelFilters[rel];
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
                            borderStyle: cfg.style === 'dashed' ? 'dashed' : 'solid'
                          }}
                        />
                      </div>
                      <span className="text-slate-200 group-hover:text-white transition">{rel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{cfg.count}</span>
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
            <span>Reset Filters</span>
          </button>
        </div>
      </aside>

      {/* ==========================================
          CENTER AREA: TOP BAR + MAIN GRAPH CANVAS
          ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-5 border-b border-[#151D3B] bg-[#080D20] z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cases')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Case</span>
            </button>

            <div className="h-4 w-px bg-[#1F294D]" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{caseId}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 text-red-300 border border-red-700/60">
                High Risk
              </span>
            </div>

            <span className="text-xs text-slate-400 hidden lg:inline">
              ATM Fraud Case – Chennai
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1F2A52] bg-[#0D1533] text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>20 May 2025 – 27 May 2025</span>
            </div>

            {/* Path Tracer / Culprit Finder Button */}
            <button
              onClick={() => setIsPathTracerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Trace Person A-B-C Paths</span>
            </button>

            {/* Add Dynamic Entity Button */}
            <button
              onClick={() => setIsAddEntityOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1F2A52] bg-[#0D1533] hover:bg-[#14204A] text-slate-200 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              <span>Add Entity / Link</span>
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
                  <Share2 className="w-3 h-3 text-blue-400" /> Export Data (JSON)
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-Header / Canvas Controls */}
        <div className="h-12 shrink-0 flex items-center justify-between px-6 border-b border-[#121933] bg-[#070B1B]/80 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Neo4j Knowledge Graph</span>
              <span className="text-[11px] font-normal text-slate-400">
                Visualize and explore relationships between entities.
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Entity Input */}
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

            {/* Canvas Quick Actions */}
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
              <button
                onClick={() => handleResetFilters()}
                title="Reset View"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141E44] transition"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Path Active Alert Bar (if active path tracing is on) */}
        {activePathNodeIds.size > 0 && (
          <div className="bg-purple-950/80 border-b border-purple-800/60 px-6 py-2 flex items-center justify-between text-xs z-10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-200">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-bold">Collusion Path Active:</span>
              <span>
                Illuminating {activePathNodeIds.size} connected entities and {activePathEdgeIds.size} links involved in crime chain.
              </span>
            </div>
            <button
              onClick={() => {
                setActivePathNodeIds(new Set());
                setActivePathEdgeIds(new Set());
                setTracedPathSteps([]);
              }}
              className="text-[11px] font-semibold text-purple-300 hover:text-white bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700/50"
            >
              Clear Trace
            </button>
          </div>
        )}

        {/* ==========================================
            MAIN INTERACTIVE GRAPH CANVAS
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
            {/* SVG Filter Glows and Arrow Markers */}
            <defs>
              <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#EF4444" floodOpacity="0.7" />
              </filter>
              <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.6" />
              </filter>
              <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3B82F6" floodOpacity="0.6" />
              </filter>
              <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.6" />
              </filter>
              <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F97316" floodOpacity="0.6" />
              </filter>
              <filter id="glow-teal" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#14B8A6" floodOpacity="0.6" />
              </filter>

              {/* Arrow Markers for each relationship color */}
              {Object.entries(RELATIONSHIP_CONFIG).map(([name, cfg]) => (
                <marker
                  key={`arrow-${name}`}
                  id={`arrow-${name.replace(/\s+/g, '-').toLowerCase()}`}
                  viewBox="0 0 10 10"
                  refX="24"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill={cfg.color} />
                </marker>
              ))}
            </defs>

            {/* EDGES (RELATIONSHIPS) */}
            <g id="edges-layer">
              {visibleEdges.map(edge => {
                const src = nodeMap.get(edge.source);
                const tgt = nodeMap.get(edge.target);
                if (!src || !tgt) return null;

                const relCfg = RELATIONSHIP_CONFIG[edge.type] || {
                  color: '#94A3B8',
                  style: 'solid',
                  dashArray: 'none'
                };
                const isPathActive = activePathEdgeIds.has(edge.id);
                const isDimmed = activePathEdgeIds.size > 0 && !isPathActive;
                const isSelectedEdge =
                  selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

                // Midpoint for label
                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;
                const markerId = `arrow-${edge.type.replace(/\s+/g, '-').toLowerCase()}`;

                return (
                  <g key={edge.id} opacity={isDimmed ? 0.15 : isSelectedEdge ? 1 : 0.85}>
                    {/* Background wider hit target */}
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke="transparent"
                      strokeWidth="12"
                      className="cursor-pointer"
                    />

                    {/* Edge Main Line */}
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={isPathActive ? '#FBBF24' : isSelectedEdge ? '#FFFFFF' : relCfg.color}
                      strokeWidth={isPathActive ? 2.8 : isSelectedEdge ? 2 : 1.5}
                      strokeDasharray={relCfg.dashArray}
                      markerEnd={`url(#${markerId})`}
                      className={isPathActive ? 'animate-pulse' : ''}
                    />

                    {/* Edge Text Label Badge */}
                    {showLabels && edge.label && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-38"
                          y="-8"
                          width="76"
                          height="16"
                          rx="4"
                          fill="#080D21"
                          stroke={isPathActive ? '#FBBF24' : isSelectedEdge ? '#FFFFFF' : relCfg.color}
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
                          fill={isPathActive ? '#FBBF24' : isSelectedEdge ? '#FFFFFF' : relCfg.color}
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* NODES */}
            <g id="nodes-layer">
              {visibleNodes.map(node => {
                const typeCfg = TYPE_CONFIG[node.type] || {
                  color: '#94A3B8',
                  glow: 'rgba(148, 163, 184, 0.4)',
                  icon: User
                };
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isCulprit = node.role === 'suspect';
                const isPathActive = activePathNodeIds.has(node.id);
                const isDimmed = activePathNodeIds.size > 0 && !isPathActive;
                const IconComponent = typeCfg.icon;

                const nodeRadius = isCulprit ? 26 : 22;
                const filterGlow = isCulprit
                  ? 'url(#glow-red)'
                  : isSelected
                  ? 'url(#glow-purple)'
                  : undefined;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform"
                    opacity={isDimmed ? 0.2 : 1}
                    onMouseDown={e => handleStartNodeDrag(e, node.id, node.x, node.y)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {/* Pulsing Aura for Primary Suspect / Path Active */}
                    {(isCulprit || isPathActive) && (
                      <circle
                        r={nodeRadius + 10}
                        fill="none"
                        stroke={isCulprit ? '#EF4444' : '#FBBF24'}
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
                      strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                      filter={filterGlow}
                    />

                    {/* Central Node Body Circle */}
                    <circle
                      r={nodeRadius}
                      fill={
                        isCulprit
                          ? 'url(#grad-red)'
                          : isSelected
                          ? '#1E1B4B'
                          : '#0B112B'
                      }
                      stroke={isCulprit ? '#DC2626' : typeCfg.color}
                      strokeWidth="2"
                    />

                    {/* Radial Gradients */}
                    <defs>
                      <radialGradient id="grad-red" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="100%" stopColor="#991B1B" />
                      </radialGradient>
                    </defs>

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
                          style={{
                            color: isCulprit ? '#FFFFFF' : typeCfg.color
                          }}
                        />
                      </div>
                    </foreignObject>

                    {/* Node Label Text */}
                    {showLabels && (
                      <g transform={`translate(0, ${nodeRadius + 14})`}>
                        {/* Primary Label */}
                        <text
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#FFFFFF"
                          className="drop-shadow-md"
                        >
                          {node.label}
                        </text>

                        {/* Secondary / Subtitle Label */}
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

          {/* Floating Zoom & Pan Controls (Bottom-Left) */}
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

          {/* Bottom Center Legend */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#090F24]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#1C264D] shadow-xl flex items-center gap-4 text-[11px] text-slate-300 z-10 hidden md:flex">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span>{type}</span>
              </div>
            ))}
          </div>

          {/* Bottom Right Mini-Map Navigator */}
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
                  return (
                    <line
                      key={e.id}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke="#475569"
                      strokeWidth="3"
                    />
                  );
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
              {/* Viewport Box */}
              <div
                className="absolute border border-purple-500 bg-purple-500/10 pointer-events-none rounded"
                style={{
                  left: '20%',
                  top: '15%',
                  width: `${Math.max(20, 60 / zoom)}%`,
                  height: `${Math.max(20, 60 / zoom)}%`
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ==========================================
          RIGHT SIDEBAR: ENTITY DETAILS & CULPRIT INTEL
          ========================================== */}
      {selectedNode && (
        <aside className="w-80 shrink-0 flex flex-col border-l border-[#151D3B] bg-[#090F24] z-20">
          {/* Header */}
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

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            {/* Entity Header Profile */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg ${
                  selectedNode.role === 'suspect'
                    ? 'bg-red-950/80 border-red-500 text-red-400 shadow-red-900/40'
                    : 'bg-purple-950/80 border-purple-500 text-purple-400 shadow-purple-900/40'
                }`}
              >
                {React.createElement(TYPE_CONFIG[selectedNode.type]?.icon || User, {
                  className: 'w-6 h-6'
                })}
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

            {/* Attributes Key-Value Table */}
            <div className="bg-[#0D1533] rounded-lg border border-[#17203E] divide-y divide-[#17203E]">
              <div className="flex justify-between px-3 py-2 text-[11px]">
                <span className="text-slate-400">Entity ID</span>
                <span className="font-mono text-white font-semibold">
                  {selectedNode.details?.entityId || 'ENT-001'}
                </span>
              </div>
              {selectedNode.details?.age && (
                <div className="flex justify-between px-3 py-2 text-[11px]">
                  <span className="text-slate-400">Age</span>
                  <span className="text-white font-semibold">{selectedNode.details.age}</span>
                </div>
              )}
              {selectedNode.details?.gender && (
                <div className="flex justify-between px-3 py-2 text-[11px]">
                  <span className="text-slate-400">Gender</span>
                  <span className="text-white font-semibold">{selectedNode.details.gender}</span>
                </div>
              )}
              {selectedNode.details?.phone && (
                <div className="flex justify-between px-3 py-2 text-[11px]">
                  <span className="text-slate-400">Phone (Primary)</span>
                  <span className="font-mono text-white font-semibold">{selectedNode.details.phone}</span>
                </div>
              )}
              {selectedNode.details?.email && (
                <div className="flex justify-between px-3 py-2 text-[11px]">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white font-semibold truncate max-w-[140px]">
                    {selectedNode.details.email}
                  </span>
                </div>
              )}
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
                  <span className="text-slate-400 block">Remarks</span>
                  <p className="text-slate-200 leading-relaxed">{selectedNode.details.remarks}</p>
                </div>
              )}
            </div>

            {/* LINKED ENTITIES (COUNT BREAKDOWN) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Linked Entities ({selectedNodeRelationships.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedNode.details?.linkedCounts ? (
                  Object.entries(selectedNode.details.linkedCounts).map(([cat, count]) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0D1533] border border-[#17203E] text-[11px]"
                    >
                      <div className="flex items-center gap-2 text-slate-300">
                        {cat.includes('Phone') && <Phone className="w-3.5 h-3.5 text-blue-400" />}
                        {cat.includes('Bank') && <Building2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {cat.includes('Email') && <Mail className="w-3.5 h-3.5 text-purple-400" />}
                        {cat.includes('Device') && <Smartphone className="w-3.5 h-3.5 text-orange-400" />}
                        {cat.includes('Location') && <MapPin className="w-3.5 h-3.5 text-teal-400" />}
                        {cat.includes('IP') && <Monitor className="w-3.5 h-3.5 text-amber-400" />}
                        {cat.includes('Person') && <User className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{cat}</span>
                      </div>
                      <span className="font-bold text-white font-mono">{count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-2">No linked counts available</div>
                )}
              </div>

              <button
                onClick={() => setShowAllRelModal(true)}
                className="w-full mt-2 py-2 text-center text-xs font-semibold text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-lg border border-purple-800/40 transition flex items-center justify-center gap-1.5"
              >
                <span>View All Relationships</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* QUICK INSIGHT AI BOX */}
            <div className="bg-[#12112C] border border-purple-800/60 rounded-xl p-3.5 space-y-2 shadow-lg shadow-purple-950/20">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>QUICK INSIGHT</span>
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
          MODAL: MULTI-PERSON PATH TRACER (PERSON A, B, C...)
          ========================================== */}
      {isPathTracerOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D1533] border border-[#223164] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A264E]">
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Multi-Person Collusion & Path Tracer
                </h3>
              </div>
              <button
                onClick={() => setIsPathTracerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Select any two Persons or Entities to uncover all indirect transaction hops, shared bank accounts, phone calls, and co-located visits connecting them.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                    Starting Person / Entity
                  </label>
                  <select
                    value={pathStartNode}
                    onChange={e => setPathStartNode(e.target.value)}
                    className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                    Target Person / Entity
                  </label>
                  <select
                    value={pathEndNode}
                    onChange={e => setPathEndNode(e.target.value)}
                    className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleTracePath(pathStartNode, pathEndNode)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Execute Path Trace</span>
                </button>
              </div>

              {/* Traced Output Results */}
              {tracedPathSteps.length > 0 && (
                <div className="mt-4 bg-[#070C20] border border-[#1F2A52] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span>Identified Collusion Trail:</span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {tracedPathSteps.length} Hop(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {tracedPathSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs bg-[#0C1430] p-2.5 rounded-lg border border-[#182348]"
                      >
                        <div className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          {step.from && step.to ? (
                            <div className="flex items-center gap-2 text-white font-medium">
                              <span>{step.from}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700/60">
                                {step.type}
                              </span>
                              <span>{step.to}</span>
                            </div>
                          ) : null}
                          <p className="text-[11px] text-slate-300 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsPathTracerOpen(false)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
                    >
                      View on Canvas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD DYNAMIC PERSON / ENTITY / LINK
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
                  Entity Name / Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Person D (Broker) or ICICI Account"
                  value={newEntityForm.label}
                  onChange={e => setNewEntityForm(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Entity Type
                  </label>
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
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Role in Crime
                  </label>
                  <select
                    value={newEntityForm.role}
                    onChange={e => setNewEntityForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-lg border border-[#1F2A52] bg-[#070B1A] px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="suspect">Suspect (High Risk)</option>
                    <option value="associate">Associate / Mule</option>
                    <option value="normal">Witness / Channel</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1C264D]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Link into Knowledge Graph
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Connect To
                    </label>
                    <select
                      value={newEntityForm.connectTo}
                      onChange={e =>
                        setNewEntityForm(prev => ({ ...prev, connectTo: e.target.value }))
                      }
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
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Relationship Type
                    </label>
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
          MODAL: VIEW ALL RELATIONSHIPS TABLE
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
