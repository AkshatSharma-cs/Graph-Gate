export type CIStatus = 'pass' | 'warn' | 'fail';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'new' | 'pre_existing' | 'resolved' | 'needs_review';
export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'unknown';
export type DestinationTrust = 'internal' | 'approved_external' | 'external' | 'untrusted' | 'unknown';
export type ToolKind = 'read' | 'write' | 'send' | 'execute';

export interface AgentConfig {
  id: string;
  name: string;
  framework: string;
  tools: string[];
  context_id?: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  kind: ToolKind;
  identity_id?: string;
  context_id?: string;
}

export interface IdentityConfig {
  id: string;
  name: string;
  principal_type: string;
  can_read: string[];
  can_send_to: string[];
}

export interface ResourceConfig {
  id: string;
  name: string;
  resource_type: string;
  classification: ClassificationLevel;
}

export interface DestinationConfig {
  id: string;
  name: string;
  trust: DestinationTrust;
}

export interface ContextConfig {
  id: string;
  name: string;
  is_shared: boolean;
}

export interface PolicyConfig {
  id: string;
  name: string;
  severity: SeverityLevel;
  description: string;
}

export interface ConfigurationSnapshot {
  agents: AgentConfig[];
  tools: ToolConfig[];
  identities: IdentityConfig[];
  resources: ResourceConfig[];
  destinations: DestinationConfig[];
  contexts: ContextConfig[];
  policies: PolicyConfig[];
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: 'Agent' | 'AgentContext' | 'Tool' | 'Identity' | 'Resource' | 'DataClass' | 'Destination';
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  is_risky: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PathWitnessStep {
  step_number: number;
  from_node: string;
  from_type: string;
  relationship: string;
  to_node: string;
  to_type: string;
  detail: string;
}

export interface RemediationTarget {
  action: string;
  target: string;
  edge: [string, string, string];
  description: string;
}

export interface PathFinding {
  id: string;
  path_fingerprint: string;
  status: FindingStatus;
  severity: SeverityLevel;
  policy_id: string;
  policy_name: string;
  policy_rule: string;
  source_id: string;
  source_classification: ClassificationLevel;
  read_identity: string;
  read_tool: string;
  agent_context: string;
  agent_id: string;
  send_tool: string;
  send_identity: string;
  destination_id: string;
  destination_trust: DestinationTrust;
  path_node_ids: string[];
  path_edge_ids: string[];
  witness_steps: PathWitnessStep[];
  witness_description: string;
  confidence_note: string;
  remediation_targets: RemediationTarget[];
}

export interface ScanSummary {
  new_violations_count: number;
  pre_existing_count: number;
  resolved_count: number;
  needs_review_count: number;
  total_candidate_violations: number;
  total_baseline_violations: number;
  is_truncated: boolean;
}

export interface RemediationOption {
  id: string;
  action_type: 'remove_edge' | 'narrow_scope' | 'remove_tool';
  target_description: string;
  suggested_fix: string;
  edge_tuple?: [string, string, string];
  scope_modification?: Record<string, any>;
}

export interface AnalysisResult {
  scan_id: string;
  timestamp: string;
  ci_status: CIStatus;
  summary: ScanSummary;
  findings: PathFinding[];
  baseline_graph: GraphData;
  candidate_graph: GraphData;
  remediation_options: RemediationOption[];
  markdown_report: string;
}

export interface SimulateFixResult {
  original_violation_count: number;
  remediated_violation_count: number;
  resolved: boolean;
  broken_paths_count: number;
  remaining_findings: PathFinding[];
  remediated_graph: GraphData;
  explanation: string;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  expected_status: CIStatus;
  expected_new_violations: number;
  explanation: string;
  baseline: ConfigurationSnapshot;
  candidate: ConfigurationSnapshot;
}

export interface EngineStatus {
  falkordb_connected: boolean;
  engine_mode: string;
  host: string;
  port: number;
}
