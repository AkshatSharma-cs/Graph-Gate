import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

export const AgentNode = memo(({ data, selected }: any) => (
  <div
    className={`px-3 py-2 rounded bg-white border transition-all min-w-[170px] shadow-xs ${
      selected
        ? 'border-[#286A61] ring-2 ring-[#286A61]/20'
        : 'border-[#DFE5E1] hover:border-[#9BA7A1]'
    }`}
  >
    <Handle type="target" position={Position.Left} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#286A61]"></span>
        <span className="text-[11px] font-mono tracking-wider uppercase text-[#64716C]">Agent</span>
      </div>
      {data.framework && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F5F6F4] text-[#64716C] rounded border border-[#DFE5E1]">
          {data.framework}
        </span>
      )}
    </div>
    <div className="font-sans font-semibold text-xs text-[#17211F] truncate">{data.label}</div>
    <Handle type="source" position={Position.Right} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
  </div>
));

export const AgentContextNode = memo(({ data, selected }: any) => (
  <div
    className={`px-3 py-2 rounded bg-white border transition-all min-w-[170px] shadow-xs ${
      selected
        ? 'border-[#286A61] ring-2 ring-[#286A61]/20'
        : 'border-[#DFE5E1] hover:border-[#9BA7A1]'
    }`}
  >
    <Handle type="target" position={Position.Left} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#64716C]"></span>
        <span className="text-[11px] font-mono tracking-wider uppercase text-[#64716C]">Context</span>
      </div>
      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-50 text-[#64716C] rounded border border-slate-200">
        shared
      </span>
    </div>
    <div className="font-sans font-semibold text-xs text-[#17211F] truncate">{data.label}</div>
    <Handle type="source" position={Position.Right} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
  </div>
));

export const ToolNode = memo(({ data, selected }: any) => {
  const isSend = data.kind === 'send';
  return (
    <div
      className={`px-3 py-2 rounded bg-white border transition-all min-w-[170px] shadow-xs ${
        selected
          ? 'border-[#286A61] ring-2 ring-[#286A61]/20'
          : 'border-[#DFE5E1] hover:border-[#9BA7A1]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isSend ? 'bg-[#A15C07]' : 'bg-[#286A61]'}`}></span>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#64716C]">Tool</span>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
            isSend
              ? 'bg-amber-50 text-[#A15C07] border-amber-200'
              : 'bg-teal-50 text-[#286A61] border-teal-200'
          }`}
        >
          {data.kind || 'tool'}
        </span>
      </div>
      <div className="font-sans font-semibold text-xs text-[#17211F] truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
    </div>
  );
});

export const IdentityNode = memo(({ data, selected }: any) => (
  <div
    className={`px-3 py-2 rounded bg-white border transition-all min-w-[170px] shadow-xs ${
      selected
        ? 'border-[#A15C07] ring-2 ring-[#A15C07]/20'
        : 'border-[#DFE5E1] hover:border-[#9BA7A1]'
    }`}
  >
    <Handle type="target" position={Position.Left} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
    <div className="flex items-center justify-between gap-2 mb-1">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A15C07]"></span>
        <span className="text-[11px] font-mono tracking-wider uppercase text-[#64716C]">Identity</span>
      </div>
      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-50 text-[#A15C07] rounded border border-amber-200">
        {data.principal_type || 'service_account'}
      </span>
    </div>
    <div className="font-sans font-semibold text-xs text-[#17211F] truncate">{data.label}</div>
    <Handle type="source" position={Position.Right} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
  </div>
));

export const ResourceNode = memo(({ data, selected }: any) => {
  const isRestricted = data.classification === 'restricted';
  const isConfidential = data.classification === 'confidential';

  return (
    <div
      className={`px-3 py-2 rounded bg-white border transition-all min-w-[180px] shadow-xs ${
        selected
          ? 'border-[#B42318] ring-2 ring-[#B42318]/20'
          : isRestricted
          ? 'border-red-300 hover:border-[#B42318]'
          : isConfidential
          ? 'border-amber-300 hover:border-[#A15C07]'
          : 'border-[#DFE5E1] hover:border-[#9BA7A1]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isRestricted ? 'bg-[#B42318]' : isConfidential ? 'bg-[#A15C07]' : 'bg-[#64716C]'
            }`}
          ></span>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#64716C]">Source</span>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-medium ${
            isRestricted
              ? 'bg-red-50 text-[#B42318] border-red-200'
              : isConfidential
              ? 'bg-amber-50 text-[#A15C07] border-amber-200'
              : 'bg-[#F5F6F4] text-[#64716C] border-[#DFE5E1]'
          }`}
        >
          {data.classification || 'unknown'}
        </span>
      </div>
      <div className="font-mono font-semibold text-xs text-[#17211F] truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
    </div>
  );
});

export const DestinationNode = memo(({ data, selected }: any) => {
  const isExternal = data.trust === 'external' || data.trust === 'untrusted';

  return (
    <div
      className={`px-3 py-2 rounded bg-white border transition-all min-w-[180px] shadow-xs ${
        selected
          ? 'border-[#B42318] ring-2 ring-[#B42318]/20'
          : isExternal
          ? 'border-red-300 hover:border-[#B42318]'
          : 'border-emerald-300 hover:border-[#16794B]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isExternal ? 'bg-[#B42318]' : 'bg-[#16794B]'}`}
          ></span>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#64716C]">Sink</span>
        </div>
        <span
          className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border font-medium ${
            isExternal
              ? 'bg-red-50 text-[#B42318] border-red-200'
              : 'bg-emerald-50 text-[#16794B] border-emerald-200'
          }`}
        >
          {data.trust || 'external'}
        </span>
      </div>
      <div className="font-mono font-semibold text-xs text-[#17211F] truncate">{data.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-white !w-2.5 !h-2.5 !border-2 !border-[#9BA7A1]" />
    </div>
  );
});

export const DataClassNode = memo(({ data }: any) => (
  <div className="px-2.5 py-1 rounded bg-[#F5F6F4] border border-[#DFE5E1] text-[#64716C] flex items-center gap-1 text-[11px] font-mono shadow-2xs">
    <Handle type="target" position={Position.Left} className="!bg-white !w-2 !h-2 !border !border-[#9BA7A1]" />
    <span className="text-[#64716C]">CLASS:</span>
    <span className="font-semibold text-[#17211F] uppercase">{data.label}</span>
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
