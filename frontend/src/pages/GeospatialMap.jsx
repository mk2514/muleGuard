import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import L from "leaflet";
import {
  ArrowLeft,
  Calendar,
  Download,
  MapPin,
  Crosshair,
  AlertTriangle,
  Users,
  Radio,
  CreditCard,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  X,
  Plus,
  Minus,
  Maximize2,
  RefreshCw,
  Clock,
  Filter,
  Key,
  Layers,
} from "lucide-react";

// Grounded dataset for CASE-2025-1024 (ATM Fraud Case – Chandigarh)
// Carefully calibrated coordinates matching the reference screenshot layout
const CASE_DATA = {
  caseId: "CASE-2025-1024",
  caseTitle: "ATM Fraud Case – Chandigarh",
  dateRange: "20 May 2025 – 27 May 2025",
  startTimestamp: "2025-05-20T00:00:00",
  endTimestamp: "2025-05-27T23:59:59",
  summary: {
    totalPoints: 128,
    overlapZones: 5,
    highRiskAreas: 3,
    entitiesInvolved: 18,
  },
  // Prominent map labels matching the screenshot
  labels: [
    { text: "CHANDIGARH", coords: [30.725, 76.790], className: "font-black text-slate-100/90 text-sm tracking-[0.25em] drop-shadow-md" },
    { text: "SECTOR 17", coords: [30.748, 76.762], className: "text-[11px] font-semibold text-slate-300 tracking-wider" },
    { text: "SECTOR 22", coords: [30.742, 76.815], className: "text-[11px] font-semibold text-slate-300 tracking-wider" },
    { text: "SECTOR 35", coords: [30.718, 76.765], className: "text-[11px] font-semibold text-slate-300 tracking-wider" },
    { text: "SECTOR 45", coords: [30.722, 76.820], className: "text-[11px] font-semibold text-slate-300 tracking-wider" },
    { text: "SECTOR 52", coords: [30.672, 76.795], className: "text-[11px] font-semibold text-slate-300 tracking-wider" },
    { text: "Rock Garden", coords: [30.750, 76.788], className: "text-[10px] font-medium text-emerald-400/90" },
    { text: "Sukhna Lake", coords: [30.745, 76.840], className: "text-[10px] font-medium text-blue-400/90" },
    { text: "Elante Mall", coords: [30.728, 76.792], className: "text-[10px] font-medium text-purple-300" },
    { text: "PGI Hospital", coords: [30.686, 76.745], className: "text-[10px] font-medium text-rose-400" },
    { text: "Chandigarh Railway Station", coords: [30.712, 76.735], className: "text-[10px] font-medium text-blue-400" },
    { text: "Mohali", coords: [30.675, 76.752], className: "text-[11px] font-bold text-slate-300 tracking-wide" },
    { text: "Panchkula", coords: [30.672, 76.848], className: "text-[11px] font-bold text-slate-300 tracking-wide" },
  ],
  // 5 Hotspots positioned exactly in the circular pentagon structure from the screenshot
  hotspots: [
    {
      id: "HS-01",
      number: 1,
      name: "High Risk Hotspot HS-01",
      location: "Sector 17, Chandigarh",
      coords: [30.742, 76.758],
      radius: 420,
      riskLevel: "High",
      entitiesInvolved: 5,
      eventsCount: 31,
      firstSeen: "20 May 2025, 08:30 AM",
      lastSeen: "22 May 2025, 11:15 PM",
      primaryLayers: ["telecom", "bank", "ip"],
      recommendedAction:
        "Correlate ATM cash dispersion times with Sector 17 mobile tower CDR logs. Suspect mule cluster detected.",
    },
    {
      id: "HS-02",
      number: 2,
      name: "High Risk Hotspot HS-02",
      location: "Sector 22, Chandigarh",
      coords: [30.736, 76.822],
      radius: 400,
      riskLevel: "High",
      entitiesInvolved: 6,
      eventsCount: 24,
      firstSeen: "21 May 2025, 10:14 AM",
      lastSeen: "24 May 2025, 07:20 PM",
      primaryLayers: ["bank", "ip"],
      recommendedAction:
        "Subpoena CCTV footage from Sector 22 ATM vestibule and verify linked SIM cards roaming from Haryana.",
    },
    {
      id: "HS-03",
      number: 3,
      name: "High Risk Hotspot HS-03",
      location: "Sector 45, Chandigarh",
      coords: [30.708, 76.832],
      radius: 350,
      riskLevel: "High",
      entitiesInvolved: 7,
      eventsCount: 28,
      firstSeen: "20 May 2025, 09:12 AM",
      lastSeen: "23 May 2025, 08:45 PM",
      primaryLayers: ["telecom", "bank", "ip"],
      recommendedAction:
        "Investigate linked bank accounts and call records within this hotspot. Possible coordinated activity detected.",
    },
    {
      id: "HS-04",
      number: 4,
      name: "High Risk Hotspot HS-04",
      location: "PGI Hospital / Mohali Corridor",
      coords: [30.695, 76.745],
      radius: 430,
      riskLevel: "High",
      entitiesInvolved: 5,
      eventsCount: 22,
      firstSeen: "21 May 2025, 02:00 PM",
      lastSeen: "25 May 2025, 04:30 PM",
      primaryLayers: ["telecom", "bank"],
      recommendedAction:
        "Issue notice under Sec 91 CrPC for IP log preservation on mobile gateway serving Mohali transit border.",
    },
    {
      id: "HS-05",
      number: 5,
      name: "High Risk Hotspot HS-05",
      location: "Sector 52, Chandigarh",
      coords: [30.686, 76.795],
      radius: 360,
      riskLevel: "Medium",
      entitiesInvolved: 4,
      eventsCount: 16,
      firstSeen: "22 May 2025, 11:20 AM",
      lastSeen: "26 May 2025, 06:10 PM",
      primaryLayers: ["telecom", "ip"],
      recommendedAction:
        "Trace secondary SIM card activations around Sector 52 bus stand transit route.",
    },
  ],
  // Telecom BTS towers matching the reference map distribution
  telecomPoints: [
    { id: "TEL-01", name: "Tower BTS-17A", location: "Sector 17 North", coords: [30.758, 76.745], entity: "+91 98765 43210", time: "2025-05-20T09:12:00" },
    { id: "TEL-02", name: "Tower BTS-RCK", location: "Rock Garden Ridge", coords: [30.756, 76.786], entity: "+91 98123 77889", time: "2025-05-20T11:45:00" },
    { id: "TEL-03", name: "Tower BTS-RLY", location: "Chandigarh Railway Station", coords: [30.718, 76.745], entity: "+91 97234 11098", time: "2025-05-21T14:20:00" },
    { id: "TEL-04", name: "Tower BTS-35C", location: "Sector 35 Central", coords: [30.712, 76.772], entity: "+91 98765 43210", time: "2025-05-21T18:05:00" },
    { id: "TEL-05", name: "Tower BTS-52D", location: "Sector 35/52 Border", coords: [30.690, 76.768], entity: "+91 99881 22334", time: "2025-05-22T08:10:00" },
    { id: "TEL-06", name: "Tower BTS-22E", location: "Sector 22 East", coords: [30.730, 76.845], entity: "+91 98765 43210", time: "2025-05-22T12:30:00" },
    { id: "TEL-07", name: "Tower BTS-45S", location: "Sector 45 South", coords: [30.680, 76.825], entity: "+91 98123 77889", time: "2025-05-23T16:45:00" },
    { id: "TEL-08", name: "Tower BTS-PKL", location: "Panchkula Link", coords: [30.675, 76.842], entity: "+91 97234 11098", time: "2025-05-24T10:15:00" },
  ],
  // Bank ATM nodes matching the reference map
  bankPoints: [
    { id: "BNK-01", name: "HDFC ATM - Sector 17", location: "Sector 17 Bank Square", coords: [30.732, 76.742], amount: "₹45,000", card: "Mule Card *4829", time: "2025-05-20T09:45:00" },
    { id: "BNK-02", name: "SBI ATM - Sector 35", location: "Sector 35 Inner Market", coords: [30.718, 76.765], amount: "₹40,000", card: "Mule Card *9102", time: "2025-05-20T12:10:00" },
    { id: "BNK-03", name: "Axis ATM - Central Ridge", location: "Madhya Marg Junction", coords: [30.742, 76.798], amount: "₹50,000", card: "Mule Card *4829", time: "2025-05-21T14:50:00" },
    { id: "BNK-04", name: "ICICI ATM - Sector 45 Link", location: "Sector 45 Main Market", coords: [30.722, 76.808], amount: "₹45,000", card: "Mule Card *3321", time: "2025-05-21T18:30:00" },
    { id: "BNK-05", name: "PNB ATM - Mohali Border", location: "Phase 5 Mohali Road", coords: [30.678, 76.770], amount: "₹35,000", card: "Mule Card *9102", time: "2025-05-22T08:40:00" },
    { id: "BNK-06", name: "Canara ATM - Sector 52", location: "Sector 52 Transit Point", coords: [30.665, 76.790], amount: "₹45,000", card: "Mule Card *4829", time: "2025-05-23T11:00:00" },
  ],
  // Email / IP nodes matching the reference map
  ipPoints: [
    { id: "IP-01", name: "Proxy Exit Node 1", location: "Sector 22 Cyber Hub", coords: [30.748, 76.810], ip: "103.241.20.14", time: "2025-05-20T09:10:00" },
    { id: "IP-02", name: "VPN Gateway Node 2", location: "Elante Commercial", coords: [30.728, 76.778], ip: "45.112.89.5", time: "2025-05-20T12:05:00" },
    { id: "IP-03", name: "Residential Broadband", location: "Sector 45 Cyber Node", coords: [30.722, 76.838], ip: "182.74.91.22", time: "2025-05-21T14:45:00" },
    { id: "IP-04", name: "Mobile Data Gateway", location: "Sector 52 IP Point", coords: [30.702, 76.795], ip: "157.39.102.8", time: "2025-05-21T18:25:00" },
  ],
  // Movement paths connecting the hotspots & entities matching the screenshot
  movementPaths: [
    {
      id: "PATH-RING",
      entity: "Primary Mule Ring (Card *4829 / +91 98765 43210)",
      color: "#ef4444",
      coords: [
        [30.742, 76.758], // HS-01
        [30.742, 76.798], // Bank 3
        [30.736, 76.822], // HS-02
        [30.722, 76.838], // IP 3
        [30.708, 76.832], // HS-03
        [30.686, 76.795], // HS-05
        [30.678, 76.770], // Bank 5
        [30.695, 76.745], // HS-04
        [30.732, 76.742], // Bank 1
        [30.742, 76.758], // HS-01
      ],
      description: "Continuous circular perimeter cash-out transit corridor connecting all 5 Hotspots",
    },
    {
      id: "PATH-CHORD",
      entity: "Co-conspirator Network Cross-Chord",
      color: "#3b82f6",
      coords: [
        [30.758, 76.745],
        [30.756, 76.786],
        [30.748, 76.810],
        [30.730, 76.845],
        [30.708, 76.832],
        [30.680, 76.825],
        [30.675, 76.842],
      ],
      description: "Northern & Eastern telecom communication arc",
    },
    {
      id: "PATH-INTERNAL",
      entity: "Internal Core Transit Vector",
      color: "#a855f7",
      coords: [
        [30.742, 76.758],
        [30.728, 76.778],
        [30.708, 76.832],
      ],
      description: "Diagonal coordination vector between Sector 17, Elante Mall, and Sector 45",
    },
    {
      id: "PATH-WEST",
      entity: "Western Railway Ingress",
      color: "#10b981",
      coords: [
        [30.718, 76.745],
        [30.712, 76.772],
        [30.690, 76.768],
        [30.686, 76.795],
      ],
      description: "Transit line from railway station into Sector 52 hideout",
    },
  ],
};

