"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlowVisualization from "./FlowVisualization";
import { Option } from "@/store/slices/outputSlice";

interface BusinessFlowSectionProps {
  currentBusinessFlow: {
    nodes: any[];
    edges: any[];
  };
}

const BusinessFlowSection: React.FC<BusinessFlowSectionProps> = ({
  currentBusinessFlow
}) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-3 pt-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Current Business Operations Flow
          </CardTitle>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            At Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 text-red-800 rounded-md px-2 py-1 text-xs font-medium">
              Critical Issue
            </div>
            <span className="text-sm">
              Tariff Disruption at Process B
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Current operations face significant delays due to new tariff
            regulations. This has led to a projected $100M increase in
            operational costs.
          </p>
        </div>
        <div className="h-64 border border-gray-100 bg-white rounded-lg overflow-hidden w-full">
          <FlowVisualization
            nodes={currentBusinessFlow.nodes}
            edges={currentBusinessFlow.edges}
            fitView={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessFlowSection;