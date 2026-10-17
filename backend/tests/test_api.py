from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.importer import get_fixture_snapshot

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "engine" in data

def test_demo_scenarios_endpoint():
    res = client.get("/api/demo/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 3
    assert scenarios[0]["id"] == "scenario-risky"

def test_analyze_endpoint():
    baseline = get_fixture_snapshot("baseline").model_dump()
    candidate = get_fixture_snapshot("candidate-risky").model_dump()
    
    payload = {
        "scenario_id": "test-scenario",
        "baseline": baseline,
        "candidate": candidate
    }
    
    res = client.post("/api/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["ci_status"] == "fail"
    assert data["summary"]["new_violations_count"] == 1
    scan_id = data["scan_id"]
    
    # Check scan retrieval
    scan_res = client.get(f"/api/scans/{scan_id}")
    assert scan_res.status_code == 200
    
    # Check report.md
    md_res = client.get(f"/api/scans/{scan_id}/report.md")
    assert md_res.status_code == 200
    assert "GraphGate CI" in md_res.text
    
    # Check report.sarif
    sarif_res = client.get(f"/api/scans/{scan_id}/report.sarif")
    assert sarif_res.status_code == 200
    assert sarif_res.json()["version"] == "2.1.0"
    
    # Test simulate-fix endpoint
    fix_payload = {
        "candidate": candidate,
        "edge_to_remove": ["drive-read-id", "CAN_READ", "payroll.csv"]
    }
    fix_res = client.post(f"/api/scans/{scan_id}/simulate-fix", json=fix_payload)
    assert fix_res.status_code == 200
    fix_data = fix_res.json()
    assert fix_data["resolved"] is True
    assert fix_data["remediated_violation_count"] == 0
