// src/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import AgentWorkflow from "@/components/agent-workflow/AgentWorkflow";
import ChatInterface from "@/components/chat/ChatInterface";
import OutputInterface from "@/components/output/OutputInterface";
import {
  Maximize2,
  Minimize2,
  ChevronDown,
  User,
  Menu,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Badge } from "@/components/ui/badge";
import { fetchOptimizationData } from "@/lib/api";
import { setCurrentBusinessFlow, setOptions, selectOption } from "@/store/slices/outputSlice";
import { addMessage, setIsTyping } from "@/store/slices/chatSlice";
import { startWorkflow, advanceToNextAgent, completeWorkflow } from "@/store/slices/agentSlice";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [outputHeight, setOutputHeight] = useState(400);
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
  const handleChatSubmit = async (message: string) => {
    try {
      // Set processing state to show agent workflow animation
      setIsProcessing(true);
      
      // Start the agent workflow animation
      dispatch(startWorkflow());
      
      // Simulate agent 1 working
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatch(advanceToNextAgent());
      
      // Simulate agent 2 working
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatch(advanceToNextAgent());

      // Call the API with the user's message
      const data = await fetchOptimizationData(message);
      
      // Simulate agent 3 working with the data
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatch(advanceToNextAgent());

      // Add the API response as a message from the AI
      dispatch(setIsTyping(true));
      await new Promise(resolve => setTimeout(resolve, 1200));
      dispatch(addMessage({
        content: data.chatResponse,
        sender: 'ai'
      }));
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
      console.error('Error processing request:', error);
      setIsProcessing(false);
      
      // Notify the user of the error
      dispatch(addMessage({
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        sender: 'ai'
      }));
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
    <div className="h-screen flex flex-col">
      {/* Application Header */}
      <header className="app-header">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg mr-2">
              T
            </div>
            <h1 className="text-lg font-semibold">TARS Multi-Agent System</h1>
          </div>

          <div className="hidden md:flex space-x-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Multi-Agent
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Analytics
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">WW</span>
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
                className="border-r border-gray-200 bg-white"
                onResize={setLeftPanelSize}
              >
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-gray-800">
                      Agent Workflows
                    </h2>
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700"
                    >
                      Active
                    </Badge>
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
                    <h2 className="text-sm font-medium text-gray-800">
                      TARS Assistant
                    </h2>
                    <span className="text-xs text-blue-600 font-medium">
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
            className="h-2 w-full bg-gray-100 cursor-ns-resize flex justify-center hover:bg-gray-200 items-center z-10"
            onMouseDown={handleMouseDown}
          >
            <div className="w-12 h-1 rounded bg-gray-300"></div>
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
            <div className="h-10 w-full bg-gray-50 flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Analysis Results
                </span>
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700"
                >
                  Updated
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
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
              className="border-r border-gray-200 bg-white overflow-y-auto"
              onResize={setLeftPanelSize}
            >
              <div className="p-3 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-800">
                  Agent Workflows
                </h2>
              </div>
              <div className="p-4">
                <AgentWorkflow isProcessing={isProcessing} minimized={false} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Main Content Area - Full Chat */}
            <ResizablePanel
              defaultSize={rightPanelSize}
              className="bg-white"
              onResize={setRightPanelSize}
            >
              <div className="h-full">
                <div className="p-3 border-b border-gray-200">
                  <h2 className="text-sm font-medium text-gray-800">
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
