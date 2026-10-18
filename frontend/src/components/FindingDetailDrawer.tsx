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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-surface-50 shadow-panel border-l border-hairline z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="p-4 border-b border-hairline bg-surface-100 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs ${
              finding.severity === 'critical'
                ? 'bg-signal-red-subtle text-signal-red border border-signal-red/30'
                : 'bg-signal-amber-subtle text-signal-amber border border-signal-amber/30'
            }`}>
              {finding.severity.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-ink-muted">{finding.policy_id}</span>
          </div>
          <h2 className="text-sm font-sans font-bold text-ink">{finding.policy_name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-xs text-ink-muted hover:text-ink hover:bg-surface-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Policy Rule Box */}
        <div className="p-3 bg-surface-100 border border-signal-red/25 rounded-xs text-ink-secondary">
          <div className="font-mono text-[11px] font-semibold mb-1 flex items-center gap-1.5 text-signal-red">
            <ShieldAlert size={13} />
            <span>POLICY VIOLATION CONDITION</span>
          </div>
          <p className="leading-relaxed text-ink text-xs">{finding.policy_rule}</p>
        </div>

        {/* Narrative */}
        <div>
          <div className="font-mono font-semibold text-ink-muted uppercase text-[10px] tracking-wider mb-1.5">
            Data-Flow Sequence Description
          </div>
          <p className="text-ink-secondary leading-relaxed bg-surface-100 p-3 rounded-xs border border-hairline font-mono text-[11px]">
            {finding.witness_description}
          </p>
        </div>

        {/* Step-by-Step Graph Edges */}
        <div>
          <div className="font-mono font-semibold text-ink-muted uppercase text-[10px] tracking-wider mb-2">
            Multi-Hop Cypher Traversal Trail
          </div>
          <div className="space-y-1.5">
            {finding.witness_steps.map((step) => (
              <div
                key={step.step_number}
                className="p-2.5 bg-surface-100 border border-hairline rounded-xs hover:border-hairline-strong transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-linear">
                    STEP {step.step_number.toString().padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10px] text-ink-faint">
                    [:{step.relationship}]
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] mb-1">
                  <span className="font-semibold text-ink">{step.from_node}</span>
                  <ArrowRight size={10} className="text-ink-faint" />
                  <span className="font-semibold text-ink">{step.to_node}</span>
                </div>
                <p className="text-ink-muted text-[11px] leading-snug">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Remediation Targets */}
        <div>
          <div className="font-mono font-semibold text-ink-muted uppercase text-[10px] tracking-wider mb-1.5">
            Candidate Remediation Edges
          </div>
          <div className="space-y-1.5">
            {finding.remediation_targets.map((rem, idx) => (
              <div key={idx} className="p-2.5 bg-surface-100 border border-hairline rounded-xs">
                <div className="font-mono text-[11px] font-semibold text-linear uppercase mb-0.5">
                  {rem.action.replace(/_/g, ' ')}
                </div>
                <p className="text-ink-secondary text-xs leading-relaxed">{rem.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology note */}
        <div className="flex items-start gap-2 p-2.5 bg-surface-100 border border-hairline rounded-xs text-ink-faint text-[10px] font-mono">
          <Info size={13} className="shrink-0 mt-0.5 text-ink-muted" />
          <span>{finding.confidence_note}</span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-hairline bg-surface-100 flex items-center justify-between">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-mono text-ink-muted hover:text-ink transition-colors"
        >
          CLOSE
        </button>

        {finding.status === 'new' && (
          <button
            onClick={() => onSimulateFix(finding)}
            className="px-3 py-1.5 text-xs font-mono font-semibold text-white bg-linear hover:bg-linear-hover rounded-xs flex items-center gap-1.5 shadow-subtle transition-colors"
          >
            <Wrench size={12} />
            <span>SIMULATE FIX (COUNTERFACTUAL)</span>
          </button>
        )}
      </div>
    </div>
  );
};
