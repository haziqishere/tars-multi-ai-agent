"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Navigate to login page when CTA is clicked
  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-dark-base">
      {/* Simple header with logo */}
      <header className="bg-dark-elevated border-b border-dark-border px-4 py-3 flex items-center justify-between shadow-subtle">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-accent-orange rounded-md flex items-center justify-center text-white font-bold text-lg mr-2 shadow-neo-dark">
            T
          </div>
          <h1 className="text-lg font-semibold text-text-primary">
            TARS Multi-Agent System
          </h1>
        </div>

        <div className="text-xs text-text-secondary">
          Microsoft AI Agent Hackathon
        </div>
      </header>

      {/* Main landing content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="max-w-lg text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="w-20 h-20 bg-accent-orange rounded-xl mx-auto flex items-center justify-center text-white font-bold text-4xl shadow-neo-dark mb-6">
              T
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Welcome to TARS
            </h1>
            <p className="text-xl text-text-secondary">
              Multi-Agent AI System for Business Optimization
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <p className="text-text-secondary">
              TARS uses a collaborative network of specialized AI agents to
              analyze and optimize your business workflows, delivering
              actionable insights and measurable improvements.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              onClick={handleGetStarted}
              className="btn-accent-orange py-3 px-6 text-lg flex items-center justify-center mx-auto hover:bg-opacity-90"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <p className="mt-6 text-xs text-text-muted">
              A project for the Microsoft AI Agent Hackathon
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
