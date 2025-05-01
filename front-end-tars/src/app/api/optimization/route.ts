import { NextRequest, NextResponse } from 'next/server';

// Sample optimization data - this would typically come from an AI model or database
const optimizationData = {
  analysis: {
    businessFlow: {
      nodes: [
        { id: "node-1", label: "Raw Materials Intake", type: "start", position: { x: 50, y: 100 } },
        { id: "node-2", label: "Quality Control", type: "process", position: { x: 200, y: 50 }, status: { type: "critical", label: "⚠ Critical" } },
        { id: "node-3", label: "Production Line A", type: "process", position: { x: 350, y: 100 } },
        { id: "node-4", label: "Production Line B", type: "process", position: { x: 350, y: 200 } },
        { id: "node-5", label: "Assembly", type: "process", position: { x: 500, y: 150 } },
        { id: "node-6", label: "Packaging", type: "process", position: { x: 650, y: 100 } },
        { id: "node-7", label: "Warehouse", type: "end", position: { x: 800, y: 150 } }
      ],
      edges: [
        { id: "edge-1", source: "node-1", target: "node-2", label: "Inspection" },
        { id: "edge-2", source: "node-2", target: "node-3", label: "Passed QC - High Priority", flowType: "critical" },
        { id: "edge-3", source: "node-2", target: "node-4", label: "Passed QC - Standard" },
        { id: "edge-4", source: "node-3", target: "node-5", label: "Component A" },
        { id: "edge-5", source: "node-4", target: "node-5", label: "Component B" },
        { id: "edge-6", source: "node-5", target: "node-6", label: "Assembled Product" },
        { id: "edge-7", source: "node-6", target: "node-7", label: "Finished Goods" }
      ]
    },
    analytics: {
      currentAnnualCost: 8750000,
      efficiencyRating: 73,
      averageProcessTime: 14.5,
      riskAssessment: 63,
      trends: {
        costTrend: "increasing",
        efficiencyTrend: "stable",
        timeTrend: "increasing",
        riskTrend: "worsening"
      }
    },
    newsAndImpact: {
      newsItems: [
        {
          id: "news-1",
          title: "New Tariff Regulations",
          date: "April 15, 2025",
          impact: "negative",
          description: "New tariffs of 25% imposed on key materials affecting Production Line B."
        },
        {
          id: "news-2",
          title: "Competitor Restructuring",
          date: "April 10, 2025",
          impact: "positive",
          description: "Main competitor implementing similar restructuring with 9-month timeline."
        },
        {
          id: "news-3",
          title: "Industry Supply Chain Disruption",
          date: "April 5, 2025",
          impact: "negative",
          description: "Major logistics provider facing operational challenges, causing delays."
        },
        {
          id: "news-4",
          title: "New Market Opportunity",
          date: "March 28, 2025",
          impact: "positive",
          description: "Growing demand in Southeast Asian markets for optimized manufacturing processes."
        }
      ],
      impactItems: [
        {
          id: "impact-1",
          title: "Supply Chain Disruption",
          description: "Potential delays in raw material sourcing affecting production timeline",
          probability: 68,
          impact: 72
        },
        {
          id: "impact-2",
          title: "Market Share Growth",
          description: "Optimization could lead to 15% increase in market share within 12 months",
          probability: 75,
          impact: 85
        },
        {
          id: "impact-3",
          title: "Regulatory Compliance",
          description: "Improved processes will ensure compliance with upcoming regulations",
          probability: 92,
          impact: 60
        }
      ]
    }
  },
  recommendations: {
    options: [
      {
        id: "option-1",
        title: "Process Automation Strategy",
        description: "Implement AI-driven automation in the manufacturing workflow, optimizing the connection between Quality Control and Assembly.",
        timeToImplement: "3-4 months",
        costReduction: "22% cost reduction",
        additionalMetrics: [
          {
            label: "ROI",
            value: "134% in 12 months"
          },
          {
            label: "Risk Reduction",
            value: "42%"
          }
        ],
        nodes: [
          { id: "node-1", label: "Raw Materials Intake", type: "start", position: { x: 50, y: 100 } },
          { id: "node-2", label: "Automated Quality Control", type: "process", position: { x: 200, y: 100 }, status: { type: "new", label: "+ New Process" } },
          { id: "node-3", label: "Smart Production Line", type: "process", position: { x: 400, y: 100 }, status: { type: "new", label: "+ New Process" } },
          { id: "node-5", label: "Automated Assembly", type: "process", position: { x: 550, y: 100 }, status: { type: "new", label: "+ New Process" } },
          { id: "node-6", label: "Packaging", type: "process", position: { x: 700, y: 100 } },
          { id: "node-7", label: "Warehouse", type: "end", position: { x: 850, y: 100 } }
        ],
        edges: [
          { id: "edge-1", source: "node-1", target: "node-2", label: "AI Sorting", flowType: "optimized" },
          { id: "edge-2", source: "node-2", target: "node-3", label: "Real-time Optimization", flowType: "optimized" },
          { id: "edge-4", source: "node-3", target: "node-5", label: "Smart Routing", flowType: "optimized" },
          { id: "edge-6", source: "node-5", target: "node-6", label: "Assembled Product", flowType: "optimized" },
          { id: "edge-7", source: "node-6", target: "node-7", label: "Finished Goods", flowType: "optimized" }
        ],
        financialImpact: [
          {
            metricName: "Annual Operating Costs",
            current: 8750000,
            projected: 6825000,
            change: -22,
            unit: "$"
          },
          {
            metricName: "Process Time",
            current: 14.5,
            projected: 8.7,
            change: -40,
            unit: "days"
          },
          {
            metricName: "Resource Utilization",
            current: 73,
            projected: 89,
            change: 22,
            unit: "%"
          },
          {
            metricName: "Regulatory Risk",
            current: 63,
            projected: 36,
            change: -43,
            unit: "%"
          }
        ],
        implementationPlan: [
          {
            id: "task-1-1",
            department: "IT",
            task: "Setup automation infrastructure",
            duration: "4 weeks",
            status: "pending"
          },
          {
            id: "task-1-2",
            department: "Operations",
            task: "Process automation integration",
            duration: "6 weeks",
            status: "pending"
          },
          {
            id: "task-1-3",
            department: "Quality Control",
            task: "Smart QC system implementation",
            duration: "3 weeks",
            status: "pending"
          },
          {
            id: "task-1-4",
            department: "HR",
            task: "Staff training program",
            duration: "4 weeks",
            status: "pending"
          },
          {
            id: "task-1-5",
            department: "Finance",
            task: "ROI tracking setup",
            duration: "2 weeks",
            status: "pending"
          }
        ]
      },
      {
        id: "option-2",
        title: "Supply Chain Restructuring",
        description: "Restructure the supply chain by consolidating suppliers and implementing just-in-time delivery systems.",
        timeToImplement: "5-6 months",
        costReduction: "18% cost reduction",
        additionalMetrics: [
          {
            label: "Supplier Reduction",
            value: "65% fewer suppliers"
          },
          {
            label: "Inventory Reduction",
            value: "38%"
          }
        ],
        nodes: [
          { id: "node-1", label: "Supplier Hub", type: "start", position: { x: 50, y: 100 }, status: { type: "new", label: "+ New Process" } },
          { id: "node-2", label: "JIT Delivery System", type: "process", position: { x: 200, y: 100 }, status: { type: "new", label: "+ New Process" } },
          { id: "node-3", label: "Quality Control", type: "process", position: { x: 350, y: 100 } },
          { id: "node-4", label: "Unified Production", type: "process", position: { x: 500, y: 100 }, status: { type: "new", label: "+ New Process" } },
          { id: "node-6", label: "Packaging", type: "process", position: { x: 650, y: 100 } },
          { id: "node-7", label: "Distribution Center", type: "end", position: { x: 800, y: 100 } }
        ],
        edges: [
          { id: "edge-1", source: "node-1", target: "node-2", label: "Scheduled Deliveries", flowType: "optimized" },
          { id: "edge-2", source: "node-2", target: "node-3", label: "Material Inspection", flowType: "optimized" },
          { id: "edge-3", source: "node-3", target: "node-4", label: "Approved Materials", flowType: "optimized" },
          { id: "edge-4", source: "node-4", target: "node-6", label: "Finished Products", flowType: "optimized" },
          { id: "edge-5", source: "node-6", target: "node-7", label: "Shipping" }
        ],
        financialImpact: [
          {
            metricName: "Annual Operating Costs",
            current: 8750000,
            projected: 7175000,
            change: -18,
            unit: "$"
          },
          {
            metricName: "Process Time",
            current: 14.5,
            projected: 10.2,
            change: -30,
            unit: "days"
          },
          {
            metricName: "Resource Utilization",
            current: 73,
            projected: 85,
            change: 16,
            unit: "%"
          },
          {
            metricName: "Regulatory Risk",
            current: 63,
            projected: 42,
            change: -33,
            unit: "%"
          }
        ],
        implementationPlan: [
          {
            id: "task-2-1",
            department: "Procurement",
            task: "Supplier consolidation",
            duration: "8 weeks",
            status: "pending"
          },
          {
            id: "task-2-2",
            department: "Logistics",
            task: "JIT delivery implementation",
            duration: "6 weeks",
            status: "pending"
          },
          {
            id: "task-2-3",
            department: "Operations",
            task: "Production line redesign",
            duration: "7 weeks",
            status: "pending"
          },
          {
            id: "task-2-4",
            department: "IT",
            task: "Supply chain management software",
            duration: "5 weeks",
            status: "pending"
          },
          {
            id: "task-2-5",
            department: "Finance",
            task: "New cost structure implementation",
            duration: "3 weeks",
            status: "pending"
          }
        ]
      }
    ]
  }
};

// Generate a response message based on the query
const generateChatResponse = (query: string): string => {
  // In a real system, this would be generated by an AI model
  // For now, we'll use a template response
  return `I've analyzed your request about "${query}" and generated optimization options. You can review the detailed business flow analysis, along with two alternative optimization strategies: Process Automation Strategy (22% cost reduction) and Supply Chain Restructuring (18% cost reduction). Each option includes financial impacts and an implementation plan.`;
};

export async function POST(request: NextRequest) {
  try {
    // Get the external API endpoint from environment variables
    // Fall back to the specific URL if not defined
    const externalApiEndpoint = process.env.EXTERNAL_API_ENDPOINT || 'http://13.82.95.209/api/optimization';
    
    // Get the JSON body from the incoming request
    const body = await request.json();

    // Forward the request to the external API
    const response = await fetch(externalApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Get the response data
    const data = await response.json();

    // Return the response from the external API
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Error in API proxy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from external API' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}