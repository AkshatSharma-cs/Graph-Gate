import json
from backend.app.schemas import AnalysisResult

def generate_markdown_report(result: AnalysisResult) -> str:
    """
    Renders an executive CI Pull Request comment / Markdown report.
    """
    status_icon = "❌ FAIL" if result.ci_status == "fail" else ("⚠️ WARN" if result.ci_status == "warn" else "✅ PASS")
    status_color = "red" if result.ci_status == "fail" else ("orange" if result.ci_status == "warn" else "green")

    md = [
        f"# GraphGate CI — Data-Flow Security Assessment",
        f"",
        f"**CI Gate Status:** **{status_icon}**  ",
        f"**Scan ID:** `{result.scan_id}` | **Evaluated At:** `{result.timestamp}`",
        f"",
        f"> **Notice:** GraphGate CI detects *structurally reachable data flows* composed across agent toolchains and identities from declarative configurations. This identifies transitive reachability risk, not evidence of runtime exfiltration.",
        f"",
        f"### Summary of Findings",
        f"",
        f"| Metric | Count | Details |",
        f"|---|:---:|---|",
        f"| **New Violations** | **{result.summary.new_violations_count}** | Newly introduced reachable sensitive paths |",
        f"| **Pre-existing Violations** | {result.summary.pre_existing_count} | Unchanged violations already present in baseline |",
        f"| **Resolved Violations** | {result.summary.resolved_count} | Previously open paths eliminated by this change |",
        f"| **Needs Security Review** | {result.summary.needs_review_count} | Unknown classifications or unverified sinks |",
        f"| **Traversal Limit Truncated** | {'Yes (threshold hit)' if result.summary.is_truncated else 'No (complete traversal)'} | Graph query bound status |",
        f"",
    ]

    new_findings = [f for f in result.findings if f.status == "new"]
    if new_findings:
        md.append(f"## 🚨 Newly Reachable Sensitive Paths (Blocking)")
        md.append("")
        for idx, f in enumerate(new_findings, 1):
            md.append(f"#### {idx}. [{f.severity.upper()}] {f.policy_name} (`{f.policy_id}`)")
            md.append(f"- **Source Resource:** `{f.source_id}` (Classification: **{f.source_classification.upper()}**)")
            md.append(f"- **Egress Destination:** `{f.destination_id}` (Trust: **{f.destination_trust.upper()}**)")
            md.append(f"- **Agent Pipeline:** `{f.agent_id}` via read tool `{f.read_tool}` and send tool `{f.send_tool}`")
            md.append(f"- **Policy Violation:** {f.policy_rule}")
            md.append("")
            md.append(f"**Path Witness Sequence:**")
            for step in f.witness_steps:
                md.append(f"  {step.step_number}. `{step.from_node}` ({step.from_type}) --`[{step.relationship}]`--> `{step.to_node}` ({step.to_type})")
            md.append("")
            md.append(f"> **Witness Detail:** {f.witness_description}")
            md.append("")
            if f.remediation_targets:
                md.append(f"**Recommended Remediation Actions:**")
                for rem in f.remediation_targets:
                    md.append(f"- *{rem['action']}*: {rem['description']}")
                md.append("")

    review_findings = [f for f in result.findings if f.status == "needs_review"]
    if review_findings:
        md.append(f"## ⚠️ Needs Review (Unclassified / Unknown Boundaries)")
        md.append("")
        for f in review_findings:
            md.append(f"- **[{f.severity.upper()}]** `{f.source_id}` ({f.source_classification}) -> `{f.destination_id}` ({f.destination_trust}) via `{f.agent_id}`: {f.policy_rule}")
        md.append("")

    resolved_findings = [f for f in result.findings if f.status == "resolved"]
    if resolved_findings:
        md.append(f"## ✅ Resolved Paths")
        md.append("")
        for f in resolved_findings:
            md.append(f"- Fixed path: `{f.source_id}` to `{f.destination_id}` via `{f.agent_id}` is no longer reachable.")
        md.append("")

    md.append("---")
    md.append("*Generated automatically by [GraphGate CI](https://github.com/graphgate-ci) — Powered by FalkorDB graph data-flow modeling.*")
    return "\n".join(md)

def generate_sarif_report(result: AnalysisResult) -> dict:
    """
    Renders findings into standard SARIF 2.1.0 format for GitHub Code Scanning integration.
    """
    rules = [
        {
            "id": "POL-001",
            "name": "RestrictedEgressProhibition",
            "shortDescription": {"text": "Restricted classification data must not flow to external/untrusted destinations."},
            "defaultConfiguration": {"level": "error"},
            "help": {"text": "Ensure agent identities and reader tools cannot access restricted resources if external senders are attached."}
        },
        {
            "id": "POL-002",
            "name": "ConfidentialEgressGuardrail",
            "shortDescription": {"text": "Confidential data may only flow to approved destinations."},
            "defaultConfiguration": {"level": "error"},
            "help": {"text": "Obtain an explicit policy exemption or re-route egress through an approved internal channel."}
        },
        {
            "id": "POL-003",
            "name": "UnknownBoundaryAudit",
            "shortDescription": {"text": "Unclassified data or unverified destination trust boundary."},
            "defaultConfiguration": {"level": "warning"},
            "help": {"text": "Classify all resources and explicitly declare trust levels on all destination sinks."}
        }
    ]

    sarif_results = []
    level_map = {
        "critical": "error",
        "high": "error",
        "medium": "warning",
        "low": "note",
        "info": "note"
    }

    for f in result.findings:
        if f.status in ["new", "needs_review"]:
            sarif_results.append({
                "ruleId": f.policy_id,
                "level": level_map.get(f.severity, "warning"),
                "message": {
                    "text": f"[{f.status.upper()}] {f.policy_name}: {f.witness_description}"
                },
                "locations": [
                    {
                        "physicalLocation": {
                            "artifactLocation": {
                                "uri": "agent-configuration.json"
                            },
                            "region": {
                                "startLine": 1,
                                "startColumn": 1
                            }
                        }
                    }
                ],
                "properties": {
                    "fingerprint": f.path_fingerprint,
                    "sourceId": f.source_id,
                    "destinationId": f.destination_id,
                    "agentId": f.agent_id
                }
            })

    return {
        "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "GraphGate CI",
                        "version": "0.1.0",
                        "informationUri": "https://github.com/graphgate-ci",
                        "rules": rules
                    }
                },
                "results": sarif_results
            }
        ]
    }
