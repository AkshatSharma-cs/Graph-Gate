import React from 'react';
import { CIStatus, DemoScenario } from '../types';
import { RefreshCw, GitPullRequest, GitCommit, Check, AlertOctagon, AlertTriangle } from 'lucide-react';

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
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-signal-red-subtle border border-signal-red/30 text-signal-red rounded-xs font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse" />
            <span>BLOCKED: FAIL</span>
          </div>
        );
      case 'warn':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-signal-amber-subtle border border-signal-amber/30 text-signal-amber rounded-xs font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-amber" />
            <span>REVIEW: WARN</span>
          </div>
        );
      case 'pass':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-signal-green-subtle border border-signal-green/30 text-signal-green rounded-xs font-mono text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green" />
            <span>APPROVED: PASS</span>
          </div>
        );
    }
  };

  return (
    <header className="h-12 bg-surface-50 border-b border-hairline px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Scenario Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-ink-muted">
          <GitPullRequest size={13} className="text-linear" />
          <span>SCENARIO:</span>
        </div>

        <div className="relative">
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="text-xs font-mono font-medium text-ink bg-surface-100 border border-hairline hover:border-hairline-strong rounded-xs px-2.5 py-1 focus:outline-none focus:border-linear cursor-pointer appearance-none pr-8 max-w-sm truncate"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className="bg-surface-200 text-ink">
                {s.title} [{s.expected_status.toUpperCase()}]
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ink-muted text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Right: CI Status & Re-Run Trigger */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-ink-muted px-2 py-0.5 rounded-xs bg-surface-100 border border-hairline">
          <GitCommit size={12} className="text-ink-faint" />
          <span className="text-ink-faint">SCAN:</span>
          <span className="text-ink font-semibold">{scanId ? scanId.replace('scan-', '') : 'init'}</span>
        </div>

        {getStatusPill()}

        <button
          onClick={onReRunAnalysis}
          disabled={isLoading}
          className="px-2.5 py-1 bg-surface-200 hover:bg-surface-300 active:bg-surface-400 text-ink border border-hairline rounded-xs text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-subtle"
        >
          <RefreshCw size={11} className={isLoading ? 'animate-spin text-linear' : 'text-ink-muted'} />
          <span>{isLoading ? 'TRAVERSING...' : 'RE-RUN'}</span>
        </button>
      </div>
    </header>
  );
};
