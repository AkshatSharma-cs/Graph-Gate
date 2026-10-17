import sys
from pathlib import Path

# Ensure project root and backend dir are in sys.path from any working directory
_backend_dir = Path(__file__).resolve().parent.parent
_project_root = _backend_dir.parent
for _p in [str(_project_root), str(_backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

import logging
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.schemas import (

    AnalyzeRequest,
    AnalysisResult,
    SimulateFixRequest,
    SimulateFixResult,
    DemoScenario,
)
from backend.app.importer import get_fixture_snapshot
from backend.app.diff_engine import run_diff_analysis
from backend.app.remediation import simulate_remediation
from backend.app.reports import generate_markdown_report, generate_sarif_report
from backend.app.graph_engine import engine_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("graphgate")

app = FastAPI(
    title="GraphGate CI API",
    description="Local-first before/after graph-based data-flow simulator for AI agent configurations using FalkorDB",
    version=settings.app_version
)

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage of completed scans for session inspection
scan_store: dict[str, AnalysisResult] = {}
snapshot_store: dict[str, tuple] = {}  # scan_id -> (baseline_snapshot, candidate_snapshot)

@app.get("/api/health")
def get_health():
    """Health check endpoint indicating backend and FalkorDB status."""
    engine_status = engine_manager.get_status()
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "engine": engine_status
    }

@app.get("/api/demo/scenarios", response_model=list[DemoScenario])
def list_demo_scenarios():
    """Returns the pre-seeded interactive demo scenarios."""
    baseline = get_fixture_snapshot("baseline")
    candidate_risky = get_fixture_snapshot("candidate-risky")
    candidate_safe = get_fixture_snapshot("candidate-safe")

    scenarios = [
        DemoScenario(
            id="scenario-risky",
            title="Risky PR: Add HR Payroll Reader + External Webhook",
            description="A pull request adds 'payroll.csv' to the reader's scope and attaches an external webhook egress tool. Composes an unauthorized restricted-to-external pipeline.",
            expected_status="fail",
            expected_new_violations=1,
            explanation="Critical failure: Restricted compensation data reaches an external partner webhook via agent composition.",
            baseline=baseline,
            candidate=candidate_risky
        ),
        DemoScenario(
            id="scenario-safe",
            title="Safe PR: Internal Feedback Reader & Slack Dispatcher",
            description="A pull request adds customer sentiment reader scoped strictly to internal documents, keeping all egress constrained to the internal Slack channel.",
            expected_status="pass",
            expected_new_violations=0,
            explanation="Zero new violations: All new capability flows remain completely confined within trusted internal boundaries.",
            baseline=baseline,
            candidate=candidate_safe
        ),
        DemoScenario(
            id="scenario-remediated",
            title="Remediated PR: Scoped Drive Reader (Project Documents Only)",
            description="The risky PR has been counterfactually remediated by scoping the reader identity exclusively to 'project-update.md', breaking the risky path.",
            expected_status="pass",
            expected_new_violations=0,
            explanation="Path resolved: Removing read privilege on payroll.csv breaks the chain while preserving reporting capabilities.",
            baseline=baseline,
            candidate=candidate_safe
        )
    ]
    return scenarios

@app.post("/api/analyze", response_model=AnalysisResult)
def analyze_configurations(request: AnalyzeRequest):
    """
    Accepts baseline and candidate configuration snapshots.
    Builds isolated graphs, executes multi-hop Cypher queries, evaluates policies,
    and returns findings, graph data, and CI decision.
    """
    result = run_diff_analysis(
        baseline_snapshot=request.baseline,
        candidate_snapshot=request.candidate,
        scenario_id=request.scenario_id,
        traversal_limit=settings.max_path_traversal_limit
    )

    result.markdown_report = generate_markdown_report(result)
    scan_store[result.scan_id] = result
    snapshot_store[result.scan_id] = (request.baseline, request.candidate)
    return result

@app.get("/api/scans/{scan_id}", response_model=AnalysisResult)
def get_scan(scan_id: str):
    """Retrieves an existing scan result."""
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    return scan_store[scan_id]

@app.post("/api/scans/{scan_id}/simulate-fix", response_model=SimulateFixResult)
def run_simulate_fix(scan_id: str, request: SimulateFixRequest):
    """
    Simulates removing or narrowing a declared edge/scope in a temporary graph,
    rerunning the query to verify if the risky path disappears.
    """
    edge = request.edge_to_remove
    # If remediation option id provided, check if we can resolve edge
    if not edge and request.remediation_option_id and scan_id in scan_store:
        prior_scan = scan_store[scan_id]
        for opt in prior_scan.remediation_options:
            if opt.id == request.remediation_option_id and opt.edge_tuple:
                edge = opt.edge_tuple
                break

    fix_result = simulate_remediation(
        candidate_snapshot=request.candidate,
        edge_to_remove=edge,
        scope_change=request.scope_change
    )
    return fix_result

@app.get("/api/scans/{scan_id}/report.md")
def get_scan_markdown(scan_id: str):
    """Returns the Markdown formatted report for CI/PR comments."""
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    report_text = generate_markdown_report(scan_store[scan_id])
    return Response(content=report_text, media_type="text/markdown")

@app.get("/api/scans/{scan_id}/report.sarif")
def get_scan_sarif(scan_id: str):
    """Returns SARIF 2.1.0 JSON for GitHub Code Scanning integration."""
    if scan_id not in scan_store:
        raise HTTPException(status_code=404, detail="Scan ID not found")
    sarif_data = generate_sarif_report(scan_store[scan_id])
    return sarif_data

from pathlib import Path
from fastapi.staticfiles import StaticFiles

# If frontend production build exists, serve it
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)

