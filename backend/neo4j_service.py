import os
from typing import Any, Dict, List, Optional
from neo4j import GraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")


def get_neo4j_driver():
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD), connection_timeout=3.0)
        driver.verify_connectivity()
        return driver
    except Exception:
        return None


def test_neo4j_status() -> Dict[str, Any]:
    driver = get_neo4j_driver()
    if driver:
        driver.close()
        return {
            "online": True,
            "uri": NEO4J_URI,
            "message": "Connected to live Neo4j database instance"
        }
    return {
        "online": False,
        "uri": NEO4J_URI,
        "message": f"Neo4j database instance offline at {NEO4J_URI}. Cypher script generation available."
    }


def generate_cypher_script(case_id: str, records: List[Dict[str, Any]], entities: List[Dict[str, Any]]) -> str:
    """Generates pure Cypher statements to import case evidence into Neo4j."""
    lines = [
        f"// ========================================================",
        f"// MuleGuard AI - Automated Neo4j Cypher Import Script",
        f"// Case ID: {case_id}",
        f"// Generated on: {os.getenv('COMPUTERNAME', 'MuleGuard-System')}",
        f"// ========================================================\n",
        "// Create Unique Constraints",
        "CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;\n",
    ]

    # 1. Node Creation for Canonical Entities
    lines.append("// 1. Merge Canonical Entities")
    for idx, e in enumerate(entities):
        cid = str(e.get("canonical_id") or f"ENT-{idx+1}").replace("'", "\\'")
        cval = str(e.get("canonical_value") or e.get("name") or cid).replace("'", "\\'")
        etype = str(e.get("type") or e.get("entity_type") or "SUSPECT").upper().replace(" ", "_")
        score = float(e.get("risk_score") or e.get("score") or 0.0)

        lines.append(
            f"MERGE (e:Entity {{id: '{cid}', case_id: '{case_id}'}}) "
            f"ON CREATE SET e.name = '{cval}', e.type = '{etype}', e.risk_score = {score};"
        )

    # 2. Relationship Creation for Ingested Evidence
    lines.append("\n// 2. Merge Evidence Transactions & Links")
    for idx, r in enumerate(records):
        src = str(r.get("source") or "").strip().replace("'", "\\'")
        tgt = str(r.get("target") or "").strip().replace("'", "\\'")
        if not src or not tgt or src == "UNKNOWN_SRC" or tgt == "UNKNOWN_TGT":
            continue

        raw = r.get("raw") or r
        amt = str(raw.get("amount") or r.get("amount") or "0").replace(",", "").replace("₹", "").strip()
        ts = str(r.get("timestamp") or "").replace("'", "\\'")
        evt_id = str(r.get("event_id") or f"EVT-{idx+1}").replace("'", "\\'")
        rel_type = "COMMUNICATED_WITH" if str(r.get("type")).upper() == "CDR" else "TRANSACTED_WITH"

        lines.append(
            f"MERGE (s:Entity {{id: '{src}', case_id: '{case_id}'}}) "
            f"MERGE (t:Entity {{id: '{tgt}', case_id: '{case_id}'}}) "
            f"CREATE (s)-[:{rel_type} {{amount: '{amt}', timestamp: '{ts}', event_id: '{evt_id}', case_id: '{case_id}'}}]->(t);"
        )

    return "\n".join(lines)


def sync_to_neo4j(case_id: str, records: List[Dict[str, Any]], entities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Syncs canonical entities and transaction relationships directly to Neo4j if online."""
    cypher_script = generate_cypher_script(case_id, records, entities)
    driver = get_neo4j_driver()

    if not driver:
        return {
            "status": "offline",
            "neo4j_online": False,
            "message": f"Neo4j database not reachable at {NEO4J_URI}. Cypher script successfully generated for manual or pipeline import.",
            "nodes_count": len(entities),
            "edges_count": len([r for r in records if r.get("source") and r.get("target")]),
            "cypher_script": cypher_script
        }

    nodes_created = 0
    relationships_created = 0

    try:
        with driver.session() as session:
            # Execute Cypher commands line by line or in blocks
            for line in cypher_script.split("\n"):
                stmt = line.strip()
                if stmt and not stmt.startswith("//"):
                    session.run(stmt)
                    if "MERGE (e:Entity" in stmt:
                        nodes_created += 1
                    elif "CREATE (s)-[" in stmt:
                        relationships_created += 1
        driver.close()

        return {
            "status": "success",
            "neo4j_online": True,
            "message": f"Successfully synchronized {nodes_created} nodes and {relationships_created} relationships to Neo4j database.",
            "nodes_count": nodes_created,
            "relationships_count": relationships_created,
            "cypher_script": cypher_script
        }
    except Exception as e:
        if driver:
            driver.close()
        return {
            "status": "error",
            "neo4j_online": True,
            "message": f"Error running Cypher statements: {str(e)}",
            "cypher_script": cypher_script
        }
