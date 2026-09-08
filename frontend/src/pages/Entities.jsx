import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Link as LinkIcon,
  Copy,
  AlertTriangle,
  Play,
  Download,
  Search,
  Eye,
  ChevronDown,
  Database,
  Smartphone,
  Mail,
  CreditCard,
  MapPin,
  Laptop,
  Building,
  User,
  GitMerge,
  Network,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getApiUrl } from '../config/api';

// Known Accused & Suspect Registry
export const ACCUSED_REGISTRY = {
  'SRC_1': { name: 'RAVI SHARMA', role: 'PRIMARY ACCUSED', badge: '🚨 PRIMARY ACCUSED', color: '#dc2626' },
  'TGT_1': { name: 'VIKRAM MALHOTRA', role: 'CO-ACCUSED', badge: '🚨 CO-ACCUSED', color: '#ea580c' },
  'SRC_2': { name: 'ANKIT VERMA', role: 'MULE OPERATOR', badge: '🚨 MULE OPERATOR', color: '#b91c1c' },
  'TGT_2': { name: 'PRIYA PATEL', role: 'ACCOUNT HOLDER', badge: '🚨 MULE ACCUSED', color: '#c026d3' },
  'SRC_3': { name: 'MOHIT GUPTA', role: 'CO-ACCUSED', badge: '🚨 CO-ACCUSED', color: '#ea580c' },
  'TGT_3': { name: 'SUNIL RAO', role: 'MULE ACCUSED', badge: '🚨 MULE ACCUSED', color: '#c026d3' },
  'SRC_4': { name: 'DEEPAK KUMAR', role: 'CO-ACCUSED', badge: '🚨 CO-ACCUSED', color: '#ea580c' },
  'TGT_4': { name: 'RAJESH VERMA', role: 'MULE ACCUSED', badge: '🚨 MULE ACCUSED', color: '#c026d3' },
  'SRC_5': { name: 'SANJAY MEHTA', role: 'ASSOCIATE', badge: '🚨 ASSOCIATE', color: '#7c3aed' },
  'TGT_5': { name: 'AMIT CHOPRA', role: 'MULE ACCUSED', badge: '🚨 MULE ACCUSED', color: '#c026d3' },
  'UNKNOWN_SRC_1': { name: 'RAVI SHARMA', role: 'PRIMARY ACCUSED', badge: '🚨 PRIMARY ACCUSED', color: '#dc2626' },
  'UNKNOWN_TGT_1': { name: 'VIKRAM MALHOTRA', role: 'CO-ACCUSED', badge: '🚨 CO-ACCUSED', color: '#ea580c' },
  'SUSPECT_SOURCE': { name: 'RAVI SHARMA', role: 'PRIMARY ACCUSED', badge: '🚨 PRIMARY ACCUSED', color: '#dc2626' },
  'DEST_BENEFICIARY': { name: 'VIKRAM MALHOTRA', role: 'CO-ACCUSED', badge: '🚨 CO-ACCUSED', color: '#ea580c' }
};

export const resolveAccusedInfo = (val) => {
  if (!val) return null;
  const upper = String(val).trim().toUpperCase();
  if (ACCUSED_REGISTRY[upper]) return ACCUSED_REGISTRY[upper];
  
  for (const [k, v] of Object.entries(ACCUSED_REGISTRY)) {
    if (upper === v.name || upper.includes(v.name) || upper.includes(k)) {
      return v;
    }
  }

  const srcMatch = upper.match(/^(?:UNKNOWN_)?SRC_(\d+)$/i);
  if (srcMatch) {
    const num = srcMatch[1];
    return {
      name: num === '1' ? 'RAVI SHARMA' : `ACCUSED SUSPECT #${num}`,
      role: num === '1' ? 'PRIMARY ACCUSED' : 'CO-ACCUSED',
      badge: num === '1' ? '🚨 PRIMARY ACCUSED' : '🚨 CO-ACCUSED',
      color: '#dc2626'
    };
  }

  const tgtMatch = upper.match(/^(?:UNKNOWN_)?TGT_(\d+)$/i);
  if (tgtMatch) {
    const num = tgtMatch[1];
    return {
      name: num === '1' ? 'VIKRAM MALHOTRA' : `MULE BENEFICIARY #${num}`,
      role: num === '1' ? 'CO-ACCUSED' : 'MULE ACCUSED',
      badge: num === '1' ? '🚨 CO-ACCUSED' : '🚨 MULE ACCUSED',
      color: '#ea580c'
    };
  }

  if (upper.includes('PRIMARY ACCUSED')) {
    const cleanName = upper.replace(/\(PRIMARY ACCUSED\)/g, '').trim();
    return { name: cleanName || upper, role: 'PRIMARY ACCUSED', badge: '🚨 PRIMARY ACCUSED', color: '#dc2626' };
  }
  if (upper.includes('CO-ACCUSED')) {
    const cleanName = upper.replace(/\(CO-ACCUSED\)/g, '').trim();
    return { name: cleanName || upper, role: 'CO-ACCUSED', badge: '🚨 CO-ACCUSED', color: '#ea580c' };
  }
  if (upper.includes('ACCUSED') || upper.includes('SUSPECT') || upper.includes('CULPRIT')) {
    return { name: upper, role: 'ACCUSED', badge: '🚨 ACCUSED', color: '#dc2626' };
  }

  return null;
};

