import uuid
from backend.app.schemas import (
    ConfigurationSnapshot,
    SimulateFixResult,
    PathFinding,
)
from backend.app.graph_engine import engine_manager
from backend.app.normalize import snapshot_to_graph_data
from backend.app.policies import evaluate_path_policy, record_to_finding

def apply_edge_removal_to_snapshot(
    snapshot: ConfigurationSnapshot,
    source_id: str,
    rel_type: str,
    target_id: str
) -> ConfigurationSnapshot:
    """Creates a modified clone of candidate snapshot with specified declared edge removed."""
    sim = snapshot.model_copy(deep=True)

    if rel_type == "CAN_READ":
        for ident in sim.identities:
            if ident.id == source_id and target_id in ident.can_read:
                ident.can_read = [r for r in ident.can_read if r != target_id]

    elif rel_type == "CAN_SEND_TO":
        for ident in sim.identities:
            if ident.id == source_id and target_id in ident.can_send_to:
                ident.can_send_to = [d for d in ident.can_send_to if d != target_id]

    elif rel_type == "USES_TOOL":
        for agent in sim.agents:
            if agent.id == source_id and target_id in agent.tools:
                agent.tools = [t for t in agent.tools if t != target_id]

    elif rel_type == "AUTHENTICATES_AS":
        for tool in sim.tools:
            if tool.id == source_id and tool.identity_id == target_id:
                tool.identity_id = None

    return sim

def simulate_remediation(
    candidate_snapshot: ConfigurationSnapshot,
    edge_to_remove: tuple[str, str, str] | None = None,
    scope_change: dict | None = None
) -> SimulateFixResult:
    """
    Counterfactual simulator:
    Tests removing or narrowing a candidate declared relationship in an isolated temporary graph,
    reruns the reachability queries, and assesses whether the risky path disappears.
    """
    sim_id = f"sim_{uuid.uuid4().hex[:8]}"

    # Baseline candidate reachability
    orig_graph = engine_manager.build_graph(f"orig_{sim_id}", candidate_snapshot)
    orig_res = engine_manager.query_paths(orig_graph)
    
    orig_violations: list[dict] = []
    for r in orig_res.records:
        _, _, _, _, is_violation = evaluate_path_policy(r)
        if is_violation:
            orig_violations.append(r)

    # Apply remediation mutation
    if edge_to_remove:
        src, rel, tgt = edge_to_remove
        remediated_snapshot = apply_edge_removal_to_snapshot(candidate_snapshot, src, rel, tgt)
        action_desc = f"Removed declared relationship ({src})-[:{rel}]->({tgt})"
    else:
        remediated_snapshot = candidate_snapshot
        action_desc = "No relationship alteration specified."

    # Build temporary simulated graph
    rem_graph = engine_manager.build_graph(f"rem_{sim_id}", remediated_snapshot)
    rem_res = engine_manager.query_paths(rem_graph)

    rem_violations: list[dict] = []
    remaining_findings: list[PathFinding] = []
    for r in rem_res.records:
        _, _, _, _, is_violation = evaluate_path_policy(r)
        if is_violation:
            rem_violations.append(r)
            remaining_findings.append(record_to_finding(r, status="new"))

    orig_count = len(orig_violations)
    rem_count = len(rem_violations)
    resolved = rem_count < orig_count
    broken_count = orig_count - rem_count

    explanation = (
        f"Counterfactual simulation verified: {action_desc}. "
        f"Risky flow paths reduced from {orig_count} to {rem_count} "
        f"({broken_count} path(s) successfully eliminated)."
    )

    remediated_graph_data = snapshot_to_graph_data(remediated_snapshot)

    return SimulateFixResult(
        original_violation_count=orig_count,
        remediated_violation_count=rem_count,
        resolved=resolved,
        broken_paths_count=broken_count,
        remaining_findings=remaining_findings,
        remediated_graph=remediated_graph_data,
        explanation=explanation
    )
