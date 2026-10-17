from backend.app.importer import get_fixture_snapshot
from backend.app.diff_engine import run_diff_analysis
from backend.app.reports import generate_markdown_report, generate_sarif_report

def test_safe_pr_passes_ci():
    """Verify that candidate-safe passes CI with 0 new violations."""
    baseline = get_fixture_snapshot("baseline")
    candidate_safe = get_fixture_snapshot("candidate-safe")
    
    analysis = run_diff_analysis(baseline, candidate_safe)
    assert analysis.ci_status == "pass"
    assert analysis.summary.new_violations_count == 0

def test_resolved_path_detection():
    """Verify that moving from risky to safe marks the violation as resolved."""
    candidate_risky = get_fixture_snapshot("candidate-risky")
    candidate_safe = get_fixture_snapshot("candidate-safe")
    
    # Baseline is risky, candidate is safe
    analysis = run_diff_analysis(candidate_risky, candidate_safe)
    assert analysis.summary.resolved_count >= 1
    resolved = [f for f in analysis.findings if f.status == "resolved"]
    assert any(f.source_id == "payroll.csv" for f in resolved)

def test_reports_generation():
    """Verify that Markdown and SARIF reports are populated correctly."""
    baseline = get_fixture_snapshot("baseline")
    candidate_risky = get_fixture_snapshot("candidate-risky")
    
    analysis = run_diff_analysis(baseline, candidate_risky)
    
    # Markdown
    md = generate_markdown_report(analysis)
    assert "# GraphGate CI" in md
    assert "FAIL" in md
    assert "payroll.csv" in md
    assert "external-webhook" in md

    # SARIF
    sarif = generate_sarif_report(analysis)
    assert sarif["version"] == "2.1.0"
    assert len(sarif["runs"]) == 1
    assert len(sarif["runs"][0]["results"]) >= 1
    rule_ids = [r["ruleId"] for r in sarif["runs"][0]["results"]]
    assert "POL-001" in rule_ids
