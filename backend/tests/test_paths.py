import pytest
from backend.app.importer import get_fixture_snapshot, parse_mcp_config
from backend.app.graph_engine import InMemoryGraphSnapshot
from backend.app.graph_builder import populate_inmemory_graph
from backend.app.diff_engine import run_diff_analysis
from backend.app.schemas import ConfigurationSnapshot, ResourceConfig, DestinationConfig, IdentityConfig, ToolConfig, AgentConfig

def test_safe_baseline_has_no_violation():
    """Verify that the baseline configuration contains 0 policy violations."""
    baseline = get_fixture_snapshot("baseline")
    graph = InMemoryGraphSnapshot("test_base")
    populate_inmemory_graph(graph, baseline)
    result = graph.query_source_to_sink_paths()
    
    # Path exists from internal project-update.md -> internal-slack, but restricted payroll.csv has NO external egress
    restricted_to_external = [
        r for r in result.records
        if r["classification"] == "restricted" and r["destination_trust"] in ["external", "untrusted"]
    ]
    assert len(restricted_to_external) == 0

def test_candidate_addition_creates_new_restricted_external_path():
    """Verify that candidate-risky introduces the restricted payroll -> external webhook path."""
    baseline = get_fixture_snapshot("baseline")
    candidate = get_fixture_snapshot("candidate-risky")
    
    analysis = run_diff_analysis(baseline, candidate)
    
    assert analysis.ci_status == "fail"
    assert analysis.summary.new_violations_count >= 1
    
    # Check that the critical violation is on payroll.csv -> external-webhook
    crit = [f for f in analysis.findings if f.status == "new" and f.severity == "critical"]
    assert len(crit) == 1
    assert crit[0].source_id == "payroll.csv"
    assert crit[0].destination_id == "external-webhook"
    assert crit[0].policy_id == "POL-001"

def test_existing_violation_is_not_counted_as_new():
    """Verify that a violation present in BOTH baseline and candidate is marked as pre_existing, not new."""
    candidate_risky = get_fixture_snapshot("candidate-risky")
    # Compare candidate-risky against itself
    analysis = run_diff_analysis(candidate_risky, candidate_risky)
    
    assert analysis.summary.new_violations_count == 0
    assert analysis.summary.pre_existing_count >= 1
    assert analysis.ci_status == "pass"  # No NEW violations introduced!

def test_unknown_classification_returns_review():
    """Verify that an unclassified resource produces a needs_review finding under POL-003."""
    baseline = get_fixture_snapshot("baseline")
    candidate = get_fixture_snapshot("candidate-safe").model_copy(deep=True)
    
    # Add an unclassified resource and attach to reader
    candidate.resources.append(ResourceConfig(id="mystery-doc.bin", name="Mystery Doc", classification="unknown"))
    candidate.identities[0].can_read.append("mystery-doc.bin")
    # Add external sink to identity
    candidate.identities[1].can_send_to.append("external-webhook")
    
    analysis = run_diff_analysis(baseline, candidate)
    review_findings = [f for f in analysis.findings if f.status == "needs_review"]
    assert len(review_findings) >= 1
    assert any(f.source_id == "mystery-doc.bin" and f.policy_id == "POL-003" for f in review_findings)

def test_query_limit_sets_truncated_flag():
    """Verify that when the traversal limit is reached, is_truncated is True."""
    candidate = get_fixture_snapshot("candidate-risky")
    graph = InMemoryGraphSnapshot("trunc_test")
    populate_inmemory_graph(graph, candidate)
    
    # Run with limit=1 when there are at least 2 paths
    res = graph.query_source_to_sink_paths(limit=1)
    assert res.is_truncated is True

def test_mcp_config_adapter():
    """Verify that MCP configuration adapter properly converts MCP JSON to snapshot entities."""
    from backend.app.importer import parse_mcp_config
    import json
    from backend.app.config import settings

    mcp_file = settings.fixtures_dir / "mcp-config.json"
    with open(mcp_file, "r") as f:
        data = json.load(f)

    snapshot = parse_mcp_config(data)
    assert len(snapshot.agents) == 1
    assert snapshot.agents[0].id == "mcp-client-agent"
    assert len(snapshot.tools) >= 2
    assert any(t.id == "gdrive_read_file" for t in snapshot.tools)
    assert any(t.id == "post_external_webhook" for t in snapshot.tools)
    assert any(r.id == "payroll.csv" and r.classification == "restricted" for r in snapshot.resources)
    assert any(d.id == "external-webhook" and d.trust == "external" for d in snapshot.destinations)

