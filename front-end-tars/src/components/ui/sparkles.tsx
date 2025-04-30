"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface SparklesProps {
  id: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

export const SparklesCore: React.FC<SparklesProps> = ({
  id,
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 70,
  className = "",
  particleColor = "#ffffff",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    // Clear any existing sparkles
    container.innerHTML = "";
    sparklesRef.current = [];
    
    // Create sparkles
    for (let i = 0; i < particleDensity; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "absolute rounded-full";
      sparkle.style.backgroundColor = particleColor;
      sparkle.style.opacity = `${Math.random() * 0.7 + 0.3}`;
      
      // Random position
      const left = Math.random() * containerWidth;
      const top = Math.random() * containerHeight;
      sparkle.style.left = `${left}px`;
      sparkle.style.top = `${top}px`;
      
      // Random size
      const size = Math.random() * (maxSize - minSize) + minSize;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      
      // Animation duration
      const duration = Math.random() * 4 + 2; // 2-6 seconds
      
      // Apply animation
      sparkle.style.animation = `sparkle-fade ${duration}s infinite ease-in-out`;
      
      container.appendChild(sparkle);
      sparklesRef.current.push(sparkle);
    }
    
    // Add animation keyframes
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes sparkle-fade {
        0%, 100% { opacity: 0; transform: scale(0.5); }
        50% { opacity: 0.7; transform: scale(1); }
      }
    `;
    document.head.appendChild(styleSheet);
    
    // Cleanup
    return () => {
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, [minSize, maxSize, particleDensity, particleColor]);

  return (
    <div 
      id={id}
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ background }}
    />
  );
};