// src/components/output/AlternativeOptionsDisplay.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, CircleDot, Check } from "lucide-react";
import FlowVisualization from "./FlowVisualization";

export interface Option {
  id: string;
  title: string;
  description: string;
  costReduction?: string;
  timeToImplement?: string;
  nodes?: any[];
  edges?: any[];
  selected?: boolean;
  additionalMetrics?: Array<{
    label: string;
    value: string;
  }>;
}

interface AlternativeOptionsDisplayProps {
  options: Option[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

const AlternativeOptionsDisplay: React.FC<AlternativeOptionsDisplayProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
}) => {
  // Helper function to extract nodes and edges from an option
  const getNodesAndEdges = (option: Option) => {
    // First check if nodes and edges are directly on the option
    if (option.nodes && option.edges) {
      return {
        nodes: option.nodes,
        edges: option.edges,
      };
    }

    // If using the updated API format, the nodes/edges might be in businessOperationsFlow
    if ((option as any).businessOperationsFlow) {
      const flow = (option as any).businessOperationsFlow;
      if (flow.nodes && flow.edges) {
        return {
          nodes: flow.nodes,
          edges: flow.edges,
        };
      }
    }

    // Fallback to empty arrays if no flow data is found
    return {
      nodes: [],
      edges: [],
    };
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        In each option radio box, review current content and compare the
        additional metrics such as savings from predicted loss events or
        projected profit increases.
      </p>

      <RadioGroup
        value={selectedOptionId || undefined}
        onValueChange={onSelectOption}
        className="space-y-6"
      >
        {options.map((option) => {
          const { nodes, edges } = getNodesAndEdges(option);

          return (
            <div key={option.id} className="relative">
              <label
                htmlFor={option.id}
                className={`block cursor-pointer w-full transition-all duration-200 ${
                  selectedOptionId === option.id
                    ? "ring-2 ring-accent-orange"
                    : "hover:bg-dark-hover"
                }`}
              >
                <Card className="overflow-hidden border-dark-border bg-dark-surface shadow-neo-dark">
                  <div className="flex flex-col relative corner-highlights">
                    {/* Content section at the top */}
                    <div className="flex p-4 pb-2">
                      {/* Radio button column */}
                      <div className="pr-4 flex items-start">
                        <div className="h-5 w-5 rounded-full border border-dark-border relative bg-dark-elevated shadow-neo-inset flex items-center justify-center">
                          <RadioGroupItem
                            value={option.id}
                            id={option.id}
                            className="mt-0 h-4 w-4 accent-accent-orange"
                          />
                        </div>
                      </div>

                      {/* Content column */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-text-primary">
                              {option.title}
                            </h3>
                            {option.costReduction && (
                              <span className="py-1 px-2 rounded-md text-xs bg-accent-green bg-opacity-10 text-accent-green border border-accent-green border-opacity-20">
                                {option.costReduction}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mt-1">
                            {option.description}
                          </p>
                        </div>

                        <div className="flex items-center space-x-4 text-xs">
                          {option.timeToImplement && (
                            <div className="flex items-center text-text-secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{option.timeToImplement}</span>
                            </div>
                          )}
                          {/* Handle additionalMetrics only if it exists in the option */}
                          {option.additionalMetrics &&
                            Array.isArray(option.additionalMetrics) &&
                            option.additionalMetrics.map((metric, idx) => (
                              <div
                                key={idx}
                                className="flex items-center text-text-secondary"
                              >
                                <CircleDot className="h-3 w-3 mr-1" />
                                <span>
                                  {metric.label}:{" "}
                                  <span className="font-medium text-accent-green">
                                    {metric.value}
                                  </span>
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {/* Flow visualization section - now full width and taller */}
                    <div className="w-full h-64 border-t border-dark-border bg-white mt-2 shadow-neo-inset">
                      <FlowVisualization
                        nodes={nodes}
                        edges={edges}
                        fitView={true}
                        zoomOnResize={true}
                      />
                    </div>
                  </div>
                </Card>
              </label>

              {/* Selected indicator */}
              {selectedOptionId === option.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -right-2 -top-2 bg-accent-orange text-white rounded-full p-1 shadow-subtle"
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default AlternativeOptionsDisplay;
