import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileCode } from 'lucide-react';

export const PolicyList: React.FC = () => {
  const policies = [
    {
      id: "POL-001",
      name: "Restricted Egress Prohibition",
      severity: "critical",
      scope: "DataClass: restricted -> Destination: external | untrusted",
      action: "BLOCK (Fail CI)",
      description: "Restricted data (e.g. payroll records, PII, cryptographic keys) must never have any reachable graph data flow to external or untrusted destination sinks.",
      compliance: "SOC2 CC6.1, GDPR Art. 32, NIST SP 800-53 AC-4"
    },
    {
      id: "POL-002",
      name: "Confidential Egress Guardrail",
      severity: "high",
      scope: "DataClass: confidential -> Destination: external | untrusted",
      action: "BLOCK unless Explicit Exemption Registered",
      description: "Confidential business records may only flow to approved destinations with registered authorization records.",
      compliance: "ISO 27001 A.8.2, SOC2 CC6.3"
    },
    {
      id: "POL-003",
      name: "Unknown Entity Boundary Audit",
      severity: "medium",
      action: "WARN (Review Needed)",
      scope: "DataClass: unknown | Destination: unknown",
      description: "Agents and tools connected to unclassified resources or unverified destination trust levels cannot be statically proven safe.",
      compliance: "Security Architecture Baseline Requirement"
    },
    {
      id: "POL-004",
      name: "External Egress Notice",
      severity: "info",
      action: "PASS (Audit Log)",
      scope: "DataClass: public | internal -> Destination: external",
      description: "Public or internal data flowing to external sinks is audited and flagged for informational awareness.",
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
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs">
        <h3 className="font-bold text-sm text-ink mb-1">Deterministic Policy Registry</h3>
        <p className="text-xs text-slate-500">
          Deterministic compliance rules evaluated against multi-hop FalkorDB graph reachability paths. No non-deterministic LLM judgements in CI gating.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {policies.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl border border-border shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  p.severity === 'critical'
                    ? 'bg-risk-600 text-white'
                    : p.severity === 'high'
                    ? 'bg-amber-600 text-white'
                    : p.severity === 'medium'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {p.severity.toUpperCase()}
                </span>
                <div>
                  <h4 className="font-bold text-xs text-ink">{p.name}</h4>
                  <span className="font-mono text-[11px] text-slate-400">{p.id}</span>
                </div>
              </div>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md font-mono ${
                p.action.includes('BLOCK')
                  ? 'bg-risk-50 text-risk-700 border border-risk-200'
                  : p.action.includes('WARN')
                  ? 'bg-warning-50 text-warning-800 border border-warning-200'
                  : 'bg-success-50 text-success-700 border border-success-200'
              }`}>
                {p.action}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {p.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] font-mono text-slate-500">
              <div>Scope: <span className="text-indigo-600">{p.scope}</span></div>
              <div className="text-slate-400">{p.compliance}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
