"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, CircleDot } from "lucide-react";
import { Badge } from "../ui/badge";
import FlowVisualization from "./FlowVisualization";
import { Option } from "@/store/slices/outputSlice";

// Extend the Option type with additional metrics
interface EnhancedOption extends Option {
  additionalMetrics?: {
    label: string;
    value: string;
  }[];
}

interface AlternativeOptionsDisplayProps {
  options: EnhancedOption[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

const AlternativeOptionsDisplay: React.FC<AlternativeOptionsDisplayProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
}) => {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        In each option radio box, review current content and compare the additional 
        metrics such as savings from predicted loss events or projected profit increases.
      </p>
      
      <RadioGroup
        value={selectedOptionId || undefined}
        onValueChange={onSelectOption}
        className="space-y-6"
      >
        {options.map((option) => (
          <div key={option.id} className="relative">
            <label
              htmlFor={option.id}
              className={`block cursor-pointer w-full transition-all duration-200 ${
                selectedOptionId === option.id
                  ? "ring-2 ring-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <Card className="overflow-hidden border-gray-200">
                <div className="flex flex-col">
                  {/* Content section at the top */}
                  <div className="flex p-4 pb-2">
                    {/* Radio button column */}
                    <div className="pr-4 flex items-start">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="mt-1"
                      />
                    </div>
                    
                    {/* Content column */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium">{option.title}</h3>
                          {option.costReduction && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {option.costReduction}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {option.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs">
                        {option.timeToImplement && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{option.timeToImplement}</span>
                          </div>
                        )}
                        {/* Additional metrics display */}
                        {option.additionalMetrics?.map((metric, idx) => (
                          <div key={idx} className="flex items-center text-gray-600">
                            <CircleDot className="h-3 w-3 mr-1" />
                            <span>
                              {metric.label}: <span className="font-medium text-green-600">{metric.value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Flow visualization section - now full width and taller */}
                  <div className="w-full h-64 border-t border-gray-100 bg-gray-50 mt-2">
                    <FlowVisualization 
                      nodes={option.nodes} 
                      edges={option.edges} 
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
                className="absolute -right-2 -top-2 bg-blue-500 text-white rounded-full p-1 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default AlternativeOptionsDisplay;