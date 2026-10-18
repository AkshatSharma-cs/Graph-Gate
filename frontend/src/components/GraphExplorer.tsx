import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import { GraphData } from '../types';
import { nodeTypes } from './CustomNodes';
import { Eye, ShieldAlert, Layers } from 'lucide-react';

interface GraphExplorerProps {
  graphData: GraphData;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  title?: string;
  onNodeClick?: (nodeId: string, nodeData: any) => void;
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  graphData,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
  title = "FalkorDB Data-Flow Reachability Topology",
  onNodeClick,
}) => {
  const [onlyRisky, setOnlyRisky] = useState(false);

  // Layout calculation
  const { nodes, edges } = useMemo(() => {
    const hasHighlight = highlightedNodeIds.length > 0 || highlightedEdgeIds.length > 0;

    const typeColumnMap: Record<string, number> = {
      DataClass: 0,
      Resource: 1,
      Identity: 2,
      Tool: 3,
      AgentContext: 4,
      Agent: 5,
      Destination: 8,
    };

    const typeCounters: Record<number, number> = {};
    const flowNodes: Node[] = [];

    const filteredNodes = onlyRisky
      ? graphData.nodes.filter(n => highlightedNodeIds.includes(n.id) || n.data?.classification === 'restricted')
      : graphData.nodes;

    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

    filteredNodes.forEach((n) => {
      let col = typeColumnMap[n.node_type] ?? 4;

      if (n.node_type === 'Tool' && n.data?.kind === 'send') {
        col = 6;
      } else if (n.node_type === 'Identity' && !graphData.edges.some(e => e.source === n.id && e.relationship === 'CAN_READ')) {
        col = 7;
      } else if (n.node_type === 'Destination') {
        col = 8;
      }

      typeCounters[col] = (typeCounters[col] || 0) + 1;
      const rowIdx = typeCounters[col] - 1;

      const isNodeHighlighted = highlightedNodeIds.includes(n.id);

      flowNodes.push({
        id: n.id,
        type: n.node_type,
        position: {
          x: col * 235 + 30,
          y: rowIdx * 115 + 40,
        },
        data: {
          ...n.data,
          label: n.label,
        },
        selected: isNodeHighlighted,
        style: {
          opacity: hasHighlight && !isNodeHighlighted ? 0.35 : 1,
        },
      });
    });

    const flowEdges: Edge[] = [];

    graphData.edges.forEach((e) => {
      if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) return;

      const isEdgeHighlighted = highlightedEdgeIds.includes(e.id) || e.is_risky;
      const isMuted = hasHighlight && !isEdgeHighlighted;

      flowEdges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: false,
        zIndex: isEdgeHighlighted ? 10 : 1,
        label: e.relationship,
        labelStyle: {
          fontSize: '9px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          fill: isEdgeHighlighted ? '#B42318' : '#64716C',
        },
        labelBgStyle: {
          fill: '#FFFFFF',
          fillOpacity: 0.95,
          stroke: isEdgeHighlighted ? '#B42318' : '#DFE5E1',
          strokeWidth: 1,
        },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 4,
        style: {
          stroke: isEdgeHighlighted ? '#B42318' : isMuted ? '#DFE5E1' : '#9BA7A1',
          strokeWidth: isEdgeHighlighted ? 2.5 : 1.2,
          opacity: isMuted ? 0.35 : 1,
        },
        className: isEdgeHighlighted ? 'risky-edge-path' : '',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeHighlighted ? '#B42318' : isMuted ? '#DFE5E1' : '#9BA7A1',
          width: 14,
          height: 14,
        },
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [graphData, highlightedNodeIds, highlightedEdgeIds, onlyRisky]);

  return (
    <div className="flex flex-col h-[520px] bg-[#F5F6F4] rounded-md border border-[#DFE5E1] shadow-xs overflow-hidden">
      {/* Workbench Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#DFE5E1] select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#17211F] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#286A61]"></span>
            <span>{title}</span>
          </span>
          <span className="text-xs text-[#64716C] font-mono">
            [{nodes.length} nodes · {edges.length} edges]
          </span>
        </div>

        <div className="flex items-center gap-3">
          {highlightedNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-[#B42318] rounded text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-[#B42318]" />
              <span>WITNESS PATH ACTIVE</span>
            </div>
          )}

          <button
            onClick={() => setOnlyRisky(!onlyRisky)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border transition-colors cursor-pointer ${
              onlyRisky
                ? 'bg-[#286A61] text-white border-[#286A61]'
                : 'bg-white border-[#DFE5E1] text-[#17211F] hover:bg-[#F5F6F4]'
            }`}
          >
            <Eye size={13} />
            <span>{onlyRisky ? 'Show Full Graph' : 'Filter Risky Subgraph'}</span>
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-[#F5F6F4]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onNodeClick && onNodeClick(node.id, node.data)}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#DFE5E1" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeColor="#DFE5E1"
            nodeColor="#FFFFFF"
            maskColor="rgba(245, 246, 244, 0.75)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
