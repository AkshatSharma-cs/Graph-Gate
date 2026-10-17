import React from 'react';
import { PathFinding } from '../types';
import { X, ShieldAlert, ArrowRight, Wrench, CheckCircle, Info } from 'lucide-react';

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
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl border-l border-border z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-border bg-slate-50 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              finding.severity === 'critical' ? 'bg-risk-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {finding.severity.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-slate-500">{finding.policy_id}</span>
          </div>
          <h2 className="text-sm font-bold text-ink">{finding.policy_name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Policy rule box */}
        <div className="p-3.5 bg-risk-50/70 border border-risk-200 rounded-lg text-risk-900">
          <div className="font-semibold mb-1 flex items-center gap-1.5 text-risk-800">
            <ShieldAlert size={14} />
            <span>Policy Violation</span>
          </div>
          <p className="leading-relaxed">{finding.policy_rule}</p>
        </div>

        {/* Path narrative */}
        <div>
          <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-2">
            Witness Traversal Path
          </h3>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-border">
            {finding.witness_description}
          </p>
        </div>

        {/* Step-by-step witness trail */}
        <div>
          <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-2.5">
            Step-by-Step Graph Edges
          </h3>
          <div className="space-y-2">
            {finding.witness_steps.map((step) => (
              <div
                key={step.step_number}
                className="p-3 bg-white border border-border rounded-lg shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded">
                    Step {step.step_number}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">
                    [:{step.relationship}]
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] mb-1">
                  <span className="font-semibold text-ink">{step.from_node}</span>
                  <ArrowRight size={11} className="text-slate-400" />
                  <span className="font-semibold text-ink">{step.to_node}</span>
                </div>
                <p className="text-slate-500 text-[11px]">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Remediation targets */}
        <div>
          <h3 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-2">
            Counterfactual Remediation Candidates
          </h3>
          <div className="space-y-2">
            {finding.remediation_targets.map((rem, idx) => (
              <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                <div className="font-semibold text-indigo-900 mb-0.5">{rem.action.replace(/_/g, ' ')}</div>
                <p className="text-slate-600 mb-2">{rem.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Note */}
        <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px]">
          <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <span>{finding.confidence_note}</span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs text-slate-600 hover:text-ink font-medium"
        >
          Close
        </button>

        {finding.status === 'new' && (
          <button
            onClick={() => onSimulateFix(finding)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Wrench size={13} />
            <span>Simulate Fix & Retest</span>
          </button>
        )}
      </div>
    </div>
  );
};
