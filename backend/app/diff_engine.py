import uuid
from datetime import datetime, timezone
from backend.app.schemas import (
    ConfigurationSnapshot,
    AnalysisResult,
    ScanSummary,
    PathFinding,
    CIStatus,
    RemediationOption,
)
from backend.app.graph_engine import engine_manager
from backend.app.normalize import snapshot_to_graph_data
from backend.app.policies import evaluate_path_policy, record_to_finding

def run_diff_analysis(
    baseline_snapshot: ConfigurationSnapshot,
    candidate_snapshot: ConfigurationSnapshot,
    scenario_id: str | None = None,
    traversal_limit: int = 250
) -> AnalysisResult:
    """
    Executes before-and-after graph reachability analysis, applies policies,
    diffs stable fingerprints, and returns an AnalysisResult.
    """
    scan_id = f"scan-{uuid.uuid4().hex[:10]}"
    timestamp = datetime.now(timezone.utc).isoformat()

    # 1. Build graphs
    baseline_graph = engine_manager.build_graph(f"baseline_{scan_id}", baseline_snapshot)
    candidate_graph = engine_manager.build_graph(f"candidate_{scan_id}", candidate_snapshot)

    # 2. Query paths
    baseline_res = engine_manager.query_paths(baseline_graph, limit=traversal_limit)
    candidate_res = engine_manager.query_paths(candidate_graph, limit=traversal_limit)

    is_truncated = baseline_res.is_truncated or candidate_res.is_truncated

    # 3. Filter policy violations in both sets
    baseline_violations_map: dict[str, dict] = {}
    for r in baseline_res.records:
        pol_id, _, _, _, is_violation = evaluate_path_policy(r)
        if is_violation:
            fp = f"{r['agent_id']}|{r['source_id']}|{r['classification']}|{r['read_tool']}|{r['read_identity']}|{r['send_tool']}|{r['send_identity']}|{r['destination_id']}|{pol_id}"
            baseline_violations_map[fp] = r

    candidate_violations_map: dict[str, dict] = {}
    for r in candidate_res.records:
        pol_id, _, _, _, is_violation = evaluate_path_policy(r)
        if is_violation:
            fp = f"{r['agent_id']}|{r['source_id']}|{r['classification']}|{r['read_tool']}|{r['read_identity']}|{r['send_tool']}|{r['send_identity']}|{r['destination_id']}|{pol_id}"
            candidate_violations_map[fp] = r

    baseline_fps = set(baseline_violations_map.keys())
    candidate_fps = set(candidate_violations_map.keys())

    new_fps = candidate_fps - baseline_fps
    pre_existing_fps = candidate_fps & baseline_fps
    resolved_fps = baseline_fps - candidate_fps

    findings: list[PathFinding] = []
    remediation_options: list[RemediationOption] = []
    seen_remediations = set()

    # Process NEW violations
    for fp in new_fps:
        rec = candidate_violations_map[fp]
        pol_id, _, _, sev, _ = evaluate_path_policy(rec)
        status = "needs_review" if pol_id == "POL-003" else "new"
        finding = record_to_finding(rec, status=status)
        findings.append(finding)

        # Generate candidate remediation options for this new finding
        for target in finding.remediation_targets:
            rem_id = f"rem-{hash(str(target['edge'])) & 0xfffffff:07x}"
            if rem_id not in seen_remediations:
                seen_remediations.add(rem_id)
                remediation_options.append(RemediationOption(
                    id=rem_id,
                    action_type="remove_edge",
                    target_description=target["target"],
                    suggested_fix=target["description"],
                    edge_tuple=target["edge"]
                ))

    # Process PRE-EXISTING violations
    for fp in pre_existing_fps:
        rec = candidate_violations_map[fp]
        pol_id, _, _, _, _ = evaluate_path_policy(rec)
        status = "needs_review" if pol_id == "POL-003" else "pre_existing"
        finding = record_to_finding(rec, status=status)
        findings.append(finding)

    # Process RESOLVED violations (existed in baseline, no longer in candidate)
    for fp in resolved_fps:
        rec = baseline_violations_map[fp]
        finding = record_to_finding(rec, status="resolved")
        findings.append(finding)

    # Sort findings by status severity: new critical -> new high -> needs_review -> pre_existing -> resolved
    sev_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    status_order = {"new": 0, "needs_review": 1, "pre_existing": 2, "resolved": 3}
    findings.sort(key=lambda f: (status_order.get(f.status, 9), sev_order.get(f.severity, 9)))

    # Calculate summary metrics
    new_violations_count = sum(1 for f in findings if f.status == "new")
    pre_existing_count = sum(1 for f in findings if f.status == "pre_existing")
    resolved_count = sum(1 for f in findings if f.status == "resolved")
    needs_review_count = sum(1 for f in findings if f.status == "needs_review")

    # Determine CI gate status
    has_critical_or_high_new = any(
        f.status == "new" and f.severity in ["critical", "high"]
        for f in findings
    )
    has_review_or_warn = needs_review_count > 0 or any(
        f.status == "new" and f.severity == "medium"
        for f in findings
    )

    if has_critical_or_high_new:
        ci_status: CIStatus = "fail"
    elif has_review_or_warn:
        ci_status = "warn"
    else:
        ci_status = "pass"

    summary = ScanSummary(
        new_violations_count=new_violations_count,
        pre_existing_count=pre_existing_count,
        resolved_count=resolved_count,
        needs_review_count=needs_review_count,
        total_candidate_violations=len(candidate_fps),
        total_baseline_violations=len(baseline_fps),
        is_truncated=is_truncated
    )

    # Convert snapshots to UI graph representation
    base_graph_data = snapshot_to_graph_data(baseline_snapshot)
    cand_graph_data = snapshot_to_graph_data(candidate_snapshot)

    # Mark risky edges in candidate graph data
    risky_edge_ids = {e_id for f in findings if f.status in ["new", "pre_existing"] for e_id in f.path_edge_ids}
    for e in cand_graph_data.edges:
        if e.id in risky_edge_ids:
            e.is_risky = True

    return AnalysisResult(
        scan_id=scan_id,
        timestamp=timestamp,
        ci_status=ci_status,
        summary=summary,
        findings=findings,
        baseline_graph=base_graph_data,
        candidate_graph=cand_graph_data,
        remediation_options=remediation_options
    )
