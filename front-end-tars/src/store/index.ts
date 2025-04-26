import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './slices/agentSlice';
import chatReducer from './slices/chatSlice';
import outputReducer from './slices/outputSlice';

export const store = configureStore({
  reducer: {
    agent: agentReducer,
    chat: chatReducer,
    output: outputReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Cursor Instructions:
// This is the main Redux store configuration.
// You need to create the following reducer slices:
// 1. agentSlice.ts - to manage agent workflow state
// 2. chatSlice.ts - to manage chat history and state
// 3. outputSlice.ts - to manage output visualization state