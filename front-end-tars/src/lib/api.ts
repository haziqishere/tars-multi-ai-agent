// src/lib/api.ts
import { Node, Edge, Option, SummaryCardData, SummaryCardResponse } from "@/types/output";

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
  chatResponse: string;
  summaryCard: SummaryCardResponse;
  context?: {
    internal: string;
    external: string;
  };
  system_info?: {
    execution_time: number;
    status: "complete" | "partial" | "fallback";
    fallbacks: {
      agent1_fallback: boolean;
      agent2_fallback: boolean;
      agent3_fallback: boolean;
      agent4_fallback: boolean;
      agent5_fallback: boolean;
    }
  }
}

/**
 * Fetches optimization data from the API
 * @param query The user query or business process to analyze
 * @returns A promise resolving to the optimization data
 */
export const fetchOptimizationData = async (query: string): Promise<ApiResponse> => {
  try {
    // Use the local API proxy endpoint which forwards to the external API
    // This bypasses CORS issues in production
    const apiEndpoint = '/api/optimization';

    const response = await fetch(apiEndpoint, {
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

/**
 * Fetches summary card data for implementation
 * @param optionId The selected option ID
 * @returns A promise resolving to the summary card data
 */
export const fetchSummaryCardData = async (optionId: string): Promise<SummaryCardData> => {
  // In a real app, we'd fetch this from the API
  try {
    // If we're already given an option ID like "option-A", extract the letter part
    const optionLetter = optionId.includes('-') ? optionId.split('-')[1] : optionId;

    // Use the local API proxy endpoint which forwards to the external API
    // This bypasses CORS issues in production
    const apiEndpoint = '/api/optimization/summary';

    const response = await fetch(`${apiEndpoint}/${optionLetter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // The API could return either a direct SummaryCardData or a SummaryCardResponse
    const data = await response.json();
    
    // If the API returns a response with allOptions, extract the right one
    if (data.allOptions && data.allOptions[optionLetter]) {
      return data.allOptions[optionLetter];
    }
    
    // Otherwise, assume it's direct SummaryCardData
    return data;
  } catch (error) {
    console.error('Error fetching summary card data:', error);
    
    // Fall back to mock data in case of an error
    // Get user information from localStorage (set during login)
    // In a real app, this would come from an auth context or service
    let userName = "J. Doe";
    let userTitle = "Head of Operations";
    
    // Try to get the logged in user from localStorage
    try {
      const userIdFromLocalStorage = localStorage.getItem('selectedUser');
      if (userIdFromLocalStorage === 'jdoe') {
        userName = "J. Doe";
        userTitle = "Head of Operations";
      } else if (userIdFromLocalStorage === 'asmith') {
        userName = "A. Smith";
        userTitle = "CEO";
      }
    } catch (error) {
      console.error("Error getting user from localStorage:", error);
      // Fall back to default user if there's an error
    }
    
    const emailSignature = `
Best regards,
TARS System
Ran By ${userName}, ${userTitle}`;
    
    return {
      businessOperationsFlow: {
        summary: "Optimized 5-step procurement process with automated vendor validation",
        steps: [
          { id: "step1", description: "Automated requisition approval", department: "Procurement" },
          { id: "step2", description: "AI-powered vendor selection", department: "Vendor Relations" },
          { id: "step3", description: "Contract negotiation assistance", department: "Legal" },
          { id: "step4", description: "Digital invoice processing", department: "Finance" },
          { id: "step5", description: "Payment automation", department: "Finance" }
        ]
      },
      departments: [
        {
          id: "dept-1",
          department: "Procurement",
          manager: "Alex Johnson",
          email: "alex.johnson@company.com",
          tasks: [
            {
              id: "task1-1",
              description: "Update requisition form with new validation fields",
              priority: "high",
              deadline: "2025-05-15",
            },
            {
              id: "task1-2",
              description: "Configure automated PO generation rules",
              priority: "medium",
              deadline: "2025-05-30",
            },
            {
              id: "task1-3",
              description: "Train team on new system",
              priority: "medium",
              deadline: "2025-06-15",
            }
          ],
          emailTemplate: {
            to: "alex.johnson@company.com",
            recipient: "Alex Johnson",
            department: "Procurement",
            subject: "Action Required: Procurement Process Optimization Implementation",
            body: `Dear Alex,

I'm reaching out regarding the recently approved procurement process optimization. The analysis has identified key areas where your department will play a critical role in implementation.

Key tasks for the Procurement team:
1. Update requisition form with new validation fields (High Priority, Due: May 15, 2025)
2. Configure automated PO generation rules (Medium Priority, Due: May 30, 2025)
3. Train team on new system (Medium Priority, Due: June 15, 2025)

The expected outcomes include a 30% reduction in processing time and 15% cost savings.

Please review the attached implementation schedule and confirm your team's availability for the kickoff meeting next Monday at 10:00 AM.
${emailSignature}`
          }
        },
        {
          id: "dept-2",
          department: "Vendor Relations",
          manager: "Sarah Miller",
          email: "sarah.miller@company.com",
          tasks: [
            {
              id: "task2-1",
              description: "Create vendor scoring criteria",
              priority: "high",
              deadline: "2025-05-20",
            },
            {
              id: "task2-2",
              description: "Update vendor database with new fields",
              priority: "medium",
              deadline: "2025-06-05",
            }
          ],
          emailTemplate: {
            to: "sarah.miller@company.com",
            recipient: "Sarah Miller",
            department: "Vendor Relations",
            subject: "Action Required: Vendor Selection Process Updates",
            body: `Dear Sarah,

Following our recent process optimization approval, we need your team's expertise to implement the new AI-powered vendor selection system.

Key tasks for the Vendor Relations team:
1. Create vendor scoring criteria (High Priority, Due: May 20, 2025)
2. Update vendor database with new fields (Medium Priority, Due: June 5, 2025)

This new system will help reduce vendor selection time by 40% and improve quality scoring by 25%.

Let's connect this week to discuss the implementation details further.
${emailSignature}`
          }
        },
        {
          id: "dept-3",
          department: "Legal",
          manager: "Michael Chen",
          email: "michael.chen@company.com",
          tasks: [
            {
              id: "task3-1",
              description: "Update contract templates",
              priority: "medium",
              deadline: "2025-06-10",
            },
            {
              id: "task3-2",
              description: "Develop legal approval workflow",
              priority: "high",
              deadline: "2025-05-25",
            },
            {
              id: "task3-3",
              description: "Create compliance checklist",
              priority: "low",
              deadline: "2025-06-30",
            }
          ],
          emailTemplate: {
            to: "michael.chen@company.com",
            recipient: "Michael Chen",
            department: "Legal",
            subject: "Action Required: Legal Process Updates for Procurement Optimization",
            body: `Dear Michael,

I'm writing regarding the procurement process optimization that was recently approved. Your department plays a crucial role in implementing the contract negotiation assistance component.

Key tasks for the Legal team:
1. Update contract templates (Medium Priority, Due: June 10, 2025)
2. Develop legal approval workflow (High Priority, Due: May 25, 2025)
3. Create compliance checklist (Low Priority, Due: June 30, 2025)

These changes will help reduce contract review time by 35% while maintaining our high legal standards.

Please review and let me know if you have any questions about the implementation timeline.
${emailSignature}`
          }
        },
        {
          id: "dept-4",
          department: "Finance",
          manager: "Jessica Taylor",
          email: "jessica.taylor@company.com",
          tasks: [
            {
              id: "task4-1",
              description: "Configure digital invoice processing",
              priority: "high",
              deadline: "2025-05-15",
            },
            {
              id: "task4-2",
              description: "Set up payment automation rules",
              priority: "high",
              deadline: "2025-05-30",
            },
            {
              id: "task4-3",
              description: "Update financial reporting dashboard",
              priority: "medium",
              deadline: "2025-06-20",
            }
          ],
          emailTemplate: {
            to: "jessica.taylor@company.com",
            recipient: "Jessica Taylor",
            department: "Finance",
            subject: "Action Required: Finance Process Updates for Procurement Optimization",
            body: `Dear Jessica,

I'm reaching out about the recently approved procurement process optimization. The Finance team has two key components to implement: digital invoice processing and payment automation.

Key tasks for the Finance team:
1. Configure digital invoice processing (High Priority, Due: May 15, 2025)
2. Set up payment automation rules (High Priority, Due: May 30, 2025)
3. Update financial reporting dashboard (Medium Priority, Due: June 20, 2025)

These changes are expected to reduce payment processing time by 60% and improve cash flow forecasting accuracy by 25%.

I've attached detailed specifications for both components. Please review them and let me know if you need any clarification.
${emailSignature}`
          }
        }
      ]
    };
  }
};