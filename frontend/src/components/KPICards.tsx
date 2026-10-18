import React from 'react';
import { CIStatus, ScanSummary } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface KPICardsProps {
  summary: ScanSummary;
  ciStatus: CIStatus;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, ciStatus }) => {
  const getGateBadge = () => {
    switch (ciStatus) {
      case 'fail':
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-red animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-signal-red">
              CI GATE: BLOCKED (FAIL)
            </span>
          </div>
        );
      case 'warn':
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-amber" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-signal-amber">
              CI GATE: REVIEW REQUIRED (WARN)
            </span>
          </div>
        );
      case 'pass':
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-signal-green" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-signal-green">
              CI GATE: PASSED (APPROVED)
            </span>
          </div>
        );
    }
  };

  const getGateMessage = () => {
    switch (ciStatus) {
      case 'fail':
        return `${summary.new_violations_count} newly reachable data flow path violates declared egress security policies. Merge is prevented.`;
      case 'warn':
        return `${summary.needs_review_count} boundary finding(s) with unclassified resources or unverified destination trust levels.`;
      case 'pass':
      default:
        return `Zero newly reachable sensitive flows introduced. Candidate capability changes strictly conform to all active policies.`;
    }
  };

  return (
    <div className="bg-surface-100 border border-hairline rounded overflow-hidden shadow-subtle">
      {/* Top Telemetry Header */}
      <div className="px-5 py-3.5 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-50">
        <div className="flex items-start md:items-center gap-3">
          <div className="mt-0.5 md:mt-0">{getGateBadge()}</div>
          <span className="hidden md:inline text-hairline-strong">|</span>
          <p className="text-xs text-ink-secondary leading-snug">{getGateMessage()}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-ink-muted self-end md:self-auto shrink-0">
          <div>
            <span className="text-ink-faint">TRAVERSAL: </span>
            <span className="text-ink font-semibold">
              {summary.is_truncated ? 'TRUNCATED (LIMIT)' : 'EXHAUSTIVE (100%)'}
            </span>
          </div>
          <div>
            <span className="text-ink-faint">PATHS: </span>
            <span className="text-ink font-semibold">{summary.total_candidate_violations} VIOLATION(S)</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Columns with vertical hairline dividers */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-hairline bg-surface-100">
        {/* 1. New Violations */}
        <div className="p-4 hover:bg-surface-200/50 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase text-ink-muted">New Violations</span>
            {summary.new_violations_count > 0 && (
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-red-subtle text-signal-red border border-signal-red/20">
                BLOCKING
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-mono font-bold tracking-tight ${
              summary.new_violations_count > 0 ? 'text-signal-red' : 'text-ink'
            }`}>
              {summary.new_violations_count}
            </span>
            <span className="text-[11px] font-mono text-ink-faint">Δ (cand - base)</span>
          </div>
          <div className="mt-1 text-[11px] text-ink-muted truncate">
            {summary.new_violations_count > 0 ? 'Introduced in candidate PR' : 'No new risky paths'}
          </div>
        </div>

        {/* 2. Pre-existing */}
        <div className="p-4 hover:bg-surface-200/50 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase text-ink-muted">Pre-Existing</span>
            <span className="text-[9px] font-mono text-ink-faint">UNCHANGED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-ink tracking-tight">
              {summary.pre_existing_count}
            </span>
            <span className="text-[11px] font-mono text-ink-faint">∩ (base ∩ cand)</span>
          </div>
          <div className="mt-1 text-[11px] text-ink-muted truncate">
            Prior technical debt in main
          </div>
        </div>

        {/* 3. Resolved */}
        <div className="p-4 hover:bg-surface-200/50 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase text-ink-muted">Resolved Paths</span>
            {summary.resolved_count > 0 && (
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-green-subtle text-signal-green border border-signal-green/20">
                FIXED
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-signal-green tracking-tight">
              {summary.resolved_count}
            </span>
            <span className="text-[11px] font-mono text-ink-faint">Δ (base - cand)</span>
          </div>
          <div className="mt-1 text-[11px] text-ink-muted truncate">
            Risks severed by change
          </div>
        </div>

        {/* 4. Needs Review */}
        <div className="p-4 hover:bg-surface-200/50 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase text-ink-muted">Needs Review</span>
            {summary.needs_review_count > 0 && (
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded-xs bg-signal-amber-subtle text-signal-amber border border-signal-amber/20">
                AUDIT
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-mono font-bold tracking-tight ${
              summary.needs_review_count > 0 ? 'text-signal-amber' : 'text-ink'
            }`}>
              {summary.needs_review_count}
            </span>
            <span className="text-[11px] font-mono text-ink-faint">unclassified</span>
          </div>
          <div className="mt-1 text-[11px] text-ink-muted truncate">
            Requires boundary clarification
          </div>
        </div>
      </div>
    </div>
  );
};
