// src/components/chat/ChatInput.tsx
"use client";

import { useState, useRef, FormEvent, KeyboardEvent } from "react";
import { Send, ImageIcon, FileTextIcon } from "lucide-react";
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
        className={`flex items-center rounded-lg overflow-hidden transition-colors shadow-neo-inset ${
          isFocused
            ? "border border-accent-orange border-opacity-50 bg-dark-elevated"
            : "border border-dark-border bg-dark-elevated"
        }`}
      >
        {!minimized && (
          <div className="flex px-2">
            <button
              type="button"
              className="h-8 w-8 text-text-muted hover:text-text-secondary hover:bg-dark-hover rounded-full transition-colors duration-200 flex items-center justify-center"
              title="Upload file"
            >
              <FileTextIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="h-8 w-8 text-text-muted hover:text-text-secondary hover:bg-dark-hover rounded-full transition-colors duration-200 flex items-center justify-center"
              title="Upload image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
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
          className="flex-1 py-2 px-3 outline-none resize-none max-h-32 text-sm bg-transparent text-text-primary placeholder-text-muted"
          disabled={disabled}
          minRows={minimized ? 1 : 1}
          maxRows={minimized ? 3 : 5}
        />

        <div className="px-2">
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
              message.trim() && !disabled
                ? "text-accent-orange hover:text-accent-orange-muted hover:bg-dark-hover"
                : "text-text-muted"
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
