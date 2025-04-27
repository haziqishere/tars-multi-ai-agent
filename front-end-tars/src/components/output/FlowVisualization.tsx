// src/components/output/FlowVisualization.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  ReactFlowInstance,
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

const FlowVisualization: React.FC<{
  nodes: any[];
  edges: any[];
  fitView?: boolean;
  zoomOnResize?: boolean;
}> = ({ nodes, edges, fitView = true, zoomOnResize = true }) => {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Force fit view when component mounts or nodes change
  useEffect(() => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.3, includeHiddenNodes: true });
      }, 100);
    }
  }, [reactFlowInstance, nodes]);

  // Handle resize events
  useEffect(() => {
    if (!containerRef.current || !zoomOnResize) return;

    const resizeObserver = new ResizeObserver(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.3 });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [reactFlowInstance, zoomOnResize]);

  const flowNodes = nodes.map((node, index, arr) => {
    // Calculate positions for better layout
    // For a simple horizontal layout with 4 nodes max:
    let xPos, yPos;

    // If we have 4 nodes, use a more complex layout (A → E/F → C pattern)
    if (arr.length === 4) {
      if (index === 0) {
        // Process A
        xPos = 100;
        yPos = 150;
      } else if (index === 3) {
        // Process C
        xPos = 700;
        yPos = 150;
      } else {
        // Middle processes (E, F)
        xPos = 350 + (index - 1) * 150;
        yPos = 50;
      }
    } else {
      // Simple horizontal layout
      const spacing = 200;
      const startX = 100;
      xPos = startX + index * spacing;
      yPos = 100;
    }

    return {
      id: node.id,
      data: { label: node.label },
      position: { x: xPos, y: yPos },
      style: {
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px",
        width: 120,
        textAlign: "center" as const,
        fontSize: "14px",
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  // Transform edges
  const flowEdges = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    style: { stroke: "#555", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));

  // This prevents rerendering the flow when nothing has changed
  const onNodeClick = useCallback((event: any, node: Node) => {
    console.log("Node clicked:", node);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "300px" }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onInit={setReactFlowInstance}
          fitView={fitView}
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.5}
          maxZoom={1.5}
          style={{ width: "100%", height: "100%" }}
        >
          <Background color="#f8f8f8" gap={16} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowVisualization;
