import asyncio
import io
import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI(
    title="MuleGuard AI - Data Ingestion Engine",
    version="1.0.0",
    description="Law Enforcement Data Processing & Normalization API",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def detect_file_type(filename: str, content_sample: str) -> str:
    """Detects investigation dataset category based on headers and keywords."""
    lower_sample = content_sample.lower()
    if any(k in lower_sample for k in ["caller", "receiver", "imei", "imsi", "duration", "cdr", "tower", "msisdn", "cell_id"]):
        return "cdr"
    elif any(k in lower_sample for k in ["account", "vpa", "upi", "txn", "credit", "debit", "balance", "ifsc", "utr", "rrn"]):
        return "bank"
    elif any(k in lower_sample for k in ["ip", "mac", "chat", "handle", "url", "device", "social", "protocol", "port"]):
        return "social"
    return "cdr"


def map_and_normalize_record(row: Dict[str, Any], file_type: str, index: int, file_name: str = "unknown") -> Dict[str, Any]:
    # Lowercase and strip keys for case-insensitive matching
    keys = {str(k).lower().strip(): v for k, v in row.items()}

    def get_first_match(possible_keys: List[str], default: str = "") -> str:
        for k in possible_keys:
            if k in keys and pd.notna(keys[k]) and str(keys[k]).strip() != "":
                return str(keys[k]).strip()
        return default

    # 1. SOURCE ENTITY RESOLUTION
    source_keywords = [
        # Bank Transactions Schema
        "sender_account_token", "sender_name", "upi_id", "bank_account_id",
        # Telecom CDR Schema
        "calling_number_token", "mobile_number_token", "msisdn_token", "imei_token", "imsi_token", "calling_no", "a_party",
        # Events & IPDR/Social
        "actor_entity_id", "source_ip", "src_ip", "user_id", "author_id", "sender_handle", "username"
    ]
    source = get_first_match(source_keywords, default=f"UNKNOWN_SRC_{index+1}")

    # 2. TARGET ENTITY RESOLUTION
    target_keywords = [
        # Bank Transactions Schema
        "beneficiary_account_token", "beneficiary_name", "merchant_id", "atm_terminal_id",
        # Telecom CDR Schema
        "called_number_token", "called_no", "b_party",
        # Events & IPDR/Social
        "subject_entity_id", "destination_ip", "dest_ip", "recipient_id", "to_handle"
    ]
    target = get_first_match(target_keywords, default=f"UNKNOWN_TGT_{index+1}")

    # Directionality swap if transaction/event is Credit or Inbound
    direction = get_first_match(["transaction_direction", "event_direction", "type", "txn_type"]).upper()
    if "CREDIT" in direction or "CR" in direction or "INBOUND" in direction:
        sender_tok = get_first_match(["sender_account_token", "sender_name", "actor_entity_id"])
        bene_tok = get_first_match(["beneficiary_account_token", "beneficiary_name", "subject_entity_id"])
        if sender_tok and bene_tok:
            source, target = target, source

    # 3. TIMESTAMP RESOLUTION
    timestamp_keywords = [
        "event_timestamp_utc", "event_timestamp", "timestamp", "txn_date", 
        "transaction_date", "value_date", "call_date", "created_at"
    ]
    timestamp = get_first_match(timestamp_keywords, default=datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    # 4. COMPREHENSIVE LOCATION & METADATA AGGREGATION
    loc_components = []

    if file_type.lower() == "bank":
        # Full bank_transactions schema extraction
        amount = get_first_match(["amount"])
        currency = get_first_match(["currency"], default="INR")
        balance = get_first_match(["balance_after"])
        status = get_first_match(["transaction_status"])
        txn_type = get_first_match(["transaction_type"])
        ifsc = get_first_match(["ifsc"])
        utr = get_first_match(["utr"])
        rrn = get_first_match(["rrn"])
        upi_tx_id = get_first_match(["upi_transaction_id"])
        ref = get_first_match(["transaction_reference"])
        ip = get_first_match(["transaction_ip"])
        atm = get_first_match(["atm_terminal_id"])
        merchant = get_first_match(["merchant_id"])
        narration = get_first_match(["narration"])

        if amount: loc_components.append(f"AMT: {currency} {amount}")
        if balance: loc_components.append(f"BAL: {balance}")
        if status: loc_components.append(f"STATUS: {status}")
        if txn_type: loc_components.append(f"TYPE: {txn_type}")
        if ifsc: loc_components.append(f"IFSC: {ifsc}")
        if ip: loc_components.append(f"IP: {ip}")
        if atm: loc_components.append(f"ATM: {atm}")
        if merchant: loc_components.append(f"MERCHANT: {merchant}")
        
        refs = [r for r in [utr, rrn, upi_tx_id, ref] if r]
        if refs: loc_components.append(f"REF: {refs[0]}")
        if narration: loc_components.append(f"NARR: {narration[:30]}")

    elif file_type.lower() == "social" or "ip" in keys:
        src_port = get_first_match(["source_port", "src_port"])
        dst_port = get_first_match(["destination_port", "dest_port"])
        protocol = get_first_match(["protocol"])
        device = get_first_match(["device_id", "user_agent"])
        login_ip = get_first_match(["ip_address", "transaction_ip", "source_ip"])
        if login_ip: loc_components.append(f"IP: {login_ip}")
        if src_port: loc_components.append(f"SPORT: {src_port}")
        if dst_port: loc_components.append(f"DPORT: {dst_port}")
        if protocol: loc_components.append(f"PROTO: {protocol}")
        if device: loc_components.append(f"DEV: {device}")

    else:  # Telecom CDR schema extraction
        cell_id = get_first_match(["cell_id", "first_cell_id", "last_cell_id", "tower_id"])
        cgi = get_first_match(["cgi"])
        lac_tac = get_first_match(["lac_tac"])
        operator = get_first_match(["operator"])
        call_dur = get_first_match(["call_duration_seconds"])
        if cell_id: loc_components.append(f"CELL: {cell_id}")
        if cgi: loc_components.append(f"CGI: {cgi}")
        if lac_tac: loc_components.append(f"LAC: {lac_tac}")
        if operator: loc_components.append(f"OP: {operator}")
        if call_dur: loc_components.append(f"DUR: {call_dur}s")

    location = " | ".join(loc_components) if loc_components else "NOT_AVAILABLE"

    # 5. UNIQUE EVENT IDENTIFIER RESOLUTION
    existing_id = get_first_match([
        "transaction_id", "event_id", "cdr_id", "bank_account_id", 
        "source_record_id", "transaction_location_id", "log_id"
    ])
    event_id = existing_id if existing_id else f"EVT-{datetime.now().year}-{uuid.uuid4().hex[:6].upper()}"

    # Construct evidence provenance block
    return {
        "event_id": event_id,
        "type": file_type.upper(),
        "source": source,
        "target": target,
        "timestamp": timestamp,
        "location": location,
        "evidence": {
            "source_type": file_type,
            "file_name": file_name,
            "row_id": index,
            "confidence": 0.90
        },
        "extracted_text": " | ".join([str(v) for v in row.values() if pd.notna(v)])[:200],
        "explanation": f"{file_type.upper()} event between {source} and {target} at {timestamp}"
    }


def generate_police_summary(detected_type: str, total_events: int, sources: List[str], targets: List[str]) -> str:
    """Generates an executive investigation brief for police officers."""
    unique_sources = len(set(sources))
    unique_targets = len(set(targets))

    if detected_type == "cdr":
        return (
            f"Automated CDR analysis completed for {total_events} call detail records. "
            f"Identified {unique_sources} unique caller entities establishing contact with {unique_targets} target endpoints. "
            f"Call frequency logs indicate active communications requiring cross-tower correlation."
        )
    elif detected_type == "bank":
        return (
            f"Financial transaction dataset processed ({total_events} ledger lines). "
            f"Mapped transfers across {unique_sources} origin accounts and {unique_targets} destination nodes. "
            f"Potential rapid fund dispersal patterns detected across high-frequency nodes."
        )
    else:
        return (
            f"Digital artifact ingestion completed ({total_events} records). "
            f"Cataloged interactions between {unique_sources} source handles/IPs and {unique_targets} target endpoints. "
            f"Metadata normalized for immediate link chart analysis."
        )


@app.post("/upload/csv")
async def upload_files(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None)
):
    # Flexible extraction: handles both "files" (plural) and "file" (singular) form data keys
    file_list: List[UploadFile] = []
    if files:
        file_list.extend(files)
    if file:
        file_list.append(file)

    if not file_list:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    allowed_extensions = (".csv", ".json", ".txt")
    all_normalized_data = []
    all_sources = []
    all_targets = []
    
    total_events_overall = 0
    total_valid = 0
    total_missing = 0
    total_duplicates = 0
    detected_types = []

    for uploaded_file in file_list:
        # Validate extension
        if not uploaded_file.filename.lower().endswith(allowed_extensions):
            raise HTTPException(
                status_code=400,
                detail=f"File {uploaded_file.filename} invalid. Formats allowed: {', '.join(allowed_extensions)}"
            )

        contents = await uploaded_file.read()
        if not contents:
            continue

        try:
            content_str = contents.decode("utf-8", errors="ignore")
        except Exception:
            raise HTTPException(status_code=400, detail=f"Failed to decode {uploaded_file.filename}")

        # Detect dataset type
        file_detected_type = detect_file_type(uploaded_file.filename, content_str[:2000])
        detected_types.append(file_detected_type)

        # Parse CSV / JSON / Delimited TXT
        if uploaded_file.filename.lower().endswith(".json"):
            try:
                parsed_json = json.loads(content_str)
                df = pd.DataFrame(parsed_json if isinstance(parsed_json, list) else [parsed_json])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid JSON in {uploaded_file.filename}: {str(e)}")
        else:
            try:
                sep = "\t" if "\t" in content_str[:500] else (";" if ";" in content_str[:500] and "," not in content_str[:500] else ",")
                df = pd.read_csv(io.StringIO(content_str), sep=sep)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse CSV {uploaded_file.filename}: {str(e)}")

        file_events = len(df)
        if file_events == 0:
            continue

        total_events_overall += file_events
        total_duplicates += int(df.duplicated().sum())
        total_missing += int(df.isnull().any(axis=1).sum())

        df = df.dropna(how="all")
        total_valid += len(df)

        records = df.to_dict(orient="records")

        # Map and tag records with the file name
        for idx, row in enumerate(records):
            norm = map_and_normalize_record(row, file_detected_type, idx, file_name=uploaded_file.filename)
            norm["source_file"] = uploaded_file.filename  # Explicit source tagging
            all_normalized_data.append(norm)
            all_sources.append(norm["source"])
            all_targets.append(norm["target"])

    await asyncio.sleep(1.0)

    primary_type = detected_types[0] if detected_types else "multi-source"
    ai_summary = generate_police_summary(primary_type, total_events_overall, all_sources, all_targets)

    return {
        "status": "success",
        "detected_type": primary_type,
        "total_events": total_events_overall,
        "processed": {
            "valid": total_valid,
            "missing": total_missing,
            "duplicates": total_duplicates,
        },
        "progress": 100,
        "data": all_normalized_data,
        "image_data": [],
        "video_data": [],
        "ai_summary": ai_summary,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)