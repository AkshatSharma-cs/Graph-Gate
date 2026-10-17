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
import { Eye, ShieldAlert, Sparkles } from 'lucide-react';

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
  title = "Agent Data-Flow Capability Graph",
  onNodeClick,
}) => {
  const [onlyRisky, setOnlyRisky] = useState(false);

  // Layout calculation
  const { nodes, edges } = useMemo(() => {
    const hasHighlight = highlightedNodeIds.length > 0 || highlightedEdgeIds.length > 0;
    
    // Categorize by entity type for horizontal column layering
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

    // Filter nodes if onlyRisky toggled
    const filteredNodes = onlyRisky
      ? graphData.nodes.filter(n => highlightedNodeIds.includes(n.id) || n.data?.classification === 'restricted')
      : graphData.nodes;

    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

    filteredNodes.forEach((n) => {
      let col = typeColumnMap[n.node_type] ?? 3;
      
      // Separate send tools from read tools in columns
      if (n.node_type === 'Tool' && n.data?.kind === 'send') {
        col = 5;
      }
      if (n.node_type === 'Identity' && !graphData.edges.some(e => e.source === n.id && e.relationship === 'CAN_READ')) {
        // Send identity
        col = 5.5;
      }
      if (n.node_type === 'DataClass') {
        col = -0.8;
      }

      typeCounters[col] = (typeCounters[col] || 0) + 1;
      const rowIdx = typeCounters[col] - 1;

      const isNodeHighlighted = highlightedNodeIds.includes(n.id);

      flowNodes.push({
        id: n.id,
        type: n.node_type,
        position: {
          x: col * 260 + 40,
          y: rowIdx * 120 + 60,
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
        animated: isEdgeHighlighted,
        label: e.relationship,
        labelStyle: {
          fontSize: '9px',
          fontWeight: 600,
          fill: isEdgeHighlighted ? '#DC2626' : '#64748B',
        },
        labelBgStyle: {
          fill: '#FFFFFF',
          fillOpacity: 0.85,
        },
        style: {
          stroke: isEdgeHighlighted ? '#DC2626' : isMuted ? '#CBD5E1' : '#94A3B8',
          strokeWidth: isEdgeHighlighted ? 2.5 : 1.5,
          opacity: isMuted ? 0.3 : 1,
        },
        className: isEdgeHighlighted ? 'risky-edge-path' : '',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isEdgeHighlighted ? '#DC2626' : isMuted ? '#CBD5E1' : '#94A3B8',
          width: 16,
          height: 16,
        },
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [graphData, highlightedNodeIds, highlightedEdgeIds, onlyRisky]);

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-ink">{title}</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {nodes.length} nodes · {edges.length} relationships
          </span>
        </div>

        <div className="flex items-center gap-3">
          {highlightedNodeIds.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-risk-50 border border-risk-200 text-risk-700 rounded-md text-xs font-medium animate-pulse">
              <ShieldAlert size={13} />
              <span>Active Path Witness Highlighted</span>
            </div>
          )}

          <button
            onClick={() => setOnlyRisky(!onlyRisky)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              onlyRisky
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-border text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Eye size={13} />
            <span>{onlyRisky ? 'Show Full Graph' : 'Focus Risky Subgraph'}</span>
          </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => onNodeClick && onNodeClick(node.id, node.data)}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#CBD5E1" />
          <Controls showInteractive={false} className="!bg-white !border !border-border !shadow-sm !rounded-lg" />
          <MiniMap
            nodeStrokeColor="#94A3B8"
            nodeColor="#E2E8F0"
            className="!bg-white/90 !border !border-border !rounded-lg !shadow-sm"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
