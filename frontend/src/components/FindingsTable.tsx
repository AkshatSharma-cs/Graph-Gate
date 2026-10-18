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
          <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-red-50 text-[#B42318] border border-red-200">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-[#A15C07] border border-amber-200">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-[#A15C07] border border-amber-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-50 text-[#64716C] border border-slate-200">
            INFO
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#B42318] text-white">
            NEW
          </span>
        );
      case 'pre_existing':
        return (
          <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[#F5F6F4] text-[#64716C] border border-[#DFE5E1]">
            EXISTING
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#16794B] text-white">
            RESOLVED
          </span>
        );
      case 'needs_review':
        return (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#A15C07] text-white">
            REVIEW
          </span>
        );
      default:
        return null;
    }
  };

  if (findings.length === 0) {
    return (
      <div className="bg-white p-8 rounded-md border border-[#DFE5E1] text-center shadow-xs">
        <div className="inline-flex p-3 bg-emerald-50 text-[#16794B] rounded mb-3">
          <ShieldCheck size={26} />
        </div>
        <h3 className="font-mono text-xs font-bold text-[#17211F] uppercase tracking-wider">
          No Policy Violations Detected
        </h3>
        <p className="text-xs text-[#64716C] max-w-sm mx-auto mt-1">
          Candidate configuration does not construct any data flows violating active data boundary policies.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-[#DFE5E1] shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="px-5 py-3.5 border-b border-[#DFE5E1] flex items-center justify-between bg-[#FBFBFA]">
        <div>
          <h3 className="font-mono font-bold text-xs text-[#17211F] uppercase tracking-wider">
            Reachable Policy Violations
          </h3>
          <p className="text-xs text-[#64716C] mt-0.5">
            Cypher-enumerated multi-hop source-to-sink paths composed across agent toolchains
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 bg-[#F5F6F4] rounded text-[#64716C] border border-[#DFE5E1]">
          {findings.length} findings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FBFBFA] border-b border-[#DFE5E1] text-[#64716C] font-mono uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-5 py-2.5">Status / Severity</th>
              <th className="px-5 py-2.5">Policy & ID</th>
              <th className="px-5 py-2.5">Sensitive Source</th>
              <th className="px-5 py-2.5">Agent Pipeline</th>
              <th className="px-5 py-2.5">Egress Sink</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE5E1]">
            {findings.map((f) => {
              const isSelected = f.id === selectedFindingId;
              return (
                <tr
                  key={f.id}
                  onClick={() => onSelectFinding(f)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#F5F6F4] border-l-4 border-l-[#286A61]' : 'hover:bg-[#F5F6F4]/60'
                  }`}
                >
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(f.status)}
                      {getSeverityBadge(f.severity)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-[#17211F]">{f.policy_name}</div>
                    <div className="text-[11px] font-mono text-[#64716C]">{f.policy_id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-mono font-medium text-[#17211F] text-xs">{f.source_id}</div>
                    <span className="text-[11px] font-mono uppercase text-[#B42318] font-semibold">
                      [{f.source_classification}]
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-[#64716C]">
                      <span className="text-[#286A61] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {f.read_tool}
                      </span>
                      <ArrowRight size={11} className="text-[#9BA7A1]" />
                      <span className="text-[#17211F] bg-[#F5F6F4] px-2 py-0.5 rounded border border-[#DFE5E1] font-semibold">
                        {f.agent_id}
                      </span>
                      <ArrowRight size={11} className="text-[#9BA7A1]" />
                      <span className="text-[#A15C07] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {f.send_tool}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-mono font-medium text-[#17211F] text-xs">{f.destination_id}</div>
                    <span className="text-[11px] font-mono uppercase text-[#B42318] font-semibold">
                      [{f.destination_trust}]
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectFinding(f)}
                        className="px-2.5 py-1 text-xs font-medium text-[#17211F] hover:text-[#286A61] bg-white hover:bg-[#F5F6F4] border border-[#DFE5E1] rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Witness</span>
                      </button>

                      {f.status === 'new' && (
                        <button
                          onClick={() => onSimulateFix(f)}
                          className="px-3 py-1 text-xs font-medium text-white bg-[#286A61] hover:bg-[#1f544c] rounded transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
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
