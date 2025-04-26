// src/components/chat/ChatMessage.tsx
"use client";

import { motion } from "framer-motion";
import { Message } from "@/store/slices/chatSlice";

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
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 text-xs">AI</span>
          </div>
        </div>
      )}

      <div className={`max-w-[75%]`}>
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          {isLoading && isLatest ? (
            <div className="flex space-x-1">
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
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        <div
          className={`text-xs text-gray-500 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center">
            <span className="text-xs">You</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
