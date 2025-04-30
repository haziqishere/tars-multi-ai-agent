// src/components/output/DepartmentSummary.tsx
import React from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Department } from "../../types/output";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSelectedDepartment } from "../../store/slices/outputSlice";

interface DepartmentSummaryProps {
  departments: Department[];
}

const DepartmentSummary: React.FC<DepartmentSummaryProps> = ({
  departments,
}) => {
  const dispatch = useAppDispatch();
  const { selectedDepartmentId, sendingEmails, emailsSent } = useAppSelector(
    (state) => state.output
  );

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="p-4 bg-dark-elevated border-b border-dark-border">
        <h3 className="text-sm font-semibold text-text-primary">
          Department Tasks
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Select a department to view email details
        </p>
      </div>

      <div className="divide-y divide-dark-border max-h-[400px] overflow-y-auto flex-grow">
        {departments.map((dept) => {
          const isSelected = selectedDepartmentId === dept.id;
          
          return (
            <div
              key={dept.id}
              onClick={() => {
                if (!sendingEmails && !emailsSent) {
                  dispatch(setSelectedDepartment(dept.id));
                }
              }}
              className={`
                p-4 cursor-pointer transition-colors relative
                ${isSelected ? "bg-dark-hover" : "hover:bg-dark-hover"}
              `}
              role="button"
              tabIndex={0}
              aria-selected={isSelected}
              aria-label={`Select ${dept.department} department`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (!sendingEmails && !emailsSent) {
                    dispatch(setSelectedDepartment(dept.id));
                  }
                }
              }}
            >
              {/* Orange left border for selected department - now using an absolutely positioned element for better visibility */}
              {isSelected && (
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1" 
                  style={{ backgroundColor: "#f97316", width: "4px" }}
                ></div>
              )}
              
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-text-primary">
                  {dept.department}
                </h4>
                <Badge
                  variant="outline"
                  className="bg-dark-surface text-text-primary border-dark-border"
                >
                  {dept.tasks.length} {dept.tasks.length === 1 ? "Task" : "Tasks"}
                </Badge>
              </div>

              <p className="text-sm text-text-secondary mb-2">
                Manager: {dept.manager}
              </p>

              {/* Show first 2 tasks (with truncation if needed) */}
              <div className="mt-3 space-y-2">
                {dept.tasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-start text-sm">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${
                        getPriorityColor(task.priority).split(" ")[0]
                      }`}
                    ></span>
                    <div>
                      <span className="text-text-primary">
                        {task.description}
                      </span>
                      <div className="flex items-center mt-1">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-text-secondary ml-2">
                          Due:{" "}
                          {new Date(task.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {dept.tasks.length > 2 && (
                  <div className="text-xs text-text-secondary italic pl-4 mt-1">
                    + {dept.tasks.length - 2} more tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default DepartmentSummary;
