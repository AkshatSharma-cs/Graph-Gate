from typing import Literal
from pydantic import BaseModel, Field

# Classification levels
ClassificationLevel = Literal["public", "internal", "confidential", "restricted", "unknown"]
DestinationTrust = Literal["internal", "approved_external", "external", "untrusted", "unknown"]
FindingStatus = Literal["new", "pre_existing", "resolved", "needs_review"]
SeverityLevel = Literal["critical", "high", "medium", "low", "info"]
CIStatus = Literal["pass", "warn", "fail"]
ToolKind = Literal["read", "write", "send", "execute"]

class AgentConfig(BaseModel):
    id: str
    name: str = ""
    framework: str = "custom"
    tools: list[str] = Field(default_factory=list)
    context_id: str | None = None

class ToolConfig(BaseModel):
    id: str
    name: str = ""
    kind: ToolKind = "read"
    identity_id: str | None = None
    context_id: str | None = None

class IdentityConfig(BaseModel):
    id: str
    name: str = ""
    principal_type: str = "service_account"
    can_read: list[str] = Field(default_factory=list)
    can_send_to: list[str] = Field(default_factory=list)

class ResourceConfig(BaseModel):
    id: str
    name: str = ""
    resource_type: str = "file"
    classification: ClassificationLevel = "internal"

class DestinationConfig(BaseModel):
    id: str
    name: str = ""
    trust: DestinationTrust = "internal"

class ContextConfig(BaseModel):
    id: str
    name: str = ""
    is_shared: bool = True

class PolicyConfig(BaseModel):
    id: str
    name: str
    severity: SeverityLevel
    description: str

class ConfigurationSnapshot(BaseModel):
    agents: list[AgentConfig] = Field(default_factory=list)
    tools: list[ToolConfig] = Field(default_factory=list)
    identities: list[IdentityConfig] = Field(default_factory=list)
    resources: list[ResourceConfig] = Field(default_factory=list)
    destinations: list[DestinationConfig] = Field(default_factory=list)
    contexts: list[ContextConfig] = Field(default_factory=list)
    policies: list[PolicyConfig] = Field(default_factory=list)

class GraphNode(BaseModel):
    id: str
    label: str
    node_type: Literal["Agent", "AgentContext", "Tool", "Identity", "Resource", "DataClass", "Destination"]
    data: dict = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship: str
    is_risky: bool = False

class GraphData(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)

class PathWitnessStep(BaseModel):
    step_number: int
    from_node: str
    from_type: str
    relationship: str
    to_node: str
    to_type: str
    detail: str

class PathFinding(BaseModel):
    id: str
    path_fingerprint: str
    status: FindingStatus
    severity: SeverityLevel
    policy_id: str
    policy_name: str
    policy_rule: str
    
    # Specific path entities
    source_id: str
    source_classification: ClassificationLevel
    read_identity: str
    read_tool: str
    agent_context: str
    agent_id: str
    send_tool: str
    send_identity: str
    destination_id: str
    destination_trust: DestinationTrust
    
    path_node_ids: list[str]
    path_edge_ids: list[str]
    witness_steps: list[PathWitnessStep]
    witness_description: str
    confidence_note: str = "Deterministic static graph traversal from declared capability configuration"
    remediation_targets: list[dict] = Field(default_factory=list)

class ScanSummary(BaseModel):
    new_violations_count: int
    pre_existing_count: int
    resolved_count: int
    needs_review_count: int
    total_candidate_violations: int
    total_baseline_violations: int
    is_truncated: bool = False

class AnalyzeRequest(BaseModel):
    scenario_id: str | None = None
    baseline: ConfigurationSnapshot
    candidate: ConfigurationSnapshot

class RemediationOption(BaseModel):
    id: str
    action_type: Literal["remove_edge", "narrow_scope", "remove_tool"]
    target_description: str
    suggested_fix: str
    edge_tuple: tuple[str, str, str] | None = None  # (from_id, rel, to_id)
    scope_modification: dict | None = None

class AnalysisResult(BaseModel):
    scan_id: str
    timestamp: str
    ci_status: CIStatus
    summary: ScanSummary
    findings: list[PathFinding]
    baseline_graph: GraphData
    candidate_graph: GraphData
    remediation_options: list[RemediationOption]
    markdown_report: str = ""

class SimulateFixRequest(BaseModel):
    candidate: ConfigurationSnapshot
    remediation_option_id: str | None = None
    # Or direct specification
    edge_to_remove: tuple[str, str, str] | None = None  # (source_id, relationship, target_id)
    scope_change: dict | None = None

class SimulateFixResult(BaseModel):
    original_violation_count: int
    remediated_violation_count: int
    resolved: bool
    broken_paths_count: int
    remaining_findings: list[PathFinding]
    remediated_graph: GraphData
    explanation: str

class DemoScenario(BaseModel):
    id: str
    title: str
    description: str
    expected_status: CIStatus
    expected_new_violations: int
    explanation: str
    baseline: ConfigurationSnapshot
    candidate: ConfigurationSnapshot
