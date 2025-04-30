"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import AgentWorkflow from "@/components/agent-workflow/AgentWorkflow";
import ChatInterface from "@/components/chat/ChatInterface";
import OutputInterface from "@/components/output/OutputInterface";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Maximize2,
  Minimize2,
  ChevronDown,
  User,
  Menu,
  Bell,
  Settings,
  ChevronLeft,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { fetchOptimizationData } from "@/lib/api";
import {
  setCurrentBusinessFlow,
  setOptions,
  selectOption,
} from "@/store/slices/outputSlice";
import { addMessage, setIsTyping } from "@/store/slices/chatSlice";
import {
  startWorkflow,
  advanceToNextAgent,
  completeWorkflow,
} from "@/store/slices/agentSlice";
import { useRouter } from "next/navigation";

export default function SystemPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [outputHeight, setOutputHeight] = useState(400);
  const outputRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Store refs for drag state to avoid closure issues
  const isDragging = useRef(false);
  const startDragY = useRef(0);
  const startHeight = useRef(0);

  const dispatch = useDispatch();

  // Store panel sizes to maintain layout preferences
  const [leftPanelSize, setLeftPanelSize] = useState(20);
  const [rightPanelSize, setRightPanelSize] = useState(80);

  // Handle back navigation to data source page
  const handleBack = () => {
    router.push("/datasource");
  };

  // Handle chat submission
  const handleChatSubmit = async (message: string) => {
    try {
      // Set processing state to show agent workflow animation
      setIsProcessing(true);

      // Start the agent workflow animation
      dispatch(startWorkflow());

      // Simulate agent 1 working
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(advanceToNextAgent());

      // Simulate agent 2 working
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(advanceToNextAgent());

      // Call the API with the user's message
      const data = await fetchOptimizationData(message);

      // Simulate agent 3 working with the data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(advanceToNextAgent());

      // Add the API response as a message from the AI
      dispatch(setIsTyping(true));
      await new Promise((resolve) => setTimeout(resolve, 1200));
      dispatch(
        addMessage({
          content: data.chatResponse,
          sender: "ai",
        })
      );
      dispatch(setIsTyping(false));

      // Advance to the final agent
      dispatch(advanceToNextAgent());

      // Update Redux store with the API response data
      dispatch(setCurrentBusinessFlow(data.analysis.businessFlow));
      dispatch(setOptions(data.recommendations.options));

      // Select the first option by default
      if (data.recommendations.options.length > 0) {
        dispatch(selectOption(data.recommendations.options[0].id));
      }

      // Mark the workflow as complete
      dispatch(completeWorkflow());

      // Stop processing, show output section
      setIsProcessing(false);
      setShowOutput(true);
    } catch (error) {
      console.error("Error processing request:", error);
      setIsProcessing(false);

      // Notify the user of the error
      dispatch(
        addMessage({
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          sender: "ai",
        })
      );
    }
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
    <div className="h-screen flex flex-col bg-dark-base">
      {/* Application Header */}
      <header className="bg-dark-elevated border-b border-dark-border px-4 py-3 flex items-center justify-between shadow-subtle">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-3 h-8 w-8 rounded-full neo-button flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5 text-text-secondary" />
            </button>
            <div className="w-8 h-8 bg-accent-orange rounded-md flex items-center justify-center text-white font-bold text-lg mr-2 shadow-neo-dark">
              T
            </div>
            <h1 className="text-lg font-semibold text-text-primary">
              TARS Multi-Agent System
            </h1>
          </div>

          <div className="hidden md:flex space-x-3">
            <span className="py-1 px-2 rounded-md text-xs bg-accent-orange bg-opacity-10 text-accent-orange border border-accent-orange border-opacity-20">
              Multi-Agent
            </span>
            <span className="py-1 px-2 rounded-md text-xs bg-accent-green bg-opacity-10 text-accent-green border border-accent-green border-opacity-20">
              Analytics
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button className="neo-button h-9 w-9 flex items-center justify-center rounded-full">
            <Bell className="h-5 w-5 text-text-secondary" />
          </button>
          <div className="h-8 w-8 bg-accent-orange bg-opacity-20 text-accent-orange rounded-full flex items-center justify-center shadow-neo-dark">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
      </header>

      {showOutput ? (
        // After workflow completion layout
        <div className="h-[calc(100%-56px)] flex flex-col relative">
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
                className="border-r border-dark-border bg-dark-surface"
                onResize={setLeftPanelSize}
              >
                <div className="p-3 border-b border-dark-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-text-primary">
                      Agent Workflows
                    </h2>
                    <span className="py-0.5 px-1.5 rounded-sm text-xs bg-accent-green bg-opacity-10 text-accent-green border border-accent-green border-opacity-20">
                      Active
                    </span>
                  </div>
                </div>
                <div className="h-[calc(100%-48px)] overflow-y-auto">
                  <AgentWorkflow isProcessing={isProcessing} minimized={true} />
                </div>
              </ResizablePanel>

              <ResizableHandle
                withHandle
                className="bg-dark-border border-dark-border"
              />

              {/* Chat Interface - Minimized */}
              <ResizablePanel
                defaultSize={rightPanelSize}
                className="bg-dark-surface"
                onResize={setRightPanelSize}
              >
                <div className="p-3 border-b border-dark-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-text-primary">
                      TARS Assistant
                    </h2>
                    <span className="text-xs text-accent-green">
                      Processing complete
                    </span>
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
            className="h-2 w-full bg-dark-elevated cursor-ns-resize flex justify-center hover:bg-dark-hover items-center z-10 border-y border-dark-border"
            onMouseDown={handleMouseDown}
          >
            <div className="w-12 h-1 rounded bg-dark-border"></div>
          </div>

          {/* Bottom section: Output UI with custom resizing */}
          <div
            ref={outputRef}
            className="bg-dark-surface overflow-hidden"
            style={{
              height: `${outputHeight}px`,
              minHeight: "80px",
              borderTop: "1px solid rgb(var(--border-rgb))",
            }}
          >
            <div className="h-10 w-full bg-dark-elevated flex items-center justify-between px-4 border-b border-dark-border">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-text-primary">
                  Analysis Results
                </span>
                <span className="py-0.5 px-1.5 rounded-sm text-xs bg-accent-green bg-opacity-10 text-accent-green border border-accent-green border-opacity-20">
                  Updated
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="neo-button h-7 w-7 flex items-center justify-center rounded-full"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <Maximize2 className="h-4 w-4 text-text-secondary" />
                  )}
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-40px)] overflow-y-auto">
              <OutputInterface />
            </div>
          </div>
        </div>
      ) : (
        // Initial layout - side by side with ResizablePanelGroup
        <div className="h-[calc(100%-56px)]">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Agent Workflow Sidebar */}
            <ResizablePanel
              defaultSize={leftPanelSize}
              minSize={15}
              maxSize={30}
              className="border-r border-dark-border bg-dark-surface overflow-y-auto"
              onResize={setLeftPanelSize}
            >
              <div className="p-3 border-b border-dark-border">
                <h2 className="text-sm font-medium text-text-primary">
                  Agent Workflows
                </h2>
              </div>
              <div className="p-4">
                <AgentWorkflow isProcessing={isProcessing} minimized={false} />
              </div>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="bg-dark-border border-dark-border"
            />

            {/* Main Content Area - Full Chat */}
            <ResizablePanel
              defaultSize={rightPanelSize}
              className="bg-dark-surface"
              onResize={setRightPanelSize}
            >
              <div className="h-full">
                <div className="p-3 border-b border-dark-border">
                  <h2 className="text-sm font-medium text-text-primary">
                    TARS Assistant
                  </h2>
                </div>
                <div className="h-[calc(100%-48px)]">
                  <ChatInterface
                    onSubmit={handleChatSubmit}
                    minimized={false}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
}
