"use client";

import { cn } from "@/utils/cn";
import React from "react";

export const AnimatedGradientText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "inline-flex animate-text-gradient bg-gradient-to-r from-[#b2a8fd] via-[#8678f9] to-[#c7d2fe] bg-[200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
};
