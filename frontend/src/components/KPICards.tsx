import React from 'react';
import { CIStatus, ScanSummary } from '../types';
import { Cpu, Activity } from 'lucide-react';

interface KPICardsProps {
  summary: ScanSummary;
  ciStatus: CIStatus;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, ciStatus }) => {
  const getSummaryNarrative = () => {
    switch (ciStatus) {
      case 'fail':
        return `${summary.new_violations_count} newly reachable data flow path violates declared security policies. Merge is prevented.`;
      case 'warn':
        return `${summary.needs_review_count} boundary finding(s) require review due to unclassified resources or unverified destination trust levels.`;
      case 'pass':
      default:
        return 'Zero newly reachable sensitive flows introduced. Candidate capability changes strictly conform to all active policies.';
    }
  };

  return (
    <div className="bg-white border border-[#DFE5E1] rounded-md overflow-hidden shadow-xs">
      {/* Top Telemetry Header */}
      <div className="px-5 py-3 border-b border-[#DFE5E1] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FBFBFA]">
        <div className="flex items-center gap-2.5">
          <Activity size={15} className="text-[#286A61] shrink-0" />
          <p className="text-xs font-medium text-[#17211F] leading-snug">
            {getSummaryNarrative()}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#64716C] self-end md:self-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <Cpu size={13} className="text-[#64716C]" />
            <span className="text-[#64716C]">ENGINE:</span>
            <span className="text-[#17211F] font-semibold">
              {summary.is_truncated ? 'TRUNCATED (LIMIT)' : 'EXHAUSTIVE (FALKORDB)'}
            </span>
          </div>
          <div>
            <span className="text-[#64716C]">EVALUATED: </span>
            <span className="text-[#17211F] font-semibold">{summary.total_candidate_violations} PATH(S)</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Columns with vertical hairline dividers */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#DFE5E1] bg-white">
        {/* 1. New Violations */}
        <div className="p-4 hover:bg-[#F5F6F4]/60 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#64716C]">New Violations</span>
            {summary.new_violations_count > 0 && (
              <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-[#B42318] border border-red-200">
                BLOCKING
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-mono font-bold tracking-tight ${
                summary.new_violations_count > 0 ? 'text-[#B42318]' : 'text-[#17211F]'
              }`}
            >
              {summary.new_violations_count}
            </span>
            <span className="text-xs font-mono text-[#64716C]">Δ (cand - base)</span>
          </div>
          <div className="mt-1 text-xs text-[#64716C] truncate">
            {summary.new_violations_count > 0 ? 'Introduced in candidate PR' : 'No new risky paths'}
          </div>
        </div>

        {/* 2. Pre-existing */}
        <div className="p-4 hover:bg-[#F5F6F4]/60 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#64716C]">Pre-Existing</span>
            <span className="text-[11px] font-mono text-[#64716C]">UNCHANGED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[#17211F] tracking-tight">
              {summary.pre_existing_count}
            </span>
            <span className="text-xs font-mono text-[#64716C]">∩ (base ∩ cand)</span>
          </div>
          <div className="mt-1 text-xs text-[#64716C] truncate">
            Prior baseline debt in main
          </div>
        </div>

        {/* 3. Resolved */}
        <div className="p-4 hover:bg-[#F5F6F4]/60 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#64716C]">Resolved Paths</span>
            {summary.resolved_count > 0 && (
              <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-[#16794B] border border-emerald-200">
                SEVERED
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-[#16794B] tracking-tight">
              {summary.resolved_count}
            </span>
            <span className="text-xs font-mono text-[#64716C]">Δ (base - cand)</span>
          </div>
          <div className="mt-1 text-xs text-[#64716C] truncate">
            Risks severed by change
          </div>
        </div>

        {/* 4. Needs Review */}
        <div className="p-4 hover:bg-[#F5F6F4]/60 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#64716C]">Needs Review</span>
            {summary.needs_review_count > 0 && (
              <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-[#A15C07] border border-amber-200">
                AUDIT
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-mono font-bold tracking-tight ${
                summary.needs_review_count > 0 ? 'text-[#A15C07]' : 'text-[#17211F]'
              }`}
            >
              {summary.needs_review_count}
            </span>
            <span className="text-xs font-mono text-[#64716C]">unclassified</span>
          </div>
          <div className="mt-1 text-xs text-[#64716C] truncate">
            Boundary classification needed
          </div>
        </div>
      </div>
    </div>
  );
};
