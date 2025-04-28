"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  selectedOptionTitle
}) => {
  return (
    <Card className="dashboard-card">
      <CardHeader className="pb-3 pt-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Implementation Plan
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
            {/* Implementation Timeline */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Implementation Timeline
              </h3>
              <div className="relative">
                <div className="absolute h-full w-0.5 bg-gray-200 left-5 top-0"></div>
                <div className="space-y-6 ml-3">
                  <div className="flex">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center z-10 relative">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">
                        Planning Phase
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        May 2025 • 2-3 weeks
                      </p>
                      <div className="bg-blue-50 p-2 rounded mt-2 text-xs text-blue-700">
                        Initial meetings, resource allocation, and
                        stakeholder alignment
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center z-10 relative">
                        <FileText className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">
                        Process Redesign
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        June 2025 • 4-6 weeks
                      </p>
                      <div className="bg-indigo-50 p-2 rounded mt-2 text-xs text-indigo-700">
                        Process mapping, testing, and optimization
                      </div>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-green-100 border-4 border-white flex items-center justify-center z-10 relative">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium">
                        Implementation
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        July-August 2025 • 6-8 weeks
                      </p>
                      <div className="bg-green-50 p-2 rounded mt-2 text-xs text-green-700">
                        Rollout, training, and transition to new
                        processes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Tasks Table */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Department Task Allocation
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Department
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Task
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {implementationTasks.map(
                      (task, index) => (
                        <tr
                          key={task.id}
                          className={
                            index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.task}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {task.duration}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Select an option to view implementation plan
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 border-t border-gray-100 py-3 flex justify-between">
        <Button size="sm" variant="outline" className="text-xs">
          <DownloadIcon className="h-3.5 w-3.5 mr-1" />
          Export Plan
        </Button>
        {selectedOptionId && (
          <Button size="sm" className="text-xs">
            Approve Implementation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ImplementationPlanSection;