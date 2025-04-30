"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

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

  // Handle user selection
  const handleSelectUser = (user: string) => {
    setSelectedUser(user);
  };

  // Handle login action (no actual auth, just navigation)
  const handleLogin = () => {
    // Save selected user to localStorage for use in other components
    if (selectedUser) {
      localStorage.setItem("selectedUser", selectedUser);
    }
    router.push("/datasource");
  };

  // Handle back navigation
  const handleBack = () => {
    router.push("/");
  };

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

      {/* Login content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md dark-container p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-3">
              Welcome!
            </h1>
            <h2 className="text-xl text-text-primary mb-2">
              Login via Existing User
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            {/* User card for J. Doe */}
            <div
              className={`w-full neo-dark-inset p-4 rounded-lg bg-dark-elevated mb-4 cursor-pointer transition-all ${
                selectedUser === "jdoe"
                  ? "border border-accent-orange"
                  : "border border-transparent hover:border-dark-hover"
              }`}
              onClick={() => handleSelectUser("jdoe")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-accent-orange bg-opacity-20 flex items-center justify-center mr-3">
                    <span className="text-accent-orange font-medium">JD</span>
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">J. Doe</p>
                    <p className="text-xs text-text-secondary">
                      Head Of Operations
                    </p>
                  </div>
                </div>
                {selectedUser === "jdoe" && (
                  <CheckCircle2 className="h-5 w-5 text-accent-orange" />
                )}
              </div>
            </div>

            {/* User card for A. Smith */}
            <div
              className={`w-full neo-dark-inset p-4 rounded-lg bg-dark-elevated mb-4 cursor-pointer transition-all ${
                selectedUser === "asmith"
                  ? "border border-accent-orange"
                  : "border border-transparent hover:border-dark-hover"
              }`}
              onClick={() => handleSelectUser("asmith")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-accent-orange bg-opacity-20 flex items-center justify-center mr-3">
                    <span className="text-accent-orange font-medium">AS</span>
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">A. Smith</p>
                    <p className="text-xs text-text-secondary">CEO</p>
                  </div>
                </div>
                {selectedUser === "asmith" && (
                  <CheckCircle2 className="h-5 w-5 text-accent-orange" />
                )}
              </div>
            </div>

            {/* Company information */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-elevated border border-dark-border">
                <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                <span className="text-xs text-text-secondary">
                  Contoso Semicon
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <button
              onClick={handleLogin}
              disabled={!selectedUser}
              className={`py-3 px-6 w-full flex items-center justify-center rounded-md transition-all ${
                selectedUser
                  ? "btn-accent-green hover:bg-opacity-90"
                  : "bg-dark-elevated text-text-muted cursor-not-allowed"
              }`}
            >
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <p className="mt-4 text-xs text-text-muted">
              For demo, you'll be logged in as either 'Head of Operations' or
              'CEO'
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
