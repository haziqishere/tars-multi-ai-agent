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
} from "reactflow";
import "reactflow/dist/style.css";

interface FlowVisualizationProps {
  nodes: any[];
  edges: any[];
}

// Custom node styling
const nodeStyle = {
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px",
  width: 120,
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  fontSize: "12px",
};

// Default edge options
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#888",
  },
  style: {
    stroke: "#888",
    strokeWidth: 2,
  },
};

const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  nodes,
  edges,
}) => {
  // Transform nodes to ReactFlow format
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
  }));

  // This prevents rerendering the flow when nothing has changed
  const onNodeClick = useCallback((event: any, node: Node) => {
    console.log("Node clicked:", node);
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodeClick={onNodeClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#f8f8f8" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default FlowVisualization;
