"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, CheckCircle2, Zap } from "lucide-react";

export default function DataSourcePage() {
  const router = useRouter();
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Handle data source toggle selection
  const handleToggleSource = (source: string) => {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        return prev.filter((s) => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  // Handle continue action
  const handleContinue = () => {
    router.push("/chat");
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/login");
  };

  // SVG Components from documentation
  const FabricLogo = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="8" fill="#4B53BC" />
      <path d="M16 20H48V44H16V20Z" fill="#8B91E2" />
      <path d="M22 26H42V38H22V26Z" fill="#E2E4FF" />
      <path d="M22 32L32 26L42 32L32 38L22 32Z" fill="#4B53BC" />
    </svg>
  );

  const SharePointLogo = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="8" fill="#0078D4" />
      <rect x="16" y="20" width="32" height="24" fill="#2B88D8" />
      <circle cx="32" cy="32" r="8" fill="#81CAFF" />
      <rect x="26" y="31" width="12" height="2" fill="#0078D4" />
      <rect x="31" y="26" width="2" height="12" fill="#0078D4" />
    </svg>
  );

  return (
    <div className="h-screen flex flex-col bg-dark-base">
      {/* Header with back button */}
      <header className="bg-dark-elevated border-b border-dark-border px-4 py-3 flex items-center justify-between shadow-subtle">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-3 h-8 w-8 rounded-full neo-button flex items-center justify-center"
          >
            <ChevronLeft className="h-5 w-5 text-text-secondary" />
          </button>
          <div className="w-7 h-7 bg-accent-orange rounded-md flex items-center justify-center text-white font-bold text-sm mr-2 shadow-neo-dark">
            T
          </div>
          <h1 className="text-lg font-semibold text-text-primary">
            TARS Multi-Agent System
          </h1>
        </div>
      </header>

      {/* Data Source Selection content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-2xl dark-container p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Choose Data Source
            </h1>
            <div className="flex items-center justify-center gap-1.5">
              <Zap className="h-4 w-4 text-accent-green" />
              <p className="text-sm text-text-secondary">
                Supercharge your agent with internal knowledge
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Microsoft Fabric Option - Fixed positioning for checkmark */}
              <div
                className={`p-4 rounded-lg cursor-pointer transition-all relative ${
                  selectedSources.includes("fabric")
                    ? "bg-accent-orange bg-opacity-10 border border-accent-orange"
                    : "bg-dark-elevated border border-dark-border hover:border-dark-hover"
                }`}
                onClick={() => handleToggleSource("fabric")}
              >
                {selectedSources.includes("fabric") && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-5 w-5 text-accent-orange" />
                  </div>
                )}
                <div className="flex flex-col items-center text-center">
                  <FabricLogo />
                  <h3 className="mt-3 text-lg font-medium text-text-primary">
                    Microsoft Fabric
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Connect to your organization's data lake and analytics
                  </p>
                </div>
              </div>

              {/* SharePoint Option - Fixed positioning for checkmark */}
              <div
                className={`p-4 rounded-lg cursor-pointer transition-all relative ${
                  selectedSources.includes("sharepoint")
                    ? "bg-accent-orange bg-opacity-10 border border-accent-orange"
                    : "bg-dark-elevated border border-dark-border hover:border-dark-hover"
                }`}
                onClick={() => handleToggleSource("sharepoint")}
              >
                {selectedSources.includes("sharepoint") && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-5 w-5 text-accent-orange" />
                  </div>
                )}
                <div className="flex flex-col items-center text-center">
                  <SharePointLogo />
                  <h3 className="mt-3 text-lg font-medium text-text-primary">
                    SharePoint
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Connect to your team's shared documents and knowledge base
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={selectedSources.length === 0}
              className={`py-3 px-6 w-48 flex items-center justify-center rounded-md transition-all ${
                selectedSources.length > 0
                  ? "btn-accent-green hover:bg-opacity-90"
                  : "bg-dark-elevated text-text-muted cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
