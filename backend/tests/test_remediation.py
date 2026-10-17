from backend.app.importer import get_fixture_snapshot
from backend.app.remediation import simulate_remediation

def test_narrowing_read_scope_resolves_path():
    """Verify that removing the read permission to payroll.csv eliminates the critical violation."""
    candidate_risky = get_fixture_snapshot("candidate-risky")
    
    # Target edge to remove: (drive-read-id, CAN_READ, payroll.csv)
    edge_to_remove = ("drive-read-id", "CAN_READ", "payroll.csv")
    
    fix_result = simulate_remediation(
        candidate_snapshot=candidate_risky,
        edge_to_remove=edge_to_remove
    )
    
    assert fix_result.resolved is True
    assert fix_result.broken_paths_count >= 1
    assert fix_result.remediated_violation_count == 0
    assert "payroll.csv" not in [f.source_id for f in fix_result.remaining_findings]

def test_removing_agent_send_tool_resolves_path():
    """Verify that removing the egress tool from agent breaks the reachability path."""
    candidate_risky = get_fixture_snapshot("candidate-risky")
    
    # Target edge to remove: (reporting-agent, USES_TOOL, webhook-sender)
    edge_to_remove = ("reporting-agent", "USES_TOOL", "webhook-sender")
    
    fix_result = simulate_remediation(
        candidate_snapshot=candidate_risky,
        edge_to_remove=edge_to_remove
    )
    
    assert fix_result.resolved is True
    assert fix_result.remediated_violation_count == 0
