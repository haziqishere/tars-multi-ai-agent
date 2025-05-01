from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field

# Request Models
class OptimizationRequest(BaseModel):
    query: str = Field(..., description="User input message describing the business process or optimization request")

# Response Models - Node
class NodePosition(BaseModel):
    x: float
    y: float

class NodeStatus(BaseModel):
    type: str  # "critical", "new", "warning", etc.
    label: str

class Node(BaseModel):
    id: str
    label: str
    type: Optional[str] = None  # "start", "process", "end", etc.
    position: Optional[NodePosition] = None
    status: Optional[NodeStatus] = None
    data: Optional[Dict[str, Any]] = None

# Response Models - Edge
class Edge(BaseModel):
    id: str
    source: str  # ID of source node
    target: str  # ID of target node
    label: Optional[str] = None
    flowType: Optional[str] = None  # "critical", "optimized", "standard", etc.
    data: Optional[Dict[str, Any]] = None

# Response Models - Analytics
class AnalyticsTrends(BaseModel):
    costTrend: str  # "increasing", "decreasing", "stable"
    efficiencyTrend: str  # "improving", "worsening", "stable"
    timeTrend: str  # "increasing", "decreasing", "stable"
    riskTrend: str  # "improving", "worsening", "stable"

class AnalyticsData(BaseModel):
    currentAnnualCost: float
    efficiencyRating: float
    averageProcessTime: float
    riskAssessment: float
    trends: AnalyticsTrends

# Response Models - News and Impact
class NewsItem(BaseModel):
    id: str
    title: str
    date: str
    impact: str  # "positive", "negative", "neutral"
    description: str

class ImpactItem(BaseModel):
    id: str
    title: str
    description: str
    probability: float  # 0-100
    impact: float  # 0-100

class NewsAndImpact(BaseModel):
    newsItems: List[NewsItem]
    impactItems: List[ImpactItem]

# Response Models - Business Flow
class BusinessFlow(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

# Response Models - Financial Impact
class FinancialImpact(BaseModel):
    metricName: str
    current: float
    projected: float
    change: float  # Percentage change
    unit: str  # "$", "%", "days", etc.

# Response Models - Implementation Task
class ImplementationTask(BaseModel):
    id: str
    department: str
    task: str
    duration: str
    status: str  # "pending", "in-progress", "completed"

# Response Models - Option Metric
class OptionMetric(BaseModel):
    label: str
    value: str

# Response Models - Option
class Option(BaseModel):
    id: str
    title: str
    description: str
    timeToImplement: str
    costReduction: str
    additionalMetrics: Optional[List[OptionMetric]] = None
    nodes: List[Node]
    edges: List[Edge]
    financialImpact: List[FinancialImpact]
    implementationPlan: List[ImplementationTask]

# Response Models - Analysis
class Analysis(BaseModel):
    businessFlow: BusinessFlow
    analytics: AnalyticsData
    newsAndImpact: NewsAndImpact

# Response Models - Recommendations
class Recommendations(BaseModel):
    options: List[Option]

# Response Models - Summary Card

# Summary Card - Business Operations Flow Step
class BusinessOperationsFlowStep(BaseModel):
    id: str
    description: str
    department: str

# Summary Card - Business Operations Flow
class BusinessOperationsFlow(BaseModel):
    summary: str
    steps: List[BusinessOperationsFlowStep]

# Summary Card - Department Task
class DepartmentTask(BaseModel):
    id: str
    description: str
    priority: str  # "high", "medium", "low"
    deadline: str  # ISO date format

# Summary Card - Email Template
class EmailTemplate(BaseModel):
    to: str
    recipient: str
    department: str
    subject: str
    body: str

# Summary Card - Department
class Department(BaseModel):
    id: str
    department: str
    manager: str
    email: str
    tasks: List[DepartmentTask]
    emailTemplate: EmailTemplate

# Summary Card
class SummaryCard(BaseModel):
    businessOperationsFlow: BusinessOperationsFlow
    departments: List[Department]

# Main Response Model
class OptimizationResponse(BaseModel):
    analysis: Analysis
    recommendations: Recommendations
    chatResponse: str
    summaryCard: Optional[SummaryCard] = None

# Error Response Model
class ErrorResponse(BaseModel):
    error: str