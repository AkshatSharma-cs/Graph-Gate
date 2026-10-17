import React from 'react';
import { CIStatus, ScanSummary } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface KPICardsProps {
  summary: ScanSummary;
  ciStatus: CIStatus;
}

export const KPICards: React.FC<KPICardsProps> = ({ summary, ciStatus }) => {
  const getBannerInfo = () => {
    switch (ciStatus) {
      case 'fail':
        return {
          bg: 'bg-risk-50 border-risk-200 text-risk-900',
          badgeBg: 'bg-risk-600 text-white',
          icon: <ShieldAlert className="text-risk-600" size={20} />,
          title: 'CI Gate Status: FAIL (Blocked)',
          desc: `${summary.new_violations_count} newly reachable sensitive data flow(s) detected in candidate pull request. Merge is blocked.`,
        };
      case 'warn':
        return {
          bg: 'bg-warning-50 border-warning-200 text-warning-900',
          badgeBg: 'bg-warning-600 text-white',
          icon: <AlertTriangle className="text-warning-600" size={20} />,
          title: 'CI Gate Status: WARN (Manual Review Required)',
          desc: `${summary.needs_review_count} boundary finding(s) with unclassified data or unverified destination trust.`,
        };
      case 'pass':
      default:
        return {
          bg: 'bg-success-50 border-success-200 text-success-900',
          badgeBg: 'bg-success-600 text-white',
          icon: <ShieldCheck className="text-success-600" size={20} />,
          title: 'CI Gate Status: PASS (Approved)',
          desc: 'Zero newly reachable sensitive flows introduced. Candidate capability additions conform to all active policies.',
        };
    }
  };

  const banner = getBannerInfo();

  return (
    <div className="space-y-4">
      {/* CI Gate Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all ${banner.bg}`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-white rounded-lg shadow-xs">{banner.icon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-ink">{banner.title}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${banner.badgeBg}`}>
                {ciStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{banner.desc}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500 border-l border-border pl-4">
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-sans font-semibold">Graph Traversal</div>
            <div className="font-semibold text-ink">
              {summary.is_truncated ? 'Truncated at limit' : '100% Complete'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. New Violations */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">New Violations</span>
            <span className={`p-1 rounded ${summary.new_violations_count > 0 ? 'bg-risk-50 text-risk-600' : 'bg-slate-50 text-slate-400'}`}>
              <ShieldAlert size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${summary.new_violations_count > 0 ? 'text-risk-600' : 'text-ink'}`}>
              {summary.new_violations_count}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">candidate - baseline</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {summary.new_violations_count > 0 ? (
              <span className="text-risk-600 font-medium">Blocking PR merge</span>
            ) : (
              <span className="text-success-600 font-medium">No new risks introduced</span>
            )}
          </div>
        </div>

        {/* 2. Pre-existing */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Pre-existing</span>
            <span className="p-1 rounded bg-slate-50 text-slate-500">
              <AlertTriangle size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink">{summary.pre_existing_count}</span>
            <span className="text-[11px] text-slate-400 font-medium">baseline ∩ candidate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Prior technical debt</span>
          </div>
        </div>

        {/* 3. Resolved */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Resolved Paths</span>
            <span className="p-1 rounded bg-success-50 text-success-600">
              <CheckCircle2 size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-success-600">{summary.resolved_count}</span>
            <span className="text-[11px] text-slate-400 font-medium">baseline - candidate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span className="text-success-600 font-medium">Paths safely eliminated</span>
          </div>
        </div>

        {/* 4. Needs Review */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Needs Review</span>
            <span className={`p-1 rounded ${summary.needs_review_count > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${summary.needs_review_count > 0 ? 'text-amber-600' : 'text-ink'}`}>
              {summary.needs_review_count}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">unclassified boundaries</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Audit boundary declarations</span>
          </div>
        </div>
      </div>
    </div>
  );
};
