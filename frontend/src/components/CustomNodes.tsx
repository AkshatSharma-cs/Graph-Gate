import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, Wrench, Shield, FileText, Globe, Layers, Tag } from 'lucide-react';

export const AgentNode = memo(({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 transition-all min-w-[160px] ${
    selected ? 'border-accent-600 ring-2 ring-accent-200' : 'border-indigo-200 hover:border-indigo-400'
  }`}>
    <Handle type="target" position={Position.Left} className="!bg-indigo-600 !w-2.5 !h-2.5" />
    <div className="flex items-center gap-2 mb-1.5">
      <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
        <Bot size={16} />
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600">AI Agent</span>
    </div>
    <div className="font-semibold text-xs text-ink truncate max-w-[150px]">{data.label}</div>
    {data.framework && (
      <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
        {data.framework}
      </span>
    )}
    <Handle type="source" position={Position.Right} className="!bg-indigo-600 !w-2.5 !h-2.5" />
  </div>
));

export const AgentContextNode = memo(({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-md rounded-xl bg-purple-50/50 border-2 transition-all min-w-[160px] ${
    selected ? 'border-purple-600 ring-2 ring-purple-200' : 'border-purple-200 hover:border-purple-400'
  }`}>
    <Handle type="target" position={Position.Left} className="!bg-purple-600 !w-2.5 !h-2.5" />
    <div className="flex items-center gap-2 mb-1.5">
      <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
        <Layers size={16} />
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase text-purple-700">Agent Context</span>
    </div>
    <div className="font-semibold text-xs text-ink truncate max-w-[150px]">{data.label}</div>
    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
      shared memory
    </span>
    <Handle type="source" position={Position.Right} className="!bg-purple-600 !w-2.5 !h-2.5" />
  </div>
));

export const ToolNode = memo(({ data, selected }: any) => {
  const isSend = data.kind === 'send';
  return (
    <div className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 transition-all min-w-[160px] ${
      selected ? 'border-sky-600 ring-2 ring-sky-200' : 'border-sky-200 hover:border-sky-400'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-sky-600 !w-2.5 !h-2.5" />
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`p-1.5 rounded-lg ${isSend ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>
          <Wrench size={16} />
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase text-sky-600">Tool</span>
      </div>
      <div className="font-semibold text-xs text-ink truncate max-w-[150px]">{data.label}</div>
      <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded font-medium ${
        isSend ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
      }`}>
        {data.kind || 'tool'}
      </span>
      <Handle type="source" position={Position.Right} className="!bg-sky-600 !w-2.5 !h-2.5" />
    </div>
  );
});

export const IdentityNode = memo(({ data, selected }: any) => (
  <div className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 transition-all min-w-[160px] ${
    selected ? 'border-amber-600 ring-2 ring-amber-200' : 'border-amber-200 hover:border-amber-400'
  }`}>
    <Handle type="target" position={Position.Left} className="!bg-amber-600 !w-2.5 !h-2.5" />
    <div className="flex items-center gap-2 mb-1.5">
      <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
        <Shield size={16} />
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600">Identity</span>
    </div>
    <div className="font-semibold text-xs text-ink truncate max-w-[150px]">{data.label}</div>
    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
      {data.principal_type || 'service_account'}
    </span>
    <Handle type="source" position={Position.Right} className="!bg-amber-600 !w-2.5 !h-2.5" />
  </div>
));

export const ResourceNode = memo(({ data, selected }: any) => {
  const isRestricted = data.classification === 'restricted';
  const isConfidential = data.classification === 'confidential';

  const badgeColor = isRestricted
    ? 'bg-risk-100 text-risk-700 border-risk-300'
    : isConfidential
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <div className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 transition-all min-w-[170px] ${
      selected
        ? 'border-risk-600 ring-2 ring-risk-200'
        : isRestricted
        ? 'border-risk-300 hover:border-risk-500'
        : 'border-slate-200 hover:border-slate-400'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-600 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg">
            <FileText size={16} />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600">Source</span>
        </div>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
          {data.classification || 'unknown'}
        </span>
      </div>
      <div className="font-semibold text-xs text-ink truncate max-w-[150px]">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-slate-600 !w-2.5 !h-2.5" />
    </div>
  );
});

export const DestinationNode = memo(({ data, selected }: any) => {
  const isExternal = data.trust === 'external' || data.trust === 'untrusted';
  const badgeColor = isExternal
    ? 'bg-risk-100 text-risk-700 border-risk-300'
    : 'bg-success-100 text-success-700 border-success-300';

  return (
    <div className={`px-4 py-3 shadow-md rounded-xl bg-white border-2 transition-all min-w-[170px] ${
      selected
        ? 'border-risk-600 ring-2 ring-risk-200'
        : isExternal
        ? 'border-risk-300 hover:border-risk-500'
        : 'border-success-300 hover:border-success-500'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-600 !w-2.5 !h-2.5" />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-slate-50 text-slate-700 rounded-lg">
            <Globe size={16} />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600">Sink</span>
        </div>
        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
          {data.trust || 'external'}
        </span>
      </div>
      <div className="font-semibold text-xs text-ink truncate max-w-[150px]">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-slate-600 !w-2.5 !h-2.5" />
    </div>
  );
});

export const DataClassNode = memo(({ data }: any) => (
  <div className="px-3 py-1.5 shadow-sm rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-1.5 text-xs">
    <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
    <Tag size={12} />
    <span className="font-bold uppercase text-[9px]">{data.label}</span>
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
