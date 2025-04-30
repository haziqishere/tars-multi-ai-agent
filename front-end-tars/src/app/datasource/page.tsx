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
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="currentColor"
    >
      <path
        fill="url(#icon-7e9afc4afb23aa85__icon-4d039b80c4be800a__a)"
        fill-rule="evenodd"
        d="m5.64 31.6-.586 2.144c-.218.685-.524 1.693-.689 2.59a5.629 5.629 0 0 0 4.638 7.588c.792.114 1.688.108 2.692-.04l4.613-.636a2.924 2.924 0 0 0 2.421-2.127l3.175-11.662L5.64 31.599Z"
        clip-rule="evenodd"
      />
      <path
        fill="url(#icon-fbd56b0a81152ef4__icon-78f52e20309b156b__b)"
        d="M10.14 32.152c-4.863.753-5.861 4.423-5.861 4.423l4.656-17.11 24.333-3.292-3.318 12.052a1.706 1.706 0 0 1-1.388 1.244l-.136.022-18.423 2.684.137-.023Z"
      />
      <path
        fill="url(#icon-971ae08ec7f45454__icon-77e9c21df46e5459__c)"
        fill-opacity=".8"
        d="M10.14 32.152c-4.863.753-5.861 4.423-5.861 4.423l4.656-17.11 24.333-3.292-3.318 12.052a1.706 1.706 0 0 1-1.388 1.244l-.136.022-18.423 2.684.137-.023Z"
      />
      <path
        fill="url(#icon-006ae52c58818f34__icon-fefad3b496a01348__d)"
        d="m12.899 21.235 26.938-3.98a1.597 1.597 0 0 0 1.323-1.17l2.78-10.06a1.595 1.595 0 0 0-1.74-2.012L16.498 7.81a7.185 7.185 0 0 0-5.777 5.193L7.013 26.438c.744-2.717 1.202-4.355 5.886-5.203Z"
      />
      <path
        fill="url(#icon-b20c75ab267ca94a__icon-6e8dfaf161507040__e)"
        d="m12.899 21.235 26.938-3.98a1.597 1.597 0 0 0 1.323-1.17l2.78-10.06a1.595 1.595 0 0 0-1.74-2.012L16.498 7.81a7.185 7.185 0 0 0-5.777 5.193L7.013 26.438c.744-2.717 1.202-4.355 5.886-5.203Z"
      />
      <path
        fill="url(#icon-a92f6eee55b4848c__icon-736fd316b8a72f77__f)"
        fill-opacity=".4"
        d="m12.899 21.235 26.938-3.98a1.597 1.597 0 0 0 1.323-1.17l2.78-10.06a1.595 1.595 0 0 0-1.74-2.012L16.498 7.81a7.185 7.185 0 0 0-5.777 5.193L7.013 26.438c.744-2.717 1.202-4.355 5.886-5.203Z"
      />
      <path
        fill="url(#icon-f38431b998350117__icon-41e6540ecda9967b__g)"
        d="M12.899 21.236c-3.901.706-4.87 1.962-5.514 3.932L4.279 36.577s.992-3.633 5.796-4.41l18.352-2.673.136-.022a1.707 1.707 0 0 0 1.388-1.244l2.73-9.915-19.782 2.923Z"
      />
      <path
        fill="url(#icon-1100149c8c650d8a__icon-5deb3b0bc4d268e5__h)"
        fill-opacity=".2"
        d="M12.899 21.236c-3.901.706-4.87 1.962-5.514 3.932L4.279 36.577s.992-3.633 5.796-4.41l18.352-2.673.136-.022a1.707 1.707 0 0 0 1.388-1.244l2.73-9.915-19.782 2.923Z"
      />
      <path
        fill="url(#icon-9a3ccf482b635fc2__icon-246be254e9c09726__i)"
        fill-rule="evenodd"
        d="M10.075 32.167c-4.06.657-5.392 3.345-5.71 4.164a5.629 5.629 0 0 0 4.638 7.59c.792.114 1.688.108 2.692-.039l4.613-.637a2.924 2.924 0 0 0 2.421-2.127l2.894-10.633-11.547 1.683-.001-.001Z"
        clip-rule="evenodd"
      />
      <defs>
        <linearGradient
          id="icon-7e9afc4afb23aa85__icon-4d039b80c4be800a__a"
          x1="12.953"
          x2="12.953"
          y1="44.001"
          y2="29.457"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".056" stop-color="#2AAC94" />
          <stop offset=".155" stop-color="#239C87" />
          <stop offset=".372" stop-color="#177E71" />
          <stop offset=".588" stop-color="#0E6961" />
          <stop offset=".799" stop-color="#095D57" />
          <stop offset="1" stop-color="#085954" />
        </linearGradient>
        <linearGradient
          id="icon-fbd56b0a81152ef4__icon-78f52e20309b156b__b"
          x1="31.331"
          x2="17.286"
          y1="33.448"
          y2="18.173"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".042" stop-color="#ABE88E" />
          <stop offset=".549" stop-color="#2AAA92" />
          <stop offset=".906" stop-color="#117865" />
        </linearGradient>
        <linearGradient
          id="icon-971ae08ec7f45454__icon-77e9c21df46e5459__c"
          x1="-3.182"
          x2="10.183"
          y1="32.706"
          y2="28.148"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#6AD6F9" />
          <stop offset="1" stop-color="#6AD6F9" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="icon-006ae52c58818f34__icon-fefad3b496a01348__d"
          x1="7.013"
          x2="42.589"
          y1="15.219"
          y2="15.219"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".043" stop-color="#25FFD4" />
          <stop offset=".874" stop-color="#55DDB9" />
        </linearGradient>
        <linearGradient
          id="icon-b20c75ab267ca94a__icon-6e8dfaf161507040__e"
          x1="7.013"
          x2="39.06"
          y1="10.247"
          y2="25.128"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#6AD6F9" />
          <stop offset=".23" stop-color="#60E9D0" />
          <stop offset=".651" stop-color="#6DE9BB" />
          <stop offset=".994" stop-color="#ABE88E" />
        </linearGradient>
        <linearGradient
          id="icon-a92f6eee55b4848c__icon-736fd316b8a72f77__f"
          x1="9.978"
          x2="27.404"
          y1="13.031"
          y2="16.885"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#fff" stop-opacity="0" />
          <stop offset=".459" stop-color="#fff" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="icon-f38431b998350117__icon-41e6540ecda9967b__g"
          x1="15.756"
          x2="16.168"
          y1="27.96"
          y2="15.74"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".205" stop-color="#063D3B" stop-opacity="0" />
          <stop offset=".586" stop-color="#063D3B" stop-opacity=".237" />
          <stop offset=".872" stop-color="#063D3B" stop-opacity=".75" />
        </linearGradient>
        <linearGradient
          id="icon-1100149c8c650d8a__icon-5deb3b0bc4d268e5__h"
          x1="2.81"
          x2="17.701"
          y1="26.744"
          y2="29.545"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#fff" stop-opacity="0" />
          <stop offset=".459" stop-color="#fff" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <linearGradient
          id="icon-9a3ccf482b635fc2__icon-246be254e9c09726__i"
          x1="13.567"
          x2="10.662"
          y1="39.97"
          y2="25.764"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset=".064" stop-color="#063D3B" stop-opacity="0" />
          <stop offset=".17" stop-color="#063D3B" stop-opacity=".135" />
          <stop offset=".562" stop-color="#063D3B" stop-opacity=".599" />
          <stop offset=".85" stop-color="#063D3B" stop-opacity=".9" />
          <stop offset="1" stop-color="#063D3B" />
        </linearGradient>
      </defs>
    </svg>
  );

  const SharePointLogo = () => (
    <svg
      viewBox="-0.12979372698077785 0 32.12979372698078 32"
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
    >
      <circle cx="15" cy="9.5" fill="#036c70" r="9.5" />
      <circle cx="23.875" cy="17.875" fill="#1a9ba1" r="8.125" />
      <circle cx="16" cy="25.5" fill="#37c6d0" r="6.5" />
      <path
        d="M16.667 7H5.833A9.506 9.506 0 0 0 15 19c.277 0 .551-.013.823-.036l.005.038A6.5 6.5 0 0 0 9.5 25.5q0 .252.019.5h7.148A1.337 1.337 0 0 0 18 24.667V8.333A1.337 1.337 0 0 0 16.667 7z"
        opacity=".1"
      />
      <path
        d="M15.667 8H5.617A9.505 9.505 0 0 0 15 19c.277 0 .551-.013.823-.036l.005.038A6.505 6.505 0 0 0 9.674 27h5.993A1.337 1.337 0 0 0 17 25.667V9.333A1.337 1.337 0 0 0 15.667 8z"
        opacity=".2"
      />
      <path
        d="M15.667 8H5.617A9.505 9.505 0 0 0 15 19c.277 0 .551-.013.823-.036l.005.038A6.5 6.5 0 0 0 9.518 25h6.149A1.337 1.337 0 0 0 17 23.667V9.333A1.337 1.337 0 0 0 15.667 8z"
        opacity=".2"
      />
      <path
        d="M14.667 8h-9.05A9.505 9.505 0 0 0 15 19c.277 0 .551-.013.823-.036l.005.038A6.5 6.5 0 0 0 9.518 25h5.149A1.337 1.337 0 0 0 16 23.667V9.333A1.337 1.337 0 0 0 14.667 8z"
        opacity=".2"
      />
      <path
        d="M1.333 8h13.334A1.333 1.333 0 0 1 16 9.333v13.334A1.333 1.333 0 0 1 14.667 24H1.333A1.333 1.333 0 0 1 0 22.667V9.333A1.333 1.333 0 0 1 1.333 8z"
        fill="#03787c"
      />
      <path
        d="M5.67 15.825a2.645 2.645 0 0 1-.822-.87 2.361 2.361 0 0 1-.287-1.19 2.29 2.29 0 0 1 .533-1.541A3.142 3.142 0 0 1 6.51 11.3a5.982 5.982 0 0 1 1.935-.3 7.354 7.354 0 0 1 2.549.357v1.8a3.986 3.986 0 0 0-1.153-.471 5.596 5.596 0 0 0-1.349-.162 2.926 2.926 0 0 0-1.386.293.91.91 0 0 0-.549.833.844.844 0 0 0 .233.59 2.122 2.122 0 0 0 .627.448q.394.196 1.176.52a1.232 1.232 0 0 1 .169.067 9.697 9.697 0 0 1 1.483.732 2.654 2.654 0 0 1 .877.883 2.558 2.558 0 0 1 .317 1.332 2.48 2.48 0 0 1-.499 1.605 2.789 2.789 0 0 1-1.335.896A6.049 6.049 0 0 1 7.703 21a10.028 10.028 0 0 1-1.722-.142 5.912 5.912 0 0 1-1.4-.404v-1.902a4.5 4.5 0 0 0 1.416.675 5.513 5.513 0 0 0 1.558.25 2.68 2.68 0 0 0 1.413-.3.947.947 0 0 0 .475-.847.904.904 0 0 0-.266-.648 2.704 2.704 0 0 0-.735-.512q-.469-.236-1.386-.62a7.86 7.86 0 0 1-1.386-.725z"
        fill="#fff"
      />
      <path d="M0 0h32v32H0z" fill="none" />
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
