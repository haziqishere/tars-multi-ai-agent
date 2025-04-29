// src/components/ui/ThemeToggle.tsx
"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  onToggle?: (isDark: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Call the onToggle prop if provided
    if (onToggle) {
      onToggle(newMode);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="neo-button h-8 w-8 flex items-center justify-center rounded-full"
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Moon className="h-4 w-4 text-accent-orange" />
      ) : (
        <Sun className="h-4 w-4 text-accent-orange" />
      )}
    </button>
  );
};

export default ThemeToggle;
