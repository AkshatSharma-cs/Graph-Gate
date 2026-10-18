import React from 'react';
import {
  LayoutDashboard,
  GitCompare,
  Network,
  ShieldAlert,
  Scale,
  FileText,
  Database,
  Terminal,
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
    <aside className="w-60 bg-surface-50 border-r border-hairline text-ink-secondary flex flex-col justify-between shrink-0 select-none">
      {/* Brand & Workspace */}
      <div>
        <div className="px-4 py-3.5 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-xs bg-linear flex items-center justify-center text-white font-mono text-xs font-bold shadow-subtle">
              G
            </div>
            <div>
              <div className="font-sans font-semibold text-xs text-ink tracking-tight flex items-center gap-1.5">
                <span>GraphGate</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-surface-200 text-ink-muted border border-hairline-subtle">
                  CI
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-ink-faint">v0.1</span>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-0.5">
          <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-ink-faint tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs transition-colors ${
                  isActive
                    ? 'bg-surface-200 text-ink font-medium border border-hairline'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isActive ? 'text-linear' : 'text-ink-muted'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-xs bg-signal-red-subtle text-signal-red border border-signal-red/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Engine Status & Footer */}
      <div className="p-3 border-t border-hairline space-y-2 bg-surface-50/50">
        <div className="p-2.5 rounded-sm bg-surface-100 border border-hairline">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase text-ink-faint flex items-center gap-1.5">
              <Database size={10} />
              <span>Graph Engine</span>
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isFalkorConnected ? 'bg-signal-green' : 'bg-linear'}`} />
          </div>
          <div className="text-[11px] font-mono text-ink font-medium truncate">
            {isFalkorConnected ? 'FalkorDB Native (Port 6379)' : 'Local Cypher Engine (Standby)'}
          </div>
          <div className="text-[10px] font-mono text-ink-muted mt-0.5 truncate">
            Cypher Reachability Verified
          </div>
        </div>

        <div className="px-1 text-[10px] font-mono text-ink-faint flex items-center justify-between">
          <span>Graph Hacks Track 01</span>
          <span>FalkorDB</span>
        </div>
      </div>
    </aside>
  );
};
