// src/components/output/FinancialImpactSection.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface FinancialImpact {
  metricName: string;
  current: number;
  projected: number;
  change: number;
  unit: string;
}

interface FinancialImpactSectionProps {
  financialImpactData: FinancialImpact[];
  selectedOptionId: string | null;
  selectedOptionTitle?: string;
}

const FinancialImpactSection: React.FC<FinancialImpactSectionProps> = ({
  financialImpactData,
  selectedOptionId,
  selectedOptionTitle,
}) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="dashboard-card-header">
        <div className="flex items-center justify-between">
          <CardTitle className="dashboard-card-title">
            Financial Impact Analysis
          </CardTitle>
          <span className="py-1 px-2 rounded-md text-xs bg-accent-green bg-opacity-10 text-accent-green border border-accent-green border-opacity-20">
            {selectedOptionTitle || "Select an option"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="dashboard-card-content">
        {selectedOptionId ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Financial Metrics */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-text-primary">
                  Key Financial Metrics
                </h3>
                <div className="space-y-3">
                  {financialImpactData.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-dark-elevated p-3 rounded-md shadow-neo-inset"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {metric.metricName}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-text-secondary">
                            Current: {metric.current}
                            {metric.unit}
                          </span>
                          <span className="text-xs text-text-muted mx-2">
                            →
                          </span>
                          <span className="text-xs text-text-secondary">
                            Projected: {metric.projected}
                            {metric.unit}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs py-1 px-2 rounded-md ${
                          metric.metricName.includes("Cost") ||
                          metric.metricName.includes("Risk")
                            ? metric.change < 0
                              ? "bg-accent-green bg-opacity-10 text-accent-green"
                              : "bg-red-800 bg-opacity-20 text-red-400"
                            : metric.change > 0
                            ? "bg-accent-green bg-opacity-10 text-accent-green"
                            : "bg-red-800 bg-opacity-20 text-red-400"
                        }`}
                      >
                        {metric.change > 0 ? "+" : ""}
                        {metric.change}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI Analysis */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-text-primary">
                  Return on Investment
                </h3>
                <div className="bg-dark-elevated p-4 rounded-md space-y-4 shadow-neo-inset">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-text-secondary">
                        Breakeven Point
                      </span>
                      <span className="text-xs font-medium text-text-primary">
                        {selectedOptionId === "option-1"
                          ? "2.1 months"
                          : "3.1 months"}
                      </span>
                    </div>

                    <div className="w-full bg-dark-border rounded-full h-2.5 mt-3">
                      <div
                        className="bg-accent-green h-2.5 rounded-full"
                        style={{
                          width:
                            selectedOptionId === "option-1" ? "80%" : "65%",
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>Risk</span>
                      <span>Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Chart (Placeholder) */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-text-primary">
                Cost-Benefit Comparison
              </h3>
              <div className="bg-dark-elevated border border-dark-border rounded-md h-64 flex items-center justify-center shadow-neo-inset">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-secondary">
                    Cost-benefit comparison chart would be displayed here
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary">
              Select an option to view financial impact analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialImpactSection;
