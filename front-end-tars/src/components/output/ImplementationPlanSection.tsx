// src/components/output/ImplementationPlanSection.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Calendar, FileText, Check, DownloadIcon } from "lucide-react";

interface ImplementationTask {
  id: string;
  department: string;
  task: string;
  duration: string;
  status: "pending" | "in-progress" | "completed";
}

interface ImplementationPlanSectionProps {
  implementationTasks: ImplementationTask[];
  selectedOptionId: string | null;
  selectedOptionTitle?: string;
}

const ImplementationPlanSection: React.FC<ImplementationPlanSectionProps> = ({
  implementationTasks,
  selectedOptionId,
  selectedOptionTitle,
}) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="dashboard-card-header">
        <div className="flex items-center justify-between">
          <CardTitle className="dashboard-card-title">
            Implementation Plan
          </CardTitle>
          <span className="py-1 px-2 rounded-md text-xs bg-accent-green bg-opacity-10 text-accent-green border border-accent-green border-opacity-20">
            {selectedOptionTitle || "Select an option"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="dashboard-card-content">
        {selectedOptionId ? (
          <div className="space-y-6">
            {/* Implementation Timeline */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-text-primary">
                Implementation Timeline
              </h3>
              <div className="relative">
                <div className="absolute h-full w-0.5 bg-dark-border left-5 top-0"></div>
                <div className="space-y-6 ml-3">
                  <div className="flex">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-accent-orange bg-opacity-10 border-4 border-dark-surface flex items-center justify-center z-10 relative shadow-neo-dark">
                        <Calendar className="h-4 w-4 text-accent-orange" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-text-primary">
                        Planning Phase
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        May 2025 • 2-3 weeks
                      </p>
                      <div className="bg-accent-orange bg-opacity-10 border border-accent-orange border-opacity-20 p-2 rounded mt-2 text-xs text-accent-orange">
                        Initial meetings, resource allocation, and stakeholder
                        alignment
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-dark-elevated border-4 border-dark-surface flex items-center justify-center z-10 relative shadow-neo-dark">
                        <FileText className="h-4 w-4 text-text-secondary" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-text-primary">
                        Process Redesign
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        June 2025 • 4-6 weeks
                      </p>
                      <div className="bg-dark-elevated p-2 rounded mt-2 text-xs text-text-secondary border border-dark-border">
                        Process mapping, testing, and optimization
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-accent-green bg-opacity-10 border-4 border-dark-surface flex items-center justify-center z-10 relative shadow-neo-dark">
                        <Check className="h-4 w-4 text-accent-green" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-text-primary">
                        Implementation
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        July-August 2025 • 6-8 weeks
                      </p>
                      <div className="bg-accent-green bg-opacity-10 border border-accent-green border-opacity-20 p-2 rounded mt-2 text-xs text-accent-green">
                        Rollout, training, and transition to new processes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Tasks Table */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-text-primary">
                Department Task Allocation
              </h3>
              <div className="overflow-x-auto rounded-md border border-dark-border shadow-neo-inset">
                <table className="min-w-full divide-y divide-dark-border">
                  <thead className="bg-dark-elevated">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                      >
                        Department
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                      >
                        Task
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                      >
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-dark-surface divide-y divide-dark-border">
                    {implementationTasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className={
                          index % 2 === 0
                            ? "bg-dark-surface"
                            : "bg-dark-elevated"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          {task.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {task.task}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {task.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary">
              Select an option to view implementation plan
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="py-3 border-t border-dark-border flex justify-between">
        <button className="neo-button h-8 px-3 text-xs flex items-center text-text-primary">
          <DownloadIcon className="h-3.5 w-3.5 mr-1 text-text-secondary" />
          Export Plan
        </button>
        {selectedOptionId && (
          <button className="btn-accent-green h-8 px-3 text-xs">
            Approve Implementation
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ImplementationPlanSection;
