"use client";

import { cn } from "@/utils/cn";
import React, { useEffect, useState } from "react";

export const WordRotate = ({
  words = [],
  className = "",
  interval = 2000,
}: {
  words: string[];
  className?: string;
  interval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className={cn("relative h-[1.5em] overflow-hidden", className)}>
      {words.map((word, index) => (
        <div
          key={index}
          className={cn(
            "absolute w-full text-center transition-transform duration-500",
            {
              "translate-y-0 opacity-100": index === currentIndex,
              "translate-y-full opacity-0": index !== currentIndex,
            }
          )}
        >
          {word}
        </div>
      ))}
    </div>
  );
};
