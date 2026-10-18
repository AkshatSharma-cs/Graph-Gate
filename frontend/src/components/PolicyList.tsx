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
      <div className="bg-white p-4 rounded-md border border-[#DFE5E1] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-teal-50 text-[#286A61] rounded border border-teal-200">
            <Scale size={16} />
          </span>
          <div>
            <h3 className="font-mono text-xs font-semibold text-[#17211F] uppercase tracking-wider">
              Deterministic Policy Matrix
            </h3>
            <p className="text-xs text-[#64716C] mt-0.5">
              Deterministic compliance rules evaluated against FalkorDB reachability paths
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 bg-[#F5F6F4] text-[#64716C] border border-[#DFE5E1] rounded">
          5 ACTIVE RULES
        </span>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {policies.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-md border border-[#DFE5E1] shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                    p.severity === 'critical'
                      ? 'bg-red-50 text-[#B42318] border border-red-200'
                      : p.severity === 'high'
                      ? 'bg-amber-50 text-[#A15C07] border border-amber-200'
                      : p.severity === 'medium'
                      ? 'bg-amber-50 text-[#A15C07] border border-amber-200'
                      : 'bg-slate-50 text-[#64716C] border border-slate-200'
                  }`}
                >
                  {p.severity.toUpperCase()}
                </span>
                <div>
                  <h4 className="font-semibold text-xs text-[#17211F]">{p.name}</h4>
                  <span className="font-mono text-xs text-[#64716C]">{p.id}</span>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded ${
                  p.action.includes('BLOCK')
                    ? 'bg-red-50 text-[#B42318] border border-red-200'
                    : p.action.includes('WARN')
                    ? 'bg-amber-50 text-[#A15C07] border border-amber-200'
                    : 'bg-emerald-50 text-[#16794B] border border-emerald-200'
                }`}
              >
                {p.action}
              </span>
            </div>

            <p className="text-xs text-[#17211F] leading-relaxed">
              {p.description}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2.5 border-t border-[#DFE5E1] text-xs font-mono gap-1 text-[#64716C]">
              <div>
                <span className="text-[#64716C]">SCOPE: </span>
                <span className="text-[#286A61] font-semibold">{p.scope}</span>
              </div>
              <div className="text-[#64716C]">{p.compliance}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
