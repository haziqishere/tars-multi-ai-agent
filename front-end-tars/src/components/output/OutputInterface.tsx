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

// Import API functions and types
import {
  fetchOptimizationData,
  ApiResponse,
  NewsItem,
  ImpactItem,
  FinancialImpact,
  ImplementationTask,
  EnhancedOption,
  AnalyticsData,
} from "@/lib/api";

const OutputInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { options, selectedOptionId, currentBusinessFlow } = useAppSelector(
    (state) => state.output
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analysis");

  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );

  // State for news and impact analysis
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [impactItems, setImpactItems] = useState<ImpactItem[]>([]);

  // State for financial impact data - indexed by option ID
  const [financialImpact, setFinancialImpact] = useState<
    Record<string, FinancialImpact[]>
  >({});

  // State for implementation plans - indexed by option ID
  const [implementationPlan, setImplementationPlan] = useState<
    Record<string, ImplementationTask[]>
  >({});

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real application, this query would come from user input
        // For now, we're using a static example query
        const query =
          "Analyze and optimize our manufacturing supply chain process";
        const data = await fetchOptimizationData(query);

        // Update analytics data
        setAnalyticsData(data.analysis.analytics);

        // Update news and impact items
        setNewsItems(data.analysis.newsAndImpact.newsItems);
        setImpactItems(data.analysis.newsAndImpact.impactItems);

        // Update current business flow
        dispatch(setCurrentBusinessFlow(data.analysis.businessFlow));

        // Update options
        dispatch(setOptions(data.recommendations.options));

        // Select the first option by default if available
        if (data.recommendations.options.length > 0) {
          dispatch(selectOption(data.recommendations.options[0].id));
        }

        // Create financial impact map indexed by option ID
        const financialImpactMap: Record<string, FinancialImpact[]> = {};
        data.recommendations.options.forEach((option) => {
          financialImpactMap[option.id] = option.financialImpact;
        });
        setFinancialImpact(financialImpactMap);

        // Create implementation plan map indexed by option ID
        const implementationPlanMap: Record<string, ImplementationTask[]> = {};
        data.recommendations.options.forEach((option) => {
          implementationPlanMap[option.id] = option.implementationPlan;
        });
        setImplementationPlan(implementationPlanMap);
      } catch (err) {
        console.error("Failed to fetch optimization data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 font-medium mb-2">Something went wrong</p>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const selectedOption = options.find((opt) => opt.id === selectedOptionId) as
    | EnhancedOption
    | undefined;
  const currentOptionFinancialImpact = selectedOptionId
    ? financialImpact[selectedOptionId] || []
    : [];
  const currentImplementationPlan = selectedOptionId
    ? implementationPlan[selectedOptionId] || []
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
              Updated{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              · Generated by TARS Intelligence
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
            <AnalyticsSection analyticsData={analyticsData} />

            {/* News and Impact Analysis Section */}
            <NewsAndImpactSection
              newsItems={newsItems}
              impactItems={impactItems}
            />

            {/* Current Business Flow - Full Width */}
            <BusinessFlowSection currentBusinessFlow={currentBusinessFlow} />

            {/* Financial Impact Section */}
            {selectedOptionId && currentOptionFinancialImpact.length > 0 && (
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
                        {currentOptionFinancialImpact.map((item, index) => (
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
            )}
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
