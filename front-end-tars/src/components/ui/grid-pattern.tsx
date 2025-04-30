"use client";

import React from "react";

export const GridPattern = ({
  className = "",
  yOffset = 0,
  patternColor = "#1F2937",
}: {
  className?: string;
  yOffset?: number;
  patternColor?: string;
}) => {
  return (
    <div
      className={`absolute inset-0 z-0 opacity-20 ${className}`}
      style={{
        backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(to right, ${patternColor} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        transform: `translateY(${yOffset}px)`,
      }}
    />
  );
};
