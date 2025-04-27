// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import AgentWorkflow from "@/components/agent-workflow/AgentWorkflow";
import ChatInterface from "@/components/chat/ChatInterface";
import OutputInterface from "@/components/output/OutputInterface";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [outputHeight, setOutputHeight] = useState(400); // Reduced from 650px to 400px to make it lower vertically
  const outputRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Store refs for drag state to avoid closure issues
  const isDragging = useRef(false);
  const startDragY = useRef(0);
  const startHeight = useRef(0);

  const dispatch = useDispatch();

  // Store panel sizes to maintain layout preferences
  const [leftPanelSize, setLeftPanelSize] = useState(20);
  const [rightPanelSize, setRightPanelSize] = useState(80);

  // Handle chat submission
  const handleChatSubmit = (message: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowOutput(true);
    }, 3000);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (isFullscreen) {
      setOutputHeight(startHeight.current);
      setIsFullscreen(false);
    } else {
      startHeight.current = outputHeight;
      setOutputHeight(window.innerHeight * 0.95);
      setIsFullscreen(true);
    }
  };

  // Direct resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    // Capture initial values
    isDragging.current = true;
    startDragY.current = e.clientY;
    startHeight.current = outputHeight;

    // Add document-level event listeners
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    // Calculate delta and apply new height
    const delta = startDragY.current - e.clientY;
    const newHeight = Math.max(
      80,
      Math.min(window.innerHeight * 0.95, startHeight.current + delta)
    );
    setOutputHeight(newHeight);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {showOutput ? (
        // After workflow completion layout
        <div className="h-screen flex flex-col relative">
          {/* Top section: minimized agent workflows and chat using ResizablePanelGroup */}
          <div
            style={{
              height: `calc(100% - ${outputHeight}px)`,
              minHeight: "5%",
            }}
          >
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Agent Workflow Sidebar - Minimized */}
              <ResizablePanel
                defaultSize={leftPanelSize}
                minSize={15}
                maxSize={30}
                className="border-r border-gray-200 bg-white"
                onResize={setLeftPanelSize}
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Agent Workflows</h2>
                    <span className="text-xs text-gray-500">*Minimize</span>
                  </div>
                </div>
                <div className="h-[calc(100%-48px)] overflow-y-auto">
                  <AgentWorkflow isProcessing={isProcessing} minimized={true} />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Chat Interface - Minimized */}
              <ResizablePanel
                defaultSize={rightPanelSize}
                className="bg-white"
                onResize={setRightPanelSize}
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold"></h2>
                  </div>
                </div>
                <div className="h-[calc(100%-48px)] overflow-y-auto">
                  <ChatInterface onSubmit={handleChatSubmit} minimized={true} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Custom resize handle */}
          <div
            ref={dragHandleRef}
            className="h-4 w-full bg-gray-200 cursor-ns-resize flex justify-center hover:bg-blue-300 items-center z-10"
            onMouseDown={handleMouseDown}
          >
            <div className="w-24 h-2 rounded bg-gray-400"></div>
          </div>

          {/* Bottom section: Output UI with custom resizing */}
          <div
            ref={outputRef}
            className="bg-white overflow-hidden"
            style={{
              height: `${outputHeight}px`,
              minHeight: "80px",
              borderTop: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div className="h-8 w-full bg-gray-100 flex items-center justify-between px-3">
              <div className="flex items-center">
                {/* No text here */}
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="h-[calc(100%-32px)] overflow-y-auto">
              <OutputInterface />
            </div>
          </div>
        </div>
      ) : (
        // Initial layout - side by side with ResizablePanelGroup
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Agent Workflow Sidebar */}
          <ResizablePanel
            defaultSize={leftPanelSize}
            minSize={15}
            maxSize={30}
            className="border-r border-gray-200 bg-white overflow-y-auto"
            onResize={setLeftPanelSize}
          >
            <AgentWorkflow isProcessing={isProcessing} minimized={false} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Area - Full Chat */}
          <ResizablePanel
            defaultSize={rightPanelSize}
            className="bg-white"
            onResize={setRightPanelSize}
          >
            <div className="h-full">
              <ChatInterface onSubmit={handleChatSubmit} minimized={false} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
