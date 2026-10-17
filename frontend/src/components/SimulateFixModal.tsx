import React, { useState } from 'react';
import { ConfigurationSnapshot, PathFinding, SimulateFixResult } from '../types';
import { simulateFix } from '../api/client';
import { X, Wrench, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';

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
  onAppliedFix,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Simulate Counterfactual Remediation</h3>
              <p className="text-xs text-slate-500">
                Test removing or narrowing an edge in an isolated simulation graph
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          <div>
            <div className="font-semibold text-ink mb-1.5 uppercase tracking-wider text-[11px]">
              Select Candidate Edge to Sever / Scope:
            </div>
            <div className="space-y-2">
              {targets.map((tgt, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedEdgeIdx === idx
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                      : 'border-border bg-white hover:border-slate-300'
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
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-bold text-ink mb-0.5">{tgt.target}</div>
                    <div className="text-slate-600 leading-relaxed">{tgt.description}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-400">
                      Edge: ({tgt.edge[0]}) -[:{tgt.edge[1]}]-&gt; ({tgt.edge[2]})
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action button */}
          {!result && (
            <div className="pt-2">
              <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Executing Graph Traversal Simulation...</span>
                  </>
                ) : (
                  <>
                    <Wrench size={14} />
                    <span>Run Counterfactual Simulation on FalkorDB</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-risk-50 border border-risk-200 text-risk-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Simulation Outcome */}
          {result && (
            <div className="space-y-3 p-4 rounded-xl border border-success-200 bg-success-50/60 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-success-800 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Simulation Confirmed: Risky Path Successfully Broken!</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {result.explanation}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white p-2.5 rounded-lg border border-success-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Before Fix</div>
                  <div className="text-lg font-bold text-risk-600">
                    {result.original_violation_count} Violations
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-success-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">After Severing Edge</div>
                  <div className="text-lg font-bold text-success-600">
                    {result.remediated_violation_count} Violations
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Notice: Static simulation only. GraphGate CI does not automatically alter source code or pull request manifests.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-ink transition-colors"
          >
            Close
          </button>

          {result && (
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-success-600 hover:bg-success-700 rounded-lg shadow-xs transition-colors"
            >
              Done Reviewing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
