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
import AlternativeOptionsDisplay from "./AlternativeOptionsDisplay";
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
import {
  BarChart3,
  DownloadIcon,
  LineChart,
  PieChart,
  PlusSquare,
  Clipboard,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Check,
  X,
} from "lucide-react";
import { Badge } from "../ui/badge";

// Define types for news and events
interface NewsItem {
  id: string;
  title: string;
  date: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

// Define types for impact analysis
interface ImpactItem {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
}

// Define types for financial impact data
interface FinancialImpact {
  metricName: string;
  current: number;
  projected: number;
  change: number;
  unit: string;
}

// Define types for implementation tasks
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
              Updated April 27, 2025 · Generated by TARS Intelligence
            </p>
          </div>
        </div>

        {/* Dashboard Tabs - Simplified to just Analysis and Recommendation */}
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
            <Card className="dashboard-card">
              <CardHeader className="pb-3 pt-4 border-b border-gray-100">
                <CardTitle className="text-base font-medium">
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                {/* Key Stats */}
                <div className="metrics-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <Card className="dashboard-card">
                    <CardContent className="pt-4 pb-3">
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
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="pt-4 pb-3">
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
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="pt-4 pb-3">
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
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="pt-4 pb-3">
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
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* News and Impact Analysis Section - Grid with two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* News and Events Section */}
              <Card className="dashboard-card">
                <CardHeader className="pb-3 pt-4 border-b border-gray-100">
                  <CardTitle className="text-base font-medium">
                    Current News & Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <ol className="list-decimal pl-5 space-y-3">
                      {newsItems.map((item) => (
                        <li key={item.id} className="text-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-medium">{item.title}</span>
                              <span className="text-gray-500 text-xs ml-2">
                                ({item.date})
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.impact === "positive"
                                  ? "bg-green-50 text-green-700"
                                  : item.impact === "negative"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-50 text-gray-700"
                              }`}
                            >
                              {item.impact === "positive" && (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              )}
                              {item.impact === "negative" && (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {item.impact.charAt(0).toUpperCase() +
                                item.impact.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                            {item.description}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>

              {/* Impact Analysis Section */}
              <Card className="dashboard-card">
                <CardHeader className="pb-3 pt-4 border-b border-gray-100">
                  <CardTitle className="text-base font-medium">
                    Future Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <ol className="list-decimal pl-5 space-y-3">
                      {impactItems.map((item) => (
                        <li key={item.id} className="text-sm">
                          <div className="flex items-start justify-between">
                            <span className="font-medium">{item.title}</span>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 text-xs"
                              >
                                P: {(item.probability * 100).toFixed(0)}%
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 text-xs"
                              >
                                I: {item.impact.toFixed(1)}/5
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs mt-1">
                            {item.description}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Business Flow - Full Width */}
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

            {/* Financial Impact Section */}
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
                <Card className="dashboard-card">
                  <CardHeader className="pb-3 pt-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium">
                        Financial Impact Analysis
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {selectedOption?.title || "Select an option"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4">
                    {selectedOptionId ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Key Financial Metrics */}
                          <div>
                            <h3 className="text-sm font-medium mb-3">
                              Key Financial Metrics
                            </h3>
                            <div className="space-y-3">
                              {currentOptionFinancialImpact.map(
                                (metric, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">
                                        {metric.metricName}
                                      </p>
                                      <div className="flex items-center mt-1">
                                        <span className="text-xs text-gray-500">
                                          Current: {metric.current}
                                          {metric.unit}
                                        </span>
                                        <span className="text-xs text-gray-400 mx-2">
                                          →
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          Projected: {metric.projected}
                                          {metric.unit}
                                        </span>
                                      </div>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`${
                                        metric.metricName.includes("Cost") ||
                                        metric.metricName.includes("Risk")
                                          ? metric.change < 0
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                          : metric.change > 0
                                          ? "bg-green-50 text-green-700"
                                          : "bg-red-50 text-red-700"
                                      }`}
                                    >
                                      {metric.change > 0 ? "+" : ""}
                                      {metric.change}%
                                    </Badge>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* ROI Analysis */}
                          <div>
                            <h3 className="text-sm font-medium mb-3">
                              Return on Investment
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-md space-y-4">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs font-medium">
                                    Breakeven Point
                                  </span>
                                  <span className="text-xs font-medium">
                                    {selectedOptionId === "option-1"
                                      ? "2.1 months"
                                      : "3.1 months"}
                                  </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                                  <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{
                                      width:
                                        selectedOptionId === "option-1"
                                          ? "80%"
                                          : "65%",
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Risk</span>
                                  <span>Return</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Comparison Chart (Placeholder) */}
                        <div>
                          <h3 className="text-sm font-medium mb-3">
                            Cost-Benefit Comparison
                          </h3>
                          <div className="bg-gray-100 border border-gray-200 rounded-md h-64 flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500">
                                Cost-benefit comparison chart would be displayed
                                here
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          Select an option to view financial impact analysis
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Implementation Plan Tab - Dynamic based on selected option */}
              <TabsContent value="implementation" className="mt-4">
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
                        {selectedOption?.title || "Select an option"}
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
                                {currentImplementationPlan.map(
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
