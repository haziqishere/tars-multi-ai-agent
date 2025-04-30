"use client";

import { motion } from "framer-motion";
import React, { useId } from "react";
import { cn } from "@/utils/cn"; // Assuming cn utility exists

interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  /** Whether the circles should orbit in reverse direction. */
  reverse?: boolean;
  /** The duration of the orbit animation in seconds. */
  duration?: number;
  /** The delay before the animation starts in seconds. */
  delay?: number;
  /** The radius of the orbit in pixels. */
  radius?: number;
  /** The path radius determines the distance of the orbiting circles from the center. */
  path?: boolean; // Added path prop for clarity, defaults to true
  /** The width of the container. */
  width?: number;
  /** The height of the container. */
  height?: number;
}

// Define OrbitingCirclesItemProps if needed, or handle children directly
interface OrbitingCirclesItemProps {
  children: React.ReactNode;
  className?: string;
  // Add any specific props for items if necessary
}

// Main OrbitingCircles component
export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 50,
  path = true, // Default path to true
  width = 0, // Default width to 0, will be calculated if not provided
  height = 0, // Default height to 0, will be calculated if not provided
}: OrbitingCirclesProps) {
  const id = useId();
  const containerWidth = width || radius * 2 + 40; // Calculate width based on radius if not provided
  const containerHeight = height || radius * 2 + 40; // Calculate height based on radius if not provided

  // Filter children to only include OrbitingCircles.Item
  const items = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<OrbitingCirclesItemProps> =>
      React.isValidElement(child) && (child.type as any).displayName === "OrbitingCirclesItem"
  );

  // Find the central child (non-item)
  const centralChild = React.Children.toArray(children).find(
    (child) =>
      !React.isValidElement(child) || (child.type as any).displayName !== "OrbitingCirclesItem"
  );


  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden", // Removed fixed h/w
        className
      )}
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
    >
      {/* Central element */}
      {centralChild && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {centralChild}
        </div>
      )}

      {/* Orbiting items */}
      {items.map((item, index) => {
        const itemProps = item.props as OrbitingCirclesItemProps; // Cast to get props
        // Calculate animation properties based on index or item props if needed
        const itemDuration = (item.props as any).duration || duration;
        const itemDelay = (item.props as any).delay || delay + index * 0.5; // Stagger delay
        const itemRadius = (item.props as any).radius || radius;
        const itemReverse = (item.props as any).reverse !== undefined ? (item.props as any).reverse : reverse;


        return (
          <motion.div
            key={`${id}-item-${index}`}
            className={cn("absolute left-1/2 top-1/2", itemProps.className)}
            style={{
              transformOrigin: `-${itemRadius}px 0px`, // Set origin for orbit
            }}
            animate={{
              rotate: itemReverse ? -360 : 360,
            }}
            transition={{
              duration: itemDuration,
              delay: itemDelay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Apply transform to position the item on the orbit path */}
            <div style={{ transform: `translateX(${itemRadius}px)` }}>
              {item.props.children}
            </div>
          </motion.div>
        );
      })}

      {/* Optional path visualization */}
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="1" // Adjust stroke width as needed
            strokeDasharray="4 4" // Dashed line
            opacity={0.3} // Adjust opacity as needed
          />
        </svg>
      )}
    </div>
  );
}

// Define the OrbitingCircles.Item subcomponent
const OrbitingCirclesItem: React.FC<OrbitingCirclesItemProps & {
  duration?: number;
  delay?: number;
  radius?: number;
  reverse?: boolean;
}> = ({ children, className }) => {
  // This component primarily acts as a marker for the parent
  // and passes its children down. The actual rendering logic
  // is handled within the parent OrbitingCircles component.
  return <div className={className}>{children}</div>;
};
OrbitingCirclesItem.displayName = "OrbitingCirclesItem"; // Important for filtering

// Assign the Item subcomponent to the main component
OrbitingCircles.Item = OrbitingCirclesItem;
