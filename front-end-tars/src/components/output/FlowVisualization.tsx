// src/components/output/FlowVisualization.tsx
"use client";

import { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  DefaultEdgeOptions,
  Node,
  Edge,
  MarkerType,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

interface FlowVisualizationProps {
  nodes: any[];
  edges: any[];
  fitView?: boolean;
}

// Custom node styling
const nodeStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "12px",
  width: 150,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  fontSize: "14px",
  fontWeight: 500,
};

// Default edge options
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#888",
    width: 20,
    height: 20,
  },
  style: {
    stroke: "#888",
    strokeWidth: 2,
  },
};

const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  nodes,
  edges,
  fitView = true,
}) => {
  // Transform nodes to ReactFlow format with adjusted positions for better visualization
  const flowNodes: Node[] = nodes.map((node) => ({
    id: node.id,
    data: { label: node.label },
    position: node.position || { x: 0, y: 0 },
    style: nodeStyle,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  // Transform edges to ReactFlow format
  const flowEdges: Edge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: "#666",
      strokeWidth: 2,
    },
    labelStyle: {
      fontSize: 12,
      fontWeight: 500,
    },
  }));

  // This prevents rerendering the flow when nothing has changed
  const onNodeClick = useCallback((event: any, node: Node) => {
    console.log("Node clicked:", node);
  }, []);

  return (
    <div className="h-full w-full" style={{ minHeight: "240px" }}>
      <ReactFlowProvider>
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodeClick={onNodeClick}
            fitView={fitView}
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-right"
            style={{ width: "100%", height: "100%" }}
          >
            <Background color="#f8f8f8" gap={16} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowVisualization;
