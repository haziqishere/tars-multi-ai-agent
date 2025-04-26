// src/components/output/OutputInterface.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentBusinessFlow,
  setOptions,
  selectOption,
  Option,
} from "@/store/slices/outputSlice";
import FlowVisualization from "./FlowVisualization";
import OptionsDisplay from "./OptionsDisplay";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const OutputInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { options, selectedOptionId, currentBusinessFlow } = useAppSelector(
    (state) => state.output
  );
  const [loading, setLoading] = useState(true);

  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock current business flow
      const currentFlow = {
        nodes: [
          { id: "A", label: "Process A", position: { x: 50, y: 75 } },
          { id: "B", label: "Process B", position: { x: 200, y: 25 } },
          { id: "C", label: "Process C", position: { x: 350, y: 75 } },
        ],
        edges: [
          { id: "A-B", source: "A", target: "B" },
          { id: "B-C", source: "B", target: "C" },
        ],
      };

      // Mock optimization options
      const mockOptions: Option[] = [
        {
          id: "option-1",
          title: "Option A",
          description: "Optimize through process D",
          timeToImplement: "2 Months",
          costReduction: "-30% in cost",
          nodes: [
            { id: "A", label: "Process A", position: { x: 50, y: 75 } },
            { id: "D", label: "Process D", position: { x: 200, y: 25 } },
            { id: "C", label: "Process C", position: { x: 350, y: 75 } },
          ],
          edges: [
            { id: "A-D", source: "A", target: "D" },
            { id: "D-C", source: "D", target: "C" },
          ],
        },
        {
          id: "option-2",
          title: "Option B",
          description: "Optimize through processes E and F",
          timeToImplement: "3 Months",
          costReduction: "-25% in cost",
          nodes: [
            { id: "A", label: "Process A", position: { x: 50, y: 75 } },
            { id: "E", label: "Process E", position: { x: 175, y: 25 } },
            { id: "F", label: "Process F", position: { x: 250, y: 25 } },
            { id: "C", label: "Process C", position: { x: 350, y: 75 } },
          ],
          edges: [
            { id: "A-E", source: "A", target: "E" },
            { id: "E-F", source: "E", target: "F" },
            { id: "F-C", source: "F", target: "C" },
          ],
        },
      ];

      dispatch(setCurrentBusinessFlow(currentFlow));
      dispatch(setOptions(mockOptions));
      dispatch(selectOption(mockOptions[0].id));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  const handleSelectOption = (optionId: string) => {
    dispatch(selectOption(optionId));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Generating optimization options...</p>
        </div>
      </div>
    );
  }

  const selectedOption = options.find((opt) => opt.id === selectedOptionId);

  return (
    <div className="h-full overflow-y-auto">
      <Card className="border-0 shadow-none rounded-none h-full">
        <CardHeader className="pb-2">
          <CardTitle>Output UI</CardTitle>
          <CardDescription>
            Analysis: Multiple Scenarios of Business Operations
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Current Business Flow */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Current Business Ops Flow
                </CardTitle>
                <CardDescription className="text-red-500">
                  Situation: Tariff
                  <br />
                  Disruption at B<br />
                  Results: -$100 Million Operation Costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 border border-gray-200 rounded-lg overflow-hidden">
                  <FlowVisualization
                    nodes={currentBusinessFlow.nodes}
                    edges={currentBusinessFlow.edges}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options Display */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Alternative Options</CardTitle>
              </CardHeader>
              <CardContent>
                <OptionsDisplay
                  options={options}
                  selectedOptionId={selectedOptionId}
                  onSelectOption={handleSelectOption}
                />
              </CardContent>
            </Card>
          </div>

          {/* Implementation Plan */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Implementation Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                The selected option will require structural changes in several
                departments. A summary of these changes will be sent to the
                relevant managers with specific implementation guidelines.
              </p>

              <Separator className="my-4" />

              <h4 className="font-medium mb-2">Context</h4>
              <p className="text-gray-700">
                Current operations are facing disruptions due to new tariff
                regulations. The proposed changes aim to navigate these
                challenges while minimizing operational costs.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Approve Selected Option</Button>
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutputInterface;
