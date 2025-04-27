// src/components/agent-workflow/AgentNode.tsx
"use client";

import { motion } from "framer-motion";
import { Agent } from "@/store/slices/agentSlice";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, ActivityIcon } from "lucide-react";
import { TypingAnimation } from "@/components/magicui/typing-animation";

interface AgentNodeProps {
  agent: Agent;
  isActive: boolean;
  minimized?: boolean;
}

// Loading spinner SVG component
const LoadingSpinner = ({ className = "" }: { className?: string }) => {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

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
      <div className="flex items-center py-1.5 px-2">
        <div className="flex items-center">
          {/* Status dot with agent number */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              agent.status === "working" ? statusConfig.color : "bg-gray-100"
            } ${statusConfig.textColor}`}
          >
            <span className="text-xs font-medium">{getAgentNumber()}</span>
          </div>

          {/* Agent details */}
          <div className="ml-2 flex-1">
            <div className="flex items-center">
              <p className="text-xs font-medium truncate max-w-[120px]">
                {agent.name}
              </p>
              {agent.status !== "idle" && (
                <>
                  {agent.status === "working" ? (
                    <div className="ml-1.5 flex items-center text-blue-600">
                      <LoadingSpinner className="h-3 w-3" />
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`ml-1.5 text-[10px] py-0 px-1.5 h-4 ${statusConfig.color} ${statusConfig.textColor}`}
                    >
                      {statusConfig.label}
                    </Badge>
                  )}
                </>
              )}
            </div>
            {agent.status === "working" && agent.message && (
              <div className="text-[10px] text-gray-500 mt-0.5 max-w-full">
                <TypingAnimation
                  className="text-[10px] leading-tight"
                  duration={50}
                >
                  {agent.message}
                </TypingAnimation>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 mb-2 ${
        isActive
          ? `bg-blue-50 border-blue-200`
          : agent.status === "completed"
          ? "bg-green-50 border-green-100"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="p-3">
        <div className="flex items-center">
          {/* Status indicator - positioned to align with the connection line */}
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
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
            <span className="text-white text-xs font-medium">
              {getAgentNumber()}
            </span>
          </motion.div>

          {/* Agent name and status */}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-sm font-medium">{agent.name}</h3>
              {agent.status === "working" ? (
                <div className="ml-2 flex items-center text-blue-600">
                  <LoadingSpinner className="h-4 w-4" />
                </div>
              ) : (
                <Badge
                  variant="outline"
                  className={`ml-1.5 text-[10px] py-0 px-1.5 ${statusConfig.color} ${statusConfig.textColor} border-0`}
                >
                  <span className="flex items-center">
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">{agent.role}</p>
          </div>
        </div>

        {/* Agent message with typing animation - only visible when there's a message */}
        {agent.message && (
          <div className="mt-2 pl-10">
            <div
              className={`text-xs p-1.5 rounded ${
                agent.status === "working"
                  ? "bg-blue-50 text-blue-800"
                  : agent.status === "completed"
                  ? "bg-green-50 text-green-800"
                  : agent.status === "error"
                  ? "bg-red-50 text-red-800"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {agent.status === "working" ? (
                <TypingAnimation
                  className="text-xs leading-tight"
                  duration={50}
                >
                  {agent.message}
                </TypingAnimation>
              ) : (
                agent.message
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AgentNode;