// Available Basemap Tile Providers (Free, Zero Key Required vs Optional Custom Key)
const BASEMAP_TILES = {
  esriDark: {
    name: "Esri Dark Gray Canvas (Zero API Key)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
  },
  esriSatelliteNight: {
    name: "Night Satellite (Zero API Key)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    attribution: "Source: Esri, Maxar, Earthstar Geographics",
  },
  osmDark: {
    name: "OpenStreetMap Dark (Zero API Key)",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    attribution: "&copy; OpenStreetMap contributors",
  },
};

export default function GeospatialMap() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Case Resolution
  const activeCaseId =
    searchParams.get("caseId") ||
    localStorage.getItem("active_case_id") ||
    "CASE-2025-1024";

  // Map DOM Reference & Leaflet Instance
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const layerGroupsRef = useRef({
    hotspots: null,
    telecom: null,
    bank: null,
    ip: null,
    paths: null,
  });

  // UI States
  const [selectedBasemap, setSelectedBasemap] = useState("esriDark");
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [selectedLayerFilter, setSelectedLayerFilter] = useState("All Combined");
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false);
  const [timeSliderVal, setTimeSliderVal] = useState(100);
  const [selectedPoint, setSelectedPoint] = useState(CASE_DATA.hotspots[2]); // Default HS-03 as shown in screenshot
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [showKeySolutionModal, setShowKeySolutionModal] = useState(false);

  // Active Layer Toggles (with eye icons)
  const [activeLayers, setActiveLayers] = useState({
    telecom: true,
    bank: true,
    ip: true,
    hotspots: true,
    paths: true,
  });

  // Extract / Ground Case Data
  const caseData = useMemo(() => {
    const rawEntities = localStorage.getItem(`entities_${activeCaseId}`);
    const rawOutput =
      localStorage.getItem(`output_${activeCaseId}`) ||
      localStorage.getItem(`pipelineData_${activeCaseId}`) ||
      localStorage.getItem("pipelineData");
    const rawCases = localStorage.getItem("cases");

    let caseTitle = "ATM Fraud Case – Chandigarh";
    if (rawCases) {
      try {
        const parsedCases = JSON.parse(rawCases);
        const match = parsedCases.find(
          (c) => c.case_id === activeCaseId || c.id === activeCaseId
        );
        if (match) {
          caseTitle = match.title || match.name || caseTitle;
        }
      } catch {
        /* continue */
      }
    }

    return {
      ...CASE_DATA,
      caseId: activeCaseId.startsWith("MG-")
        ? activeCaseId.replace("MG-", "CASE-")
        : activeCaseId,
      caseTitle,
    };
  }, [activeCaseId]);

  // Toggle layer helper
  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  // Switch Tile Layer without reload
  const switchBasemap = (key) => {
    setSelectedBasemap(key);
    setShowBasemapMenu(false);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const provider = BASEMAP_TILES[key];
    const newTileLayer = L.tileLayer(provider.url, {
      maxZoom: 19,
      subdomains: provider.subdomains,
      attribution: provider.attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Chandigarh with optimal zoom level showing all 5 sectors
      const map = L.map(mapContainerRef.current, {
        center: [30.718, 76.790],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Default Basemap: Esri World Dark Gray Base (100% FREE, ZERO API KEY REQUIRED)
      const provider = BASEMAP_TILES.esriDark;
      const tileLayer = L.tileLayer(provider.url, {
        maxZoom: 19,
        subdomains: provider.subdomains,
        attribution: provider.attribution,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Add scale indicator at bottom left
      L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

      // Initialize Layer Groups
      layerGroupsRef.current = {
        hotspots: L.layerGroup().addTo(map),
        telecom: L.layerGroup().addTo(map),
        bank: L.layerGroup().addTo(map),
        ip: L.layerGroup().addTo(map),
        paths: L.layerGroup().addTo(map),
      };

      // Add prominent map text labels directly to the map
      const labelsGroup = L.layerGroup().addTo(map);
      caseData.labels.forEach((lbl) => {
        const labelIcon = L.divIcon({
          html: `<div class="${lbl.className} whitespace-nowrap pointer-events-none select-none">${lbl.text}</div>`,
          className: "custom-leaflet-icon",
          iconAnchor: [30, 10],
        });
        L.marker(lbl.coords, { icon: labelIcon, interactive: false }).addTo(labelsGroup);
      });
      labelLayerRef.current = labelsGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Layers & Markers whenever data, filters, or activeLayers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { hotspots, telecom, bank, ip, paths } = layerGroupsRef.current;

    // Clear existing layers
    hotspots.clearLayers();
    telecom.clearLayers();
    bank.clearLayers();
    ip.clearLayers();
    paths.clearLayers();

    const isGlobalLayer =
      selectedLayerFilter === "All Combined" || !selectedLayerFilter;

    // 1. OVERLAP / HOTSPOTS (Pulsating Radar Rings with Numbered Core)
    if (
      activeLayers.hotspots &&
      (isGlobalLayer || selectedLayerFilter === "Overlap / Hotspots")
    ) {
      caseData.hotspots.forEach((hs) => {
        // Red radius circle
        const radiusCircle = L.circle(hs.coords, {
          radius: hs.radius,
          color: "#ef4444",
          weight: 1.5,
          opacity: 0.7,
          fillColor: "#ef4444",
          fillOpacity: 0.12,
          dashArray: "4, 6",
        }).addTo(hotspots);

        radiusCircle.on("click", () => setSelectedPoint(hs));

        // Pulsating Concentric Radar Waves with bold numbered badge
        const hotspotHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 58px; height: 58px;">
            <!-- Outer Pulsating Radar Wave -->
            <div class="absolute inset-0 rounded-full bg-red-600/30 animate-radar border border-red-500/50"></div>
            <!-- Secondary Wave -->
            <div class="absolute inset-2 rounded-full bg-red-600/25 animate-pulse border border-red-500/40"></div>
            <!-- Center Solid Badge -->
            <div class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 text-white font-black text-sm shadow-xl shadow-red-600/70 border-2 border-white/95 transform transition-transform group-hover:scale-125">
              ${hs.number}
            </div>
          </div>
        `;

        const hotspotIcon = L.divIcon({
          html: hotspotHtml,
          className: "custom-leaflet-icon",
          iconSize: [58, 58],
          iconAnchor: [29, 29],
        });

        const marker = L.marker(hs.coords, { icon: hotspotIcon }).addTo(hotspots);
        marker.on("click", () => setSelectedPoint(hs));
      });
    }

    // 2. TELECOM / CALL DATA POINTS (Blue Glowing Antenna Badges)
    if (
      activeLayers.telecom &&
      (isGlobalLayer || selectedLayerFilter === "Telecom / Call Data")
    ) {
      caseData.telecomPoints.forEach((p) => {
        const telecomHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
            <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white border-2 border-blue-300 shadow-md shadow-blue-600/60 transform transition-transform group-hover:scale-125">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
                <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
                <circle cx="12" cy="12" r="2"/>
                <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
                <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: telecomHtml,
          className: "custom-leaflet-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(p.coords, { icon }).addTo(telecom);
        marker.on("click", () =>
          setSelectedPoint({
            ...p,
            type: "telecom",
            riskLevel: "Medium",
            radius: "500 m",
            entitiesInvolved: 1,
            eventsCount: 14,
            firstSeen: "20 May 2025, 09:12 AM",
            lastSeen: "27 May 2025, 14:10 PM",
            primaryLayers: ["telecom"],
            recommendedAction:
              "Query CDR dump from local telecom circle for all IMEI numbers handshaking with this BTS tower.",
          })
        );
      });
    }

    // 3. BANK TRANSACTIONS (Green Glowing ATM / Card Badges)
    if (
      activeLayers.bank &&
      (isGlobalLayer || selectedLayerFilter === "Bank Transactions")
    ) {
      caseData.bankPoints.forEach((p) => {
        const bankHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
            <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white border-2 border-emerald-300 shadow-md shadow-emerald-600/60 transform transition-transform group-hover:scale-125">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: bankHtml,
          className: "custom-leaflet-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(p.coords, { icon }).addTo(bank);
        marker.on("click", () =>
          setSelectedPoint({
            ...p,
            type: "bank",
            riskLevel: "High",
            radius: "50 m",
            entitiesInvolved: 2,
            eventsCount: 8,
            firstSeen: "20 May 2025, 09:45 AM",
            lastSeen: "25 May 2025, 13:45 PM",
            primaryLayers: ["bank"],
            recommendedAction: `Flag bank account linked to ${p.card} for emergency debit freeze under PMLA provisions.`,
          })
        );
      });
    }

    // 4. EMAIL / IP ACTIVITY (Purple Glowing Globe Badges)
    if (
      activeLayers.ip &&
      (isGlobalLayer || selectedLayerFilter === "Email / IP Activity")
    ) {
      caseData.ipPoints.forEach((p) => {
        const ipHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
            <div class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white border-2 border-purple-300 shadow-md shadow-purple-600/60 transform transition-transform group-hover:scale-125">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" x2="22" y1="12" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: ipHtml,
          className: "custom-leaflet-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(p.coords, { icon }).addTo(ip);
        marker.on("click", () =>
          setSelectedPoint({
            ...p,
            type: "ip",
            riskLevel: "High",
            radius: "150 m",
            entitiesInvolved: 3,
            eventsCount: 12,
            firstSeen: "20 May 2025, 09:10 AM",
            lastSeen: "24 May 2025, 19:30 PM",
            primaryLayers: ["ip"],
            recommendedAction: `Serve notice to ISP for subscriber identity records and session NAT logs for IP ${p.ip}.`,
          })
        );
      });
    }

    // 5. MOVEMENT PATHS (Polylines with dashed arrows)
    if (
      activeLayers.paths &&
      (isGlobalLayer || selectedLayerFilter === "Movement Paths")
    ) {
      caseData.movementPaths.forEach((path) => {
        const polyline = L.polyline(path.coords, {
          color: path.color,
          weight: 2.5,
          opacity: 0.85,
          dashArray: "6, 8",
          lineCap: "round",
        }).addTo(paths);

        polyline.on("click", () =>
          setSelectedPoint({
            id: path.id,
            name: path.entity,
            location: "Multi-sector Corridor",
            radius: "Linear Vector",
            riskLevel: "High",
            entitiesInvolved: 2,
            eventsCount: path.coords.length,
            firstSeen: "20 May 2025, 09:00 AM",
            lastSeen: "26 May 2025, 22:00 PM",
            primaryLayers: ["telecom", "bank", "ip"],
            recommendedAction:
              "Deploy check-post alerts along transit coordinates between identified ATM dispensing nodes.",
          })
        );
      });
    }
  }, [activeLayers, selectedLayerFilter, caseData]);

  // Zoom Helpers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.setView([30.718, 76.790], 13, { animate: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070b13] text-slate-100 font-sans -m-6 p-6">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/cases")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Cases</span>
          </button>
          <div className="pl-2 border-l border-slate-700/60">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              {caseData.caseId}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {caseData.caseTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tile Layer Selector (Solution for zero API key watermark) */}
          <div className="relative">
            <button
              onClick={() => setShowBasemapMenu(!showBasemapMenu)}
              title="Basemap Styles (Zero Key Required)"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700/70 bg-[#111726] px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
            >
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              <span>Map Style</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showBasemapMenu && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-slate-700 bg-[#121829] py-1.5 shadow-2xl z-40 space-y-1 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Basemap (No Key Needed)
                </div>
                {Object.entries(BASEMAP_TILES).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => switchBasemap(k)}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                      selectedBasemap === k
                        ? "bg-purple-600/30 text-purple-200 font-semibold"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{v.name}</span>
                    {selectedBasemap === k && <span className="text-purple-400">✓</span>}
                  </button>
                ))}
                <div className="border-t border-slate-800 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowBasemapMenu(false);
                      setShowKeySolutionModal(true);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                  >
                    <Key className="h-3 w-3" />
                    <span>API Key Guide & Solution</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-[#111726] px-3 py-1.5 text-xs text-slate-200 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{caseData.dateRange}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 ml-1" />
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-purple-900/30 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* 2. TOP KPI SUMMARY STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-4">
        {/* Total Points */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-800 bg-[#0e1424]/90 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL POINTS
            </div>
            <div className="text-xl font-bold text-white">
              {caseData.summary.totalPoints}
            </div>
          </div>
        </div>

        {/* Overlap Zones */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-800 bg-[#0e1424]/90 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
            <Crosshair className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OVERLAP ZONES
            </div>
            <div className="text-xl font-bold text-white">
              {caseData.summary.overlapZones}
            </div>
          </div>
        </div>

        {/* High Risk Areas */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-800 bg-[#0e1424]/90 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HIGH RISK AREAS
            </div>
            <div className="text-xl font-bold text-white">
              {caseData.summary.highRiskAreas}
            </div>
          </div>
        </div>

        {/* Entities Involved */}
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-800 bg-[#0e1424]/90 p-3.5 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ENTITIES INVOLVED
            </div>
            <div className="text-xl font-bold text-white">
              {caseData.summary.entitiesInvolved}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: 3-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* LEFT COLUMN: Data Layer, Legend, Reading Guide (2.5 cols) */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-4">
          {/* Data Layer Dropdown */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1424]/95 p-3.5 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DATA LAYER
            </div>
            <div className="relative">
              <button
                onClick={() => setIsLayerDropdownOpen(!isLayerDropdownOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-slate-700/80 bg-[#161f32] px-3 py-2 text-xs text-white hover:border-slate-600 transition"
              >
                <span className="truncate">{selectedLayerFilter}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isLayerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-lg border border-slate-700 bg-[#141b2d] py-1 shadow-2xl space-y-0.5">
                  {[
                    "All Combined",
                    "Telecom / Call Data",
                    "Bank Transactions",
                    "Email / IP Activity",
                    "Overlap / Hotspots",
                    "Movement Paths",
                  ].map((layer) => (
                    <button
                      key={layer}
                      onClick={() => {
                        setSelectedLayerFilter(layer);
                        setIsLayerDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                        selectedLayerFilter === layer
                          ? "bg-purple-600/30 text-purple-300 font-semibold"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <span>{layer}</span>
                      {selectedLayerFilter === layer && (
                        <span className="text-purple-400 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1424]/95 p-3.5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              LEGEND
            </div>
            <div className="space-y-2.5 text-xs">
              {/* Telecom */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/40">
                  <Radio className="h-3.5 w-3.5" />
                </div>
                <span className="text-slate-300 font-medium">Telecom / Call Data</span>
              </div>

              {/* Bank */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/40">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <span className="text-slate-300 font-medium">Bank Transactions</span>
              </div>

              {/* Email / IP */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600/20 text-purple-400 border border-purple-500/40">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span className="text-slate-300 font-medium">Email / IP Activity</span>
              </div>

              {/* Overlap */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600/20 text-red-400 border border-red-500/40">
                  <Crosshair className="h-3.5 w-3.5" />
                </div>
                <span className="text-slate-300 font-medium">Overlap / Hotspots</span>
              </div>

              {/* Movement Paths */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center text-slate-400">
                  <span className="font-mono text-xs">➔</span>
                </div>
                <span className="text-slate-300 font-medium">Movement Paths</span>
              </div>
            </div>
          </div>

          {/* How to Read the Map Guide */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1424]/95 p-3.5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              HOW TO READ THE MAP
            </div>
            <div className="space-y-3 text-[11px] text-slate-400 leading-snug">
              <div className="flex items-start gap-2.5">
                <div className="flex gap-1 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span>Different colors represent data layers</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="font-mono text-xs text-slate-300 mt-[-2px]">╌╌➔</span>
                <span>Dashed lines show movement paths</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="h-3 w-3 rounded-full border border-red-500/80 bg-red-500/20 flex items-center justify-center mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                </div>
                <span>Red zones indicate high risk overlap areas</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: LEAFLET MAP VIEW & TIME RANGE SLIDER (6.5 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col rounded-xl border border-slate-800 overflow-hidden bg-[#0a0f1d] relative min-h-[560px]">
          {/* Map Container */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[500px] flex-1 z-0" />

          {/* Floating Zoom & Control Toolbar on Map */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#111726]/90 text-slate-200 hover:bg-slate-800 hover:text-white transition shadow-lg"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#111726]/90 text-slate-200 hover:bg-slate-800 hover:text-white transition shadow-lg"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Recenter Map"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-[#111726]/90 text-slate-200 hover:bg-slate-800 hover:text-white transition shadow-lg"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* BOTTOM TIME RANGE SCRUBBER OVERLAY */}
          <div className="border-t border-slate-800 bg-[#0e1424]/95 p-3.5 space-y-2 z-10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-[11px] tracking-wider uppercase">
                <span>➔ TIME RANGE</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Calendar className="h-3 w-3 text-purple-400" />
                <span>20 May 2025 00:00</span>
              </div>
            </div>

            {/* Slider bar */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={timeSliderVal}
                onChange={(e) => setTimeSliderVal(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                27 May 2025 23:59
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Layers & Selected Point Information (3 cols) */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-4">
          {/* Active Layers (5) */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1424]/95 p-3.5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ACTIVE LAYERS (5)
            </div>
            <div className="space-y-2 text-xs">
              {/* Telecom */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  <div>
                    <div className="font-medium text-slate-200">Telecom / Call Data</div>
                    <div className="text-[10px] text-slate-400">45 Points</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer("telecom")}
                  className={`p-1 rounded transition ${
                    activeLayers.telecom ? "text-blue-400" : "text-slate-600"
                  }`}
                >
                  {activeLayers.telecom ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Bank */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <div>
                    <div className="font-medium text-slate-200">Bank Transactions</div>
                    <div className="text-[10px] text-slate-400">38 Points</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer("bank")}
                  className={`p-1 rounded transition ${
                    activeLayers.bank ? "text-emerald-400" : "text-slate-600"
                  }`}
                >
                  {activeLayers.bank ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Email / IP */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                  <div>
                    <div className="font-medium text-slate-200">Email / IP Activity</div>
                    <div className="text-[10px] text-slate-400">29 Points</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer("ip")}
                  className={`p-1 rounded transition ${
                    activeLayers.ip ? "text-purple-400" : "text-slate-600"
                  }`}
                >
                  {activeLayers.ip ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Overlap Hotspots */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                  <div>
                    <div className="font-medium text-slate-200">Overlap / Hotspots</div>
                    <div className="text-[10px] text-slate-400">5 Zones</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer("hotspots")}
                  className={`p-1 rounded transition ${
                    activeLayers.hotspots ? "text-red-400" : "text-slate-600"
                  }`}
                >
                  {activeLayers.hotspots ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Movement Paths */}
              <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 transition">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400 shadow-sm" />
                  <div>
                    <div className="font-medium text-slate-200">Movement Paths</div>
                    <div className="text-[10px] text-slate-400">12 Paths</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleLayer("paths")}
                  className={`p-1 rounded transition ${
                    activeLayers.paths ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {activeLayers.paths ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Selected Point Information */}
          {selectedPoint && (
            <div className="rounded-xl border border-slate-800 bg-[#0e1424]/95 p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SELECTED POINT INFORMATION
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Point Title */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-400 border border-red-500/40">
                  <Crosshair className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {selectedPoint.name || `Hotspot ${selectedPoint.id}`}
                  </div>
                  <div className="text-[10px] text-slate-400">{selectedPoint.id}</div>
                </div>
              </div>

              {/* Details Key-Value List */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Location</span>
                  <span className="font-medium text-slate-200 text-right">
                    {selectedPoint.location || "Chandigarh Central"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Radius</span>
                  <span className="font-mono text-slate-200">
                    {selectedPoint.radius ? `${selectedPoint.radius} m` : "350 m"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Risk Level</span>
                  <span className="font-semibold text-red-400">
                    {selectedPoint.riskLevel || "High"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Entities Involved</span>
                  <span className="font-semibold text-slate-200">
                    {selectedPoint.entitiesInvolved || 7}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Events (Total)</span>
                  <span className="font-semibold text-slate-200">
                    {selectedPoint.eventsCount || 28}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">First Seen</span>
                  <span className="text-[11px] text-slate-300">
                    {selectedPoint.firstSeen || "20 May 2025, 09:12 AM"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400">Last Seen</span>
                  <span className="text-[11px] text-slate-300">
                    {selectedPoint.lastSeen || "23 May 2025, 08:45 PM"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Primary Layers</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded bg-blue-600/30 text-blue-400 flex items-center justify-center">
                      <Radio className="h-3 w-3" />
                    </div>
                    <div className="h-5 w-5 rounded bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                      <CreditCard className="h-3 w-3" />
                    </div>
                    <div className="h-5 w-5 rounded bg-purple-600/30 text-purple-400 flex items-center justify-center">
                      <Globe className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Action Callout */}
              <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <ShieldCheck className="h-4 w-4" />
                  <span>RECOMMENDED ACTION</span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  {selectedPoint.recommendedAction ||
                    "Investigate linked bank accounts and call records within this hotspot. Possible coordinated activity detected."}
                </p>
              </div>

              {/* View Full Details Button */}
              <button
                onClick={() => setShowFullDetailsModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition"
              >
                <span>View Full Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. FULL FORENSIC DETAILS MODAL */}
      {showFullDetailsModal && selectedPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0e1424] p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/40">
                  <Crosshair className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedPoint.name || `Hotspot ${selectedPoint.id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Forensic Spatial Audit Report · {selectedPoint.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullDetailsModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Total Transactions
                </span>
                <span className="text-lg font-bold text-emerald-400">
                  ₹2,55,000 (8 txns)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  CDR Calls Recorded
                </span>
                <span className="text-lg font-bold text-blue-400">
                  42 calls (3 BTS)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141b2d] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Unique IP Logins
                </span>
                <span className="text-lg font-bold text-purple-400">
                  6 IP addresses
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Correlated Case Entities
              </div>
              <div className="rounded-xl border border-slate-800 bg-[#121929] divide-y divide-slate-800/80 text-xs">
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">Mule Card *4829</span>
                    <span className="text-slate-400 text-[11px] block">
                      Account: Ramesh Chand (Axis Bank, Sector 35 Branch)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    High Risk
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">MSISDN: +91 98765 43210</span>
                    <span className="text-slate-400 text-[11px] block">
                      Airtel Pre-paid, SIM activated via fake Aadhaar UID
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Key Link
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">IP: 103.241.20.14</span>
                    <span className="text-slate-400 text-[11px] block">
                      Host: BSNL Broadband (Dynamic Pool), Geo-radius: Sector 45
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Gateway
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFullDetailsModal(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowFullDetailsModal(false);
                  navigate(`/graph?caseId=${activeCaseId}`);
                }}
                className="rounded-lg bg-purple-600 hover:bg-purple-700 px-4 py-2 text-xs font-semibold text-white transition flex items-center gap-1.5"
              >
                <span>Open in Graph Explorer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. API KEY EXPLANATION & ZERO-KEY SOLUTION MODAL */}
      {showKeySolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0e1424] p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Basemap Solution: Zero API Key Required
                  </h3>
                  <p className="text-xs text-slate-400">
                    Explanation and permanent fix for the Carto tile watermark
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeySolutionModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200">
                <div className="font-semibold text-sm text-emerald-300 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Permanent Fix Applied Automatically</span>
                </div>
                We have switched the default map provider to <strong>Esri World Dark Gray Canvas</strong>. It is completely free, runs on a high-speed global CDN, and requires <strong>zero API keys</strong> and displays <strong>zero watermarks</strong>.
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Why did "API KEY REQUIRED" appear?</h4>
                <p className="text-slate-400">
                  CARTO recently updated their public CDN policy to imprint a diagonal watermark on direct tile requests unless an authenticated account key is passed in the URL.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Available Free Options (No Key Needed):</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-200">Esri Dark Gray Canvas</strong>: Sleek dark minimalist basemap, optimal for investigative tactical overlays.</li>
                  <li><strong className="text-slate-200">Night Satellite</strong>: High-resolution satellite imagery with night contrast.</li>
                  <li><strong className="text-slate-200">OpenStreetMap Dark</strong>: High detail road map with dark inversion.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowKeySolutionModal(false)}
                className="rounded-lg bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-semibold text-white transition"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
