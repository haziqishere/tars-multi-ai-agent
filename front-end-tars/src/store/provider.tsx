"use client";

import { store } from "./index";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

// Cursor Instructions:
// This is the Redux Provider component that wraps the application.
// It provides the Redux store to all components in the application.
