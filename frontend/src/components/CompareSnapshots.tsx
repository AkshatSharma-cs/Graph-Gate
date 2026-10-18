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
      <div className="bg-surface-100 p-4 rounded border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-surface-200 text-linear rounded-xs border border-hairline">
            <GitCompare size={15} />
          </span>
          <div>
            <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
              Declarative Capability Delta
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Comparing toolchain registrations, identity permissions, and egress sinks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 bg-surface-50 rounded-xs border border-hairline">
            <span className="text-ink-muted">TOOLS: </span>
            <span className="text-ink font-semibold">{baseline.tools.length}</span>
            <ArrowRight size={10} className="inline mx-1 text-ink-faint" />
            <span className="text-linear font-semibold">{candidate.tools.length}</span>
          </div>

          <div className="px-2.5 py-1 bg-surface-50 rounded-xs border border-hairline">
            <span className="text-ink-muted">SCOPES: </span>
            <span className="text-ink font-semibold">{baseReadResources.size}</span>
            <ArrowRight size={10} className="inline mx-1 text-ink-faint" />
            <span className="text-linear font-semibold">{candReadResources.length}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline (main) */}
        <div className="bg-surface-100 rounded border border-hairline shadow-subtle overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-surface-50 border-b border-hairline flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <GitBranch size={12} className="text-ink-muted" />
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">BASELINE (main)</span>
            </div>
            <span className="text-[10px] text-ink-faint">{baseline.agents.length} agent(s)</span>
          </div>

          <div className="p-4 space-y-4 text-xs font-mono flex-1">
            {/* Tools */}
            <div>
              <div className="text-ink-faint text-[10px] uppercase font-semibold mb-1.5 tracking-wider">
                Configured Tools
              </div>
              <div className="space-y-1">
                {baseline.tools.map(t => (
                  <div key={t.id} className="p-2 rounded-xs border border-hairline bg-surface-50 flex items-center justify-between">
                    <span className="text-ink font-medium">{t.id}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 rounded-xs bg-surface-200 text-ink-muted">
                      {t.kind}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read Scopes */}
            <div>
              <div className="text-ink-faint text-[10px] uppercase font-semibold mb-1.5 tracking-wider">
                Permitted Read Scopes
              </div>
              <div className="space-y-1">
                {baseline.identities.flatMap(i => i.can_read.map(r => (
                  <div key={`${i.id}-${r}`} className="p-2 rounded-xs border border-hairline bg-surface-50 flex items-center justify-between">
                    <span className="text-ink-secondary">{r}</span>
                    <span className="text-[10px] text-ink-faint">via {i.id}</span>
                  </div>
                )))}
              </div>
            </div>

            {/* Egress Sinks */}
            <div>
              <div className="text-ink-faint text-[10px] uppercase font-semibold mb-1.5 tracking-wider">
                Egress Sinks
              </div>
              <div className="space-y-1">
                {baseline.destinations.map(d => (
                  <div key={d.id} className="p-2 rounded-xs border border-hairline bg-surface-50 flex items-center justify-between">
                    <span className="text-ink-secondary">{d.id}</span>
                    <span className="text-[10px] uppercase text-signal-green">[{d.trust}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Candidate (PR) */}
        <div className="bg-surface-100 rounded border border-hairline shadow-subtle overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 bg-surface-50 border-b border-hairline flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-linear"></span>
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">CANDIDATE (PR #42)</span>
            </div>
            <span className="text-[10px] text-linear font-semibold">DELTA EVALUATED</span>
          </div>

          <div className="p-4 space-y-4 text-xs font-mono flex-1">
            {/* Tools with delta */}
            <div>
              <div className="text-ink-faint text-[10px] uppercase font-semibold mb-1.5 tracking-wider">
                Configured Tools (with delta)
              </div>
              <div className="space-y-1">
                {candidate.tools.map(t => {
                  const isAdded = addedTools.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className={`p-2 rounded-xs border flex items-center justify-between transition-colors ${
                        isAdded
                          ? 'border-linear/40 bg-linear-subtle text-ink'
                          : 'border-hairline bg-surface-50 text-ink-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={11} className="text-linear" />}
                        <span className="font-medium">{t.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[9px] uppercase font-bold text-linear px-1.5 py-0.2 rounded-xs bg-linear/20">
                            + ADDED
                          </span>
                        )}
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded-xs bg-surface-200 text-ink-muted">
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
              <div className="text-ink-faint text-[10px] uppercase font-semibold mb-1.5 tracking-wider">
                Permitted Read Scopes (with delta)
              </div>
              <div className="space-y-1">
                {candidate.identities.flatMap(i => i.can_read.map(r => {
                  const isAdded = addedReadResources.includes(r);
                  return (
                    <div
                      key={`${i.id}-${r}`}
                      className={`p-2 rounded-xs border flex items-center justify-between ${
                        isAdded
                          ? 'border-signal-red/40 bg-signal-red-subtle text-signal-red'
                          : 'border-hairline bg-surface-50 text-ink-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={11} className="text-signal-red" />}
                        <span className="font-medium">{r}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-xs bg-signal-red/20 text-signal-red">
                            WIDENED SCOPE
                          </span>
                        )}
                        <span className="text-[10px] text-ink-faint">via {i.id}</span>
                      </div>
                    </div>
                  );
                }))}
              </div>
            </div>

            {/* Egress Sinks with delta */}
            <div>
              <div className="text-ink-faint text-[10px] uppercase font-semibold mb-1.5 tracking-wider">
                Egress Sinks (with delta)
              </div>
              <div className="space-y-1">
                {candidate.destinations.map(d => {
                  const isAdded = addedSendDestinations.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      className={`p-2 rounded-xs border flex items-center justify-between ${
                        isAdded
                          ? 'border-signal-red/40 bg-signal-red-subtle text-signal-red'
                          : 'border-hairline bg-surface-50 text-ink-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isAdded && <Plus size={11} className="text-signal-red" />}
                        <span className="font-medium">{d.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdded && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-xs bg-signal-red/20 text-signal-red">
                            NEW SINK
                          </span>
                        )}
                        <span className="text-[10px] uppercase font-semibold text-signal-red">[{d.trust}]</span>
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
