// src/app/page.tsx
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import AgentWorkflow from "@/components/agent-workflow/AgentWorkflow";
import ChatInterface from "@/components/chat/ChatInterface";
import OutputInterface from "@/components/output/OutputInterface";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const dispatch = useDispatch();

  // Handle chat submission
  const handleChatSubmit = (message: string) => {
    // Set processing state to true to start animation
    setIsProcessing(true);

    // Simulate API call to backend
    setTimeout(() => {
      setIsProcessing(false);
      setShowOutput(true);
    }, 3000);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-screnn h-screen"
    >
      {/* Agent Workflow Sidebar */}
      <ResizablePanel
        defaultSize={20}
        minSize={15}
        maxSize={30}
        className="border-r border-gray-200 bg-white overflow-y-auto"
      >
        <AgentWorkflow isProcessing={isProcessing} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Main Content Area */}
      <ResizablePanel defaultSize={80}>
        {showOutput ? (
          <ResizablePanelGroup direction="vertical">
            {/* Chat Interface - Default to 1/3 when output is shown */}
            <ResizablePanel
              defaultSize={33}
              minSize={20}
              maxSize={50}
              className="bg-white border-b border-gray-200"
            >
              <ChatInterface
                onSubmit={handleChatSubmit}
                minimized={showOutput}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Output Interface - Default to 2/3 when shown */}
            <ResizablePanel
              defaultSize={67}
              className="bg-white overflow-y-auto"
            >
              <div className="h-full overflow-y-auto">
                <OutputInterface />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          // When output is not shown, chat takes full height
          <div className="h-full bg-white">
            <ChatInterface onSubmit={handleChatSubmit} minimized={false} />
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
