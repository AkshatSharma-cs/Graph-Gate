import React from 'react';
import { PathFinding } from '../types';
import { X, ShieldAlert, ArrowRight, Wrench, Info } from 'lucide-react';

interface FindingDetailDrawerProps {
  finding: PathFinding | null;
  onClose: () => void;
  onSimulateFix: (finding: PathFinding) => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({
  finding,
  onClose,
  onSimulateFix,
}) => {
  if (!finding) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-[#DFE5E1] z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-[#DFE5E1] bg-[#FBFBFA] flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                finding.severity === 'critical'
                  ? 'bg-red-50 text-[#B42318] border border-red-200'
                  : 'bg-amber-50 text-[#A15C07] border border-amber-200'
              }`}
            >
              {finding.severity.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-[#64716C]">{finding.policy_id}</span>
          </div>
          <h2 className="text-sm font-semibold text-[#17211F]">{finding.policy_name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#64716C] hover:text-[#17211F] hover:bg-[#F5F6F4] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Policy Rule Box */}
        <div className="p-3.5 bg-red-50/60 border border-red-200 rounded text-[#17211F]">
          <div className="font-mono text-xs font-semibold mb-1.5 flex items-center gap-1.5 text-[#B42318]">
            <ShieldAlert size={14} />
            <span>POLICY VIOLATION CONDITION</span>
          </div>
          <p className="leading-relaxed text-[#17211F] text-xs">{finding.policy_rule}</p>
        </div>

        {/* Narrative */}
        <div>
          <div className="font-mono font-semibold text-[#64716C] uppercase text-[11px] tracking-wider mb-1.5">
            Data-Flow Sequence Description
          </div>
          <p className="text-[#17211F] leading-relaxed bg-[#FBFBFA] p-3.5 rounded border border-[#DFE5E1] font-mono text-xs">
            {finding.witness_description}
          </p>
        </div>

        {/* Step-by-Step Graph Edges */}
        <div>
          <div className="font-mono font-semibold text-[#64716C] uppercase text-[11px] tracking-wider mb-2">
            Multi-Hop Cypher Traversal Trail
          </div>
          <div className="space-y-2">
            {finding.witness_steps.map((step) => (
              <div
                key={step.step_number}
                className="p-3 bg-[#FBFBFA] border border-[#DFE5E1] rounded hover:border-[#9BA7A1] transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-semibold text-[#286A61]">
                    STEP {step.step_number.toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[11px] text-[#64716C]">
                    [:{step.relationship}]
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs mb-1">
                  <span className="font-semibold text-[#17211F]">{step.from_node}</span>
                  <ArrowRight size={11} className="text-[#9BA7A1]" />
                  <span className="font-semibold text-[#17211F]">{step.to_node}</span>
                </div>
                <p className="text-[#64716C] text-xs leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Remediation Targets */}
        <div>
          <div className="font-mono font-semibold text-[#64716C] uppercase text-[11px] tracking-wider mb-1.5">
            Candidate Remediation Edges
          </div>
          <div className="space-y-2">
            {finding.remediation_targets.map((rem, idx) => (
              <div key={idx} className="p-3 bg-teal-50/40 border border-teal-200 rounded">
                <div className="font-mono text-xs font-semibold text-[#286A61] uppercase mb-1">
                  {rem.action.replace(/_/g, ' ')}
                </div>
                <p className="text-[#17211F] text-xs leading-relaxed">{rem.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology note */}
        <div className="flex items-start gap-2 p-3 bg-[#F5F6F4] border border-[#DFE5E1] rounded text-[#64716C] text-xs font-mono">
          <Info size={14} className="shrink-0 mt-0.5 text-[#64716C]" />
          <span>{finding.confidence_note}</span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-[#DFE5E1] bg-[#FBFBFA] flex items-center justify-between">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 text-xs font-medium text-[#64716C] hover:text-[#17211F] transition-colors cursor-pointer"
        >
          Close
        </button>

        {finding.status === 'new' && (
          <button
            onClick={() => onSimulateFix(finding)}
            className="px-4 py-2 text-xs font-medium text-white bg-[#286A61] hover:bg-[#1f544c] rounded flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Wrench size={13} />
            <span>Simulate Fix (Counterfactual)</span>
          </button>
        )}
      </div>
    </div>
  );
};
