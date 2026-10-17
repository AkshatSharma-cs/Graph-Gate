from typing import Any
from backend.app.schemas import PathFinding, SeverityLevel, ClassificationLevel, DestinationTrust
from backend.app.graph_queries import build_witness_steps

def evaluate_path_policy(record: dict[str, Any], approved_exceptions: set[str] | None = None) -> tuple[str, str, str, SeverityLevel, bool]:
    """
    Evaluates deterministic policies against a single graph path.
    Returns: (policy_id, policy_name, policy_rule, severity, is_violation)
    """
    classification: str = record.get("classification", "unknown").lower()
    dest_trust: str = record.get("destination_trust", "unknown").lower()
    dest_id: str = record.get("destination_id", "")
    exceptions = approved_exceptions or set()

    # Rule 3: Unknown classification or unknown destination trust -> Warning / Needs Review
    if classification == "unknown" or dest_trust == "unknown":
        return (
            "POL-003",
            "Unknown Boundary Audit",
            "Data flow involves unclassified resource or unverified destination trust; manual security review required.",
            "medium",
            True  # triggers needs_review finding
        )

    # Rule 1: Restricted data reaching external/untrusted destination -> Critical Violation
    if classification == "restricted" and dest_trust in ["external", "untrusted"]:
        return (
            "POL-001",
            "Restricted Egress Prohibition",
            "Restricted classification data must never flow to external or untrusted destinations.",
            "critical",
            True
        )

    # Rule 2: Confidential data reaching external/untrusted destination -> High Violation
    if classification == "confidential" and dest_trust in ["external", "untrusted"]:
        if dest_id in exceptions:
            return (
                "POL-002-EXEMPT",
                "Confidential Egress Exception",
                f"Destination '{dest_id}' has an explicit security authorization exception.",
                "info",
                False
            )
        return (
            "POL-002",
            "Confidential Egress Guardrail",
            "Confidential data may only flow to internal or explicitly approved destinations.",
            "high",
            True
        )

    # Rule 4: Public or internal data to external
    if classification in ["public", "internal"] and dest_trust in ["external", "untrusted"]:
        return (
            "POL-004",
            "External Egress Notice",
            f"Authorized {classification} data exported to external destination.",
            "low",
            False
        )

    # Compliant internal flow
    return (
        "POL-005",
        "Compliant Internal Flow",
        "Data flow is strictly confined within internal trusted systems.",
        "info",
        False
    )

def record_to_finding(record: dict[str, Any], status: str = "new") -> PathFinding:
    """
    Transforms a raw path query dictionary record into a strongly-typed PathFinding.
    """
    pol_id, pol_name, pol_rule, severity, _ = evaluate_path_policy(record)
    steps, desc, path_nodes, path_edges = build_witness_steps(record)

    # Stable fingerprint format:
    # agent_id | source_id | classification | read_tool | read_identity | send_tool | send_identity | destination_id | policy_id
    fingerprint = (
        f"{record['agent_id']}|{record['source_id']}|{record['classification']}|"
        f"{record['read_tool']}|{record['read_identity']}|{record['send_tool']}|"
        f"{record['send_identity']}|{record['destination_id']}|{pol_id}"
    )

    finding_id = f"finding-{hash(fingerprint) & 0xffffffff:08x}"

    # Suggested remediation candidate edges
    remediation_targets = [
        {
            "action": "narrow_read_scope",
            "target": f"Identity '{record['read_identity']}' reading '{record['source_id']}'",
            "edge": (record['read_identity'], "CAN_READ", record['source_id']),
            "description": f"Revoke read access on '{record['source_id']}' from identity '{record['read_identity']}'."
        },
        {
            "action": "remove_agent_send_tool",
            "target": f"Agent '{record['agent_id']}' using tool '{record['send_tool']}'",
            "edge": (record['agent_id'], "USES_TOOL", record['send_tool']),
            "description": f"Disassociate outbound sender tool '{record['send_tool']}' from agent '{record['agent_id']}'."
        },
        {
            "action": "scope_egress_destination",
            "target": f"Identity '{record['send_identity']}' sending to '{record['destination_id']}'",
            "edge": (record['send_identity'], "CAN_SEND_TO", record['destination_id']),
            "description": f"Restrict identity '{record['send_identity']}' egress destination to internal destinations only."
        }
    ]

    return PathFinding(
        id=finding_id,
        path_fingerprint=fingerprint,
        status=status,  # type: ignore
        severity=severity,
        policy_id=pol_id,
        policy_name=pol_name,
        policy_rule=pol_rule,
        source_id=record["source_id"],
        source_classification=record["classification"],  # type: ignore
        read_identity=record["read_identity"],
        read_tool=record["read_tool"],
        agent_context=record["agent_context"],
        agent_id=record["agent_id"],
        send_tool=record["send_tool"],
        send_identity=record["send_identity"],
        destination_id=record["destination_id"],
        destination_trust=record["destination_trust"],  # type: ignore
        path_node_ids=path_nodes,
        path_edge_ids=path_edges,
        witness_steps=steps,
        witness_description=desc,
        confidence_note="Deterministic static graph traversal from declared capability configuration",
        remediation_targets=remediation_targets
    )