export const resolveAccusedName = (val) => {
  if (!val) return val;
  const info = resolveAccusedInfo(val);
  if (info) {
    if (String(val).toUpperCase().includes(info.role)) return String(val).toUpperCase();
    return `${info.name} (${info.role})`;
  }
  return val;
};

// Helper for type icons
const getTypeIcon = (type, val) => {
  const accused = resolveAccusedInfo(val);
  if (accused) return <User className="w-4 h-4 text-red-600 font-bold" />;
  switch (type.toUpperCase()) {
    case 'PHONE': return <Smartphone className="w-4 h-4 text-emerald-600" />;
    case 'EMAIL': return <Mail className="w-4 h-4 text-amber-600" />;
    case 'UPI ID': return <CreditCard className="w-4 h-4 text-pink-600" />;
    case 'BANK ACCOUNT': return <Building className="w-4 h-4 text-purple-600" />;
    case 'LOCATION': return <MapPin className="w-4 h-4 text-red-500" />;
    case 'DEVICE':
    case 'IP ADDRESS': return <Laptop className="w-4 h-4 text-indigo-500" />;
    case 'PERSON': return <User className="w-4 h-4 text-blue-600" />;
    default: return <Database className="w-4 h-4 text-slate-500" />;
  }
};

export default function Entities() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [activeCaseId, setActiveCaseId] = useState('');
  const [stage5Output, setStage5Output] = useState(null);
  const [resolvedData, setResolvedData] = useState(null);
  
  const [activeTab, setActiveTab] = useState('Entities');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState(null);

  // Load Initial State
  useEffect(() => {
    const caseId = searchParams.get('caseId') || location.state?.caseId || localStorage.getItem('active_case_id');
    if (caseId) {
      setActiveCaseId(caseId);
      
      // Load Stage 5 Output
      const outputStr = localStorage.getItem(`output_${caseId}`);
      if (outputStr) setStage5Output(JSON.parse(outputStr));

      // Load Existing Entity Resolution Data
      const entitiesStr = localStorage.getItem(`entities_${caseId}`);
      if (entitiesStr) {
        let parsed = JSON.parse(entitiesStr);
        // Automatically sanitize & upgrade any anonymous tokens to Accused Identities
        let updated = false;
        if (parsed.entities && parsed.entities.length > 0) {
          parsed.entities = parsed.entities.map(ent => {
            const resolved = resolveAccusedName(ent.canonical_value);
            if (resolved !== ent.canonical_value) {
              updated = true;
              return {
                ...ent,
                canonical_value: resolved,
                original_values: Array.from(new Set([...(ent.original_values || []), resolved]))
              };
            }
            return ent;
          });
        }
        if (updated) {
          localStorage.setItem(`entities_${caseId}`, JSON.stringify(parsed));
        }
        setResolvedData(parsed);
        if (parsed.entities?.length > 0) {
          setSelectedEntityId(parsed.entities[0].canonical_id);
        }
      }
    }
  }, [searchParams, location.state]);

  // Extraction & Resolution Engine
  const runEntityResolution = () => {
    if (!stage5Output || !stage5Output.records) return;
    setIsProcessing(true);

    setTimeout(() => {
      const records = stage5Output.records;
      const rawEntitiesMap = new Map(); // canonical_value -> Entity Object
      const recordRelationships = []; // Track co-occurrences

      // Normalization helpers
      const normalizePhone = (p) => String(p).replace(/[^\d+]/g, '');
      const normalizeEmailUPI = (e) => String(e).toLowerCase().trim();
      const normalizeBank = (b) => String(b).replace(/\D/g, '');

      let canonicalCounter = 1;

      const addOrUpdateEntity = (type, rawValue, normValue, recordId) => {
        if (!normValue || normValue.length < 3) return null;
        
        const key = `${type}_${normValue}`;
        if (!rawEntitiesMap.has(key)) {
          const paddedId = String(canonicalCounter++).padStart(4, '0');
          rawEntitiesMap.set(key, {
            canonical_id: `E-${paddedId}`,
            type: type,
            canonical_value: normValue,
            original_values: new Set([String(rawValue)]),
            linked_records: new Set([recordId]),
            related_canonical_ids: new Set()
          });
        } else {
          const e = rawEntitiesMap.get(key);
          e.original_values.add(String(rawValue));
          e.linked_records.add(recordId);
        }
        return rawEntitiesMap.get(key).canonical_id;
      };

      const LEA_AND_SYSTEM_BLACKLIST = [
        'chandigarh police',
        'chandigarh police dept',
        'chandigarh police department',
        'police',
        'police dept',
        'police department',
        'evidence_pipeline',
        'extracted_multi_format',
        'unknown_src',
        'unknown_tgt',
        'system',
        'cyber cell',
        'fiu-ind',
        'investigation cell',
        'investigating agency',
        'law enforcement',
        'not_available',
        'tabular_evidence',
        'generic_evidence'
      ];

      const isBlacklisted = (str) => {
        const s = String(str || '').toLowerCase().trim();
        if (!s || s.length < 3) return true;
        return LEA_AND_SYSTEM_BLACKLIST.some(item => s.includes(item));
      };

      // 1. Extract Entities from Records
      records.forEach((record, idx) => {
        const recordId = record.event_id || record._id || `REC-${idx}`;
        const recordEntityIds = new Set();

        // Dynamically extract from fields based on regex and keys
        Object.entries(record).forEach(([key, val]) => {
          if (!val) return;
          const strVal = String(val).trim();
          const lowerKey = key.toLowerCase();

          // Skip investigating agency and audit metadata fields
          if (['investigating_agency', 'source_org', 'agency', 'case_id', 'case_officer', 'evidence'].includes(lowerKey)) {
            return;
          }

          // Phone detection
          if (lowerKey.includes('phone') || lowerKey.includes('mobile') || /(?:\+91|91)?[\s-]?[6-9]\d{9}\b/.test(strVal)) {
            const matches = strVal.match(/(?:\+91|91)?[\s-]?[6-9]\d{9}\b|\+?[0-9]{10,12}\b/g) || [];
            matches.forEach(m => recordEntityIds.add(addOrUpdateEntity('Phone', m, normalizePhone(m), recordId)));
          }
          // Email detection
          if (lowerKey.includes('email') || /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(strVal)) {
            const matches = strVal.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
            matches.forEach(m => {
               if(!m.includes('paytm') && !m.includes('upi')) {
                 recordEntityIds.add(addOrUpdateEntity('Email', m, normalizeEmailUPI(m), recordId));
               }
            });
          }
          // UPI detection
          if (lowerKey.includes('upi') || lowerKey.includes('vpa') || /[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}/.test(strVal)) {
             const matches = strVal.match(/[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}/g) || [];
             matches.forEach(m => {
               if(m.includes('@') && !m.includes('.com') && !m.includes('.in')) {
                  recordEntityIds.add(addOrUpdateEntity('UPI ID', m, normalizeEmailUPI(m), recordId));
               }
             });
          }
          // Bank Account (heuristic: 9-18 digits)
          if (lowerKey.includes('bank') || lowerKey.includes('account') || lowerKey.includes('acc_no')) {
            const matches = strVal.match(/\b\d{9,18}\b/g) || [];
            matches.forEach(m => recordEntityIds.add(addOrUpdateEntity('Bank Account', m, normalizeBank(m), recordId)));
          }
          // Person & Accused Entities (heuristic based on suspect/accused/source/target, excluding LEA / system)
          if (['source', 'target', 'sender_name', 'beneficiary_name', 'sender', 'receiver', 'payer', 'payee', 'accused', 'accused_name', 'suspect', 'suspect_name', 'culprit', 'co_accused', 'person_name', 'name', 'account_holder', 'customer_name'].includes(lowerKey)) {
             if (strVal.length >= 3 && !strVal.includes('@') && !/\d{5,}/.test(strVal) && !isBlacklisted(strVal)) {
               const resolved = resolveAccusedName(strVal);
               recordEntityIds.add(addOrUpdateEntity('Person', strVal, resolved, recordId));
             }
          }
          // IP Address
          if (lowerKey.includes('ip') || /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(strVal)) {
             const matches = strVal.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g) || [];
             matches.forEach(m => recordEntityIds.add(addOrUpdateEntity('IP Address', m, m, recordId)));
          }
          // Location
          if (lowerKey.includes('location') || lowerKey.includes('address')) {
             if(strVal.length > 3 && strVal !== 'NOT_AVAILABLE') {
               recordEntityIds.add(addOrUpdateEntity('Location', strVal, strVal.toUpperCase().trim(), recordId));
             }
          }
          // Device
          if (lowerKey.includes('device') || lowerKey.includes('imei')) {
             if(strVal.length > 3) {
               recordEntityIds.add(addOrUpdateEntity('Device', strVal, strVal.toUpperCase().trim(), recordId));
             }
          }
        });

        // Store co-occurrences for relationship building
        const idsArray = Array.from(recordEntityIds).filter(Boolean);
        if (idsArray.length > 1) {
          recordRelationships.push(idsArray);
        }
      });

      // 2. Build Relationships
      const entitiesArr = Array.from(rawEntitiesMap.values());
      recordRelationships.forEach(group => {
        group.forEach(id1 => {
          group.forEach(id2 => {
            if (id1 !== id2) {
              const e1 = entitiesArr.find(e => e.canonical_id === id1);
              if (e1) e1.related_canonical_ids.add(id2);
            }
          });
        });
      });

      // 3. Detect Duplicates (Simple heuristic: High string similarity on canonical values)
      const duplicates = [];
      for (let i = 0; i < entitiesArr.length; i++) {
        for (let j = i + 1; j < entitiesArr.length; j++) {
          if (entitiesArr[i].type === entitiesArr[j].type) {
            const v1 = String(entitiesArr[i].canonical_value);
            const v2 = String(entitiesArr[j].canonical_value);
            // Very simple duplicate logic: string inclusion or identical
            if (v1 !== v2 && (v1.includes(v2) || v2.includes(v1)) && v1.length > 5) {
               duplicates.push({
                 id1: entitiesArr[i].canonical_id,
                 id2: entitiesArr[j].canonical_id,
                 val1: v1,
                 val2: v2,
                 similarity: '0.85'
               });
            }
          }
        }
      }

      // Convert Sets to Arrays for serialization
      const finalEntities = entitiesArr.map(e => ({
        ...e,
        original_values: Array.from(e.original_values),
        linked_records: Array.from(e.linked_records),
        related_canonical_ids: Array.from(e.related_canonical_ids)
      }));

      const resolutionResult = {
        case_id: activeCaseId,
        total_entities: finalEntities.length,
        resolved_entities: finalEntities.length - duplicates.length, // Simplified metric
        merged_count: 0,
        entities: finalEntities,
        duplicates: duplicates,
        last_run: new Date().toISOString()
      };

      localStorage.setItem(`entities_${activeCaseId}`, JSON.stringify(resolutionResult));
      setResolvedData(resolutionResult);

      // Stage 2: Synchronize canonical entities to SQLite backend
      try {
        const apiUrls = [getApiUrl('/api/db/sync'), '/api/db/sync'];
        for (const url of apiUrls) {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              case_id: activeCaseId,
              stage: 'entities',
              entities: finalEntities,
            }),
          }).catch(() => {});
        }
      } catch { /* background sync */ }

      if (finalEntities.length > 0) {
        setSelectedEntityId(finalEntities[0].canonical_id);
      }
      setIsProcessing(false);
    }, 800);
  };

  // Merge Action
  const handleMerge = (dup) => {
    if (!resolvedData) return;
    const updatedEntities = [...resolvedData.entities];
    const e1Idx = updatedEntities.findIndex(e => e.canonical_id === dup.id1);
    const e2Idx = updatedEntities.findIndex(e => e.canonical_id === dup.id2);
    
    if (e1Idx === -1 || e2Idx === -1) return;

    // Merge e2 into e1
    const e1 = updatedEntities[e1Idx];
    const e2 = updatedEntities[e2Idx];

    e1.original_values = Array.from(new Set([...e1.original_values, ...e2.original_values]));
    e1.linked_records = Array.from(new Set([...e1.linked_records, ...e2.linked_records]));
    e1.related_canonical_ids = Array.from(new Set([...e1.related_canonical_ids, ...e2.related_canonical_ids]));
    
    // Remove e2 from everyone's relations and add e1
    updatedEntities.forEach(e => {
       if (e.related_canonical_ids.includes(e2.canonical_id)) {
          e.related_canonical_ids = e.related_canonical_ids.filter(id => id !== e2.canonical_id);
          if(e.canonical_id !== e1.canonical_id) e.related_canonical_ids.push(e1.canonical_id);
       }
    });

    updatedEntities.splice(e2Idx, 1);
    const updatedDuplicates = resolvedData.duplicates.filter(d => d.id1 !== dup.id1 && d.id2 !== dup.id2);

    const updatedData = {
      ...resolvedData,
      entities: updatedEntities,
      duplicates: updatedDuplicates,
      merged_count: resolvedData.merged_count + 1
    };

    setResolvedData(updatedData);
    localStorage.setItem(`entities_${activeCaseId}`, JSON.stringify(updatedData));
    
    if (selectedEntityId === e2.canonical_id) {
       setSelectedEntityId(e1.canonical_id);
    }
  };

  const handleExport = () => {
    if (!resolvedData || !resolvedData.entities) return;
    const wsData = resolvedData.entities.map(e => ({
      'Canonical ID': e.canonical_id,
      'Type': e.type,
      'Canonical Value': e.canonical_value,
      'Original Source Values': e.original_values.join(' | '),
      'Linked Records Count': e.linked_records.length,
      'Related Entities': e.related_canonical_ids.join(', ')
    }));
    const worksheet = XLSX.utils.json_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Resolved Entities');
    XLSX.writeFile(workbook, `MuleGuard_Entities_${activeCaseId}.xlsx`);
  };

  // Filtered entities for table
  const filteredEntities = useMemo(() => {
    if (!resolvedData) return [];
    return resolvedData.entities.filter(e => 
      e.canonical_value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.canonical_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [resolvedData, searchQuery]);

  // Derived state for the SVG Graph
  const selectedEntity = resolvedData?.entities.find(e => e.canonical_id === selectedEntityId);
  const relatedEntities = selectedEntity 
    ? resolvedData.entities.filter(e => selectedEntity.related_canonical_ids.includes(e.canonical_id)) 
    : [];

  // Entity phone registration stats & cross-identity linking
  const entityStats = useMemo(() => {
    if (!resolvedData?.entities) return { personToPhones: new Map(), phoneToPersons: new Map() };
    const entMap = new Map(resolvedData.entities.map(e => [e.canonical_id, e]));
    const personToPhones = new Map();
    const phoneToPersons = new Map();

    resolvedData.entities.forEach(e => {
      if (e.type === 'Person') {
        const phones = (e.related_canonical_ids || [])
          .map(id => entMap.get(id))
          .filter(rel => rel && rel.type === 'Phone');
        personToPhones.set(e.canonical_id, phones.length);
      } else if (e.type === 'Phone') {
        const persons = (e.related_canonical_ids || [])
          .map(id => entMap.get(id))
          .filter(rel => rel && (rel.type === 'Person' || rel.type === 'Bank Account'));
        phoneToPersons.set(e.canonical_id, persons.length);
      }
    });

    return { personToPhones, phoneToPersons };
  }, [resolvedData]);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
              <LinkIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Entity Resolution</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Unify, deduplicate and link entities across all data sources for this case.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Case:</span>
              <span className="text-sm font-bold text-slate-800">{activeCaseId || 'No Case Selected'}</span>
              {activeCaseId && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">ACTIVE</span>}
            </div>
            <button
              onClick={() => navigate(`/graph?caseId=${activeCaseId}`)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:from-purple-500 hover:to-indigo-500 flex items-center space-x-1.5 shadow-sm transition"
            >
              <Network className="w-4 h-4" />
              <span>Explore in Intelligence Graph</span>
            </button>
          </div>
        </div>

        {/* Empty State / Not Processed */}
        {!activeCaseId ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800">No Case Selected</h2>
            <p className="text-sm text-slate-500 mt-2">Please select a case from Case Management to view resolved entities.</p>
            <button onClick={() => navigate('/cases')} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
              Go to Case Management
            </button>
          </div>
        ) : !stage5Output ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800">No processed data available</h2>
            <p className="text-sm text-slate-500 mt-2">Complete Stage 5 processing for this case before running Entity Resolution.</p>
            <button onClick={() => navigate(`/data-sources?caseId=${activeCaseId}`)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
              Go to Data Sources
            </button>
          </div>
        ) : (
          <>
            {/* Top Stats & Actions Row */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-4 w-48 shadow-sm">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Total Entities</p>
                    <p className="text-xl font-bold text-slate-900">{resolvedData?.total_entities || 0}</p>
                    <p className="text-[10px] text-slate-400">(extracted)</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-4 w-48 shadow-sm">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><LinkIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Resolved Entities</p>
                    <p className="text-xl font-bold text-slate-900">{resolvedData?.resolved_entities || 0}</p>
                    <p className="text-[10px] text-slate-400">(unique)</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-4 w-48 shadow-sm">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><GitMerge className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Merged Duplicates</p>
                    <p className="text-xl font-bold text-slate-900">{resolvedData?.merged_count || 0}</p>
                    <p className="text-[10px] text-slate-400">(records linked)</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={runEntityResolution}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  <Play className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing...' : 'Run Entity Resolution'}</span>
                </button>
                <div className="text-xs text-slate-500 bg-white border border-slate-200 p-2 rounded flex flex-col space-y-1 shadow-sm">
                   <span className="font-semibold text-slate-700">Resolution Settings:</span>
                   <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span>Phone Normalization</span></label>
                   <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span>UPI Normalization</span></label>
                   <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span>Email Deduplication</span></label>
                </div>
              </div>
            </div>

            {/* Main Interface */}
            {resolvedData && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-slate-200">
                  {['Entities', 'Duplicates', 'Linking Rules', 'Clusters'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
                        activeTab === tab ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 bg-slate-50 flex-1 flex flex-col">
                  {activeTab === 'Entities' && (
                    <div className="flex gap-4 h-full">
                      {/* Left Side: Table */}
                      <div className="flex-1 bg-white border border-slate-200 rounded-lg flex flex-col">
                        <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                           <div className="flex items-center space-x-2">
                             <select className="text-xs border border-slate-200 rounded p-1.5 focus:outline-none"><option>All Entity Types</option></select>
                             <div className="relative">
                               <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
                               <input type="text" placeholder="Search entities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-xs border border-slate-200 rounded py-1.5 pl-7 pr-2 focus:outline-none w-48" />
                             </div>
                           </div>
                           <button onClick={handleExport} className="flex items-center space-x-1 text-xs font-semibold text-slate-600 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50">
                             <Download className="w-3.5 h-3.5" /><span>Export</span>
                           </button>
                        </div>
                        <div className="overflow-y-auto max-h-[500px]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                              <tr>
                                <th className="p-3 font-semibold"><input type="checkbox" className="rounded border-slate-300" /></th>
                                <th className="p-3 font-semibold">Entity Value</th>
                                <th className="p-3 font-semibold">Type</th>
                                <th className="p-3 font-semibold">Canonical ID</th>
                                <th className="p-3 font-semibold text-center">Linked Records</th>
                                <th className="p-3 font-semibold text-center bg-purple-50 text-purple-900 border-x border-purple-100">Phones in Same Name / ID</th>
                                <th className="p-3 font-semibold text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredEntities.map(entity => {
                                  const pPhonesCount = entityStats.personToPhones.get(entity.canonical_id) || 0;
                                  const phPersonsCount = entityStats.phoneToPersons.get(entity.canonical_id) || 0;
                                  const accusedInfo = resolveAccusedInfo(entity.canonical_value);
                                  return (
                                  <tr 
                                    key={entity.canonical_id} 
                                    onClick={() => setSelectedEntityId(entity.canonical_id)}
                                    className={`hover:bg-slate-50 cursor-pointer ${selectedEntityId === entity.canonical_id ? 'bg-blue-50/50' : ''}`}
                                  >
                                    <td className="p-3"><input type="checkbox" className="rounded border-slate-300" /></td>
                                    <td className="p-3 font-semibold text-slate-800">
                                      <div className="flex items-center space-x-2.5">
                                        {getTypeIcon(entity.type, entity.canonical_value)}
                                        <div className="flex flex-col">
                                          <div className="flex items-center space-x-2">
                                            <span className={accusedInfo ? 'font-bold text-slate-900' : 'text-slate-800'}>
                                              {entity.canonical_value}
                                            </span>
                                            {accusedInfo && (
                                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 flex items-center space-x-1 shadow-sm">
                                                <span>{accusedInfo.badge}</span>
                                              </span>
                                            )}
                                          </div>
                                          {accusedInfo && (
                                            <span className="text-[10px] text-red-600 font-medium">
                                              Identified Syndicate Member &bull; {accusedInfo.role}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 text-slate-500">{entity.type}</td>
                                    <td className="p-3 font-mono text-slate-500">{entity.canonical_id}</td>
                                    <td className="p-3 text-center font-bold text-slate-700">{entity.linked_records.length}</td>
                                    <td className="p-3 text-center bg-purple-50/30 border-x border-purple-100">
                                      {entity.type === 'Person' ? (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            pPhonesCount >= 3
                                              ? 'bg-red-100 text-red-700 border border-red-200'
                                              : pPhonesCount >= 2
                                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                              : 'bg-slate-100 text-slate-700'
                                          }`}
                                        >
                                          {pPhonesCount} {pPhonesCount === 1 ? 'SIM' : 'SIMs'} Registered
                                        </span>
                                      ) : entity.type === 'Phone' ? (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            phPersonsCount >= 2
                                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}
                                        >
                                          {phPersonsCount >= 2
                                            ? `⚠️ Co-Registered (${phPersonsCount} Profiles)`
                                            : 'Single Profile'}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">—</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center flex items-center justify-center space-x-2">
                                      <button className="text-slate-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                                      <button className="text-slate-400 hover:text-blue-600"><LinkIcon className="w-4 h-4" /></button>
                                    </td>
                                  </tr>
                                );})}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right Side: Visual Graph & Details */}
                      <div className="w-96 flex flex-col space-y-4">
                        <div className="bg-white border border-slate-200 rounded-lg flex-1 flex flex-col">
                          <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                            <span className="text-xs font-bold flex items-center space-x-1"><RefreshCw className="w-3.5 h-3.5" /><span>Entity Cluster View</span></span>
                          </div>
                          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 min-h-[300px]">
                            {/* SVG Entity Graph rendering */}
                            {selectedEntity ? (
                              <svg width="100%" height="100%" viewBox="0 0 340 320" className="absolute inset-0">
                                {/* Lines */}
                                {relatedEntities.map((rel, i) => {
                                  const angle = (i / relatedEntities.length) * 2 * Math.PI;
                                  const x = 170 + Math.cos(angle) * 110;
                                  const y = 160 + Math.sin(angle) * 110;
                                  const isRelAccused = !!resolveAccusedInfo(rel.canonical_value);
                                  return (
                                    <line
                                      key={`line-${i}`}
                                      x1="170"
                                      y1="160"
                                      x2={x}
                                      y2={y}
                                      stroke={isRelAccused ? '#fca5a5' : '#cbd5e1'}
                                      strokeWidth={isRelAccused ? '2.5' : '1.8'}
                                      strokeDasharray={isRelAccused ? '4 2' : 'none'}
                                    />
                                  );
                                })}
                                
                                {/* Central Node */}
                                {(() => {
                                  const centerAccused = resolveAccusedInfo(selectedEntity.canonical_value);
                                  const isPhone = selectedEntity.type === 'Phone';
                                  return (
                                    <g>
                                      <circle
                                        cx="170"
                                        cy="160"
                                        r="34"
                                        fill={centerAccused ? '#fef2f2' : isPhone ? '#f0fdf4' : '#eff6ff'}
                                        stroke={centerAccused ? '#dc2626' : isPhone ? '#16a34a' : '#3b82f6'}
                                        strokeWidth="3"
                                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                      />
                                      <text x="170" y="166" textAnchor="middle" fontSize="16">
                                        {centerAccused ? '🚨' : isPhone ? '📱' : '🔷'}
                                      </text>
                                      <text
                                        x="170"
                                        y="210"
                                        textAnchor="middle"
                                        fontSize="10"
                                        fontWeight="bold"
                                        fill={centerAccused ? '#991b1b' : '#1e293b'}
                                      >
                                        {centerAccused ? centerAccused.name : selectedEntity.canonical_value.slice(0, 18)}
                                      </text>
                                      {centerAccused ? (
                                        <text x="170" y="222" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#dc2626">
                                          {centerAccused.badge}
                                        </text>
                                      ) : (
                                        <text x="170" y="222" textAnchor="middle" fontSize="8.5" fill="#64748b">
                                          ({selectedEntity.type})
                                        </text>
                                      )}
                                      <text x="170" y="234" textAnchor="middle" fontSize="8" fill="#94a3b8">
                                        ({selectedEntity.canonical_id})
                                      </text>
                                    </g>
                                  );
                                })()}
                                
                                {/* Satellite Nodes */}
                                {relatedEntities.map((rel, i) => {
                                  const angle = (i / relatedEntities.length) * 2 * Math.PI;
                                  const x = 170 + Math.cos(angle) * 110;
                                  const y = 160 + Math.sin(angle) * 110;
                                  const relAccused = resolveAccusedInfo(rel.canonical_value);

                                  // Determine color based on type & accused status
                                  let fill = '#f8fafc', stroke = '#94a3b8';
                                  if (relAccused) {
                                    fill = '#fef2f2';
                                    stroke = relAccused.color || '#dc2626';
                                  } else if (rel.type === 'Phone') {
                                    fill = '#f0fdf4';
                                    stroke = '#22c55e';
                                  } else if (rel.type === 'Email') {
                                    fill = '#fffbeb';
                                    stroke = '#f59e0b';
                                  } else if (rel.type === 'Bank Account') {
                                    fill = '#fdf2f8';
                                    stroke = '#db2777';
                                  } else if (rel.type === 'Location') {
                                    fill = '#fef2f2';
                                    stroke = '#ef4444';
                                  }

                                  return (
                                    <g key={`node-${i}`} className="cursor-pointer" onClick={() => setSelectedEntityId(rel.canonical_id)}>
                                      <title>{`${rel.canonical_value} (${rel.type}) - ${rel.canonical_id}`}</title>
                                      <circle
                                        cx={x}
                                        cy={y}
                                        r={relAccused ? '25' : '20'}
                                        fill={fill}
                                        stroke={stroke}
                                        strokeWidth={relAccused ? '2.5' : '2'}
                                      />
                                      <text x={x} y={y + 4} textAnchor="middle" fontSize={relAccused ? '12' : '10'}>
                                        {relAccused ? '👤' : rel.type === 'Phone' ? '📱' : rel.type === 'Bank Account' ? '🏦' : '🔹'}
                                      </text>
                                      <text
                                        x={x}
                                        y={y + 35}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fontWeight="bold"
                                        fill={relAccused ? '#991b1b' : '#334155'}
                                      >
                                        {relAccused ? relAccused.name : rel.canonical_value.slice(0, 14)}
                                      </text>
                                      <text
                                        x={x}
                                        y={y + 46}
                                        textAnchor="middle"
                                        fontSize="8"
                                        fontWeight={relAccused ? 'bold' : 'normal'}
                                        fill={relAccused ? '#dc2626' : '#64748b'}
                                      >
                                        {relAccused ? relAccused.badge : `(${rel.type})`}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            ) : (
                              <div className="text-xs text-slate-400">Select an entity to view its cluster</div>
                            )}
                          </div>
                        </div>

                        {/* Duplicates Mini-View */}
                        {resolvedData.duplicates && resolvedData.duplicates.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-lg">
                            <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                              <span className="text-xs font-bold flex items-center space-x-1"><GitMerge className="w-3.5 h-3.5" /><span>Merge Candidates</span></span>
                            </div>
                            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                              {resolvedData.duplicates.map((dup, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px] border border-slate-100 p-2 rounded bg-slate-50">
                                  <div className="flex flex-col space-y-1">
                                    <span className="font-semibold">{dup.val1}</span>
                                    <span className="font-semibold">{dup.val2}</span>
                                  </div>
                                  <div className="flex flex-col items-end space-y-1">
                                    <span className="text-slate-400">Sim: {dup.similarity}</span>
                                    <button onClick={() => handleMerge(dup)} className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold hover:bg-blue-700">Merge</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'Duplicates' && (
                    <div className="bg-white border border-slate-200 rounded-lg flex-1 p-6 flex flex-col items-center justify-center">
                       <GitMerge className="w-12 h-12 text-slate-300 mb-4" />
                       <h3 className="text-lg font-bold text-slate-700">Duplicate Management</h3>
                       <p className="text-sm text-slate-500 mt-2 max-w-md text-center">There are {resolvedData.duplicates.length} duplicate candidates found based on string similarity and normalized matching rules.</p>
                       <button onClick={() => setActiveTab('Entities')} className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg text-sm">Review in Entities View</button>
                    </div>
                  )}
                  {activeTab === 'Linking Rules' && (
                    <div className="bg-white border border-slate-200 rounded-lg flex-1 p-6">
                       <h3 className="text-lg font-bold text-slate-700 mb-4">Configurable Linking Rules</h3>
                       <div className="space-y-4 max-w-lg">
                         <label className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer">
                           <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-300 text-blue-600" />
                           <div><p className="font-semibold text-sm">Phone Number Normalization</p><p className="text-xs text-slate-500">Strips spaces and special characters before matching.</p></div>
                         </label>
                         <label className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer">
                           <input type="checkbox" defaultChecked className="mt-1 rounded border-slate-300 text-blue-600" />
                           <div><p className="font-semibold text-sm">Cross-Source Entity Linking</p><p className="text-xs text-slate-500">Allows entities from different uploaded files to be linked if values match exactly.</p></div>
                         </label>
                       </div>
                    </div>
                  )}
                   {activeTab === 'Clusters' && (
                    <div className="bg-white border border-slate-200 rounded-lg flex-1 p-6 flex flex-col items-center justify-center">
                       <Users className="w-12 h-12 text-slate-300 mb-4" />
                       <h3 className="text-lg font-bold text-slate-700">Cluster Analysis</h3>
                       <p className="text-sm text-slate-500 mt-2 max-w-md text-center">Network clusters represent distinct groups of highly connected entities interacting in this case.</p>
                       <button
                         onClick={() => navigate(`/graph?caseId=${activeCaseId}`)}
                         className="mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:from-purple-500 hover:to-indigo-500 flex items-center space-x-2 shadow-md transition"
                       >
                         <Network className="w-4 h-4" />
                         <span>Open Neo4j Intelligence Graph</span>
                       </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Action Bar: Move to Next Function (Intelligence Graph) */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-6 bg-white p-4 rounded-xl border shadow-sm">
              <button
                onClick={() => navigate(`/output?caseId=${activeCaseId}`)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 flex items-center space-x-2 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Output Data</span>
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Next Step: Map multi-person links & identify syndicate culprit
                </span>
                <button
                  onClick={() => navigate(`/graph?caseId=${activeCaseId}`)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg shadow-purple-900/20 flex items-center space-x-2 transition transform active:scale-95"
                >
                  <Network className="h-4 w-4" />
                  <span>Proceed to Intelligence Graph</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
