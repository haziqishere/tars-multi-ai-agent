"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { AnalyticsData } from "@/lib/api";

interface AnalyticsSectionProps {
  analyticsData: AnalyticsData | null;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  analyticsData,
}) => {
  // Handle the case when data is not yet loaded
  if (!analyticsData) {
    return (
      <Card className="dashboard-card">
        <CardHeader className="pb-3 pt-4 border-b border-gray-100">
          <CardTitle className="text-base font-medium">
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4">
          <div className="text-center py-4 text-gray-500">
            Loading analytics data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format the annual cost for display
  const formatCost = (cost: number): string => {
    if (cost >= 1000000000) {
      return `$${(cost / 1000000000).toFixed(1)}B`;
    } else if (cost >= 1000000) {
      return `$${(cost / 1000000).toFixed(0)}M`;
    } else if (cost >= 1000) {
      return `$${(cost / 1000).toFixed(0)}K`;
    } else {
      return `$${cost}`;
    }
  };

  // Get the trend badge for a specific metric
  const getTrendBadge = (
    trend: "increasing" | "decreasing" | "stable",
    isPositive: boolean
  ) => {
    // For cost and time, decreasing is good (green)
    // For efficiency and risk, increasing is good (green) if isPositive is true
    const isGood = isPositive ? trend === "increasing" : trend === "decreasing";
    const isNeutral = trend === "stable";

    let className = "text-xs mr-2 ";
    let icon = null;

    if (isNeutral) {
      className += "bg-gray-50 text-gray-700";
      icon = <Minus className="h-3 w-3 mr-1" />;
    } else if (isGood) {
      className += "bg-green-50 text-green-700";
      icon = isPositive ? (
        <ArrowUp className="h-3 w-3 mr-1" />
      ) : (
        <ArrowDown className="h-3 w-3 mr-1" />
      );
    } else {
      className += "bg-red-50 text-red-700";
      icon = isPositive ? (
        <ArrowDown className="h-3 w-3 mr-1" />
      ) : (
        <ArrowUp className="h-3 w-3 mr-1" />
      );
    }

    return (
      <Badge variant="outline" className={className}>
        <span className="flex items-center">
          {icon}
          {trend.charAt(0).toUpperCase() + trend.slice(1)}
        </span>
      </Badge>
    );
  };

  // Get text for risk assessment
  const getRiskText = (score: number): string => {
    if (score >= 80) return "Critical";
    if (score >= 60) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-3 pt-4 border-b border-gray-100">
        <CardTitle className="text-base font-medium">
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        {/* Key Stats */}
        <div className="metrics-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Current Annual Cost</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              {formatCost(analyticsData.currentAnnualCost)}
            </p>
            <div className="flex items-center mt-1">
              {getTrendBadge(analyticsData.trends.costTrend, false)}
              <span className="text-xs text-gray-500">vs. Previous Year</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Efficiency Rating</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              {analyticsData.efficiencyRating}%
            </p>
            <div className="flex items-center mt-1">
              {getTrendBadge(
                analyticsData.trends.efficiencyTrend === "improving"
                  ? "increasing"
                  : analyticsData.trends.efficiencyTrend === "worsening"
                  ? "decreasing"
                  : "stable",
                true
              )}
              <span className="text-xs text-gray-500">vs. Target (71%)</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Process Time</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              {analyticsData.averageProcessTime.toFixed(1)} Days
            </p>
            <div className="flex items-center mt-1">
              {getTrendBadge(analyticsData.trends.timeTrend, false)}
              <span className="text-xs text-gray-500">
                Compared to Benchmark
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Risk Assessment</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              {getRiskText(analyticsData.riskAssessment)}
            </p>
            <div className="flex items-center mt-1">
              {analyticsData.riskAssessment > 60 && (
                <AlertCircle className="h-3.5 w-3.5 text-red-600 mr-1" />
              )}
              <span
                className={`text-xs ${
                  analyticsData.riskAssessment > 60
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              >
                {analyticsData.riskAssessment > 60
                  ? "Requires Immediate Action"
                  : "Monitor Closely"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSection;
