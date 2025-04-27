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
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node component for better visualization
const CustomNode = ({ data, isConnectable, id }: any) => {
  return (
    <div className="px-4 py-2 shadow-sm bg-white border border-gray-200 rounded-lg min-w-[120px] text-center">
      <div className="font-medium text-gray-800">{data.label}</div>
      {data.subLabel && (
        <div className="text-xs text-gray-500 mt-1">{data.subLabel}</div>
      )}
      {data.status && (
        <div
          className={`text-xs mt-1 ${
            data.status === "critical"
              ? "text-red-600"
              : data.status === "warning"
              ? "text-amber-600"
              : data.status === "optimized"
              ? "text-green-600"
              : "text-blue-600"
          }`}
        >
          {data.status === "critical" && "⚠ Critical"}
          {data.status === "warning" && "⚠ Warning"}
          {data.status === "optimized" && "✓ Optimized"}
          {data.status === "new" && "+ New Process"}
        </div>
      )}
    </div>
  );
};

interface FlowVisualizationProps {
  nodes: any[];
  edges: any[];
  fitView?: boolean;
  zoomOnResize?: boolean;
}

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Default edge options
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#666",
    width: 20,
    height: 20,
  },
  style: {
    stroke: "#666",
    strokeWidth: 2,
  },
  animated: false,
};

const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  nodes,
  edges,
  fitView = true,
  zoomOnResize = true,
}) => {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Transform input nodes to ReactFlow format with custom styling
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
      const spacing = 220;
      const startX = 100;
      xPos = startX + index * spacing;
      yPos = 100;
    }

    // Detect special status based on node id or label
    let status = undefined;
    if (node.id === "B") status = "critical";
    if (node.id === "D" || node.id === "E" || node.id === "F") status = "new";

    return {
      id: node.id,
      type: "custom",
      position: { x: xPos, y: yPos },
      data: {
        label: node.label,
        subLabel: node.subLabel || "",
        status: status,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  // Transform edges with styling based on process relationships
  const flowEdges = edges.map((edge) => {
    // Apply special styles to critical paths
    const isCriticalPath = edge.source === "B" || edge.target === "B";
    const isOptimizedPath =
      edge.source === "D" ||
      edge.target === "D" ||
      edge.source === "E" ||
      edge.target === "E" ||
      edge.source === "F" ||
      edge.target === "F";

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: isOptimizedPath,
      style: {
        stroke: isCriticalPath
          ? "#ef4444"
          : isOptimizedPath
          ? "#22c55e"
          : "#64748b",
        strokeWidth: isCriticalPath || isOptimizedPath ? 2.5 : 2,
        strokeDasharray: edge.dashed ? "5,5" : undefined,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isCriticalPath
          ? "#ef4444"
          : isOptimizedPath
          ? "#22c55e"
          : "#64748b",
      },
    };
  });

  // Force fit view when component mounts or nodes change
  useEffect(() => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({
          padding: 0.2,
          includeHiddenNodes: true,
          minZoom: 0.7,
          maxZoom: 1.5,
        });
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

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <ReactFlowProvider>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onInit={setReactFlowInstance}
          fitView={fitView}
          fitViewOptions={{ padding: 0.3 }}
          defaultEdgeOptions={defaultEdgeOptions}
          minZoom={0.5}
          maxZoom={2}
          nodeTypes={nodeTypes}
          style={{ width: "100%", height: "100%" }}
        >
          <Background color="#f8f8f8" gap={16} size={1} />
          <Controls
            showInteractive={false}
            className="bg-white rounded-md shadow-sm border border-gray-200"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowVisualization;
