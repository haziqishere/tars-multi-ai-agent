// src/components/agent-workflow/WorkflowAnimation.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WorkflowAnimationProps {
  fromAgentId: number | null;
  toAgentId: number | null;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

const WorkflowAnimation: React.FC<WorkflowAnimationProps> = ({
  fromAgentId,
  toAgentId,
  isAnimating,
  onAnimationComplete,
}) => {
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate positions for the animation based on agent IDs
  const getAnimationPath = () => {
    if (!fromAgentId || !toAgentId) return null;

    // Adjust these calculations to match your agent node positions
    // Using 70px per agent node instead of 60px to match our more compact layout
    const startY = (fromAgentId - 1) * 70 + 20; // 70px per agent node, centered at 20px
    const endY = (toAgentId - 1) * 70 + 20;

    return {
      start: { x: 20, y: startY },
      end: { x: 20, y: endY },
    };
  };

  // Clean up any running animations on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  // Start animation when isAnimating changes to true
  useEffect(() => {
    if (isAnimating && onAnimationComplete) {
      // Set a timeout to trigger the completion callback
      animationRef.current = setTimeout(() => {
        onAnimationComplete();
      }, 1000); // Animation takes 1 second
    }
  }, [isAnimating, onAnimationComplete]);

  // If not animating or missing agent IDs, don't render anything
  if (!isAnimating || !fromAgentId || !toAgentId) {
    return null;
  }

  const animationPath = getAnimationPath();

  // Check if path is valid
  if (!animationPath) {
    return null;
  }

  const { start, end } = animationPath;

  return (
    <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
      {/* Animated particles */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-blue-500"
        style={{ left: start.x, top: start.y }}
        animate={{
          left: [start.x, start.x],
          top: [start.y, end.y],
          opacity: [1, 0],
        }}
        transition={{
          duration: 1,
          ease: "easeInOut",
        }}
      />

      {/* Optional: Add more particles for a more dynamic effect */}
      <motion.div
        className="absolute w-1 h-1 rounded-full bg-blue-400"
        style={{ left: start.x + 2, top: start.y }}
        animate={{
          left: [start.x + 2, start.x + 2],
          top: [start.y, end.y],
          opacity: [1, 0],
        }}
        transition={{
          duration: 1,
          delay: 0.2,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-0.5 h-0.5 rounded-full bg-blue-300"
        style={{ left: start.x - 2, top: start.y }}
        animate={{
          left: [start.x - 2, start.x - 2],
          top: [start.y, end.y],
          opacity: [1, 0],
        }}
        transition={{
          duration: 1,
          delay: 0.4,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default WorkflowAnimation;
