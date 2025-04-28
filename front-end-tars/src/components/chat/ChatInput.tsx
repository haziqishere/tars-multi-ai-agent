// src/components/chat/ChatInput.tsx
"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, PlusIcon, MicIcon, ImageIcon, FileTextIcon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  minimized?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  disabled = false,
  minimized = false,
}) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage("");

    // Refocus the input after submission
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${minimized ? "w-full" : ""}`}
    >
      <div
        className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
          isFocused ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"
        } bg-white`}
      >
        {!minimized && (
          <div className="flex px-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Upload file"
            >
              <FileTextIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Upload image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            minimized
              ? "Type a message..."
              : "Ask TARS about business optimization..."
          }
          className="flex-1 py-2 px-3 outline-none resize-none max-h-32 text-sm"
          disabled={disabled}
          minRows={minimized ? 1 : 1}
          maxRows={minimized ? 3 : 5}
        />

        <div className="px-2">
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${
              message.trim() && !disabled
                ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                : "text-gray-400"
            } rounded-full`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!minimized && (
        <div className="absolute left-2 -top-9 flex space-x-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-white text-gray-700 hover:bg-gray-50"
          >
            <MicIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
