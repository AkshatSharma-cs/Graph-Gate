import React from 'react';
import { ConfigurationSnapshot } from '../types';
import { ArrowRight, Plus, Check, ShieldAlert, GitCompare, FileCode } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Overview callout */}
      <div className="bg-white p-5 rounded-xl border border-border shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <GitCompare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">Configuration Delta Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Diffing declared capabilities, identities, and scopes between baseline branch and candidate PR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-border font-mono">
            <span className="text-slate-500">Tools: </span>
            <span className="font-semibold text-ink">{baseline.tools.length}</span>
            <ArrowRight size={11} className="inline mx-1 text-slate-400" />
            <span className="font-semibold text-indigo-600">{candidate.tools.length}</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-border font-mono">
            <span className="text-slate-500">Read Resources: </span>
            <span className="font-semibold text-ink">{baseReadResources.size}</span>
            <ArrowRight size={11} className="inline mx-1 text-slate-400" />
            <span className="font-semibold text-indigo-600">{candReadResources.length}</span>
          </div>
        </div>
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Snapshot */}
        <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-ink uppercase tracking-wider">Baseline Branch (main)</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                current
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">{baseline.agents.length} agent(s)</span>
          </div>

          <div className="p-5 space-y-4 text-xs flex-1">
            {/* Tools */}
            <div>
              <div className="font-semibold text-slate-500 mb-2 uppercase text-[10px] tracking-wider">
                Configured Tools
              </div>
              <div className="space-y-1.5">
                {baseline.tools.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg border border-border bg-slate-50/50 flex items-center justify-between font-mono text-xs">
                    <span className="font-semibold text-ink">{t.id}</span>
                    <span className="text-[10px] uppercase font-sans font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {t.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read Scopes */}
            <div>
              <div className="font-semibold text-slate-500 mb-2 uppercase text-[10px] tracking-wider">
                Permitted Read Scopes
              </div>
              <div className="space-y-1.5">
                {baseline.identities.flatMap(i => i.can_read.map(r => (
                  <div key={`${i.id}-${r}`} className="p-2 rounded-lg border border-border bg-white flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-700">{r}</span>
                    <span className="text-[10px] text-slate-400">via {i.id}</span>
                  </div>
                )))}
              </div>
            </div>

            {/* Destinations */}
            <div>
              <div className="font-semibold text-slate-500 mb-2 uppercase text-[10px] tracking-wider">
                Egress Targets
              </div>
              <div className="space-y-1.5">
                {baseline.destinations.map(d => (
                  <div key={d.id} className="p-2 rounded-lg border border-border bg-white flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-700">{d.id}</span>
                    <span className="text-[10px] uppercase font-sans font-semibold text-slate-500">[{d.trust}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Snapshot */}
        <div className="bg-white rounded-xl border border-indigo-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider">Candidate Pull Request</span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded font-bold uppercase">
                PR #42
              </span>
            </div>
            <span className="text-xs font-mono text-indigo-600 font-semibold">{candidate.agents.length} agent(s)</span>
          </div>

          <div className="p-5 space-y-4 text-xs flex-1">
            {/* Tools */}
            <div>
              <div className="font-semibold text-slate-500 mb-2 uppercase text-[10px] tracking-wider">
                Configured Tools (with delta)
              </div>
              <div className="space-y-1.5">
                {candidate.tools.map(t => {
                  const isAdded = addedTools.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between font-mono text-xs transition-all ${
                        isAdded
                          ? 'border-indigo-300 bg-indigo-50/70 text-indigo-950 font-bold'
                          : 'border-border bg-slate-50/50 text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={13} className="text-indigo-600 shrink-0" />}
                        <span>{t.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[9px] font-sans uppercase font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                            Added In PR
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-sans font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {t.kind}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Read Scopes */}
            <div>
              <div className="font-semibold text-slate-500 mb-2 uppercase text-[10px] tracking-wider">
                Permitted Read Scopes (with delta)
              </div>
              <div className="space-y-1.5">
                {candidate.identities.flatMap(i => i.can_read.map(r => {
                  const isAdded = addedReadResources.includes(r);
                  return (
                    <div
                      key={`${i.id}-${r}`}
                      className={`p-2 rounded-lg border flex items-center justify-between font-mono text-xs ${
                        isAdded
                          ? 'border-risk-300 bg-risk-50/60 text-risk-900 font-bold'
                          : 'border-border bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={12} className="text-risk-600 shrink-0" />}
                        <span>{r}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[9px] font-sans uppercase font-bold text-risk-700 bg-risk-100 px-1.5 py-0.5 rounded">
                            Widened Scope
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">via {i.id}</span>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* Destinations */}
            <div>
              <div className="font-semibold text-slate-500 mb-2 uppercase text-[10px] tracking-wider">
                Egress Targets (with delta)
              </div>
              <div className="space-y-1.5">
                {candidate.destinations.map(d => {
                  const isAdded = addedSendDestinations.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`p-2 rounded-lg border flex items-center justify-between font-mono text-xs ${
                        isAdded
                          ? 'border-risk-300 bg-risk-50/60 text-risk-900 font-bold'
                          : 'border-border bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={12} className="text-risk-600 shrink-0" />}
                        <span>{d.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[9px] font-sans uppercase font-bold text-risk-700 bg-risk-100 px-1.5 py-0.5 rounded">
                            New Egress Sink
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-sans font-semibold text-slate-500">[{d.trust}]</span>
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
