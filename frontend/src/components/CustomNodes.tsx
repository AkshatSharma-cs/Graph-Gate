import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Wrench, Shield, FileText, Globe, Layers, Tag } from 'lucide-react';

export const AgentNode = memo(({ data, selected }: any) => (
  <div className={`px-3 py-2.5 rounded-sm bg-surface-100 border transition-all min-w-[170px] shadow-subtle ${
    selected
      ? 'border-linear ring-1 ring-linear shadow-glow'
      : 'border-hairline hover:border-hairline-strong'
  }`}>
    <Handle type="target" position={Position.Left} className="!bg-surface-300 !border !border-hairline-strong" />
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-linear"></span>
        <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">Agent</span>
      </div>
      {data.framework && (
        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-surface-200 text-ink-muted rounded-xs border border-hairline-subtle">
          {data.framework}
        </span>
      )}
    </div>
    <div className="font-sans font-semibold text-xs text-ink truncate">{data.label}</div>
    <Handle type="source" position={Position.Right} className="!bg-surface-300 !border !border-hairline-strong" />
  </div>
));

export const AgentContextNode = memo(({ data, selected }: any) => (
  <div className={`px-3 py-2.5 rounded-sm bg-surface-100 border transition-all min-w-[170px] shadow-subtle ${
    selected
      ? 'border-purple-500 ring-1 ring-purple-500'
      : 'border-hairline hover:border-hairline-strong'
  }`}>
    <Handle type="target" position={Position.Left} className="!bg-surface-300 !border !border-hairline-strong" />
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
        <span className="text-[10px] font-mono tracking-wider uppercase text-purple-400">Context</span>
      </div>
      <span className="text-[9px] font-mono px-1 py-0.2 bg-purple-500/10 text-purple-300 rounded-xs border border-purple-500/20">
        shared
      </span>
    </div>
    <div className="font-sans font-semibold text-xs text-ink truncate">{data.label}</div>
    <Handle type="source" position={Position.Right} className="!bg-surface-300 !border !border-hairline-strong" />
  </div>
));

export const ToolNode = memo(({ data, selected }: any) => {
  const isSend = data.kind === 'send';
  return (
    <div className={`px-3 py-2.5 rounded-sm bg-surface-100 border transition-all min-w-[170px] shadow-subtle ${
      selected
        ? 'border-signal-blue ring-1 ring-signal-blue'
        : 'border-hairline hover:border-hairline-strong'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-surface-300 !border !border-hairline-strong" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isSend ? 'bg-signal-amber' : 'bg-signal-blue'}`}></span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">Tool</span>
        </div>
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-xs border ${
          isSend
            ? 'bg-signal-amber-subtle text-signal-amber border-signal-amber/20'
            : 'bg-signal-blue-subtle text-signal-blue border-signal-blue/20'
        }`}>
          {data.kind || 'tool'}
        </span>
      </div>
      <div className="font-sans font-semibold text-xs text-ink truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-surface-300 !border !border-hairline-strong" />
    </div>
  );
});

export const IdentityNode = memo(({ data, selected }: any) => (
  <div className={`px-3 py-2.5 rounded-sm bg-surface-100 border transition-all min-w-[170px] shadow-subtle ${
    selected
      ? 'border-signal-amber ring-1 ring-signal-amber'
      : 'border-hairline hover:border-hairline-strong'
  }`}>
    <Handle type="target" position={Position.Left} className="!bg-surface-300 !border !border-hairline-strong" />
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-signal-amber"></span>
        <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">Identity</span>
      </div>
      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-surface-200 text-ink-secondary rounded-xs border border-hairline-subtle">
        {data.principal_type || 'service_account'}
      </span>
    </div>
    <div className="font-sans font-semibold text-xs text-ink truncate">{data.label}</div>
    <Handle type="source" position={Position.Right} className="!bg-surface-300 !border !border-hairline-strong" />
  </div>
));

export const ResourceNode = memo(({ data, selected }: any) => {
  const isRestricted = data.classification === 'restricted';
  const isConfidential = data.classification === 'confidential';

  return (
    <div className={`px-3 py-2.5 rounded-sm bg-surface-100 border transition-all min-w-[180px] shadow-subtle ${
      selected
        ? 'border-signal-red ring-1 ring-signal-red shadow-red-glow'
        : isRestricted
        ? 'border-signal-red/50 hover:border-signal-red'
        : isConfidential
        ? 'border-signal-amber/40 hover:border-signal-amber'
        : 'border-hairline hover:border-hairline-strong'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-surface-300 !border !border-hairline-strong" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${
            isRestricted ? 'bg-signal-red animate-pulse' : isConfidential ? 'bg-signal-amber' : 'bg-ink-muted'
          }`}></span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">Source</span>
        </div>
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-xs border font-semibold ${
          isRestricted
            ? 'bg-signal-red-subtle text-signal-red border-signal-red/30'
            : isConfidential
            ? 'bg-signal-amber-subtle text-signal-amber border-signal-amber/30'
            : 'bg-surface-200 text-ink-secondary border-hairline-subtle'
        }`}>
          {data.classification || 'unknown'}
        </span>
      </div>
      <div className="font-mono font-semibold text-xs text-ink truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-surface-300 !border !border-hairline-strong" />
    </div>
  );
});

export const DestinationNode = memo(({ data, selected }: any) => {
  const isExternal = data.trust === 'external' || data.trust === 'untrusted';

  return (
    <div className={`px-3 py-2.5 rounded-sm bg-surface-100 border transition-all min-w-[180px] shadow-subtle ${
      selected
        ? 'border-signal-red ring-1 ring-signal-red shadow-red-glow'
        : isExternal
        ? 'border-signal-red/50 hover:border-signal-red'
        : 'border-signal-green/40 hover:border-signal-green'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-surface-300 !border !border-hairline-strong" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isExternal ? 'bg-signal-red' : 'bg-signal-green'}`}></span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">Sink</span>
        </div>
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-xs border font-semibold ${
          isExternal
            ? 'bg-signal-red-subtle text-signal-red border-signal-red/30'
            : 'bg-signal-green-subtle text-signal-green border-signal-green/30'
        }`}>
          {data.trust || 'external'}
        </span>
      </div>
      <div className="font-mono font-semibold text-xs text-ink truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-surface-300 !border !border-hairline-strong" />
    </div>
  );
});

export const DataClassNode = memo(({ data }: any) => (
  <div className="px-2 py-1 rounded-xs bg-surface-200 border border-hairline text-ink-secondary flex items-center gap-1 text-[10px] font-mono">
    <Handle type="target" position={Position.Left} className="!bg-surface-400" />
    <span className="text-ink-muted">CLASS:</span>
    <span className="font-semibold text-ink uppercase">{data.label}</span>
  </div>
));

export const nodeTypes = {
  Agent: AgentNode,
  AgentContext: AgentContextNode,
  Tool: ToolNode,
  Identity: IdentityNode,
  Resource: ResourceNode,
  Destination: DestinationNode,
  DataClass: DataClassNode,
};
