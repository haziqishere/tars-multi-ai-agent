"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  selectedOptionTitle
}) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-3 pt-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Financial Impact Analysis
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700"
          >
            {selectedOptionTitle || "Select an option"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        {selectedOptionId ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Financial Metrics */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Key Financial Metrics
                </h3>
                <div className="space-y-3">
                  {financialImpactData.map(
                    (metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {metric.metricName}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Current: {metric.current}
                              {metric.unit}
                            </span>
                            <span className="text-xs text-gray-400 mx-2">
                              →
                            </span>
                            <span className="text-xs text-gray-500">
                              Projected: {metric.projected}
                              {metric.unit}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            metric.metricName.includes("Cost") ||
                            metric.metricName.includes("Risk")
                              ? metric.change < 0
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                              : metric.change > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {metric.change > 0 ? "+" : ""}
                          {metric.change}%
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* ROI Analysis */}
              <div>
                <h3 className="text-sm font-medium mb-3">
                  Return on Investment
                </h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium">
                        Breakeven Point
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOptionId === "option-1"
                          ? "2.1 months"
                          : "3.1 months"}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                      <div
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{
                          width:
                            selectedOptionId === "option-1"
                              ? "80%"
                              : "65%",
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Risk</span>
                      <span>Return</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Chart (Placeholder) */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Cost-Benefit Comparison
              </h3>
              <div className="bg-gray-100 border border-gray-200 rounded-md h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Cost-benefit comparison chart would be displayed
                    here
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Select an option to view financial impact analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialImpactSection;