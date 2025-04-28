"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentBusinessFlow,
  setOptions,
  selectOption,
  Option,
} from "@/store/slices/outputSlice";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import modular components
import AlternativeOptionsDisplay from "./AlternativeOptionsDisplay";
import AnalyticsSection from "./AnalyticsSection";
import NewsAndImpactSection from "./NewsAndImpactSection";
import BusinessFlowSection from "./BusinessFlowSection";
import FinancialImpactSection from "./FinancialImpactSection";
import ImplementationPlanSection from "./ImplementationPlanSection";
import { PlusSquare } from "lucide-react";

// Define types for component data
interface NewsItem {
  id: string;
  title: string;
  date: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

interface ImpactItem {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
}

interface FinancialImpact {
  metricName: string;
  current: number;
  projected: number;
  change: number;
  unit: string;
}

interface ImplementationTask {
  id: string;
  department: string;
  task: string;
  duration: string;
  status: "pending" | "in-progress" | "completed";
}

// Extend the Option type with additional metrics
interface EnhancedOption extends Option {
  additionalMetrics?: {
    label: string;
    value: string;
  }[];
}

const OutputInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { options, selectedOptionId, currentBusinessFlow } = useAppSelector(
    (state) => state.output
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analysis");

  // Mock news and events data
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: "news-1",
      title: "New Tariff Regulations",
      date: "April 15, 2025",
      impact: "negative",
      description:
        "New tariffs of 25% imposed on key materials affecting Process B.",
    },
    {
      id: "news-2",
      title: "Competitor Restructuring",
      date: "April 10, 2025",
      impact: "positive",
      description:
        "Main competitor implementing similar restructuring with 9-month timeline.",
    },
    {
      id: "news-3",
      title: "Industry Supply Chain Disruption",
      date: "April 5, 2025",
      impact: "negative",
      description:
        "Major logistics provider facing operational challenges, causing delays.",
    },
    {
      id: "news-4",
      title: "New Market Opportunity",
      date: "March 28, 2025",
      impact: "positive",
      description:
        "Growing demand in Southeast Asian markets for optimized processes.",
    },
  ]);

  // Mock impact analysis data
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([
    {
      id: "impact-1",
      title: "Cost Structure Transformation",
      description:
        "Restructuring can reduce operational costs by up to 30% within 6 months.",
      probability: 0.8,
      impact: 4.5,
    },
    {
      id: "impact-2",
      title: "Market Competitiveness",
      description:
        "Improved processes will enhance product delivery speed by 40%.",
      probability: 0.7,
      impact: 4.2,
    },
    {
      id: "impact-3",
      title: "Regulatory Compliance",
      description:
        "New structure aligns better with upcoming regulatory changes.",
      probability: 0.9,
      impact: 3.8,
    },
  ]);

  // Mock financial impact data - this will change based on selected option
  const [financialImpact, setFinancialImpact] = useState<
    Record<string, FinancialImpact[]>
  >({
    "option-1": [
      {
        metricName: "Annual Operating Cost",
        current: 340,
        projected: 238,
        change: -30,
        unit: "M",
      },
      {
        metricName: "Process Time",
        current: 42,
        projected: 25,
        change: -40,
        unit: "days",
      },
      {
        metricName: "Resource Utilization",
        current: 68,
        projected: 85,
        change: 25,
        unit: "%",
      },
      {
        metricName: "Regulatory Risk",
        current: 75,
        projected: 35,
        change: -53,
        unit: "%",
      },
    ],
    "option-2": [
      {
        metricName: "Annual Operating Cost",
        current: 340,
        projected: 255,
        change: -25,
        unit: "M",
      },
      {
        metricName: "Process Time",
        current: 42,
        projected: 30,
        change: -29,
        unit: "days",
      },
      {
        metricName: "Resource Utilization",
        current: 68,
        projected: 80,
        change: 18,
        unit: "%",
      },
      {
        metricName: "Regulatory Risk",
        current: 75,
        projected: 40,
        change: -47,
        unit: "%",
      },
    ],
  });

  // Mock implementation plan data - varies by option
  const [implementationPlan, setImplementationPlan] = useState<
    Record<string, ImplementationTask[]>
  >({
    "option-1": [
      {
        id: "task-1-1",
        department: "Operations",
        task: "Process D Integration",
        duration: "4 weeks",
        status: "pending",
      },
      {
        id: "task-1-2",
        department: "Finance",
        task: "Cost Structure Revision",
        duration: "3 weeks",
        status: "pending",
      },
      {
        id: "task-1-3",
        department: "Procurement",
        task: "Supplier Renegotiation",
        duration: "6 weeks",
        status: "pending",
      },
      {
        id: "task-1-4",
        department: "Policy & Governance",
        task: "Compliance Update",
        duration: "2 weeks",
        status: "pending",
      },
      {
        id: "task-1-5",
        department: "Sales & Marketing",
        task: "Market Communication",
        duration: "3 weeks",
        status: "pending",
      },
    ],
    "option-2": [
      {
        id: "task-2-1",
        department: "Operations",
        task: "Process E & F Integration",
        duration: "6 weeks",
        status: "pending",
      },
      {
        id: "task-2-2",
        department: "Finance",
        task: "Investment Planning",
        duration: "2 weeks",
        status: "pending",
      },
      {
        id: "task-2-3",
        department: "Procurement",
        task: "New Supplier Onboarding",
        duration: "8 weeks",
        status: "pending",
      },
      {
        id: "task-2-4",
        department: "Policy & Governance",
        task: "Regulatory Assessment",
        duration: "4 weeks",
        status: "pending",
      },
      {
        id: "task-2-5",
        department: "Sales & Marketing",
        task: "Product Positioning",
        duration: "5 weeks",
        status: "pending",
      },
    ],
  });

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

      // Mock optimization options with additional metrics
      const mockOptions: EnhancedOption[] = [
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
          additionalMetrics: [
            { label: "Saves from predicted loss", value: "$85M" },
            { label: "Projected annual profit", value: "+$42M" },
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
          additionalMetrics: [
            { label: "Saves from predicted loss", value: "$65M" },
            { label: "Projected annual profit", value: "+$35M" },
          ],
        },
      ];

      dispatch(setCurrentBusinessFlow(currentFlow));
      dispatch(setOptions(mockOptions as Option[]));
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

  const selectedOption = options.find((opt) => opt.id === selectedOptionId) as
    | EnhancedOption
    | undefined;
  const currentOptionFinancialImpact = selectedOptionId
    ? financialImpact[selectedOptionId]
    : [];
  const currentImplementationPlan = selectedOptionId
    ? implementationPlan[selectedOptionId]
    : [];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-4 py-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Business Operation Analysis
            </h1>
            <p className="text-sm text-gray-500">
              Updated April 29, 2025 · Generated by TARS Intelligence
            </p>
          </div>
        </div>

        {/* Dashboard Tabs - Analysis and Recommendation */}
        <Tabs
          defaultValue="analysis"
          className="w-full mb-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="w-full justify-start bg-white border border-gray-200 rounded-md p-0.5 h-10">
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-sm h-8"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="recommendation"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-sm h-8"
            >
              Recommendation
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab Content */}
          <TabsContent value="analysis" className="mt-4 space-y-4">
            {/* Analytics Dashboard Section */}
            <AnalyticsSection />

            {/* News and Impact Analysis Section */}
            <NewsAndImpactSection
              newsItems={newsItems}
              impactItems={impactItems}
            />

            {/* Current Business Flow - Full Width */}
            <BusinessFlowSection currentBusinessFlow={currentBusinessFlow} />

            {/* Financial Impact Section - Using option-1 data for the analysis tab */}
            <Card className="dashboard-card">
              <CardHeader className="pb-3 pt-4 border-b border-gray-100">
                <CardTitle className="text-base font-medium">
                  Financial Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Key Metric
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Current Value
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Projected After Changes
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Change
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {financialImpact["option-1"].map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.metricName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.current}
                            {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.projected}
                            {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.change > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.change > 0 ? "+" : ""}
                              {item.change}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendation Tab Content */}
          <TabsContent value="recommendation" className="mt-4 space-y-4">
            {/* Recommendation Tab Tabs */}
            <Tabs defaultValue="options" className="w-full">
              <TabsList className="w-full justify-start bg-white border border-gray-200 rounded-md p-0.5 h-10">
                <TabsTrigger
                  value="options"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-sm h-8"
                >
                  Alternative Options
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-sm h-8"
                >
                  Financial Impact
                </TabsTrigger>
                <TabsTrigger
                  value="implementation"
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-sm h-8"
                >
                  Implementation Plan
                </TabsTrigger>
              </TabsList>

              {/* Options Tab */}
              <TabsContent value="options" className="mt-4">
                <Card className="dashboard-card">
                  <CardHeader className="pb-3 pt-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">
                        Alternative Options
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        <PlusSquare className="h-3.5 w-3.5 mr-1" />
                        Custom Option
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    {/* Enhanced Options Display with additional metrics */}
                    <AlternativeOptionsDisplay
                      options={options as EnhancedOption[]}
                      selectedOptionId={selectedOptionId}
                      onSelectOption={handleSelectOption}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Impact Tab - Dynamic based on selected option */}
              <TabsContent value="financial" className="mt-4">
                <FinancialImpactSection
                  financialImpactData={currentOptionFinancialImpact}
                  selectedOptionId={selectedOptionId}
                  selectedOptionTitle={selectedOption?.title}
                />
              </TabsContent>

              {/* Implementation Plan Tab - Dynamic based on selected option */}
              <TabsContent value="implementation" className="mt-4">
                <ImplementationPlanSection
                  implementationTasks={currentImplementationPlan}
                  selectedOptionId={selectedOptionId}
                  selectedOptionTitle={selectedOption?.title}
                />
              </TabsContent>
            </Tabs>

            {/* Approve Button - Bottom of the Recommendation Tab */}
            <div className="flex justify-end mt-6">
              <Button disabled={!selectedOptionId} className="px-6">
                Approve Selected Option
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OutputInterface;
