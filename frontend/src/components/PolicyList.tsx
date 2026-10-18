import React from 'react';
import { Scale, Check, AlertOctagon, ShieldAlert } from 'lucide-react';

export const PolicyList: React.FC = () => {
  const policies = [
    {
      id: "POL-001",
      name: "Restricted Egress Prohibition",
      severity: "critical",
      scope: "DataClass: restricted -> Destination: external | untrusted",
      action: "BLOCK (Fail CI)",
      description: "Restricted classification data (e.g. payroll datasets, cryptographic keys, customer PII) must never have any reachable graph data flow to external or untrusted destination sinks.",
      compliance: "SOC2 CC6.1, GDPR Art. 32, NIST SP 800-53 AC-4"
    },
    {
      id: "POL-002",
      name: "Confidential Egress Guardrail",
      severity: "high",
      scope: "DataClass: confidential -> Destination: external | untrusted",
      action: "BLOCK unless Explicit Exemption Registered",
      description: "Confidential organizational documents may only flow to approved destinations with registered authorization records.",
      compliance: "ISO 27001 A.8.2, SOC2 CC6.3"
    },
    {
      id: "POL-003",
      name: "Unknown Entity Boundary Audit",
      severity: "medium",
      action: "WARN (Review Needed)",
      scope: "DataClass: unknown | Destination: unknown",
      description: "Agents and tools connected to unclassified resources or unverified destination trust levels cannot be proven safe statically.",
      compliance: "Security Architecture Baseline Requirement"
    },
    {
      id: "POL-004",
      name: "External Egress Notice",
      severity: "info",
      action: "PASS (Audit Logged)",
      scope: "DataClass: public | internal -> Destination: external",
      description: "Internal or public operational data flowing to external destinations is audited for visibility.",
      compliance: "Egress Monitoring Baseline"
    },
    {
      id: "POL-005",
      name: "Compliant Internal Flow",
      severity: "info",
      action: "PASS (Approved)",
      scope: "Destination: internal | approved_external",
      description: "Data flows strictly confined within internal organizational infrastructure.",
      compliance: "Standard Internal Operation"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface-100 p-4 rounded border border-hairline shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-surface-200 text-linear rounded-xs border border-hairline">
            <Scale size={15} />
          </span>
          <div>
            <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Deterministic Policy Matrix
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Deterministic compliance rules evaluated against FalkorDB reachability paths
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 bg-surface-50 text-ink-secondary border border-hairline rounded-xs">
          5 ACTIVE RULES
        </span>
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {policies.map((p) => (
          <div key={p.id} className="bg-surface-100 p-4 rounded border border-hairline shadow-subtle space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs ${
                  p.severity === 'critical'
                    ? 'bg-signal-red-subtle text-signal-red border border-signal-red/30'
                    : p.severity === 'high'
                    ? 'bg-signal-amber-subtle text-signal-amber border border-signal-amber/30'
                    : p.severity === 'medium'
                    ? 'bg-signal-amber-subtle text-signal-amber border border-signal-amber/20'
                    : 'bg-surface-200 text-ink-muted border border-hairline'
                }`}>
                  {p.severity.toUpperCase()}
                </span>
                <div>
                  <h4 className="font-sans font-semibold text-xs text-ink">{p.name}</h4>
                  <span className="font-mono text-[10px] text-ink-muted">{p.id}</span>
                </div>
              </div>

              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-xs ${
                p.action.includes('BLOCK')
                  ? 'bg-signal-red-subtle text-signal-red border border-signal-red/30'
                  : p.action.includes('WARN')
                  ? 'bg-signal-amber-subtle text-signal-amber border border-signal-amber/30'
                  : 'bg-signal-green-subtle text-signal-green border border-signal-green/30'
              }`}>
                {p.action}
              </span>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              {p.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-hairline text-[11px] font-mono gap-1 text-ink-muted">
              <div>
                <span className="text-ink-faint">SCOPE: </span>
                <span className="text-linear">{p.scope}</span>
              </div>
              <div className="text-ink-faint">{p.compliance}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
