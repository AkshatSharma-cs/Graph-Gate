import React from 'react';
import { CIStatus, DemoScenario } from '../types';
import { RefreshCw, GitPullRequest, GitCommit, ChevronDown } from 'lucide-react';

interface TopNavProps {
  scenarios: DemoScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onReRunAnalysis: () => void;
  isLoading: boolean;
  ciStatus: CIStatus;
  scanId: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onReRunAnalysis,
  isLoading,
  ciStatus,
  scanId,
}) => {
  const getStatusPill = () => {
    switch (ciStatus) {
      case 'fail':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 text-[#B42318] rounded font-mono text-xs font-semibold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B42318]" />
            <span>GATE: BLOCKED</span>
          </div>
        );
      case 'warn':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-[#A15C07] rounded font-mono text-xs font-semibold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#A15C07]" />
            <span>GATE: REVIEW REQUIRED</span>
          </div>
        );
      case 'pass':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#16794B] rounded font-mono text-xs font-semibold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#16794B]" />
            <span>GATE: PASSED</span>
          </div>
        );
    }
  };

  return (
    <header className="h-[54px] bg-white border-b border-[#DFE5E1] px-5 flex items-center justify-between shrink-0 select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
      {/* Left: Scenario Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#64716C]">
          <GitPullRequest size={14} className="text-[#286A61]" />
          <span className="tracking-wide uppercase font-mono text-[11px]">Scenario:</span>
        </div>

        <div className="relative">
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="text-xs font-medium text-[#17211F] bg-[#F5F6F4] hover:bg-white border border-[#DFE5E1] hover:border-[#286A61] rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#286A61] focus:border-[#286A61] cursor-pointer appearance-none pr-8 max-w-sm truncate transition-colors"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className="text-[#17211F] bg-white">
                {s.title} [{s.expected_status.toUpperCase()}]
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64716C]"
          />
        </div>
      </div>

      {/* Right: Authoritative CI Status & Re-Run Trigger */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#64716C] px-2.5 py-1 rounded bg-[#F5F6F4] border border-[#DFE5E1]">
          <GitCommit size={13} className="text-[#64716C]" />
          <span className="text-[#64716C]">SCAN</span>
          <span className="text-[#17211F] font-semibold">{scanId ? scanId.replace('scan-', '') : 'init'}</span>
        </div>

        {getStatusPill()}

        <button
          onClick={onReRunAnalysis}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[#286A61] hover:bg-[#1f544c] active:bg-[#173f39] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Traversing Graph...' : 'Re-run Analysis'}</span>
        </button>
      </div>
    </header>
  );
};
