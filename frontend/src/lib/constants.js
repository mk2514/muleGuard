export const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/cases", label: "Case Management", icon: "cases" },
  { to: "/data-sources", label: "Data Sources", icon: "sources" },
  { to: "/entities", label: "Entities", icon: "entities" },
  { to: "/graph", label: "Intelligence Graph", icon: "graph" },
  { to: "/map", label: "Geospatial Map", icon: "map" },
  { to: "/timeline", label: "Timeline", icon: "timeline" },
  { to: "/alerts", label: "Alerts", icon: "alerts", badge: 12 },
  { to: "/reports", label: "Reports", icon: "reports" },
  { to: "/custody", label: "Chain of Custody", icon: "custody" },
];

export const PIPELINE_STEPS = [
  { id: 1, title: "Ingestion", caption: "Collect data" },
  { id: 2, title: "Preprocessing", caption: "Clean & standardize" },
  { id: 3, title: "Normalization", caption: "Unify formats" },
  { id: 4, title: "Output", caption: "Ready for analysis" },
];

export const SOURCE_TYPES = [
  { id: "upload", label: "Upload Files" },
  { id: "api", label: "API Integration" },
  { id: "cdr", label: "Call Records (CDR)" },
  { id: "bank", label: "Bank Transactions" },
  { id: "upi", label: "UPI / Wallet" },
  { id: "ip", label: "IP Logs" },
  { id: "email", label: "Emails" },
  { id: "social", label: "Social Media" },
  { id: "docs", label: "Documents" },
  { id: "images", label: "Images (OCR)" },
  { id: "video", label: "Video" },
  { id: "multilang", label: "Multi-language" },
];

export const DEPARTMENTS = [
  "Cyber Crime",
  "Fraud",
  "Intelligence",
  "Economic Offences",
  "Narcotics",
  "Special Branch",
];

export const FIELD_MAP = [
  { source: "caller", standard: "source", type: "string", mapped: true },
  { source: "receiver", standard: "target", type: "string", mapped: true },
  { source: "date", standard: "timestamp", type: "datetime", mapped: true },
  { source: "tower", standard: "location", type: "string", mapped: true },
  { source: "type", standard: "type", type: "enum", mapped: true },
  { source: "amount", standard: "amount", type: "number", mapped: false },
  { source: "event_no", standard: "event_id", type: "string", mapped: true },
];

export const RAW_ROWS = {
  cdr: [
    ["9876543210", "9123456780", "12/05/24 1:45PM", "00:04:12", "CHN-TWR-09", "VOICE"],
    ["9876543210", "9988776655", "12/05/24 2:02PM", "00:01:08", "CHD-SEC17", "VOICE"],
    ["9123456780", "9876543210", "12/05/24 2:18PM", "SMS", "MOH-TWR-02", "SMS"],
  ],
  bank: [
    ["SBIN0001122", "HDFC0003344", "12-05-2024", "85000", "IMPS", "Mule acct"],
    ["HDFC0003344", "ICIC0007788", "12-05-2024", "84200", "NEFT", "Layering"],
  ],
  ip: [
    ["103.21.44.18", "login", "12/05 13:41", "Chennai", "fail x4"],
    ["49.36.88.102", "session", "12/05 14:02", "Chandigarh", "ok"],
  ],
};

export const INGESTED_SOURCES = [
  { name: "Call Records (CDR)", records: "12,543", format: "CSV", status: "Ingested" },
  { name: "Bank Transactions", records: "8,921", format: "XLSX", status: "Ingested" },
  { name: "UPI / Wallet Data", records: "21,004", format: "CSV", status: "Ingested" },
  { name: "Internet / IP Logs", records: "54,118", format: "JSON", status: "Ingested" },
  { name: "Emails", records: "1,842", format: "EML", status: "Ingested" },
  { name: "Social Media Data", records: "6,410", format: "ZIP", status: "Ingested" },
];

export const PROCESS_STEPS = [
  { id: 1, title: "Validation", detail: "File format and schema checks" },
  { id: 2, title: "Cleaning", detail: "Strip noise, fix encodings" },
  { id: 3, title: "Standardization", detail: "Unify phone, date, IDs" },
  { id: 4, title: "Missing Handling", detail: "Flag incomplete fields" },
  { id: 5, title: "Deduplication", detail: "Collapse duplicate events" },
  { id: 6, title: "Enrichment", detail: "Attach tower / IFSC context" },
  { id: 7, title: "Mapping", detail: "Map to unified event schema" },
];

export const CASES = [
  { id: "MG-2024-1024", title: "Mule network — Sector 17 cluster", unit: "Cyber Crime", status: "Active", risk: "High", updated: "12 May 2024" },
  { id: "MG-2024-0981", title: "UPI layering — Chandigarh / Mohali", unit: "Fraud", status: "Active", risk: "High", updated: "09 May 2024" },
  { id: "MG-2024-0872", title: "SIM box — Panchkula towers", unit: "Intelligence", status: "Review", risk: "Medium", updated: "02 May 2024" },
  { id: "MG-2024-0744", title: "Account mule recruitment", unit: "Economic Offences", status: "Closed", risk: "Low", updated: "18 Apr 2024" },
];

export const ENTITIES = [
  { id: "EN-441", type: "Person", name: "Rakesh Mehra", link: "Primary suspect", risk: "High" },
  { id: "EN-442", type: "Phone", name: "9876543210", link: "Hub number", risk: "High" },
  { id: "EN-443", type: "Account", name: "SBIN ••••1122", link: "Collection account", risk: "High" },
  { id: "EN-444", type: "Person", name: "Anita Kaur", link: "Mule account holder", risk: "Medium" },
  { id: "EN-445", type: "IP", name: "103.21.44.18", link: "Repeated failed logins", risk: "Medium" },
];
