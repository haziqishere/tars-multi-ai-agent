// src/components/agent-workflow/AgentWorkflow.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateAgentStatus,
  updateAgentProgress,
  advanceToNextAgent,
  startWorkflow,
  resetWorkflow,
} from "@/store/slices/agentSlice";
import AgentNode from "./AgentNode";
import WorkflowAnimation from "./WorkflowAnimation";
import { motion } from "framer-motion";

interface AgentWorkflowProps {
  isProcessing: boolean;
  minimized?: boolean;
}

const AgentWorkflow: React.FC<AgentWorkflowProps> = ({
  isProcessing,
  minimized = false,
}) => {
  const dispatch = useAppDispatch();
  const { agents, currentAgentId, isWorkflowActive } = useAppSelector(
    (state) => state.agent
  );
  const [animatingFromAgent, setAnimatingFromAgent] = useState<number | null>(
    null
  );
  const [animatingToAgent, setAnimatingToAgent] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Helper function to get agent index from ID
  const getAgentIndex = (agentId: string | null): number | null => {
    if (!agentId) return null;
    const match = agentId.match(/agent(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Immediately trigger workflow when isProcessing becomes true
  useEffect(() => {
    if (isProcessing) {
      // Start the workflow immediately when isProcessing becomes true
      dispatch(startWorkflow());
    }
  }, [isProcessing, dispatch]);

  return (
    <div className={`h-full ${minimized ? "overflow-hidden px-3" : "p-3"}`}>
      {!minimized && (
        <h2 className="text-sm font-semibold mb-3">Agent Workflows</h2>
      )}

      {!isWorkflowActive &&
        !agents.some((agent) => agent.status === "completed") && (
          <p className="text-xs text-gray-500 mb-3">
            Enter your prompt to start the agent workflow
          </p>
        )}

      {minimized ? (
        <div className="space-y-3 relative py-1">
          {/* Main vertical connection line - now with correct height calculation */}
          <div
            className="absolute left-4 top-0 w-0.5 bg-gray-200 z-0"
            style={{
              height: `${Math.min(agents.length - 1, 4) * 70 + 25}px`, // Calculate height to stop at agent 5
            }}
          ></div>

          {/* Individual connection lines between agents */}
          {agents.slice(0, -1).map((agent, index) => {
            // Skip rendering connection after agent 5
            if (index >= 4) return null;

            const currentAgentIndex = getAgentIndex(currentAgentId);
            const agentNumber = getAgentIndex(agent.id);

            return (
              <motion.div
                key={`connection-${index}`}
                className="absolute left-4 w-0.5 z-0"
                style={{
                  top: `${index * 70 + 25}px`,
                  height: "70px",
                }}
                animate={{
                  backgroundColor:
                    currentAgentIndex &&
                    agentNumber &&
                    currentAgentIndex > agentNumber
                      ? "#0ea5e9"
                      : "#e5e7eb",
                }}
              />
            );
          })}

          {/* Agent nodes rendered above the lines */}
          {agents.map((agent, index) => (
            <div key={agent.id} className="relative z-10 mb-1">
              <AgentNode
                agent={agent}
                isActive={currentAgentId === agent.id}
                minimized={true}
              />
            </div>
          ))}

          {/* Workflow animation between agents */}
          <WorkflowAnimation
            fromAgentId={animatingFromAgent}
            toAgentId={animatingToAgent}
            isAnimating={isAnimating}
            onAnimationComplete={() => setIsAnimating(false)}
          />
        </div>
      ) : (
        // Non-minimized view for agent workflow
        <div className="space-y-4">
          {/* Display agents in non-minimized view */}
          {agents.map((agent, index) => (
            <div key={agent.id} className="relative z-10 mb-4">
              <AgentNode
                agent={agent}
                isActive={currentAgentId === agent.id}
                minimized={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentWorkflow;
