// src/lib/api.ts
import { Node, Edge, Option } from "@/store/slices/outputSlice";

// Types for API responses
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

export interface ImpactItem {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
}

export interface FinancialImpact {
  metricName: string;
  current: number;
  projected: number;
  change: number;
  unit: string;
}

export interface ImplementationTask {
  id: string;
  department: string;
  task: string;
  duration: string;
  status: "pending" | "in-progress" | "completed";
}

export interface AnalyticsData {
  currentAnnualCost: number;
  efficiencyRating: number;
  averageProcessTime: number;
  riskAssessment: number;
  trends: {
    costTrend: "increasing" | "decreasing" | "stable";
    efficiencyTrend: "improving" | "worsening" | "stable";
    timeTrend: "increasing" | "decreasing" | "stable";
    riskTrend: "improving" | "worsening" | "stable";
  }
}

export interface EnhancedOption extends Option {
  additionalMetrics?: {
    label: string;
    value: string;
  }[];
  financialImpact: FinancialImpact[];
  implementationPlan: ImplementationTask[];
}

export interface ApiResponse {
  analysis: {
    businessFlow: {
      nodes: Node[];
      edges: Edge[];
    };
    analytics: AnalyticsData;
    newsAndImpact: {
      newsItems: NewsItem[];
      impactItems: ImpactItem[];
    };
  };
  recommendations: {
    options: EnhancedOption[];
  };
  chatResponse: string; // Added chat response to API response
}

/**
 * Fetches optimization data from the API
 * @param query The user query or business process to analyze
 * @returns A promise resolving to the optimization data
 */
export const fetchOptimizationData = async (query: string): Promise<ApiResponse> => {
  try {
    // Using relative URL since we're making requests to our Next.js API routes
    const response = await fetch('/api/optimization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching optimization data:', error);
    throw error;
  }
};