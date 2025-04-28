// src/components/output/FlowVisualization.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

// Define types for the props
interface Node {
  id: string;
  label: string;
  position?: { x: number; y: number };
  type?: string;
  status?: {
    type: "critical" | "new" | "warning" | string;
    label: string;
  };
  data?: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  flowType?: "critical" | "optimized" | "standard" | string;
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
  fitView = false,
  zoomOnResize = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 400,
  });

  // Calculate positions for nodes using improved layout algorithm
  const getNodePositions = () => {
    const result: Record<string, { x: number; y: number }> = {};

    // If all nodes have explicit positions, use those
    const allHavePositions = nodes.every((node) => node.position);

    if (allHavePositions) {
      nodes.forEach((node) => {
        if (node.position) {
          result[node.id] = {
            x: node.position.x,
            y: node.position.y,
          };
        }
      });
      return result;
    }

    // Create a graph representation for analysis
    const graph: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    // Initialize graph structures
    nodes.forEach((node) => {
      graph[node.id] = [];
      inDegree[node.id] = 0;
    });

    // Build the graph
    edges.forEach((edge) => {
      graph[edge.source].push(edge.target);
      inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
    });

    // Find root nodes (nodes with no incoming edges)
    const roots = nodes
      .filter((node) => inDegree[node.id] === 0)
      .map((node) => node.id);

    // If no roots found, just use the first node as root
    if (roots.length === 0 && nodes.length > 0) {
      roots.push(nodes[0].id);
    }

    // Perform level assignment - group nodes by their level in the graph
    const levels: string[][] = [];
    let currentLevel = [...roots];

    while (currentLevel.length > 0) {
      levels.push([...currentLevel]);

      const nextLevel: string[] = [];
      currentLevel.forEach((nodeId) => {
        graph[nodeId].forEach((target) => {
          inDegree[target]--;
          if (inDegree[target] === 0) {
            nextLevel.push(target);
          }
        });
      });

      currentLevel = nextLevel;
    }

    // Check for remaining nodes (cycles) and add them to the last level
    const remainingNodes = nodes
      .filter((node) => !levels.flat().includes(node.id))
      .map((node) => node.id);

    if (remainingNodes.length > 0) {
      levels.push(remainingNodes);
    }

    // Calculate container size for better scaling
    const containerWidth = containerDimensions.width || 800;
    const containerHeight = containerDimensions.height || 400;

    // Node dimensions
    const nodeWidth = 120;
    const nodeHeight = 60;

    // DRAMATICALLY INCREASED SPACING: Calculate much more generous horizontal and vertical spacing
    // Horizontal spacing between levels - massive increase for maximum readability
    const horizontalSpacing = Math.max(
      280, // Dramatically increased minimum spacing from 150 to 280
      Math.min(
        400,
        (containerWidth - nodeWidth * levels.length) /
          Math.max(1, levels.length)
      )
    );

    // Position nodes based on their levels
    levels.forEach((levelNodes, levelIndex) => {
      const levelWidth = nodeWidth + (levelIndex > 0 ? horizontalSpacing : 0);

      // Increase the starting position for better left margin
      const levelStart = 150 + levelIndex * levelWidth; // Increased from 100 to 150

      // DRAMATICALLY INCREASED SPACING: Much more vertical spacing between nodes in the same level
      const verticalSpacing = Math.max(
        200, // Dramatically increased minimum spacing from 100 to 200
        Math.min(
          300,
          (containerHeight - nodeHeight * levelNodes.length) /
            Math.max(1, levelNodes.length)
        )
      );

      // IMPROVED VERTICAL DISTRIBUTION: Ensure nodes are centered within available height
      // with much more space between them
      const totalLevelHeight =
        levelNodes.length * nodeHeight +
        (levelNodes.length - 1) * verticalSpacing;
      const startY = Math.max(100, (containerHeight - totalLevelHeight) / 2); // Increased from 50 to 100

      levelNodes.forEach((nodeId, nodeIndex) => {
        // STAGGERING: Stagger nodes in adjacent levels for better visibility and edge routing
        const verticalOffset =
          levelNodes.length > 2 && levelIndex % 2 === 1
            ? verticalSpacing / 2
            : 0;

        result[nodeId] = {
          x: levelStart,
          y:
            startY +
            nodeIndex * (nodeHeight + verticalSpacing) +
            verticalOffset,
        };
      });
    });

    // Special case handling for small diagrams
    if (nodes.length <= 3) {
      // Simple horizontal layout for 2-3 nodes with MASSIVE SPACING
      nodes.forEach((node, index) => {
        result[node.id] = {
          x: 120 + index * (nodeWidth + 350), // Dramatically increased from 200 to 350
          y: containerHeight / 2 - nodeHeight / 2,
        };
      });
    } else if (levels.length <= 1 && nodes.length > 3) {
      // For flat structures with many nodes, use a grid layout with MASSIVE SPACING
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const rows = Math.ceil(nodes.length / cols);

      const gridSpacingX = Math.min(450, containerWidth / cols); // Dramatically increased from 300 to 450
      const gridSpacingY = Math.min(350, containerHeight / rows); // Dramatically increased from 200 to 350

      nodes.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        result[node.id] = {
          x: 100 + col * gridSpacingX, // Increased from 80 to 100
          y: 100 + row * gridSpacingY, // Increased from 60 to 100
        };
      });
    }

    // COMPLEX LAYOUTS: Special handling for complex diagrams with many nodes
    if (nodes.length > 6 && levels.length > 2) {
      // For complex layouts, try to optimize spacing based on the overall shape

      // Step 1: Find the level with the most nodes
      const maxNodesInLevel = Math.max(...levels.map((level) => level.length));

      // Step 2: Re-position levels horizontally with much more spacing for complex diagrams
      const complexHorizontalSpacing = Math.max(
        350, // Dramatically increased from 200 to 350
        Math.min(
          450,
          (containerWidth - nodeWidth * levels.length) /
            Math.max(1, levels.length - 1)
        )
      );

      // Step 3: Re-position levels with balanced vertical distribution
      levels.forEach((levelNodes, levelIndex) => {
        const levelStart =
          150 + levelIndex * (nodeWidth + complexHorizontalSpacing); // Increased from 100 to 150

        // Calculate vertical distribution with much more spacing
        const levelNodesCount = levelNodes.length;
        const useableHeight = containerHeight - 150; // Increased margins from 100 to 150
        const levelHeight =
          levelNodesCount * nodeHeight + (levelNodesCount - 1) * 250; // Increased from 120 to 250
        const startY = (useableHeight - levelHeight) / 2 + 75; // Increased from 50 to 75

        levelNodes.forEach((nodeId, nodeIndex) => {
          result[nodeId] = {
            x: levelStart,
            y: startY + nodeIndex * (nodeHeight + 250), // Dramatically increased from 120 to 250
          };
        });
      });
    }

    return result;
  };

  // Set SVG size based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && svgRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerDimensions({
          width: clientWidth || 800,
          height: clientHeight || 400,
        });

        svgRef.current.setAttribute("width", `${clientWidth}px`);
        svgRef.current.setAttribute("height", `${clientHeight}px`);

        // When container resizes, recalculate viewBox for better fit
        if (fitView || zoomOnResize) {
          fitViewToContent();
        }
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      updateDimensions(); // Initial update
    }

    return () => resizeObserver.disconnect();
  }, [fitView, zoomOnResize]);

  // Function to fit the view to content
  const fitViewToContent = () => {
    if (!svgRef.current || nodes.length === 0) return;

    const nodePositions = getNodePositions();
    const nodeWidth = 120;
    const nodeHeight = 60;

    // Calculate the bounds of all nodes
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    Object.values(nodePositions).forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + nodeWidth);
      maxY = Math.max(maxY, pos.y + nodeHeight);
    });

    // Add generous padding for maximum space
    const padding = 150; // Dramatically increased from 80 to 150
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    // Set the viewBox to fit all nodes
    const viewBoxWidth = maxX - minX;
    const viewBoxHeight = maxY - minY;

    if (viewBoxWidth > 0 && viewBoxHeight > 0) {
      svgRef.current.setAttribute(
        "viewBox",
        `${minX} ${minY} ${viewBoxWidth} ${viewBoxHeight}`
      );
    }
  };

  // Positions for all nodes
  const nodePositions = getNodePositions();

  // Apply fit view on initial render and when nodes change
  useEffect(() => {
    if (fitView) {
      fitViewToContent();
    }
  }, [nodes, fitView, containerDimensions]);

  // Renders a node
  const renderNode = (node: Node) => {
    const pos = nodePositions[node.id];
    if (!pos) return null;

    // Determine node status - now using the status property from the API
    let statusColor = "transparent";
    let statusLabel = "";

    if (node.status) {
      switch (node.status.type) {
        case "critical":
          statusColor = "#ef4444"; // red
          statusLabel = node.status.label;
          break;
        case "new":
          statusColor = "#0ea5e9"; // blue
          statusLabel = node.status.label;
          break;
        case "warning":
          statusColor = "#f59e0b"; // amber
          statusLabel = node.status.label;
          break;
        default:
          statusColor = "#64748b"; // slate
          statusLabel = node.status.label;
      }
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
    const isHovered = hoveredEdge === edge.id;

    if (!sourcePos || !targetPos) return null;

    // Node dimensions
    const nodeWidth = 120;
    const nodeHeight = 60;
    const nodeRadius = 6;

    // Calculate optimal exit and entry points for the edge
    // Decide which sides of the nodes to connect based on their relative positions
    let sourceX, sourceY, targetX, targetY;

    const sourceCenterX = sourcePos.x + nodeWidth / 2;
    const sourceCenterY = sourcePos.y + nodeHeight / 2;
    const targetCenterX = targetPos.x + nodeWidth / 2;
    const targetCenterY = targetPos.y + nodeHeight / 2;

    const dx = targetCenterX - sourceCenterX;
    const dy = targetCenterY - sourceCenterY;

    // Determine whether the connection is primarily horizontal or vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      // Primarily horizontal connection
      if (dx > 0) {
        // Target is to the right of source
        sourceX = sourcePos.x + nodeWidth;
        sourceY = sourcePos.y + nodeHeight / 2;
        targetX = targetPos.x;
        targetY = targetPos.y + nodeHeight / 2;
      } else {
        // Target is to the left of source
        sourceX = sourcePos.x;
        sourceY = sourcePos.y + nodeHeight / 2;
        targetX = targetPos.x + nodeWidth;
        targetY = targetPos.y + nodeHeight / 2;
      }
    } else {
      // Primarily vertical connection
      if (dy > 0) {
        // Target is below source
        sourceX = sourcePos.x + nodeWidth / 2;
        sourceY = sourcePos.y + nodeHeight;
        targetX = targetPos.x + nodeWidth / 2;
        targetY = targetPos.y;
      } else {
        // Target is above source
        sourceX = sourcePos.x + nodeWidth / 2;
        sourceY = sourcePos.y;
        targetX = targetPos.x + nodeWidth / 2;
        targetY = targetPos.y + nodeHeight;
      }
    }

    // Adjust connection points to account for rounded corners if needed
    // This is a simplified adjustment
    if (dx > 0 && Math.abs(dy) < nodeRadius) {
      // Horizontal connection and close to the corner radius
      sourceY = Math.max(
        sourcePos.y + nodeRadius,
        Math.min(sourceY, sourcePos.y + nodeHeight - nodeRadius)
      );
      targetY = Math.max(
        targetPos.y + nodeRadius,
        Math.min(targetY, targetPos.y + nodeHeight - nodeRadius)
      );
    } else if (Math.abs(dx) < nodeRadius && dy !== 0) {
      // Vertical connection and close to the corner radius
      sourceX = Math.max(
        sourcePos.x + nodeRadius,
        Math.min(sourceX, sourcePos.x + nodeWidth - nodeRadius)
      );
      targetX = Math.max(
        targetPos.x + nodeRadius,
        Math.min(targetX, targetPos.x + nodeWidth - nodeRadius)
      );
    }

    // Calculate the distance between nodes
    const distance = Math.sqrt(
      Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
    );

    // Determine edge color and animation based on flowType from API
    const isCriticalPath = edge.flowType === "critical";
    const isOptimizedPath = edge.flowType === "optimized";

    const strokeColor = isCriticalPath
      ? "#ef4444" // red for critical
      : isOptimizedPath
      ? "#22c55e" // green for optimized
      : "#64748b"; // slate for normal

    // Enhanced styling for hover state
    const baseStrokeWidth = isCriticalPath || isOptimizedPath ? 2.5 : 1.5;
    const strokeWidth = isHovered ? baseStrokeWidth * 1.5 : baseStrokeWidth;
    const strokeOpacity = isHovered ? 0.8 : 0.5; // Static 50% opacity when not hovered

    // Define arrow properties
    const arrowSize = isHovered ? 10 : 8;

    // Calculate bezier curve control points
    // Enhance the curve calculation for smoother flows
    let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;

    // Adaptive control point calculation based on distance and direction
    const curveFactor = Math.min(distance * 0.5, 120);

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal dominant flow - smoother horizontal curves
      const vertOffset = Math.min(Math.abs(dy) * 0.3, 40) * Math.sign(dy);
      controlPoint1X = sourceX + curveFactor / 2;
      controlPoint1Y = sourceY + vertOffset / 2;
      controlPoint2X = targetX - curveFactor / 2;
      controlPoint2Y = targetY + vertOffset / 2;
    } else {
      // Vertical dominant flow - smoother vertical curves
      const horizOffset = Math.min(Math.abs(dx) * 0.3, 40) * Math.sign(dx);
      controlPoint1X = sourceX + horizOffset / 2;
      controlPoint1Y = sourceY + curveFactor / 2;
      controlPoint2X = targetX + horizOffset / 2;
      controlPoint2Y = targetY - curveFactor / 2;
    }

    // Calculate the actual path points for a cubic bezier curve to use for the arrow placement
    // We evaluate the Bezier curve formula at t = 0.95 to get a point very close to the target
    // This ensures the arrow head is correctly aligned with the path direction
    const t = 0.95; // We use t = 0.95 instead of t = 1.0 to get a point before the very end
    const bezierPoint = (t: number) => {
      // Cubic Bezier formula: P(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const t2 = t * t;
      const t3 = t2 * t;

      return {
        x:
          mt3 * sourceX +
          3 * mt2 * t * controlPoint1X +
          3 * mt * t2 * controlPoint2X +
          t3 * targetX,
        y:
          mt3 * sourceY +
          3 * mt2 * t * controlPoint1Y +
          3 * mt * t2 * controlPoint2Y +
          t3 * targetY,
      };
    };

    // For extreme curves, we'll use the bezier formula to compute the tangent directly
    // This will give us a more precise arrow angle for extreme curves
    const t1 = 0.9; // Use a slightly earlier point to get a better tangent vector
    const t2 = 0.99; // Use a point very close to the end
    const p1 = bezierPoint(t1);
    const p2 = bezierPoint(t2);

    // Calculate the tangent vector
    const tangentX = p2.x - p1.x;
    const tangentY = p2.y - p1.y;
    const betterAngle = Math.atan2(tangentY, tangentX);

    // Calculate a point slightly before the target for the arrow
    const arrowBackoffDistance = arrowSize * 1.5; // Slightly reduced backoff distance to ensure better connection
    const beforeTargetX =
      targetX - Math.cos(betterAngle) * arrowBackoffDistance;
    const beforeTargetY =
      targetY - Math.sin(betterAngle) * arrowBackoffDistance;

    // Create a smooth bezier curve path
    const pathDAttr = `M${sourceX},${sourceY} C${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${beforeTargetX},${beforeTargetY}`;

    // Precise calculation for the arrow path - the extension now uses the same control points
    // but extends precisely to the target point using the calculated tangent angle
    const finalSegmentLength = 5; // tiny extension to ensure perfect connection
    const connectorX = targetX - Math.cos(betterAngle) * finalSegmentLength;
    const connectorY = targetY - Math.sin(betterAngle) * finalSegmentLength;

    // The connector path now precisely extends from the end of the visible path to the target point
    // This tiny extension will be nearly invisible but ensures perfect connection
    const connectorDAttr = `M${beforeTargetX},${beforeTargetY} L${connectorX},${connectorY} L${targetX},${targetY}`;

    // Calculate improved arrow points with thicker base for better appearance
    const arrowBaseWidth = arrowSize * 0.6;
    const arrowPoints = [
      [
        targetX - Math.cos(betterAngle - Math.PI / 6) * arrowSize,
        targetY - Math.sin(betterAngle - Math.PI / 6) * arrowSize,
      ],
      [targetX, targetY],
      [
        targetX - Math.cos(betterAngle + Math.PI / 6) * arrowSize,
        targetY - Math.sin(betterAngle + Math.PI / 6) * arrowSize,
      ],
      [
        targetX - Math.cos(betterAngle) * arrowBaseWidth,
        targetY - Math.sin(betterAngle) * arrowBaseWidth,
      ],
    ];

    // Prepare optional edge label
    const showLabel = edge.label || isHovered;
    let labelX, labelY;

    // Position the label at the middle of the path
    if (showLabel) {
      // Find the midpoint of the bezier curve (approximation)
      labelX = (sourceX + targetX) / 2;
      labelY = (sourceY + targetY) / 2 - 10; // Offset above the line
    }

    // Generate a unique ID for the path for gradient and animation
    const pathId = `path-${edge.id}`;
    const gradientId = `gradient-${edge.id}`;

    return (
      <g
        key={edge.id}
        onMouseEnter={() => setHoveredEdge(edge.id)}
        onMouseLeave={() => setHoveredEdge(null)}
      >
        {/* Gradient definition for animated flow path */}
        {(isCriticalPath || isOptimizedPath) && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.9" />
            </linearGradient>
          </defs>
        )}

        {/* Invisible connector path to ensure the arrow connects properly */}
        <path
          d={connectorDAttr}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0"
        />

        {/* Path with shadow for depth */}
        {isHovered && (
          <path
            d={pathDAttr}
            fill="none"
            stroke="#000000"
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            opacity={0.07}
            filter="blur(3px)"
          />
        )}

        {/* Main path line */}
        <path
          id={pathId}
          d={pathDAttr}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={strokeOpacity}
          strokeDasharray={
            isHovered ? "0" : isCriticalPath ? "0" : isOptimizedPath ? "0" : "0"
          }
        />

        {/* Path line overlay with animation restored but static opacity */}
        {(isCriticalPath || isOptimizedPath) && (
          <path
            d={pathDAttr}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="6 12"
            opacity={isHovered ? 0.7 : 0.5}
            strokeDashoffset="0"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="18"
              to="0"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        )}

        {/* Improved arrow head with better shape */}
        <polygon
          points={`${arrowPoints[0][0]},${arrowPoints[0][1]} ${arrowPoints[1][0]},${arrowPoints[1][1]} ${arrowPoints[2][0]},${arrowPoints[2][1]} ${arrowPoints[3][0]},${arrowPoints[3][1]}`}
          fill={strokeColor}
          opacity={strokeOpacity}
        />

        {/* Edge label */}
        {(edge.label || isHovered) && (
          <g transform={`translate(${labelX}, ${labelY})`}>
            {isHovered && !edge.label && (
              <rect
                x="-30"
                y="-15"
                width="60"
                height="20"
                rx="4"
                fill="white"
                stroke={strokeColor}
                strokeWidth="1"
                opacity="0.9"
              />
            )}
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight={isHovered ? "500" : "400"}
              fill={strokeColor}
              opacity={isHovered ? 1 : 0.9}
            >
              {edge.label ||
                (isCriticalPath
                  ? "Critical Path"
                  : isOptimizedPath
                  ? "Optimized"
                  : "Flow")}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "250px",
        position: "relative",
      }}
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
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#f8f8f8"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render edges first so they appear behind nodes */}
        {edges.map((edge) => renderEdge(edge))}

        {/* Render nodes */}
        {nodes.map((node) => renderNode(node))}
      </svg>
    </div>
  );
};

export default FlowVisualization;
