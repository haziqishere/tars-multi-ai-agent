// src/store/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isMinimized: boolean;
  isTyping: boolean;
}

const initialState: ChatState = {
  messages: [],
  isMinimized: false,
  isTyping: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      const { content, sender } = action.payload;
      state.messages.push({
        id: Date.now().toString(),
        content,
        sender,
        timestamp: Date.now(),
      });
    },
    setIsMinimized: (state, action: PayloadAction<boolean>) => {
      state.isMinimized = action.payload;
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    updateMessage: (state, action: PayloadAction<{ id: string; content: string }>) => {
      const { id, content } = action.payload;
      const messageIndex = state.messages.findIndex(m => m.id === id);
      if (messageIndex !== -1) {
        state.messages[messageIndex].content = content;
      }
    },
  },
});

export const { 
  addMessage, 
  setIsMinimized, 
  setIsTyping, 
  clearMessages,
  updateMessage
} = chatSlice.actions;

export default chatSlice.reducer;