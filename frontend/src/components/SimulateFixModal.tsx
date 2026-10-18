import React, { useState } from 'react';
import { ConfigurationSnapshot, PathFinding, SimulateFixResult } from '../types';
import { simulateFix } from '../api/client';
import { X, Wrench, CheckCircle2, RefreshCw } from 'lucide-react';

interface SimulateFixModalProps {
  scanId: string;
  candidateSnapshot: ConfigurationSnapshot;
  finding: PathFinding | null;
  isOpen: boolean;
  onClose: () => void;
  onAppliedFix?: (remediatedCandidate: ConfigurationSnapshot) => void;
}

export const SimulateFixModal: React.FC<SimulateFixModalProps> = ({
  scanId,
  candidateSnapshot,
  finding,
  isOpen,
  onClose,
}) => {
  const [selectedEdgeIdx, setSelectedEdgeIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulateFixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !finding) return null;

  const targets = finding.remediation_targets || [];

  const handleSimulate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const chosenTarget = targets[selectedEdgeIdx];
      const res = await simulateFix(
        scanId,
        candidateSnapshot,
        chosenTarget?.edge
      );
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-100 select-none">
      <div className="bg-surface-50 rounded border border-hairline shadow-panel w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-100 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-linear-subtle text-linear rounded-xs border border-linear/20">
              <Wrench size={14} />
            </span>
            <div>
              <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                Counterfactual Remediation Simulator
              </h3>
              <p className="text-[11px] text-ink-muted">
                Test breaking reachable paths in an isolated temporary FalkorDB graph
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xs text-ink-muted hover:text-ink hover:bg-surface-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <div className="font-mono font-semibold text-ink-muted mb-2 uppercase text-[10px] tracking-wider">
              Select Candidate Relationship to Sever:
            </div>
            <div className="space-y-1.5">
              {targets.map((tgt, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xs border cursor-pointer transition-all ${
                    selectedEdgeIdx === idx
                      ? 'border-linear bg-linear-subtle text-ink'
                      : 'border-hairline bg-surface-100 text-ink-secondary hover:border-hairline-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="remediation_edge"
                    checked={selectedEdgeIdx === idx}
                    onChange={() => {
                      setSelectedEdgeIdx(idx);
                      setResult(null);
                    }}
                    className="mt-0.5 accent-linear focus:ring-0"
                  />
                  <div className="flex-1">
                    <div className="font-mono text-[11px] font-semibold text-ink mb-0.5 uppercase">
                      {tgt.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-ink-secondary leading-snug">{tgt.description}</div>
                    <div className="mt-1 font-mono text-[10px] text-ink-muted">
                      ({tgt.edge[0]}) -[:{tgt.edge[1]}]-&gt; ({tgt.edge[2]})
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          {!result && (
            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-linear hover:bg-linear-hover text-white font-mono text-xs font-semibold rounded-xs flex items-center justify-center gap-2 shadow-subtle transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>EXECUTING GRAPH SIMULATION...</span>
                </>
              ) : (
                <>
                  <Wrench size={13} />
                  <span>EXECUTE COUNTERFACTUAL SIMULATION</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-2.5 bg-signal-red-subtle border border-signal-red/30 text-signal-red rounded-xs font-mono text-xs">
              {error}
            </div>
          )}

          {/* Result Block */}
          {result && (
            <div className="space-y-3 p-3.5 rounded-xs border border-signal-green/30 bg-signal-green-subtle/30 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-signal-green font-mono font-bold text-xs">
                <CheckCircle2 size={15} />
                <span>COUNTERFACTUAL CONFIRMED: RISKY PATH ELIMINATED</span>
              </div>
              <p className="text-ink-secondary text-xs font-mono leading-relaxed">
                {result.explanation}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div className="bg-surface-100 p-2.5 rounded-xs border border-hairline">
                  <div className="text-[10px] uppercase text-ink-faint">Before Fix</div>
                  <div className="text-base font-bold text-signal-red">
                    {result.original_violation_count} Violation(s)
                  </div>
                </div>
                <div className="bg-surface-100 p-2.5 rounded-xs border border-signal-green/30">
                  <div className="text-[10px] uppercase text-ink-faint">After Severance</div>
                  <div className="text-base font-bold text-signal-green">
                    {result.remediated_violation_count} Violation(s)
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-ink-faint pt-0.5">
                Evaluated on temporary in-memory snapshot. Declarative source files were not modified.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-100 border-t border-hairline flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-mono text-ink-muted hover:text-ink transition-colors"
          >
            CLOSE
          </button>

          {result && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs font-mono font-semibold text-white bg-signal-green hover:bg-emerald-600 rounded-xs transition-colors"
            >
              DONE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
