// src/components/output/AnalyticsSection.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { AnalyticsData } from "@/lib/api"; // Import from your API types

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
        <CardHeader className="dashboard-card-header">
          <CardTitle className="dashboard-card-title">
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="dashboard-card-content">
          <div className="text-center py-4 text-text-secondary">
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
    trend: "increasing" | "decreasing" | "stable" | "improving" | "worsening",
    isPositive: boolean
  ) => {
    // For cost and time, decreasing is good (green)
    // For efficiency and risk, improving is good (green)
    let isGood = false;

    if (trend === "improving") {
      isGood = true;
    } else if (trend === "worsening") {
      isGood = false;
    } else {
      // For increasing/decreasing/stable
      isGood = isPositive ? trend === "increasing" : trend === "decreasing";
    }

    const isNeutral = trend === "stable";

    let className = "text-xs mr-2 rounded-md py-1 px-2 flex items-center ";
    let icon = null;

    if (isNeutral) {
      className += "bg-dark-elevated text-text-secondary";
      icon = <Minus className="h-3 w-3 mr-1" />;
    } else if (isGood) {
      className += "bg-accent-green bg-opacity-10 text-accent-green";
      icon =
        isPositive || trend === "improving" ? (
          <ArrowUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        );
    } else {
      className += "bg-red-800 bg-opacity-20 text-red-400";
      icon =
        isPositive || trend === "improving" ? (
          <ArrowDown className="h-3 w-3 mr-1" />
        ) : (
          <ArrowUp className="h-3 w-3 mr-1" />
        );
    }

    return (
      <span className={className}>
        {icon}
        {trend.charAt(0).toUpperCase() + trend.slice(1)}
      </span>
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
      <CardHeader className="dashboard-card-header">
        <CardTitle className="dashboard-card-title">
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="dashboard-card-content">
        {/* Key Stats */}
        <div className="metrics-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-dark-surface p-4 rounded-md border border-dark-border shadow-neo-dark relative corner-highlights">
            <p className="stat-label">Current Annual Cost</p>
            <p className="stat-value text-2xl font-semibold text-text-primary">
              {formatCost(analyticsData.currentAnnualCost)}
            </p>
            <div className="flex items-center mt-1">
              {getTrendBadge(analyticsData.trends.costTrend, false)}
              <span className="text-xs text-text-secondary">
                vs. Previous Year
              </span>
            </div>
          </div>

          <div className="bg-dark-surface p-4 rounded-md border border-dark-border shadow-neo-dark relative corner-highlights">
            <p className="stat-label">Efficiency Rating</p>
            <p className="stat-value text-2xl font-semibold text-text-primary">
              {analyticsData.efficiencyRating}%
            </p>
            <div className="flex items-center mt-1">
              {getTrendBadge(analyticsData.trends.efficiencyTrend, true)}
              <span className="text-xs text-text-secondary">
                vs. Target (71%)
              </span>
            </div>
          </div>

          <div className="bg-dark-surface p-4 rounded-md border border-dark-border shadow-neo-dark relative corner-highlights">
            <p className="stat-label">Process Time</p>
            <p className="stat-value text-2xl font-semibold text-text-primary">
              {analyticsData.averageProcessTime.toFixed(1)} Days
            </p>
            <div className="flex items-center mt-1">
              {getTrendBadge(analyticsData.trends.timeTrend, false)}
              <span className="text-xs text-text-secondary">
                Compared to Benchmark
              </span>
            </div>
          </div>

          <div className="bg-dark-surface p-4 rounded-md border border-dark-border shadow-neo-dark relative corner-highlights">
            <p className="stat-label">Risk Assessment</p>
            <p className="stat-value text-2xl font-semibold text-text-primary">
              {getRiskText(analyticsData.riskAssessment)}
            </p>
            <div className="flex items-center mt-1">
              {analyticsData.trends.riskTrend &&
                getTrendBadge(analyticsData.trends.riskTrend, false)}
              <span
                className={`text-xs ${
                  analyticsData.riskAssessment > 60
                    ? "text-red-400"
                    : "text-yellow-400"
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
