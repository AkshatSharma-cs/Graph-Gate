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
      Resource: 0,
      DataClass: 0,
      Identity: 1,
      Tool: 2,
      AgentContext: 3,
      Agent: 4,
      Destination: 6,
    };

    const typeCounters: Record<number, number> = {};
    const flowNodes: Node[] = [];

    const filteredNodes = onlyRisky
      ? graphData.nodes.filter(n => highlightedNodeIds.includes(n.id) || n.data?.classification === 'restricted')
      : graphData.nodes;

    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

    filteredNodes.forEach((n) => {
      let col = typeColumnMap[n.node_type] ?? 3;

      if (n.node_type === 'Tool' && n.data?.kind === 'send') {
        col = 5;
      }
      if (n.node_type === 'Identity' && !graphData.edges.some(e => e.source === n.id && e.relationship === 'CAN_READ')) {
        col = 5.5;
      }
      if (n.node_type === 'DataClass') {
        col = -0.7;
      }

      typeCounters[col] = (typeCounters[col] || 0) + 1;
      const rowIdx = typeCounters[col] - 1;

      const isNodeHighlighted = highlightedNodeIds.includes(n.id);

      flowNodes.push({
        id: n.id,
        type: n.node_type,
        position: {
          x: col * 250 + 20,
          y: rowIdx * 105 + 40,
        },
        data: {
          ...n.data,
          label: n.label,
        },
        selected: isNodeHighlighted,
        style: {
          opacity: hasHighlight && !isNodeHighlighted ? 0.25 : 1,
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
        animated: isEdgeHighlighted,
        label: e.relationship,
        labelStyle: {
          fontSize: '8px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          fill: isEdgeHighlighted ? '#EF4444' : '#6B7280',
        },
        labelBgStyle: {
          fill: '#0F1012',
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 2,
        style: {
          stroke: isEdgeHighlighted ? '#EF4444' : isMuted ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.16)',
          strokeWidth: isEdgeHighlighted ? 2.2 : 1.2,
          opacity: isMuted ? 0.2 : 1,
        },
        className: isEdgeHighlighted ? 'risky-edge-path' : '',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeHighlighted ? '#EF4444' : isMuted ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)',
          width: 14,
          height: 14,
        },
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [graphData, highlightedNodeIds, highlightedEdgeIds, onlyRisky]);

  return (
    <div className="flex flex-col h-[500px] bg-ground rounded border border-hairline shadow-subtle overflow-hidden">
      {/* Workbench Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-50 border-b border-hairline select-none">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ink font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-linear"></span>
            <span>{title}</span>
          </span>
          <span className="text-[10px] text-ink-muted font-mono">
            [{nodes.length} nodes · {edges.length} edges]
          </span>
        </div>

        <div className="flex items-center gap-3">
          {highlightedNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-signal-red-subtle border border-signal-red/30 text-signal-red rounded-xs text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse" />
              <span>WITNESS PATH ACTIVE</span>
            </div>
          )}

          <button
            onClick={() => setOnlyRisky(!onlyRisky)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-xs border transition-colors ${
              onlyRisky
                ? 'bg-linear text-white border-linear'
                : 'bg-surface-100 border-hairline text-ink-secondary hover:text-ink hover:bg-surface-200'
            }`}
          >
            <Eye size={12} />
            <span>{onlyRisky ? 'VIEW FULL TOPOLOGY' : 'FILTER RISKY SUBGRAPH'}</span>
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-ground">
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
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255, 255, 255, 0.08)" />
          <Controls showInteractive={false} />
          <MiniMap
            nodeStrokeColor="rgba(255, 255, 255, 0.2)"
            nodeColor="#1A1B20"
            maskColor="rgba(8, 9, 10, 0.75)"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
