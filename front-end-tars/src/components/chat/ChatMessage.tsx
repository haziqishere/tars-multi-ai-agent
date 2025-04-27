// src/components/chat/ChatMessage.tsx
"use client";

import { motion } from "framer-motion";
import { Message } from "@/store/slices/chatSlice";
import { Bot, UserIcon } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest }) => {
  const isUser = message.sender === "user";

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Determine if message is a loading indicator
  const isLoading =
    message.content === "..." || message.content === "Thinking...";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} relative`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-4 w-4 text-blue-700" />
          </div>
        </div>
      )}

      <div className={`max-w-[75%]`}>
        <div
          className={`p-3 rounded-lg shadow-sm ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          {isLoading && isLatest ? (
            <div className="flex space-x-1 items-center px-2 py-1">
              <motion.div
                className="w-2 h-2 rounded-full bg-current"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-current"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 rounded-full bg-current"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
              />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm md:text-base">
              {message.content}
            </div>
          )}
        </div>

        <div
          className={`text-xs text-gray-500 mt-1 flex items-center ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {formatTime(message.timestamp)}
          
          {/* Additional metadata could be added here */}
          {!isUser && !isLoading && isLatest && (
            <span className="ml-2 text-blue-600 font-medium flex items-center">
              <span className="h-1 w-1 rounded-full bg-blue-600 mr-1"></span>
              TARS
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3 mt-1">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
