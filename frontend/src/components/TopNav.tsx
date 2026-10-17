import React from 'react';
import { CIStatus, DemoScenario } from '../types';
import { Play, RefreshCw, GitPullRequest, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

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
  const getStatusBadge = () => {
    switch (ciStatus) {
      case 'fail':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-risk-100 text-risk-700 border border-risk-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-risk-600 animate-ping" />
            <span>CI BLOCKED: FAIL</span>
          </div>
        );
      case 'warn':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-warning-100 text-warning-800 border border-warning-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-warning-600" />
            <span>CI WARN: REVIEW</span>
          </div>
        );
      case 'pass':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-success-100 text-success-800 border border-success-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-success-600" />
            <span>CI APPROVED: PASS</span>
          </div>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between shrink-0 shadow-2xs">
      {/* Left: Scenario Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <GitPullRequest size={14} className="text-slate-400" />
          <span>Demo Scenario:</span>
        </div>

        <select
          value={activeScenarioId}
          onChange={(e) => onSelectScenario(e.target.value)}
          className="text-xs font-semibold text-ink bg-slate-50 border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-md truncate"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.expected_status.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Right: CI Status + Re-Run */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Scan ID</div>
          <div className="text-xs font-mono font-medium text-slate-600">{scanId || 'initializing'}</div>
        </div>

        {getStatusBadge()}

        <button
          onClick={onReRunAnalysis}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span>{isLoading ? 'Evaluating...' : 'Re-Run Gate'}</span>
        </button>
      </div>
    </header>
  );
};
