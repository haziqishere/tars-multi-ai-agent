// src/components/output/OutputInterface.tsx
"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentBusinessFlow,
  setOptions,
  selectOption,
  setSummaryCardData,
  showSummaryCard,
  setSummaryCardResponse,
} from "@/store/slices/outputSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusSquare,
  BarChart3,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";

// Import modular components
import AlternativeOptionsDisplay from "./AlternativeOptionsDisplay";
import AnalyticsSection from "./AnalyticsSection";
import NewsAndImpactSection from "./NewsAndImpactSection";
import BusinessFlowSection from "./BusinessFlowSection";
import FinancialImpactSection from "./FinancialImpactSection";
import ImplementationPlanSection from "./ImplementationPlanSection";
import SummaryCard from "./SummaryCard";

// Import API functions and types - directly use your existing types
import { fetchOptimizationData, fetchSummaryCardData } from "@/lib/api";
// Import the specific types from your API
import type {
  AnalyticsData,
  NewsItem,
  ImpactItem,
  FinancialImpact,
  ImplementationTask,
  ApiResponse,
} from "@/lib/api";

const OutputInterface: React.FC = () => {
  const dispatch = useAppDispatch();
  const { options, selectedOptionId, currentBusinessFlow } = useAppSelector(
    (state) => state.output
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analysis");
  const [approvingOption, setApprovingOption] = useState(false);

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

  // Add state for system info
  const [systemInfo, setSystemInfo] = useState<
    ApiResponse["system_info"] | null
  >(null);
  const [context, setContext] = useState<ApiResponse["context"] | null>(null);

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

        // Use your existing API function
        const data = await fetchOptimizationData(query);

        // Update analytics data
        if (data.analysis && data.analysis.analytics) {
          setAnalyticsData(data.analysis.analytics);
        }

        // Update news and impact items
        if (data.analysis && data.analysis.newsAndImpact) {
          setNewsItems(data.analysis.newsAndImpact.newsItems || []);
          setImpactItems(data.analysis.newsAndImpact.impactItems || []);
        }

        // Update current business flow
        if (data.analysis && data.analysis.businessFlow) {
          dispatch(setCurrentBusinessFlow(data.analysis.businessFlow));
        }

        // Store context if available
        if (data.context) {
          setContext(data.context);
        }

        // Store system info if available
        if (data.system_info) {
          setSystemInfo(data.system_info);
        }

        // Handle summary card data if present in the API response
        if (data.summaryCard) {
          // Store the full summary card response
          dispatch(setSummaryCardResponse(data.summaryCard));

          // If the API already provides summary card data, we can use it directly
          // Find the active option based on the activeOption field
          const activeOptionLetter = data.summaryCard.activeOption;
          const activeOptionData =
            data.summaryCard.allOptions[activeOptionLetter];

          if (activeOptionData) {
            dispatch(setSummaryCardData(activeOptionData));
          }
        }

        // Update options - Enhanced to include businessOperationsFlow data from summaryCard
        if (data.recommendations && data.recommendations.options) {
          // If we have summaryCard data, enhance the options with the businessOperationsFlow
          if (data.summaryCard && data.summaryCard.allOptions) {
            const enhancedOptions = data.recommendations.options.map(
              (option: any) => {
                // Extract the option letter from the id (e.g., "option-A" -> "A")
                const optionIdParts = option.id.split("-");
                const optionLetter =
                  optionIdParts.length > 1 ? optionIdParts[1] : "";

                // If we have summary card data for this option, enhance it with flow data
                if (optionLetter && data.summaryCard.allOptions[optionLetter]) {
                  const summaryOption =
                    data.summaryCard.allOptions[optionLetter];

                  // Extract nodes and edges from businessOperationsFlow if available
                  if (summaryOption.businessOperationsFlow) {
                    const flow = summaryOption.businessOperationsFlow;
                    return {
                      ...option,
                      nodes: flow.nodes || [],
                      edges: flow.edges || [],
                      businessOperationsFlow: flow,
                    };
                  }
                }
                return option;
              }
            );

            dispatch(setOptions(enhancedOptions));
          } else {
            dispatch(setOptions(data.recommendations.options));
          }

          // Select the option marked as selected (if any) or the first option by default
          const selectedOption = data.recommendations.options.find(
            (opt) => opt.selected
          );
          if (selectedOption) {
            dispatch(selectOption(selectedOption.id));
          } else if (data.recommendations.options.length > 0) {
            dispatch(selectOption(data.recommendations.options[0].id));
          }

          // Create financial impact map indexed by option ID
          const financialImpactMap: Record<string, FinancialImpact[]> = {};
          data.recommendations.options.forEach((option: any) => {
            if (option.financialImpact) {
              financialImpactMap[option.id] = option.financialImpact;
            }
          });
          setFinancialImpact(financialImpactMap);

          // Create implementation plan map indexed by option ID
          const implementationPlanMap: Record<string, ImplementationTask[]> =
            {};
          data.recommendations.options.forEach((option: any) => {
            if (option.implementationPlan) {
              implementationPlanMap[option.id] = option.implementationPlan;
            }
          });
          setImplementationPlan(implementationPlanMap);
        }
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

  // Modified handle approve option to use allOptions from the API if available
  const handleApproveOption = async () => {
    if (!selectedOptionId) return;

    setApprovingOption(true);
    try {
      // First check if we already have summary data from the API response
      if (options.length > 0 && selectedOptionId) {
        // Extract the option letter (e.g., "A" from "option-A")
        const optionLetter = selectedOptionId.split("-")[1];

        // If we have a summaryCardResponse with allOptions, use it
        const state = (window as any).__REDUX_STORE__?.getState?.();
        const summaryCardResponse = state?.output?.summaryCardResponse;

        if (
          summaryCardResponse &&
          summaryCardResponse.allOptions &&
          optionLetter &&
          summaryCardResponse.allOptions[optionLetter]
        ) {
          // We already have the summary data for this option
          dispatch(
            setSummaryCardData(summaryCardResponse.allOptions[optionLetter])
          );
          dispatch(showSummaryCard());
          setApprovingOption(false);
          return;
        }
      }

      // If we don't have the data already, fetch it
      const summaryData = await fetchSummaryCardData(selectedOptionId);
      dispatch(setSummaryCardData(summaryData));
      dispatch(showSummaryCard());
    } catch (error) {
      console.error("Failed to load summary data:", error);
      // Show error message to user
    } finally {
      setApprovingOption(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-base">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">
            Generating optimization options...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-base">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-text-primary font-medium mb-2">
            Something went wrong
          </p>
          <p className="text-text-secondary">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-accent-orange text-white px-4 py-2 rounded-md hover:bg-accent-orange-muted transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const selectedOption = options.find((opt) => opt.id === selectedOptionId);
  const currentOptionFinancialImpact = selectedOptionId
    ? financialImpact[selectedOptionId] || []
    : [];
  const currentImplementationPlan = selectedOptionId
    ? implementationPlan[selectedOptionId] || []
    : [];

  // Add system info display if present
  const renderSystemInfo = () => {
    if (!systemInfo) return null;

    return (
      <div className="text-xs text-text-muted mt-2 flex items-center">
        <span>Execution time: {systemInfo.execution_time.toFixed(1)}s</span>
        <span className="mx-2">•</span>
        <span>Status: {systemInfo.status}</span>
        {systemInfo.status === "fallback" && (
          <>
            <span className="mx-2">•</span>
            <span className="text-amber-500">
              Some agents fell back to backup logic
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-dark-base px-4 py-3">
      <div className="max-w-[1400px] mx-auto">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Business Operation Analysis
            </h1>
            <p className="text-sm text-text-secondary">
              Updated{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              · Generated by TARS Intelligence
              {systemInfo && ` · ${systemInfo.execution_time.toFixed(1)}s`}
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
          <TabsList className="w-full justify-start bg-dark-elevated border border-dark-border rounded-md p-0.5 h-10 shadow-neo-dark">
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-accent-green data-[state=active]:bg-opacity-10 data-[state=active]:text-accent-green rounded-sm h-8 text-text-secondary"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="recommendation"
              className="data-[state=active]:bg-accent-green data-[state=active]:bg-opacity-10 data-[state=active]:text-accent-green rounded-sm h-8 text-text-secondary"
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
                <CardHeader className="dashboard-card-header">
                  <CardTitle className="dashboard-card-title">
                    Financial Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="dashboard-card-content">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-border">
                      <thead className="bg-dark-elevated">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                          >
                            Key Metric
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                          >
                            Current Value
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                          >
                            Projected After Changes
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                          >
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {currentOptionFinancialImpact.map((item, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0
                                ? "bg-dark-surface"
                                : "bg-dark-elevated"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                              {item.metricName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              {item.current}
                              {item.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              {item.projected}
                              {item.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.change > 0
                                    ? "bg-accent-green bg-opacity-10 text-accent-green"
                                    : "bg-red-800 bg-opacity-20 text-red-400"
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
              <TabsList className="w-full justify-start bg-dark-elevated border border-dark-border rounded-md p-0.5 h-10 shadow-neo-dark">
                <TabsTrigger
                  value="options"
                  className="data-[state=active]:bg-accent-green data-[state=active]:bg-opacity-10 data-[state=active]:text-accent-green rounded-sm h-8 text-text-secondary"
                >
                  Alternative Options
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="data-[state=active]:bg-accent-green data-[state=active]:bg-opacity-10 data-[state=active]:text-accent-green rounded-sm h-8 text-text-secondary"
                >
                  Financial Impact
                </TabsTrigger>
                <TabsTrigger
                  value="implementation"
                  className="data-[state=active]:bg-accent-green data-[state=active]:bg-opacity-10 data-[state=active]:text-accent-green rounded-sm h-8 text-text-secondary"
                >
                  Implementation Plan
                </TabsTrigger>
              </TabsList>

              {/* Options Tab */}
              <TabsContent value="options" className="mt-4">
                <Card className="dashboard-card">
                  <CardHeader className="dashboard-card-header">
                    <div className="flex items-center justify-between">
                      <CardTitle className="dashboard-card-title">
                        Alternative Options
                      </CardTitle>
                      <button className="neo-button h-7 px-2 text-xs flex items-center text-text-primary">
                        <PlusSquare className="h-3.5 w-3.5 mr-1 text-accent-orange" />
                        Custom Option
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="dashboard-card-content">
                    <AlternativeOptionsDisplay
                      options={options}
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
              <button
                disabled={!selectedOptionId || approvingOption}
                className="bg-accent-green text-white px-6 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-neo-dark hover:bg-accent-green-muted transition-colors"
                onClick={handleApproveOption}
              >
                {approvingOption ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Selected Option
                  </>
                )}
              </button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary Card Modal */}
        <SummaryCard />
      </div>
    </div>
  );
};

export default OutputInterface;
