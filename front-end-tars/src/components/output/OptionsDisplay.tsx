"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Option } from "@/store/slices/outputSlice";
import FlowVisualization from "./FlowVisualization";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OptionsDisplayProps {
  options: Option[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
}

const OptionsDisplay: React.FC<OptionsDisplayProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
}) => {
  // Change from single expandedOptionId to a Set of expanded option IDs
  const [expandedOptionIds, setExpandedOptionIds] = useState<Set<string>>(
    new Set()
  );
  const [renderFlowKeys, setRenderFlowKeys] = useState<Record<string, number>>(
    {}
  );

  // Force ReactFlow to recalculate when expanded
  useEffect(() => {
    // Create a copy of the current state to avoid modifying the original
    const newRenderFlowKeys = { ...renderFlowKeys };

    // Update keys for any newly expanded options
    expandedOptionIds.forEach((optionId) => {
      // Small delay to ensure the collapsible is open
      setTimeout(() => {
        // Update the render key for this specific option
        setRenderFlowKeys((prev) => ({
          ...prev,
          [optionId]: (prev[optionId] || 0) + 1,
        }));

        // Also dispatch resize event
        window.dispatchEvent(new Event("resize"));
      }, 300);
    });
  }, [expandedOptionIds]);

  const handleExpand = (optionId: string) => {
    // Toggle the expanded state for this option ID
    setExpandedOptionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  );

  return (
    <div className="space-y-4 w-full">
      <RadioGroup
        value={selectedOptionId || undefined}
        onValueChange={onSelectOption}
        className="w-full"
      >
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isExpanded = expandedOptionIds.has(option.id);

          return (
            <motion.div
              key={option.id}
              className={`border rounded-lg overflow-hidden transition-colors w-full ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              {/* Collapsible Flow Content */}
              <Collapsible
                open={isExpanded}
                onOpenChange={() => handleExpand(option.id)}
                className="w-full"
              >
                {/* Option Header - Full Width */}
                <div className="p-4 w-full flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-grow">
                    <RadioGroupItem
                      value={option.id}
                      id={`option-${option.id}`}
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between w-full">
                        <Label
                          htmlFor={`option-${option.id}`}
                          className="font-medium text-lg"
                        >
                          {option.title}
                        </Label>

                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDownIcon
                              className={`h-4 w-4 transform transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                            <span className="sr-only">Toggle</span>
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <p className="mt-1 text-sm text-gray-700">
                        {option.description}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-800 hover:bg-blue-50"
                        >
                          {option.timeToImplement}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-800 hover:bg-green-50"
                        >
                          {option.costReduction}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <CollapsibleContent className="w-full border-t border-gray-200">
                  <div className="p-4 w-full">
                    <div className="h-96 w-full border border-gray-200 rounded-lg overflow-hidden">
                      {isExpanded && (
                        <div
                          key={renderFlowKeys[option.id] || 0}
                          className="w-full h-full"
                        >
                          <FlowVisualization
                            nodes={option.nodes}
                            edges={option.edges}
                            fitView={true}
                            zoomOnResize={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </RadioGroup>

      {/* Selected Option Summary */}
      {selectedOption && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium mb-2">Selected Option Summary</h4>
          <p className="text-sm text-gray-700">
            Implementing {selectedOption.title} will take{" "}
            {selectedOption.timeToImplement.toLowerCase()}
            and result in {selectedOption.costReduction.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
};

export default OptionsDisplay;
