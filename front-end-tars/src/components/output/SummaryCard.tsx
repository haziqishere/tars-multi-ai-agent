// src/components/output/SummaryCard.tsx
import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { hideSummaryCard } from "../../store/slices/outputSlice";
import DepartmentSummary from "./DepartmentSummary";
import EmailPreview from "./EmailPreview";
import FlowVisualization from "./FlowVisualization";

const SummaryCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    summaryCardData,
    summaryCardVisible,
    selectedOptionId,
    options,
    summaryCardResponse,
  } = useAppSelector((state) => state.output);

  if (!summaryCardVisible || !summaryCardData) return null;

  // Find the selected option to display its flow visualization
  const selectedOption = options.find((opt) => opt.id === selectedOptionId);

  // Extract option letter (e.g., "A" from "option-A") for display purposes
  const optionLetter = selectedOptionId?.split("-")[1] || "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-dark-surface rounded-lg shadow-xl border border-dark-border">
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Implementation Summary
            </h2>
            {summaryCardResponse && (
              <p className="text-sm text-text-secondary">
                Option {optionLetter} Implementation
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(hideSummaryCard())}
            aria-label="Close"
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Selected Option Flow Visualization */}
          {selectedOption && (
            <Card className="overflow-hidden border border-dark-border bg-white">
              <div className="p-4 bg-dark-elevated border-b border-dark-border">
                <h3 className="font-medium text-text-primary">
                  Selected Implementation: {selectedOption.title}
                </h3>
              </div>
              <div className="h-64 w-full">
                <FlowVisualization
                  nodes={selectedOption.nodes || []}
                  edges={selectedOption.edges || []}
                  fitView={true}
                  zoomOnResize={true}
                />
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
            {/* Department Summary on the left */}
            <DepartmentSummary departments={summaryCardData.departments} />

            {/* Email Preview on the right */}
            <EmailPreview />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SummaryCard;
