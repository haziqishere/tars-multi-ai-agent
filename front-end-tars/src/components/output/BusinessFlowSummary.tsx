// src/components/output/BusinessFlowSummary.tsx
import React from "react";
import { Card } from "../ui/card";
import { BusinessFlowStep } from "../../types/output";

interface BusinessFlowSummaryProps {
  flowSummary: string;
  steps: BusinessFlowStep[];
}

const BusinessFlowSummary: React.FC<BusinessFlowSummaryProps> = ({
  flowSummary,
  steps,
}) => {
  return (
    <Card className="p-4 bg-white border-dark-border">
      <h3 className="text-base font-medium mb-2 text-text-primary">
        Business Flow Summary
      </h3>
      <p className="text-sm text-text-secondary mb-4">{flowSummary}</p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex flex-col items-center">
            {/* Line connector */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
            )}

            {/* Step Circle */}
            <div className="bg-primary/10 text-primary border border-primary/20 rounded-full w-8 h-8 flex items-center justify-center z-10 relative">
              {index + 1}
            </div>

            {/* Department Tag */}
            <div className="mt-2 bg-dark-elevated px-2 py-0.5 rounded-md text-xs">
              {step.department}
            </div>

            {/* Step Description */}
            <p className="text-xs text-center text-text-secondary mt-1">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BusinessFlowSummary;
