// src/components/chat/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addMessage,
  setIsMinimized,
  updateMessage,
} from "@/store/slices/chatSlice";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { motion } from "framer-motion";
import { store } from "@/store";
import { Bot, User, Clock, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

interface ChatInterfaceProps {
  onSubmit: (message: string) => void;
  minimized: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSubmit,
  minimized,
}) => {
  const dispatch = useAppDispatch();
  const { messages, isTyping } = useAppSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [aiResponseTime, setAiResponseTime] = useState<number | null>(null);

  useEffect(() => {
    dispatch(setIsMinimized(minimized));
  }, [minimized, dispatch]);

  useEffect(() => {
    // Scroll to bottom when messages change with better behavior
    if (messagesEndRef.current) {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [messages]);

  // Calculate AI response time
  useEffect(() => {
    if (messages.length >= 2) {
      const lastUserMessageIndex = messages.findIndex(
        (msg, i, arr) =>
          msg.sender === "user" &&
          i < arr.length - 1 &&
          arr[i + 1].sender === "ai"
      );

      if (lastUserMessageIndex !== -1) {
        const userMessageTime = messages[lastUserMessageIndex].timestamp;
        const aiMessageTime = messages[lastUserMessageIndex + 1].timestamp;
        const responseTime = (aiMessageTime - userMessageTime) / 1000; // in seconds
        setAiResponseTime(responseTime);
      }
    }
  }, [messages]);

  const handleSubmit = (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    dispatch(addMessage({ content: message, sender: "user" }));

    // Add loading message
    dispatch(
      addMessage({
        content: "Thinking...",
        sender: "ai",
      })
    );

    // Send message to parent for processing
    onSubmit(message);
  };

  return (
    <div className="flex flex-col h-full">
      {!minimized && (
        <div className="bg-dark-elevated border-b border-dark-border px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-accent-green bg-opacity-20 flex items-center justify-center mr-2 shadow-neo-dark">
              <Bot className="h-4 w-4 text-accent-green" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-text-primary">
                TARS Assistant
              </h3>
              <div className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-green mr-1.5"></span>
                <span className="text-xs text-text-secondary">Online</span>
              </div>
            </div>
          </div>
          <div>
            {aiResponseTime && (
              <span className="py-1 px-2 rounded-md text-xs bg-dark-surface border border-dark-border shadow-subtle">
                <Clock className="h-3 w-3 mr-1 inline-block" />
                <span className="text-text-secondary">
                  {aiResponseTime.toFixed(1)}s response
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages container */}
      <div
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-dark-base relative"
        style={{
          height: minimized ? "calc(100% - 38px)" : "calc(100% - 130px)",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-xl shadow-neo-dark p-6 relative corner-highlights">
              <div className="w-12 h-12 rounded-full bg-accent-green bg-opacity-20 mb-4 flex items-center justify-center mx-auto shadow-neo-dark">
                <Bot className="h-6 w-6 text-accent-green" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-text-primary">
                TARS Multi-Agent System
              </h3>
              <p className="text-text-secondary mb-6">
                I can help you analyze business operations, identify
                optimization opportunities, and generate implementation
                strategies.
              </p>

              <div className="space-y-3">
                <button
                  className="w-full justify-start text-left border border-dark-border bg-dark-elevated hover:bg-dark-hover p-2 rounded-md flex items-center space-x-2 shadow-subtle"
                  onClick={() =>
                    handleSubmit(
                      "Analyze our supply chain operations for cost optimization opportunities"
                    )
                  }
                >
                  <div className="text-accent-orange">→</div>
                  <span className="text-text-primary text-sm">
                    Analyze supply chain operations
                  </span>
                </button>

                <button
                  className="w-full justify-start text-left border border-dark-border bg-dark-elevated hover:bg-dark-hover p-2 rounded-md flex items-center space-x-2 shadow-subtle"
                  onClick={() =>
                    handleSubmit(
                      "Evaluate the impact of new tariff regulations on our operations"
                    )
                  }
                >
                  <div className="text-accent-orange">→</div>
                  <span className="text-text-primary text-sm">
                    Evaluate tariff regulation impact
                  </span>
                </button>

                <button
                  className="w-full justify-start text-left border border-dark-border bg-dark-elevated hover:bg-dark-hover p-2 rounded-md flex items-center space-x-2 shadow-subtle"
                  onClick={() =>
                    handleSubmit(
                      "Generate strategies to reduce our operations cost by 25%"
                    )
                  }
                >
                  <div className="text-accent-orange">→</div>
                  <span className="text-text-primary text-sm">
                    Generate cost reduction strategies
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-y-auto pb-2 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area - fixed at bottom */}
      <div
        className={`border-t border-dark-border ${
          minimized ? "p-2" : "p-4"
        } bg-dark-surface`}
      >
        <ChatInput
          onSubmit={handleSubmit}
          disabled={isTyping}
          minimized={minimized}
        />

        {!minimized && (
          <div className="flex justify-center mt-2">
            <span className="text-xs text-text-muted">
              TARS uses AI agents for comprehensive business analysis
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
