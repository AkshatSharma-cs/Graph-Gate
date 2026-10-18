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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17211F]/40 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-md border border-[#DFE5E1] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-[#FBFBFA] border-b border-[#DFE5E1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-teal-50 text-[#286A61] rounded border border-teal-200">
              <Wrench size={15} />
            </span>
            <div>
              <h3 className="font-mono text-xs font-semibold text-[#17211F] uppercase tracking-wider">
                Counterfactual Remediation Simulator
              </h3>
              <p className="text-xs text-[#64716C]">
                Test breaking reachable paths in an isolated temporary graph
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#64716C] hover:text-[#17211F] hover:bg-[#F5F6F4] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <div className="font-mono font-semibold text-[#64716C] mb-2 uppercase text-[11px] tracking-wider">
              Select Candidate Relationship to Sever:
            </div>
            <div className="space-y-2">
              {targets.map((tgt, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-all ${
                    selectedEdgeIdx === idx
                      ? 'border-[#286A61] bg-teal-50/30 text-[#17211F]'
                      : 'border-[#DFE5E1] bg-white text-[#17211F] hover:border-[#9BA7A1]'
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
                    className="mt-1 accent-[#286A61] focus:ring-0"
                  />
                  <div className="flex-1">
                    <div className="font-mono text-xs font-semibold text-[#286A61] mb-0.5 uppercase">
                      {tgt.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-[#17211F] leading-snug">{tgt.description}</div>
                    <div className="mt-1.5 font-mono text-xs text-[#64716C] bg-[#F5F6F4] px-2 py-0.5 rounded inline-block border border-[#DFE5E1]">
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
              className="w-full py-2.5 px-4 bg-[#286A61] hover:bg-[#1f544c] text-white font-medium text-xs rounded flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Executing Graph Simulation...</span>
                </>
              ) : (
                <>
                  <Wrench size={13} />
                  <span>Execute Counterfactual Simulation</span>
                </>
              )}
            </button>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#B42318] rounded text-xs font-mono">
              {error}
            </div>
          )}

          {/* Result Block */}
          {result && (
            <div className="space-y-3 p-4 rounded border border-emerald-200 bg-emerald-50/50 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#16794B] font-mono font-semibold text-xs">
                <CheckCircle2 size={16} />
                <span>COUNTERFACTUAL CONFIRMED: RISKY PATH ELIMINATED</span>
              </div>
              <p className="text-[#17211F] text-xs font-mono leading-relaxed">
                {result.explanation}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1 font-mono">
                <div className="bg-white p-3 rounded border border-[#DFE5E1]">
                  <div className="text-[11px] uppercase text-[#64716C]">Before Fix</div>
                  <div className="text-lg font-bold text-[#B42318]">
                    {result.original_violation_count} Violation(s)
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-emerald-200">
                  <div className="text-[11px] uppercase text-[#64716C]">After Severance</div>
                  <div className="text-lg font-bold text-[#16794B]">
                    {result.remediated_violation_count} Violation(s)
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-[#64716C] pt-1">
                Evaluated on temporary in-memory snapshot. Declarative source files were not modified.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#FBFBFA] border-t border-[#DFE5E1] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#64716C] hover:text-[#17211F] transition-colors cursor-pointer"
          >
            Close
          </button>

          {result && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#16794B] hover:bg-[#12633e] rounded transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
