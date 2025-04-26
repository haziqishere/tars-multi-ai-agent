// src/components/output/OptionsDisplay.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);

  const handleExpand = (optionId: string) => {
    setExpandedOptionId(expandedOptionId === optionId ? null : optionId);
  };

  const selectedOption = options.find(
    (option) => option.id === selectedOptionId
  );

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedOptionId || undefined}
        onValueChange={onSelectOption}
      >
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isExpanded = option.id === expandedOptionId;

          return (
            <motion.div
              key={option.id}
              className={`border rounded-lg overflow-hidden transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value={option.id}
                      id={`option-${option.id}`}
                    />
                    <div>
                      <Label
                        htmlFor={`option-${option.id}`}
                        className="font-medium text-base"
                      >
                        {option.title}
                      </Label>
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

                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => handleExpand(option.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronDownIcon
                          className={`h-4 w-4 transform transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                        <span className="sr-only">Toggle</span>
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 pt-4 border-t">
                      <div className="h-48 border border-gray-200 rounded-lg overflow-hidden">
                        <FlowVisualization
                          nodes={option.nodes}
                          edges={option.edges}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
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
