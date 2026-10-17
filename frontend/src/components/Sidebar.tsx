import React from 'react';
import {
  LayoutDashboard,
  GitCompare,
  Network,
  ShieldAlert,
  Scale,
  FileText,
  Database,
  ExternalLink,
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
    { id: 'compare' as NavTab, label: 'Compare Snapshots', icon: GitCompare },
    { id: 'graph' as NavTab, label: 'Graph Explorer', icon: Network },
    {
      id: 'findings' as NavTab,
      label: 'Findings',
      icon: ShieldAlert,
      badge: violationsCount > 0 ? violationsCount : undefined,
    },
    { id: 'policies' as NavTab, label: 'Policies', icon: Scale },
    { id: 'report' as NavTab, label: 'CI Report & SARIF', icon: FileText },
  ];

  const isFalkorConnected = engineStatus?.falkordb_connected ?? false;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none">
      {/* Brand */}
      <div>
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Network size={20} />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white">GraphGate CI</div>
            <div className="text-[10px] text-slate-400 font-mono">Agent Data-Flow Gate</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-risk-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Engine Status */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Database size={11} />
              <span>Graph Engine</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${isFalkorConnected ? 'bg-success-500 animate-pulse' : 'bg-indigo-400'}`} />
          </div>
          <div className="text-xs font-semibold text-white">
            {isFalkorConnected ? 'FalkorDB Native (Active)' : 'Local Engine (FalkorDB Standby)'}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            {engineStatus?.host || 'localhost'}:{engineStatus?.port || 6379}
          </div>
        </div>

        {/* Attribution / Hackathon Notice */}
        <div className="text-[10px] text-slate-500 leading-tight">
          Graph Hacks Track 01 · Powered by <span className="text-slate-400">FalkorDB</span> & Cypher Data-Flow Modeling.
        </div>
      </div>
    </aside>
  );
};
