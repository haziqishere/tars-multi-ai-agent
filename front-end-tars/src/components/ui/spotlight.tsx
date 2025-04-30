"use client";

import { cn } from "@/utils/cn";
import React, { useEffect, useRef, useState } from "react";

export const Spotlight = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && divRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      };

      const handleMouseEnter = () => {
        setOpacity(1);
      };

      const handleMouseLeave = () => {
        setOpacity(0);
      };

      const element = divRef.current;
      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [isMounted]);

  return (
    <div
      ref={divRef}
      className={cn("relative w-full overflow-hidden rounded-md", className)}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};
