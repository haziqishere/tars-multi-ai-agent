// src/components/output/FlowVisualization.tsx
"use client";

import React, { useEffect, useRef } from 'react';

// Define types for the props
interface Node {
  id: string;
  label: string;
  position?: { x: number; y: number };
  data?: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface FlowVisualizationProps {
  nodes: Node[];
  edges: Edge[];
  fitView?: boolean;
  zoomOnResize?: boolean;
}

const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  nodes,
  edges,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate positions for nodes if needed
  const getNodePositions = () => {
    const result: Record<string, {x: number, y: number}> = {};
    
    // Use positions from props if available, otherwise calculate
    nodes.forEach((node, index) => {
      if (node.position) {
        result[node.id] = {
          x: node.position.x,
          y: node.position.y, 
        };
      } else {
        // Default simple horizontal layout
        const spacing = 200;
        const startX = 100;
        result[node.id] = {
          x: startX + index * spacing,
          y: 100,
        };
      }
    });
    
    return result;
  };
  
  // Positions for all nodes
  const nodePositions = getNodePositions();
  
  // Set SVG size based on container
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && svgRef.current) {
        svgRef.current.setAttribute('width', `${containerRef.current.clientWidth}px`);
        svgRef.current.setAttribute('height', `${containerRef.current.clientHeight}px`);
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  // Renders a node
  const renderNode = (node: Node) => {
    const pos = nodePositions[node.id];
    if (!pos) return null;
    
    // Determine node status
    let statusColor = 'transparent';
    let statusLabel = '';

    if (node.id === 'B') {
      statusColor = '#ef4444'; // red
      statusLabel = '⚠ Critical';
    } else if (node.id === 'D' || node.id === 'E' || node.id === 'F') {
      statusColor = '#0ea5e9'; // blue
      statusLabel = '+ New Process';
    }
    
    return (
      <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
        {/* Node background */}
        <rect 
          width="120"
          height="60"
          rx="6"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        
        {/* Node label */}
        <text
          x="60"
          y="30"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="500"
          fill="#1f2937"
        >
          {node.label}
        </text>
        
        {/* Status indicator if it exists */}
        {statusLabel && (
          <g>
            <rect
              x="10"
              y="40"
              width="100"
              height="16"
              rx="3"
              fill={statusColor}
              opacity="0.1"
            />
            <text
              x="60"
              y="48"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="400"
              fill={statusColor}
            >
              {statusLabel}
            </text>
          </g>
        )}
      </g>
    );
  };
  
  // Renders an edge with arrow
  const renderEdge = (edge: Edge) => {
    const sourcePos = nodePositions[edge.source];
    const targetPos = nodePositions[edge.target];
    
    if (!sourcePos || !targetPos) return null;
    
    // Source point should be on the right side of the node
    const sourceX = sourcePos.x + 120; // Full width of node
    const sourceY = sourcePos.y + 30; // Half height of node
    
    // Target point should be on the left side of the node
    const targetX = targetPos.x;
    const targetY = targetPos.y + 30; // Half height of node
    
    // Determine edge color based on connected nodes
    const isCriticalPath = edge.source === "B" || edge.target === "B";
    const isOptimizedPath =
      edge.source === "D" || edge.target === "D" ||
      edge.source === "E" || edge.target === "E" ||
      edge.source === "F" || edge.target === "F";
      
    const strokeColor = isCriticalPath 
      ? '#ef4444' // red for critical
      : isOptimizedPath
      ? '#22c55e' // green for optimized
      : '#64748b'; // slate for normal
      
    const strokeWidth = isCriticalPath || isOptimizedPath ? 2.5 : 1.5;
    
    // Calculate bezier curve control points
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Better control point calculation based on distance and angle
    const offsetX = Math.min(distance * 0.3, 100); // Cap the offset to avoid extreme curves
    const offsetY = Math.abs(dy) < 50 ? 0 : Math.sign(dy) * Math.min(Math.abs(dy) * 0.2, 50);
    
    const controlPoint1X = sourceX + offsetX;
    const controlPoint1Y = sourceY + offsetY;
    const controlPoint2X = targetX - offsetX;
    const controlPoint2Y = targetY + offsetY;
    
    // Define arrow properties
    const arrowSize = 8;
    
    // Calculate a point slightly before the target for the arrow
    // Using vector math to place the arrow correctly at any angle
    const angle = Math.atan2(targetY - controlPoint2Y, targetX - controlPoint2X);
    const beforeTargetX = targetX - Math.cos(angle) * (arrowSize * 2);
    const beforeTargetY = targetY - Math.sin(angle) * (arrowSize * 2);
    
    // Create a smooth bezier curve path
    const pathDAttr = `M${sourceX},${sourceY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${beforeTargetX},${beforeTargetY}`;
    
    // Calculate arrow points properly aligned with the path direction
    const arrowPoints = [
      [
        targetX - Math.cos(angle - Math.PI/6) * arrowSize,
        targetY - Math.sin(angle - Math.PI/6) * arrowSize
      ],
      [targetX, targetY],
      [
        targetX - Math.cos(angle + Math.PI/6) * arrowSize,
        targetY - Math.sin(angle + Math.PI/6) * arrowSize
      ]
    ];
    
    return (
      <g key={edge.id}>
        {/* Path line */}
        <path
          d={pathDAttr}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Arrow head */}
        <polygon
          points={`${arrowPoints[0][0]},${arrowPoints[0][1]} ${arrowPoints[1][0]},${arrowPoints[1][1]} ${arrowPoints[2][0]},${arrowPoints[2][1]}`}
          fill={strokeColor}
        />
      </g>
    );
  };
  
  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', minHeight: '250px', position: 'relative' }}
    >
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 400" 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f8f8f8" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Render edges first so they appear behind nodes */}
        {edges.map(edge => renderEdge(edge))}
        
        {/* Render nodes */}
        {nodes.map(node => renderNode(node))}
      </svg>
    </div>
  );
};

export default FlowVisualization;
