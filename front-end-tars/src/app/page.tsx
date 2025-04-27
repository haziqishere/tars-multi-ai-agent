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
    <div className="h-screen flex flex-col">
      {showOutput ? (
        // After workflow completion layout
        <ResizablePanelGroup direction="vertical" className="h-screen">
          {/* Top section: minimized agent workflow and chat */}
          <ResizablePanel
            defaultSize={20}
            minSize={10}
            maxSize={40}
            className="border-b border-gray-200"
          >
            <ResizablePanelGroup direction="horizontal">
              {/* Agent Workflow Sidebar - Minimized */}
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={30}
                className="border-r border-gray-200 bg-white"
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Agent Workflows</h2>
                    <span className="text-xs text-gray-500">*Minimize</span>
                  </div>
                </div>
                <div className="h-full overflow-y-auto">
                  <AgentWorkflow isProcessing={isProcessing} minimized={true} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Chat Interface - Minimized */}
              <ResizablePanel defaultSize={80} className="bg-white">
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">UI for Chat</h2>
                    <span className="text-xs text-gray-500">*Minimize</span>
                  </div>
                </div>
                <div className="h-full overflow-y-auto">
                  <ChatInterface onSubmit={handleChatSubmit} minimized={true} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Bottom section: Output UI */}
          <ResizablePanel defaultSize={80} className="bg-white overflow-hidden">
            <div className="h-full overflow-y-auto">
              <OutputInterface />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // Initial layout - side by side
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Agent Workflow Sidebar */}
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={30}
            className="border-r border-gray-200 bg-white overflow-y-auto"
          >
            <AgentWorkflow isProcessing={isProcessing} minimized={false} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Area - Full Chat */}
          <ResizablePanel defaultSize={80} className="bg-white">
            <div className="h-full">
              <ChatInterface onSubmit={handleChatSubmit} minimized={false} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
