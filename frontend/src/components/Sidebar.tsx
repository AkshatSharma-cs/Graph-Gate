import React from 'react';
import {
  LayoutDashboard,
  GitCompare,
  Network,
  ShieldAlert,
  Scale,
  FileText,
  Database,
} from 'lucide-react';
import { EngineStatus } from '../types';

export type NavTab = 'overview' | 'compare' | 'graph' | 'findings' | 'policies' | 'report';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  engineStatus: EngineStatus | null;
  violationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  engineStatus,
  violationsCount,
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'compare' as NavTab, label: 'Snapshot Diff', icon: GitCompare },
    { id: 'graph' as NavTab, label: 'Graph Explorer', icon: Network },
    {
      id: 'findings' as NavTab,
      label: 'Findings',
      icon: ShieldAlert,
      badge: violationsCount > 0 ? violationsCount : undefined,
    },
    { id: 'policies' as NavTab, label: 'Policy Registry', icon: Scale },
    { id: 'report' as NavTab, label: 'CI & SARIF Report', icon: FileText },
  ];

  const isFalkorConnected = engineStatus?.falkordb_connected ?? false;

  return (
    <aside className="w-60 bg-surface border-r border-border text-ink-secondary flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Product Identity */}
      <div>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-brand flex items-center justify-center text-white shadow-subtle">
              <Network size={16} />
            </div>
            <div>
              <div className="font-semibold text-sm text-ink tracking-tight flex items-center gap-1.5">
                <span>GraphGate</span>
                <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-subtle text-ink-secondary border border-border">
                  CI
                </span>
              </div>
              <div className="text-xs text-ink-muted">Data-Flow Gate</div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-xs font-mono uppercase text-ink-muted tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-brand-subtle text-brand font-medium border-l-2 border-brand'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className={isActive ? 'text-brand' : 'text-ink-muted'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-risk-subtle text-risk-text border border-risk-border">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Engine Status & Footer */}
      <div className="p-3 border-t border-border space-y-2 bg-surface-subtle">
        <div className="p-2.5 rounded bg-surface border border-border text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs uppercase text-ink-muted flex items-center gap-1.5">
              <Database size={12} className="text-brand" />
              <span>Graph Engine</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isFalkorConnected ? 'bg-success' : 'bg-brand'
              }`}
            />
          </div>
          <div className="font-medium text-ink truncate">
            {isFalkorConnected ? 'FalkorDB (Active)' : 'Embedded Engine (Standby)'}
          </div>
          <div className="text-xs text-ink-muted font-mono mt-0.5 truncate">
            {engineStatus?.host || 'localhost'}:{engineStatus?.port || 6379}
          </div>
        </div>

        <div className="px-1 text-xs text-ink-muted flex items-center justify-between font-mono">
          <span>Graph Hacks Track 01</span>
          <span>openCypher</span>
        </div>
      </div>
    </aside>
  );
};
