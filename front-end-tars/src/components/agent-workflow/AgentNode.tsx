// src/components/agent-workflow/AgentNode.tsx
"use client";

import { motion } from "framer-motion";
import { Agent } from "@/store/slices/agentSlice";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, ActivityIcon } from "lucide-react";

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
  // Determine status styling and icon
  const getStatusConfig = () => {
    switch (agent.status) {
      case "idle":
        return {
          color: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-200",
          icon: <Clock className="h-3.5 w-3.5" />,
          label: "Waiting",
        };
      case "working":
        return {
          color: "bg-blue-50",
          textColor: "text-blue-600",
          borderColor: "border-blue-200",
          icon: <ActivityIcon className="h-3.5 w-3.5 text-blue-500" />,
          label: "Processing",
        };
      case "completed":
        return {
          color: "bg-green-50",
          textColor: "text-green-600",
          borderColor: "border-green-200",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
          label: "Completed",
        };
      case "error":
        return {
          color: "bg-red-50",
          textColor: "text-red-600",
          borderColor: "border-red-200",
          icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
          label: "Error",
        };
      default:
        return {
          color: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-200",
          icon: <Clock className="h-3.5 w-3.5" />,
          label: "Waiting",
        };
    }
  };

  // Extract agent number for display
  const getAgentNumber = (): number => {
    const match = agent.id.match(/agent(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const statusConfig = getStatusConfig();

  if (minimized) {
    return (
      <div className="flex items-center py-2.5 px-4">
        <div className="flex items-center">
          {/* Status dot with agent number */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              agent.status === "working" ? statusConfig.color : "bg-gray-100"
            } ${statusConfig.textColor}`}
          >
            <span className="text-xs font-medium">{getAgentNumber()}</span>
          </div>

          {/* Agent details */}
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <p className="text-sm font-medium">{agent.name}</p>
              {agent.status !== "idle" && (
                <Badge
                  variant="outline"
                  className={`ml-2 text-xs ${statusConfig.color} ${statusConfig.textColor}`}
                >
                  {statusConfig.label}
                </Badge>
              )}
            </div>
            {agent.status === "working" && (
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                {agent.message || "Processing..."}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar for active agents only */}
        {agent.status === "working" && (
          <div className="mt-1 w-full">
            <Progress value={agent.progress} className="h-1" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 mb-4 ${
        isActive
          ? `bg-blue-50 border-blue-200`
          : agent.status === "completed"
          ? "bg-green-50 border-green-100"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center">
          {/* Status indicator - positioned to align with the connection line */}
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              agent.status === "working"
                ? "bg-blue-500"
                : agent.status === "completed"
                ? "bg-green-500"
                : agent.status === "error"
                ? "bg-red-500"
                : "bg-gray-300"
            }`}
            animate={{
              scale: isActive && agent.status === "working" ? [1, 1.05, 1] : 1,
            }}
            transition={{
              repeat: isActive && agent.status === "working" ? Infinity : 0,
              duration: 1.5,
            }}
          >
            <span className="text-white text-sm font-medium">
              {getAgentNumber()}
            </span>
          </motion.div>

          {/* Agent name and status */}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-base font-medium">{agent.name}</h3>
              <Badge
                variant="outline"
                className={`ml-2 ${statusConfig.color} ${statusConfig.textColor} border-0`}
              >
                <span className="flex items-center">
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.label}</span>
                </span>
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">{agent.role}</p>
          </div>
        </div>

        {/* Agent message - only visible when there's a message */}
        {agent.message && (
          <div className="mt-3 pl-[52px]">
            <div
              className={`text-sm p-2 rounded ${
                agent.status === "working"
                  ? "bg-blue-50 text-blue-800"
                  : agent.status === "completed"
                  ? "bg-green-50 text-green-800"
                  : agent.status === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {agent.message}
            </div>
          </div>
        )}

        {/* Progress bar - only visible when processing */}
        {agent.status === "working" && (
          <div className="mt-4 pl-[52px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-medium">{agent.progress}%</span>
            </div>
            <Progress value={agent.progress} className="h-2" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default AgentNode;
