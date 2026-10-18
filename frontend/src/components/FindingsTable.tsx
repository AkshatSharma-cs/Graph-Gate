import React from 'react';
import { PathFinding } from '../types';
import { ArrowRight, Eye, Wrench, ShieldCheck } from 'lucide-react';

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
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-red-subtle text-signal-red border border-signal-red/30">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-amber-subtle text-signal-amber border border-signal-amber/30">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-amber-subtle text-signal-amber border border-signal-amber/20">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-xs bg-surface-200 text-ink-muted border border-hairline">
            INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-red text-white">
            NEW
          </span>
        );
      case 'pre_existing':
        return (
          <span className="text-[9px] font-mono font-medium uppercase px-1.5 py-0.2 rounded-xs bg-surface-200 text-ink-muted border border-hairline">
            EXISTING
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-green text-white">
            RESOLVED
          </span>
        );
      case 'needs_review':
        return (
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-amber text-white">
            REVIEW
          </span>
        );
      default:
        return null;
    }
  };

  if (findings.length === 0) {
    return (
      <div className="bg-surface-100 p-8 rounded border border-hairline text-center shadow-subtle">
        <div className="inline-flex p-2.5 bg-signal-green-subtle text-signal-green rounded-xs mb-2.5">
          <ShieldCheck size={24} />
        </div>
        <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
          No Policy Violations Detected
        </h3>
        <p className="text-xs text-ink-muted max-w-sm mx-auto mt-1">
          Candidate configuration does not construct any data flows violating active data boundary policies.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-100 rounded border border-hairline shadow-subtle overflow-hidden">
      {/* Table Header */}
      <div className="px-4 py-3 border-b border-hairline flex items-center justify-between bg-surface-50">
        <div>
          <h3 className="font-mono font-bold text-xs text-ink uppercase tracking-wider">
            Reachable Policy Violations
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Cypher-enumerated multi-hop source-to-sink paths composed across agent toolchains
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 bg-surface-200 rounded-xs text-ink-secondary border border-hairline">
          {findings.length} findings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-50/60 border-b border-hairline text-ink-muted font-mono uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Status / Severity</th>
              <th className="px-4 py-2.5">Policy & ID</th>
              <th className="px-4 py-2.5">Sensitive Source</th>
              <th className="px-4 py-2.5">Agent Pipeline</th>
              <th className="px-4 py-2.5">Egress Sink</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {findings.map((f) => {
              const isSelected = f.id === selectedFindingId;
              return (
                <tr
                  key={f.id}
                  onClick={() => onSelectFinding(f)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-surface-200' : 'hover:bg-surface-200/50'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(f.status)}
                      {getSeverityBadge(f.severity)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{f.policy_name}</div>
                    <div className="text-[10px] font-mono text-ink-muted">{f.policy_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono font-medium text-ink text-xs">{f.source_id}</div>
                    <span className="text-[10px] font-mono uppercase text-signal-red font-semibold">
                      [{f.source_classification}]
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink-secondary">
                      <span className="text-signal-blue bg-signal-blue-subtle px-1.5 py-0.2 rounded-xs border border-signal-blue/20">
                        {f.read_tool}
                      </span>
                      <ArrowRight size={10} className="text-ink-faint" />
                      <span className="text-ink bg-surface-200 px-1.5 py-0.2 rounded-xs border border-hairline font-bold">
                        {f.agent_id}
                      </span>
                      <ArrowRight size={10} className="text-ink-faint" />
                      <span className="text-signal-amber bg-signal-amber-subtle px-1.5 py-0.2 rounded-xs border border-signal-amber/20">
                        {f.send_tool}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono font-medium text-ink text-xs">{f.destination_id}</div>
                    <span className="text-[10px] font-mono uppercase text-signal-red font-semibold">
                      [{f.destination_trust}]
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectFinding(f)}
                        className="px-2 py-1 text-xs font-mono text-ink-secondary hover:text-ink bg-surface-200 hover:bg-surface-300 border border-hairline rounded-xs transition-colors flex items-center gap-1"
                      >
                        <Eye size={11} />
                        <span>Witness</span>
                      </button>

                      {f.status === 'new' && (
                        <button
                          onClick={() => onSimulateFix(f)}
                          className="px-2.5 py-1 text-xs font-mono font-medium text-white bg-linear hover:bg-linear-hover rounded-xs transition-colors flex items-center gap-1 shadow-subtle"
                        >
                          <Wrench size={11} />
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
