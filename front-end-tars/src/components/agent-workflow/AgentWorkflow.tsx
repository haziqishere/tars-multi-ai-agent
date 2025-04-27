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

  // Simulate agent workflow process when isProcessing is true
  useEffect(() => {
    if (isProcessing) {
      dispatch(startWorkflow());

      const processAgents = async () => {
        // Agent 1: Enterprise Knowledge Base Agent
        dispatch(
          updateAgentStatus({
            agentId: "agent1",
            status: "working",
            message: "Accessing knowledge base",
          })
        );

        // Instead of progress updates, just add a delay to simulate work
        await new Promise((resolve) => setTimeout(resolve, 3000));
        dispatch(updateAgentStatus({ agentId: "agent1", status: "completed" }));

        // Animate transition to Agent 2
        setAnimatingFromAgent(1);
        setAnimatingToAgent(2);
        setIsAnimating(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsAnimating(false);

        // Move to Agent 2
        dispatch(advanceToNextAgent());

        // Agent 2: Global Intelligence
        dispatch(
          updateAgentStatus({
            agentId: "agent2",
            status: "working",
            message: "Making timeline of events",
          })
        );

        // Instead of progress updates, just add a delay to simulate work
        await new Promise((resolve) => setTimeout(resolve, 3000));
        dispatch(updateAgentStatus({ agentId: "agent2", status: "completed" }));

        // Animate transition to Agent 3
        setAnimatingFromAgent(2);
        setAnimatingToAgent(3);
        setIsAnimating(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsAnimating(false);

        // Move to Agent 3
        dispatch(advanceToNextAgent());

        // Agent 3: Strategic Consultant
        dispatch(
          updateAgentStatus({
            agentId: "agent3",
            status: "working",
            message: "Deriving actionable decisions and scenarios",
          })
        );

        // Instead of progress updates, just add a delay to simulate work
        await new Promise((resolve) => setTimeout(resolve, 3000));
        dispatch(updateAgentStatus({ agentId: "agent3", status: "completed" }));

        // Animate transition to Agent 4
        setAnimatingFromAgent(3);
        setAnimatingToAgent(4);
        setIsAnimating(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsAnimating(false);

        // Move to Agent 4
        dispatch(advanceToNextAgent());

        // Agent 4: Prediction & ROI
        dispatch(
          updateAgentStatus({
            agentId: "agent4",
            status: "working",
            message: "Calculating implementation time and cost",
          })
        );

        // Instead of progress updates, just add a delay to simulate work
        await new Promise((resolve) => setTimeout(resolve, 3000));
        dispatch(updateAgentStatus({ agentId: "agent4", status: "completed" }));

        // Animate transition to Agent 5
        setAnimatingFromAgent(4);
        setAnimatingToAgent(5);
        setIsAnimating(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsAnimating(false);

        // Move to Agent 5
        dispatch(advanceToNextAgent());

        // Agent 5: Informant
        dispatch(
          updateAgentStatus({
            agentId: "agent5",
            status: "working",
            message: "Preparing information for managers",
          })
        );

        // Instead of progress updates, just add a delay to simulate work
        await new Promise((resolve) => setTimeout(resolve, 3000));
        dispatch(updateAgentStatus({ agentId: "agent5", status: "completed" }));

        // Complete workflow
        dispatch(advanceToNextAgent());
      };

      processAgents();
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

      {minimized && (
        <div className="space-y-3 relative">
          {/* Connection lines between agents - positioned absolutely behind the agents */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

          {agents.slice(0, -1).map((agent, index) => {
            const currentAgentIndex = getAgentIndex(currentAgentId);
            const agentNumber = getAgentIndex(agent.id);

            return (
              <motion.div
                key={`connection-${index}`}
                className="absolute left-4 w-0.5 z-0"
                style={{
                  top: `${index * 70 + 25}px`, // Increased from 60px to 70px
                  height: "70px", // Increased from 60px to 70px
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
              <AgentNode agent={agent} isActive={currentAgentId === agent.id} minimized={true} />
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
      )}
    </div>
  );
};

export default AgentWorkflow;
