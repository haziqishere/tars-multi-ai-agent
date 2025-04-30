"use client";

import { cn } from "@/utils/cn";
import React from "react";

export const HyperText = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
