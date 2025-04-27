// src/components/agent-workflow/AgentNode.tsx
"use client";

import { motion } from "framer-motion";
import { Agent } from "@/store/slices/agentSlice";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AgentNodeProps {
  agent: Agent;
  isActive: boolean;
  minimized?: boolean;
}

const AgentNode: React.FC<AgentNodeProps> = ({
  agent,
  isActive,
  minimized = false,
}) => {
  // Determine status color
  const getStatusColor = () => {
    switch (agent.status) {
      case "idle":
        return "bg-gray-200";
      case "working":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-200";
    }
  };

  // Extract agent number for display
  const getAgentNumber = (): number => {
    const match = agent.id.match(/agent(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const getStatusText = () => {
    switch (agent.status) {
      case "working":
        return agent.message || agent.role;
      case "completed":
        return "Task completed";
      case "error":
        return "Error occurred";
      default:
        return "";
    }
  };

  if (minimized) {
    return (
      <div className="flex items-center space-x-2">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center ${getStatusColor()}`}
        >
          <span className="text-white text-xs">{agent.id}</span>
        </div>
        <span className="text-xs truncate">{agent.name}</span>
        {agent.status === "completed" && (
          <span className="text-xs text-green-600">✓</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative p-3 rounded-lg transition-all duration-300 mb-4 ${
        isActive
          ? "bg-blue-50 border border-blue-200"
          : "bg-white border border-gray-200"
      }`}
    >
      <div className="flex items-center">
        {/* Status indicator - positioned to align with the connection line */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getStatusColor()}`}
          animate={{
            scale: isActive && agent.status === "working" ? [1, 1.1, 1] : 1,
          }}
          transition={{
            repeat: isActive && agent.status === "working" ? Infinity : 0,
            duration: 1.5,
          }}
        >
          <span className="text-white text-xs font-bold">
            {getAgentNumber()}
          </span>
        </motion.div>

        {/* Agent name and status */}
        <div className="flex-1">
          <h3 className="text-sm font-medium">{agent.name}</h3>
          {agent.status === "working" && (
            <p className="text-xs text-blue-600">
              {agent.message || agent.role}
            </p>
          )}
          {agent.status === "completed" && (
            <p className="text-xs text-green-600">Task completed</p>
          )}
          {agent.status === "error" && (
            <p className="text-xs text-red-600">Error occurred</p>
          )}
        </div>
      </div>

      {/* Progress bar - only visible when processing */}
      {agent.status === "working" && (
        <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: `${agent.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

export default AgentNode;
