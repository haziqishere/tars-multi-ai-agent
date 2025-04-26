// src/components/chat/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage, setIsMinimized } from "@/store/slices/chatSlice";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { motion } from "framer-motion";

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

  useEffect(() => {
    dispatch(setIsMinimized(minimized));
  }, [minimized, dispatch]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    dispatch(addMessage({ content: message, sender: "user" }));

    // Start AI typing indicator
    dispatch(addMessage({ content: "Thinking...", sender: "ai" }));

    // Send message to parent for processing
    onSubmit(message);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <h2 className="text-lg font-semibold">
          {minimized ? "UI for Chat *Minimize" : "UI for Chat"}
        </h2>
      </div>

      {/* Messages container - should flex-grow to fill available space */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-purple-200 mb-4 flex items-center justify-center">
              <span className="text-purple-600 text-3xl">✨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Need help planning the perfect event?
            </h3>
            <p className="text-gray-600 mb-6">
              Get expert tips on budgeting, guest management, and themes to make
              your event unforgettable!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <ChatInput onSubmit={handleSubmit} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatInterface;
