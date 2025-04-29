// src/components/output/BusinessFlowSection.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import FlowVisualization from "./FlowVisualization";
import { Option } from "@/store/slices/outputSlice";

interface BusinessFlowSectionProps {
  currentBusinessFlow: {
    nodes: any[];
    edges: any[];
  };
}

const BusinessFlowSection: React.FC<BusinessFlowSectionProps> = ({
  currentBusinessFlow,
}) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="dashboard-card-header">
        <div className="flex items-center justify-between">
          <CardTitle className="dashboard-card-title">
            Current Business Operations Flow
          </CardTitle>
          <span className="py-1 px-2 rounded-md text-xs bg-red-800 bg-opacity-20 text-red-400 border border-red-900 border-opacity-30">
            <AlertCircle className="h-3.5 w-3.5 mr-1 inline-block" />
            At Risk
          </span>
        </div>
      </CardHeader>
      <CardContent className="dashboard-card-content">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-red-900 bg-opacity-20 text-red-400 rounded-md px-2 py-1 text-xs font-medium">
              Critical Issue
            </div>
            <span className="text-sm text-text-primary">
              Tariff Disruption at Process B
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Current operations face significant delays due to new tariff
            regulations. This has led to a projected $100M increase in
            operational costs.
          </p>
        </div>
        <div className="h-64 border border-dark-border rounded-lg bg-white overflow-hidden w-full shadow-neo-inset">
          <FlowVisualization
            nodes={currentBusinessFlow.nodes}
            edges={currentBusinessFlow.edges}
            fitView={true}
            zoomOnResize={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessFlowSection;
