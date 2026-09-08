import sqlite3
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "muleguard.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes SQLite schema for permanent crime investigation storage."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Cases Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            case_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            officer TEXT,
            rank TEXT,
            department TEXT,
            branch TEXT,
            fir_no TEXT,
            location TEXT,
            incident_date TEXT,
            priority TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Open',
            created_at TEXT
        )
    """)

    # 2. Evidence Records Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evidence_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            event_id TEXT,
            type TEXT,
            source TEXT,
            target TEXT,
            timestamp TEXT,
            location TEXT,
            extracted_text TEXT,
            source_file TEXT,
            raw_json TEXT,
            created_at TEXT,
            FOREIGN KEY (case_id) REFERENCES cases(case_id)
        )
    """)

    # 3. Canonical Entities Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            canonical_id TEXT NOT NULL,
            canonical_value TEXT,
            entity_type TEXT,
            risk_score REAL DEFAULT 0.0,
            confidence REAL DEFAULT 1.0,
            data_json TEXT,
            created_at TEXT,
            FOREIGN KEY (case_id) REFERENCES cases(case_id)
        )
    """)

    # 4. Pipeline Stages State Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pipeline_stages (
            case_id TEXT NOT NULL,
            stage TEXT NOT NULL,
            records_count INTEGER DEFAULT 0,
            data_json TEXT,
            updated_at TEXT,
            PRIMARY KEY (case_id, stage)
        )
    """)

    # 5. Chain of Custody Logs Table (BSA Sec 63 / 65B Admissibility)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS custody_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            step_number INTEGER,
            action TEXT NOT NULL,
            actor TEXT NOT NULL,
            role TEXT,
            organization TEXT,
            timestamp TEXT,
            sha256_hash TEXT,
            status TEXT DEFAULT 'Verified',
            notes TEXT,
            created_at TEXT,
            FOREIGN KEY (case_id) REFERENCES cases(case_id)
        )
    """)

    # Seed Default Cases if table is empty
    cursor.execute("SELECT COUNT(*) as cnt FROM cases")
    row = cursor.fetchone()
    if row and row["cnt"] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO cases (case_id, title, description, officer, rank, department, branch, fir_no, location, incident_date, priority, status, created_at)
            VALUES 
            (
                'MG-2026-1024',
                'Phishing Network Investigation - Axis Bank Mules',
                'Investigation into organized cyber financial fraud ring utilizing fake KYC accounts across Chandigarh region.',
                'Inspector Raj', 'Inspector', 'Cyber Crime Cell', 'Sector 17, Chandigarh', 'FIR-045/2026', 'Chandigarh Central', '2026-02-14', 'High', 'In Progress', ?
            ),
            (
                'MG-2026-1025',
                'UPI Layering Fraud & Money Laundering',
                'Rapid movement of stolen funds through multiple fast-node UPI VPAs within short time windows.',
                'SI Vikram Sharma', 'Sub-Inspector', 'Economic Offences Wing', 'Mohali Phase 7', 'FIR-102/2026', 'Mohali', '2026-03-01', 'Medium', 'Open', ?
            )
        """, (now_str, now_str))

    conn.commit()
    conn.close()


def save_case(case_data: Dict[str, Any]) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO cases (case_id, title, description, officer, rank, department, branch, fir_no, location, incident_date, priority, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(case_id) DO UPDATE SET
            title=excluded.title,
            description=excluded.description,
            officer=excluded.officer,
            rank=excluded.rank,
            department=excluded.department,
            branch=excluded.branch,
            fir_no=excluded.fir_no,
            location=excluded.location,
            incident_date=excluded.incident_date,
            priority=excluded.priority,
            status=excluded.status
    """, (
        case_data.get("case_id"),
        case_data.get("title", "Untitled Case"),
        case_data.get("description", ""),
        case_data.get("officer", "Inspector"),
        case_data.get("rank", "Inspector"),
        case_data.get("department", "Cyber Crime Cell"),
        case_data.get("branch", "HQ"),
        case_data.get("fir_no", ""),
        case_data.get("location", "Chandigarh"),
        case_data.get("incident_date", now_str[:10]),
        case_data.get("priority", "Medium"),
        case_data.get("status", "Open"),
        case_data.get("created_at", now_str),
    ))
    conn.commit()
    conn.close()
    return True


def save_pipeline_records(case_id: str, records: List[Dict[str, Any]], stage: str = "output") -> int:
    if not records:
        return 0

    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Update pipeline stage snapshot
    cursor.execute("""
        INSERT INTO pipeline_stages (case_id, stage, records_count, data_json, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(case_id, stage) DO UPDATE SET
            records_count=excluded.records_count,
            data_json=excluded.data_json,
            updated_at=excluded.updated_at
    """, (case_id, stage, len(records), json.dumps(records), now_str))

    # Insert individual records
    saved_count = 0
    for r in records:
        cursor.execute("""
            INSERT INTO evidence_records (case_id, event_id, type, source, target, timestamp, location, extracted_text, source_file, raw_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            case_id,
            r.get("event_id"),
            r.get("type", "UNKNOWN"),
            r.get("source", ""),
            r.get("target", ""),
            r.get("timestamp", now_str),
            r.get("location", ""),
            r.get("extracted_text", ""),
            r.get("source_file", r.get("evidence", {}).get("file_name", "")),
            json.dumps(r),
            now_str,
        ))
        saved_count += 1

    conn.commit()
    conn.close()
    return saved_count


def save_entities(case_id: str, entities: List[Dict[str, Any]]) -> int:
    if not entities:
        return 0

    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Clear previous resolved entities for this case to avoid duplication
    cursor.execute("DELETE FROM entities WHERE case_id = ?", (case_id,))

    saved_count = 0
    for e in entities:
        cursor.execute("""
            INSERT INTO entities (case_id, canonical_id, canonical_value, entity_type, risk_score, confidence, data_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            case_id,
            e.get("canonical_id", f"ENT-{saved_count+1}"),
            e.get("canonical_value") or e.get("name") or "",
            e.get("type") or e.get("entity_type") or "SUSPECT",
            float(e.get("risk_score") or e.get("score") or 0.0),
            float(e.get("confidence") or 1.0),
            json.dumps(e),
            now_str,
        ))
        saved_count += 1

    conn.commit()
    conn.close()
    return saved_count


def get_case(case_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_cases() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cases ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_case_evidence(case_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evidence_records WHERE case_id = ? ORDER BY timestamp ASC", (case_id,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("raw_json"):
            try:
                d["payload"] = json.loads(d["raw_json"])
            except Exception:
                pass
        result.append(d)
    return result


def get_case_entities(case_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM entities WHERE case_id = ?", (case_id,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("data_json"):
            try:
                d["entity_details"] = json.loads(d["data_json"])
            except Exception:
                pass
        result.append(d)
    return result


def get_custody_logs(case_id: str) -> List[Dict[str, Any]]:
    """Retrieves chronological chain of custody handover logs for a case."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM custody_logs WHERE case_id = ? ORDER BY step_number ASC, timestamp ASC", (case_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_custody_log(case_id: str, entry: Dict[str, Any]) -> bool:
    """Appends an immutable chain of custody log entry into SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO custody_logs (case_id, step_number, action, actor, role, organization, timestamp, sha256_hash, status, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        entry.get("step_number", 1),
        entry.get("action", "Verified"),
        entry.get("actor", "Inspector Vijay"),
        entry.get("role", "Field Officer"),
        entry.get("organization", "Cyber Crime Cell"),
        entry.get("timestamp", now_str),
        entry.get("sha256_hash", "a3f5e72c3b8f4b8d9e7c2f1a9b6e3d5c7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"),
        entry.get("status", "Verified"),
        entry.get("notes", ""),
        now_str
    ))
    conn.commit()
    conn.close()
    return True

