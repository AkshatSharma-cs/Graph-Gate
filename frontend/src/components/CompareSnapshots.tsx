import React from 'react';
import { ConfigurationSnapshot } from '../types';
import { ArrowRight, Plus, GitCompare, GitBranch } from 'lucide-react';

interface CompareSnapshotsProps {
  baseline: ConfigurationSnapshot;
  candidate: ConfigurationSnapshot;
}

export const CompareSnapshots: React.FC<CompareSnapshotsProps> = ({ baseline, candidate }) => {
  const baseTools = new Set(baseline.tools.map(t => t.id));
  const candTools = candidate.tools.map(t => t.id);
  const addedTools = candTools.filter(t => !baseTools.has(t));

  const baseReadResources = new Set(baseline.identities.flatMap(i => i.can_read));
  const candReadResources = candidate.identities.flatMap(i => i.can_read);
  const addedReadResources = candReadResources.filter(r => !baseReadResources.has(r));

  const baseSendDestinations = new Set(baseline.identities.flatMap(i => i.can_send_to));
  const candSendDestinations = candidate.identities.flatMap(i => i.can_send_to);
  const addedSendDestinations = candSendDestinations.filter(d => !baseSendDestinations.has(d));

  return (
    <div className="space-y-4">
      {/* Overview Ribbon */}
      <div className="bg-white p-4 rounded-md border border-[#DFE5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-teal-50 text-[#286A61] rounded border border-teal-200">
            <GitCompare size={16} />
          </span>
          <div>
            <h3 className="font-mono text-xs font-semibold text-[#17211F] uppercase tracking-wider">
              Declarative Capability Delta
            </h3>
            <p className="text-xs text-[#64716C] mt-0.5">
              Comparing toolchain registrations, identity permissions, and egress sinks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1 bg-[#FBFBFA] rounded border border-[#DFE5E1]">
            <span className="text-[#64716C]">TOOLS: </span>
            <span className="text-[#17211F] font-semibold">{baseline.tools.length}</span>
            <ArrowRight size={11} className="inline mx-1 text-[#9BA7A1]" />
            <span className="text-[#286A61] font-semibold">{candidate.tools.length}</span>
          </div>

          <div className="px-3 py-1 bg-[#FBFBFA] rounded border border-[#DFE5E1]">
            <span className="text-[#64716C]">SCOPES: </span>
            <span className="text-[#17211F] font-semibold">{baseReadResources.size}</span>
            <ArrowRight size={11} className="inline mx-1 text-[#9BA7A1]" />
            <span className="text-[#286A61] font-semibold">{candReadResources.length}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline (main) */}
        <div className="bg-white rounded-md border border-[#DFE5E1] shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3 bg-[#FBFBFA] border-b border-[#DFE5E1] flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <GitBranch size={13} className="text-[#64716C]" />
              <span className="text-xs font-semibold text-[#17211F] uppercase tracking-wider">BASELINE (main)</span>
            </div>
            <span className="text-xs text-[#64716C]">{baseline.agents.length} agent(s)</span>
          </div>

          <div className="p-4 space-y-4 text-xs font-mono flex-1">
            {/* Tools */}
            <div>
              <div className="text-[#64716C] text-[11px] uppercase font-semibold mb-2 tracking-wider">
                Configured Tools
              </div>
              <div className="space-y-1.5">
                {baseline.tools.map(t => (
                  <div key={t.id} className="p-2.5 rounded border border-[#DFE5E1] bg-[#FBFBFA] flex items-center justify-between">
                    <span className="text-[#17211F] font-medium">{t.id}</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#F5F6F4] text-[#64716C] border border-[#DFE5E1]">
                      {t.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read Scopes */}
            <div>
              <div className="text-[#64716C] text-[11px] uppercase font-semibold mb-2 tracking-wider">
                Permitted Read Scopes
              </div>
              <div className="space-y-1.5">
                {baseline.identities.flatMap(i => i.can_read.map(r => (
                  <div key={`${i.id}-${r}`} className="p-2.5 rounded border border-[#DFE5E1] bg-[#FBFBFA] flex items-center justify-between">
                    <span className="text-[#17211F]">{r}</span>
                    <span className="text-[11px] text-[#64716C]">via {i.id}</span>
                  </div>
                )))}
              </div>
            </div>

            {/* Egress Sinks */}
            <div>
              <div className="text-[#64716C] text-[11px] uppercase font-semibold mb-2 tracking-wider">
                Egress Sinks
              </div>
              <div className="space-y-1.5">
                {baseline.destinations.map(d => (
                  <div key={d.id} className="p-2.5 rounded border border-[#DFE5E1] bg-[#FBFBFA] flex items-center justify-between">
                    <span className="text-[#17211F]">{d.id}</span>
                    <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded bg-emerald-50 text-[#16794B] border border-emerald-200">
                      [{d.trust}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidate (PR) */}
        <div className="bg-white rounded-md border border-[#DFE5E1] shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3 bg-[#FBFBFA] border-b border-[#DFE5E1] flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#286A61]"></span>
              <span className="text-xs font-semibold text-[#17211F] uppercase tracking-wider">CANDIDATE (PR #42)</span>
            </div>
            <span className="text-xs text-[#286A61] font-semibold">DELTA EVALUATED</span>
          </div>

          <div className="p-4 space-y-4 text-xs font-mono flex-1">
            {/* Tools with delta */}
            <div>
              <div className="text-[#64716C] text-[11px] uppercase font-semibold mb-2 tracking-wider">
                Configured Tools (with delta)
              </div>
              <div className="space-y-1.5">
                {candidate.tools.map(t => {
                  const isAdded = addedTools.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded border flex items-center justify-between transition-colors ${
                        isAdded
                          ? 'border-teal-200 bg-teal-50/40 text-[#17211F]'
                          : 'border-[#DFE5E1] bg-[#FBFBFA] text-[#17211F]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={12} className="text-[#286A61]" />}
                        <span className="font-medium">{t.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[10px] uppercase font-bold text-[#286A61] px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                            + ADDED
                          </span>
                        )}
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#F5F6F4] text-[#64716C] border border-[#DFE5E1]">
                          {t.kind}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Read Scopes with delta */}
            <div>
              <div className="text-[#64716C] text-[11px] uppercase font-semibold mb-2 tracking-wider">
                Permitted Read Scopes (with delta)
              </div>
              <div className="space-y-1.5">
                {candidate.identities.flatMap(i => i.can_read.map(r => {
                  const isAdded = addedReadResources.includes(r);
                  return (
                    <div
                      key={`${i.id}-${r}`}
                      className={`p-2.5 rounded border flex items-center justify-between ${
                        isAdded
                          ? 'border-amber-200 bg-amber-50/40 text-[#17211F]'
                          : 'border-[#DFE5E1] bg-[#FBFBFA] text-[#17211F]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={12} className="text-[#A15C07]" />}
                        <span className="font-medium">{r}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-[#A15C07] border border-amber-200">
                            WIDENED SCOPE
                          </span>
                        )}
                        <span className="text-[11px] text-[#64716C]">via {i.id}</span>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* Egress Sinks with delta */}
            <div>
              <div className="text-[#64716C] text-[11px] uppercase font-semibold mb-2 tracking-wider">
                Egress Sinks (with delta)
              </div>
              <div className="space-y-1.5">
                {candidate.destinations.map(d => {
                  const isAdded = addedSendDestinations.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`p-2.5 rounded border flex items-center justify-between ${
                        isAdded
                          ? 'border-red-200 bg-red-50/40 text-[#17211F]'
                          : 'border-[#DFE5E1] bg-[#FBFBFA] text-[#17211F]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={12} className="text-[#B42318]" />}
                        <span className="font-medium">{d.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-50 text-[#B42318] border border-red-200">
                            NEW SINK
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-semibold text-[#B42318] px-2 py-0.5 rounded bg-red-50 border border-red-200">
                          [{d.trust}]
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
