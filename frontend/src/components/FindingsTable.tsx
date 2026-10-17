import React from 'react';
import { PathFinding } from '../types';
import { ShieldAlert, ShieldCheck, AlertCircle, Sparkles, ArrowRight, Eye, Wrench } from 'lucide-react';

interface FindingsTableProps {
  findings: PathFinding[];
  selectedFindingId?: string;
  onSelectFinding: (finding: PathFinding) => void;
  onSimulateFix: (finding: PathFinding) => void;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  findings,
  selectedFindingId,
  onSelectFinding,
  onSimulateFix,
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-risk-100 text-risk-700 border border-risk-200">Critical</span>;
      case 'high':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Medium</span>;
      default:
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Info</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-risk-600 text-white animate-pulse">New Path</span>;
      case 'pre_existing':
        return <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">Pre-existing</span>;
      case 'resolved':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-success-600 text-white">Resolved</span>;
      case 'needs_review':
        return <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500 text-white">Needs Review</span>;
      default:
        return null;
    }
  };

  if (findings.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-border text-center shadow-xs">
        <div className="inline-flex p-3 bg-success-50 text-success-600 rounded-full mb-3">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-sm font-bold text-ink">No Violating Paths Detected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Candidate configuration does not construct any data flows violating active data boundary policies.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-bold text-xs text-ink uppercase tracking-wider">Identified Data-Flow Violations</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enumerated source-to-sink multi-hop compositions across agents, identities, and tools
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-1 bg-slate-100 rounded text-slate-600">
          {findings.length} total findings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3">Status / Severity</th>
              <th className="px-4 py-3">Policy Rule</th>
              <th className="px-4 py-3">Sensitive Source</th>
              <th className="px-4 py-3">Agent & Toolchain</th>
              <th className="px-4 py-3">Egress Sink</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {findings.map((f) => {
              const isSelected = f.id === selectedFindingId;
              return (
                <tr
                  key={f.id}
                  onClick={() => onSelectFinding(f)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(f.status)}
                      {getSeverityBadge(f.severity)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-ink text-xs">{f.policy_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{f.policy_id}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-ink font-mono">{f.source_id}</div>
                    <span className="text-[10px] uppercase font-bold text-risk-600">
                      [{f.source_classification}]
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                      <span className="text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                        {f.read_tool}
                      </span>
                      <ArrowRight size={11} className="text-slate-400" />
                      <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-bold">
                        {f.agent_id}
                      </span>
                      <ArrowRight size={11} className="text-slate-400" />
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                        {f.send_tool}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-ink font-mono">{f.destination_id}</div>
                    <span className="text-[10px] uppercase font-bold text-risk-600">
                      [{f.destination_trust}]
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectFinding(f)}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1"
                        title="Inspect step-by-step witness on graph"
                      >
                        <Eye size={12} />
                        <span>Witness</span>
                      </button>

                      {f.status === 'new' && (
                        <button
                          onClick={() => onSimulateFix(f)}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center gap-1 shadow-xs"
                          title="Simulate breaking this path in temporary graph"
                        >
                          <Wrench size={12} />
                          <span>Simulate Fix</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
