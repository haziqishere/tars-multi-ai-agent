"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

const AnalyticsSection: React.FC = () => {
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
              $340M
            </p>
            <div className="flex items-center mt-1">
              <Badge
                variant="outline"
                className="text-xs bg-red-50 text-red-700 mr-2"
              >
                +12%
              </Badge>
              <span className="text-xs text-gray-500">
                vs. Previous Year
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Efficiency Rating</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              68%
            </p>
            <div className="flex items-center mt-1">
              <Badge
                variant="outline"
                className="text-xs bg-amber-50 text-amber-700 mr-2"
              >
                -3%
              </Badge>
              <span className="text-xs text-gray-500">
                vs. Target (71%)
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Process Time</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              42 Days
            </p>
            <div className="flex items-center mt-1">
              <Badge
                variant="outline"
                className="text-xs bg-red-50 text-red-700 mr-2"
              >
                +8 Days
              </Badge>
              <span className="text-xs text-gray-500">
                Due to Tariff Delays
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <p className="stat-label">Risk Assessment</p>
            <p className="stat-value text-2xl font-semibold text-gray-900">
              High
            </p>
            <div className="flex items-center mt-1">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 mr-1" />
              <span className="text-xs text-red-600">
                Requires Immediate Action
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSection;