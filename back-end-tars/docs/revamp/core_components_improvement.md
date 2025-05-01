"""Create analytics data"""
    # Extract from contexts to find metrics
    internal_context = agent3_data.get("internal_context", "")
    enhanced_answer = agent3_data.get("enhanced_answer", "")
    
    # Try to extract financial metrics
    cost_match = re.search(r"(?:cost|expense|budget)[:\s]+\$?(\d[\d,\.]*\d)(?:k|m)?", 
                          internal_context + enhanced_answer, re.IGNORECASE)
    
    current_annual_cost = 0
    if cost_match:
        cost_str = cost_match.group(1).replace(",", "")
        try:
            current_annual_cost = float(cost_str)
            # Adjust for k/m notation
            if "k" in cost_match.group(0).lower():
                current_annual_cost *= 1000
            elif "m" in cost_match.group(0).lower():
                current_annual_cost *= 1000000
        except ValueError:
            current_annual_cost = 5000000  # Fallback
    else:
        current_annual_cost = 5000000  # Fallback
    
    # Try to extract efficiency rating
    efficiency_match = re.search(r"(?:efficiency|productive|performance)[:\s]+(\d+)%?", 
                               internal_context + enhanced_answer, re.IGNORECASE)
    efficiency_rating = int(efficiency_match.group(1)) if efficiency_match else 65
    
    # Try to extract process time
    time_match = re.search(r"(?:time|duration|cycle)[:\s]+(\d+\.?\d*)(?:\s+(?:days|hours|weeks))?", 
                          internal_context + enhanced_answer, re.IGNORECASE)
    avg_process_time = float(time_match.group(1)) if time_match else 12.5
    
    # Try to extract risk assessment
    risk_match = re.search(r"(?:risk|vulnerability|exposure)[:\s]+(\d+)%?", 
                          internal_context + enhanced_answer, re.IGNORECASE)
    risk_assessment = int(risk_match.group(1)) if risk_match else 45
    
    # Determine trends based on context
    cost_trend = "increasing"
    if "reduce cost" in enhanced_answer.lower() or "cost reduction" in enhanced_answer.lower():
        cost_trend = "decreasing"
    
    efficiency_trend = "stable"
    if "improve efficiency" in enhanced_answer.lower() or "efficiency gain" in enhanced_answer.lower():
        efficiency_trend = "improving"
    
    time_trend = "stable"
    if "faster" in enhanced_answer.lower() or "reduce time" in enhanced_answer.lower():
        time_trend = "decreasing"
    
    risk_trend = "stable"
    if "mitigate risk" in enhanced_answer.lower() or "reduce risk" in enhanced_answer.lower():
        risk_trend = "improving"
    
    return {
        "currentAnnualCost": current_annual_cost,
        "efficiencyRating": efficiency_rating,
        "averageProcessTime": avg_process_time,
        "riskAssessment": risk_assessment,
        "trends": {
            "costTrend": cost_trend,
            "efficiencyTrend": efficiency_trend,
            "timeTrend": time_trend,
            "riskTrend": risk_trend
        }
    }

def create_news_impact(agent3_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create news and impact data"""
    external_context = agent3_data.get("external_context", "")
    enhanced_answer = agent3_data.get("enhanced_answer", "")
    
    news_items = []
    impact_items = []
    
    # Extract news items from external context
    news_sections = re.split(r'\n\d+\.', external_context)
    
    for i, section in enumerate(news_sections[1:], 1):  # Skip the first split which is before any numbers
        if not section.strip():
            continue
            
        # Extract title and description
        lines = section.strip().split("\n")
        title = lines[0].strip() if lines else f"Industry Update {i}"
        description = " ".join(lines[1:]).strip() if len(lines) > 1 else section.strip()
        
        # Determine impact
        impact = "neutral"
        if any(word in section.lower() for word in ["positive", "increase", "growth", "opportunity", "improvement"]):
            impact = "positive"
        elif any(word in section.lower() for word in ["negative", "decrease", "decline", "risk", "threat", "problem"]):
            impact = "negative"
        
        # Generate a date (recent)
        month = datetime.now().strftime("%B")
        day = min(28, (i * 3) % 28)
        year = datetime.now().year
        date = f"{month} {day}, {year}"
        
        news_items.append({
            "id": f"news-{i}",
            "title": title,
            "date": date,
            "impact": impact,
            "description": description[:200]  # Limit length
        })
        
        # Only include up to 3 news items
        if len(news_items) >= 3:
            break
    
    # If no news items found, create fallback
    if not news_items:
        news_items = [
            {
                "id": "news-1",
                "title": "Industry Trends Report Released",
                "date": datetime.now().strftime("%B %d, %Y"),
                "impact": "neutral",
                "description": "New industry report highlights changing market dynamics and opportunities for optimization."
            }
        ]
    
    # Extract impact items from the enhanced answer
    # Look for sections about implications, impacts, risks, etc.
    impact_sections = []
    
    # Look for potential impact statements
    lines = enhanced_answer.split("\n")
    in_impact_section = False
    current_section = ""
    
    for line in lines:
        # Check if this is a heading for impacts, risks, etc.
        if re.match(r"^#+\s+(?:impact|risk|implication|consideration)", line, re.IGNORECASE):
            if current_section:
                impact_sections.append(current_section)
            current_section = line
            in_impact_section = True
        elif in_impact_section:
            # Check if this is a new heading (but not an impact heading)
            if re.match(r"^#+\s+", line) and not re.match(r"^#+\s+(?:impact|risk|implication|consideration)", line, re.IGNORECASE):
                in_impact_section = False
                if current_section:
                    impact_sections.append(current_section)
                current_section = ""
            else:
                current_section += "\n" + line
    
    # Add the last section if it exists
    if current_section and in_impact_section:
        impact_sections.append(current_section)
    
    # If no specific sections found, look for bullet points that might be impacts
    if not impact_sections:
        for line in lines:
            if re.match(r"^[-*]\s+", line) and len(line) > 10:
                impact_sections.append(line)
    
    # Create impact items from the sections
    for i, section in enumerate(impact_sections, 1):
        if len(impact_items) >= 3:  # Limit to 3 items
            break
            
        # Extract title and description
        section_lines = section.strip().split("\n")
        title = section_lines[0].strip()
        # Remove markdown heading symbols
        title = re.sub(r"^#+\s+", "", title)
        # Remove bullet point symbols
        title = re.sub(r"^[-*]\s+", "", title)
        
        description = " ".join(section_lines[1:]).strip() if len(section_lines) > 1 else ""
        if not description:
            description = title
            title = f"Impact Factor {i}"
        
        # Generate probability and impact scores
        probability = 50 + (i * 10) % 40  # Range from 50-90
        impact_score = 60 + (i * 15) % 35  # Range from 60-95
        
        impact_items.append({
            "id": f"impact-{i}",
            "title": title,
            "description": description[:200],  # Limit length
            "probability": probability,
            "impact": impact_score
        })
    
    # If no impact items found, create fallback
    if not impact_items:
        impact_items = [
            {
                "id": "impact-1",
                "title": "Process Efficiency Improvement",
                "description": "Implementing the recommended changes could lead to significant process efficiency improvements.",
                "probability": 75,
                "impact": 80
            },
            {
                "id": "impact-2",
                "title": "Cost Reduction",
                "description": "Potential for 15-20% cost reduction through optimization of resource allocation.",
                "probability": 70,
                "impact": 85
            }
        ]
    
    return {
        "newsItems": news_items,
        "impactItems": impact_items
    }

def create_options(agent4_data: Dict[str, Any], agent5_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Create recommendation options"""
    branches = agent4_data.get("branches", {})
    selected_branch = agent4_data.get("selected_branch", "B")
    
    options = []
    
    # Process each branch (A, B, C) into an option
    for branch_id in ["A", "B", "C"]:
        branch_data = branches.get(branch_id, {})
        if not branch_data:
            continue
            
        # Determine if this is the selected/recommended branch
        is_selected = branch_id == selected_branch
        
        # Create nodes and edges for this option (simplified flow)
        option_nodes = []
        option_edges = []
        
        # Generate sample process flow based on action items
        action_items = branch_data.get("action_items", [])
        
        # Ensure we have at least some action items
        if not action_items:
            action_items = [
                "Analyze current process",
                "Implement improvements",
                "Monitor results"
            ]
        
        # Create a simple flow from start to end with these items as nodes
        width = 800
        height = 200
        step_width = width / (len(action_items) + 2)  # +2 for start/end
        
        # Add start node
        option_nodes.append({
            "id": "node-1",
            "label": "Start",
            "type": "start",
            "position": {"x": step_width, "y": height / 2}
        })
        
        # Add action item nodes
        for i, item in enumerate(action_items, 2):
            option_nodes.append({
                "id": f"node-{i}",
                "label": item,
                "type": "process",
                "position": {"x": i * step_width, "y": height / 2}
            })
        
        # Add end node
        option_nodes.append({
            "id": f"node-{len(action_items) + 2}",
            "label": "End",
            "type": "end",
            "position": {"x": (len(action_items) + 2) * step_width, "y": height / 2}
        })
        
        # Create edges connecting all nodes in sequence
        for i in range(1, len(option_nodes)):
            option_edges.append({
                "id": f"edge-{i}",
                "source": f"node-{i}",
                "target": f"node-{i + 1}",
                "label": f"Step {i}",
                "flowType": "optimized" if is_selected else "standard"
            })
        
        # Create financial impact metrics
        cost = branch_data.get("cost", 100000 * (1 + int(branch_id.replace("A", "1").replace("B", "2").replace("C", "3"))))
        time = branch_data.get("time", 3 * int(branch_id.replace("A", "1").replace("B", "2").replace("C", "3")))
        
        # Calculate projected costs and metrics based on branch data
        current_annual_cost = 5000000  # Default
        cost_reduction_pct = 0
        
        if branch_id == "A":
            cost_reduction_pct = 10  # Conservative
        elif branch_id == "B":
            cost_reduction_pct = 20  # Balanced
        elif branch_id == "C":
            cost_reduction_pct = 30  # Aggressive
        
        projected_cost = current_annual_cost * (1 - cost_reduction_pct / 100)
        
        financial_impact = [
            {
                "metricName": "Annual Operating Costs",
                "current": current_annual_cost,
                "projected": projected_cost,
                "change": -cost_reduction_pct,
                "unit": "$"
            },
            {
                "metricName": "Process Time",
                "current": 14.5,
                "projected": 14.5 * (1 - cost_reduction_pct / 100),
                "change": -cost_reduction_pct,
                "unit": "days"
            }
        ]
        
        # Create implementation plan
        implementation_plan = []
        departments = ["IT", "Operations", "Finance", "HR"]
        
        for i, item in enumerate(action_items, 1):
            dept = departments[i % len(departments)]
            implementation_plan.append({
                "id": f"task-{branch_id}-{i}",
                "department": dept,
                "task": item,
                "duration": f"{(i + 1) * 2} weeks",
                "status": "pending"
            })
        
        # Create the option
        summary = branch_data.get("summary", f"Option {branch_id}")
        if len(summary) < 10:
            summary = f"Option {branch_id}: {summary}"
            
        # Use first pros as part of description if summary is too short
        description = summary
        if len(description) < 30 and branch_data.get("pros"):
            description += f" - {branch_data.get('pros')[0]}"
        
        options.append({
            "id": f"option-{branch_id}",
            "title": summary,
            "description": description,
            "timeToImplement": f"{time} months",
            "costReduction": f"{cost_reduction_pct}% cost reduction",
            "additionalMetrics": [
                {
                    "label": "Implementation Cost",
                    "value": f"${cost:,}"
                },
                {
                    "label": "ROI",
                    "value": f"{int(200 - cost / (cost_reduction_pct * current_annual_cost / 100) * 100)}% in 12 months"
                }
            ],
            "nodes": option_nodes,
            "edges": option_edges,
            "financialImpact": financial_impact,
            "implementationPlan": implementation_plan
        })
    
    # If no options were created, provide a fallback
    if not options:
        options = [
            {
                "id": "option-1",
                "title": "Process Optimization Strategy",
                "description": "Implement process improvements to reduce costs and improve efficiency",
                "timeToImplement": "3-6 months",
                "costReduction": "15% cost reduction",
                "additionalMetrics": [
                    {
                        "label": "ROI",
                        "value": "125% in 12 months"
                    },
                    {
                        "label": "Risk Reduction",
                        "value": "30%"
                    }
                ],
                "nodes": [
                    {"id": "node-1", "label": "Start", "type": "start", "position": {"x": 100, "y": 100}},
                    {"id": "node-2", "label": "Process Analysis", "type": "process", "position": {"x": 250, "y": 100}},
                    {"id": "node-3", "label": "Implement Changes", "type": "process", "position": {"x": 400, "y": 100}},
                    {"id": "node-4", "label": "Monitor Results", "type": "process", "position": {"x": 550, "y": 100}},
                    {"id": "node-5", "label": "End", "type": "end", "position": {"x": 700, "y": 100}}
                ],
                "edges": [
                    {"id": "edge-1", "source": "node-1", "target": "node-2", "label": "Step 1"},
                    {"id": "edge-2", "source": "node-2", "target": "node-3", "label": "Step 2"},
                    {"id": "edge-3", "source": "node-3", "target": "node-4", "label": "Step 3"},
                    {"id": "edge-4", "source": "node-4", "target": "node-5", "label": "Step 4"}
                ],
                "financialImpact": [
                    {
                        "metricName": "Annual Operating Costs",
                        "current": 5000000,
                        "projected": 4250000,
                        "change": -15,
                        "unit": "$"
                    },
                    {
                        "metricName": "Process Time",
                        "current": 14.5,
                        "projected": 10.2,
                        "change": -30,
                        "unit": "days"
                    }
                ],
                "implementationPlan": [
                    {
                        "id": "task-1",
                        "department": "IT",
                        "task": "Implement system updates",
                        "duration": "4 weeks",
                        "status": "pending"
                    },
                    {
                        "id": "task-2",
                        "department": "Operations",
                        "task": "Process restructuring",
                        "duration": "6 weeks",
                        "status": "pending"
                    },
                    {
                        "id": "task-3",
                        "department": "HR",
                        "task": "Staff training",
                        "duration": "3 weeks",
                        "status": "pending"
                    }
                ]
            }
        ]
    
    return options


# app/utils/config.py
from pydantic_settings import BaseSettings
import os
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables with defaults"""
    
    # API settings
    APP_NAME: str = "TARS Multi-Agent System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server settings
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Azure settings
    AZURE_CONN_STRING: str = os.getenv("AZURE_CONN_STRING", "")
    AGENT1_ID: str = os.getenv("AGENT1_ID", "")
    AGENT2_ID: str = os.getenv("AGENT2_ID", "")
    AGENT3_ID: str = os.getenv("AGENT3_ID", "")
    AGENT4_ID: str = os.getenv("AGENT4_ID", "")
    AGENT5_ID: str = os.getenv("AGENT5_ID", "")
    
    # Search API keys
    SEARCH1API_KEY: Optional[str] = os.getenv("SEARCH1API_KEY", "")
    
    # Timeout settings (in seconds)
    AGENT1_TIMEOUT: int = 25
    AGENT2_TIMEOUT: int = 20
    AGENT2_SUMMARY_TIMEOUT: int = 10
    AGENT3_INITIAL_TIMEOUT: int = 15
    AGENT3_EVAL_TIMEOUT: int = 10
    AGENT3_FORMULATE_TIMEOUT: int = 10
    AGENT3_ENHANCE_TIMEOUT: int = 20
    AGENT4_QUESTIONS_TIMEOUT: int = 10
    AGENT4_BRANCHES_TIMEOUT: int = 20
    AGENT4_PREDICTION_TIMEOUT: int = 15
    AGENT5_PARSE_TIMEOUT: int = 10
    AGENT5_ASSIGN_TIMEOUT: int = 10
    AGENT5_EMAIL_TIMEOUT: int = 10
    
    # Cross-Origin Resource Sharing settings
    CORS_ORIGINS: list = ["*"]
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()


# app/utils/logging.py
import logging
import sys
from typing import Optional

def get_logger(name: str) -> logging.Logger:
    """Configure and return a logger for the given name"""
    logger = logging.getLogger(f"tars.{name}")
    
    # Only configure if it hasn't been configured yet
    if not logger.handlers:
        # Configure handler to print to stdout
        handler = logging.StreamHandler(sys.stdout)
        
        # Format the log messages with name and colors
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        
        # Add the handler to the logger
        logger.addHandler(handler)
        
        # Set level (could be configurable)
        logger.setLevel(logging.INFO)
        
        # Don't propagate to root logger
        logger.propagate = False
    
    return logger


# app/utils/azure_helpers.py
def extract_message(messages: list) -> str:
    """Extract the assistant message from the thread"""
    for msg in reversed(messages):
        if msg.get("role") == "assistant":
            content = msg.get("content", [])
            if content and isinstance(content, list):
                return content[0].get("text", {}).get("value", "").strip()
    return ""


# app/main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
import json
from typing import Dict, Any, List, Optional

from app.utils.config import settings
from app.utils.logging import get_logger
from app.process_manager import ProcessManager
from app.agents.agent1_enterprise_knowledge import EnterpriseKnowledgeAgent
from app.agents.agent2_global_intel import GlobalIntelligenceAgent
from app.agents.agent3_consultant import ConsultantAgent
from app.agents.agent4_outcome_predictor import OutcomePredictorAgent
from app.agents.agent5_task_dispatcher import TaskDispatcherAgent

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Get application logger
logger = get_logger("main")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="API for the TARS Multi-Agent System",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Request bodies
class OptimizationRequest(Dict[str, str]):
    pass

# Initialize agents and process manager
def initialize_process_manager():
    """Initialize agents and process manager"""
    logger.info("Initializing agents and process manager")
    
    # Create a temporary manager to allow agent3 and agent4 to be initialized with it
    temp_manager = {}
    
    # Initialize agents
    agent1 = EnterpriseKnowledgeAgent()
    agent2 = GlobalIntelligenceAgent()
    
    # Create the process manager
    process_manager = ProcessManager({
        "agent1": agent1,
        "agent2": agent2
    })
    
    # Now we can create agent3 and agent4 with the process_manager
    agent3 = ConsultantAgent(process_manager)
    agent4 = OutcomePredictorAgent(process_manager)
    agent5 = TaskDispatcherAgent()
    
    # Update the process_manager with all agents
    process_manager.agents.update({
        "agent3": agent3,
        "agent4": agent4,
        "agent5": agent5
    })
    
    return process_manager

# Initialize process manager on startup
process_manager = initialize_process_manager()

# Middleware for request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for all routes"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)}
    )

# API Routes
@app.post("/api/optimization")
async def optimize(request: OptimizationRequest):
    """
    Process an optimization request.
    
    This endpoint receives a user query about business process optimization,
    processes it through the multi-agent system, and returns a comprehensive
    analysis with recommendations.
    """
    try:
        query = request.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Query parameter is required")
        
        logger.info(f"Received optimization request: {query[:100]}...")
        
        # Process the request through the agent pipeline
        result = await process_manager.process_request(query)
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing optimization request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process optimization request: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": settings.APP_VERSION}

if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
# app/agents/base.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
import asyncio
from datetime import datetime

class Agent(ABC):
    """Base interface for all TARS agents"""
    
    def __init__(self):
        self.logger = logging.getLogger(f"tars.agent.{self.name.lower().replace(' ', '_')}")
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process input data and return results.
        
        Args:
            input_data: The data to process
            context: Shared context with data from other agents
            
        Returns:
            Dict with processing results
        """
        pass
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Return the agent's name"""
        pass
    
    async def _handle_timeout(self, coro, timeout_seconds, fallback_data=None):
        """Helper method to handle timeouts with fallback"""
        try:
            return await asyncio.wait_for(coro, timeout=timeout_seconds)
        except asyncio.TimeoutError:
            self.logger.warning(f"Operation timed out after {timeout_seconds}s")
            return fallback_data or {"error": f"Operation timed out after {timeout_seconds}s"}
        except Exception as e:
            self.logger.error(f"Error during operation: {str(e)}")
            return fallback_data or {"error": str(e)}


# app/agents/agent1_enterprise_knowledge.py
from typing import Dict, Any
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
import os
import time
from datetime import datetime
import asyncio

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.logging import get_logger

class EnterpriseKnowledgeAgent(Agent):
    """Agent 1: Retrieves information from internal company documents"""
    
    def __init__(self):
        super().__init__()
        self.logger = get_logger("agent1")
        self.client = None
        self.agent = None
        
    @property
    def name(self) -> str:
        return "Enterprise Knowledge Agent"
    
    async def setup_client(self):
        """Create client connection (async-friendly wrapper)"""
        if self.client is None or self.agent is None:
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._setup_client)
    
    def _setup_client(self):
        """Actual setup logic (runs in thread pool)"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=settings.AZURE_CONN_STRING
        )
        self.agent = self.client.agents.get_agent(settings.AGENT1_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a question using the enterprise knowledge base"""
        question = input_data.get("question", "")
        caller = input_data.get("caller", "Agent3")
        
        self.logger.info(f"📥 Received from {caller}: {question}")
        
        # Setup client if needed
        await self.setup_client()
        
        # Process request with timeout handling
        result = await self._handle_timeout(
            self._process_request(question),
            timeout_seconds=settings.AGENT1_TIMEOUT,
            fallback_data={"response": f"Unable to retrieve information about '{question}' within time limit"}
        )
        
        # Prepare return data
        response_data = {
            "question": question,
            "response": result.get("response", "No response generated"),
            "timestamp": datetime.now().isoformat(),
            "caller": caller
        }
        
        return response_data
    
    async def _process_request(self, question: str) -> Dict[str, Any]:
        """Core processing logic as async coroutine"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            # Create a thread
            thread = await loop.run_in_executor(
                None, 
                lambda: self.client.agents.create_thread()
            )
            self.logger.info(f"Created thread {thread.id}")
            
            # Create message
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=question)
            )
            
            # Create and process run
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Poll for completion
            max_wait = settings.AGENT1_TIMEOUT - 1  # Leave 1s buffer
            waited = 0
            run_status = None
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                run_status = run.status
                self.logger.info(f"Status: {run_status}")
                
                if run_status == RunStatus.COMPLETED:
                    msgs = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    response = self._extract_message(msgs)
                    return {"response": response or "Empty response from knowledge base"}
                
                if run_status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run_status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": f"Timeout waiting for completion", "status": run_status}
            
        except Exception as e:
            self.logger.error(f"Error processing request: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                    self.logger.info(f"Cleaned up thread {thread.id}")
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    def _extract_message(self, messages: list) -> str:
        """Extract the assistant message from the thread"""
        for msg in reversed(messages):
            if msg.get("role") == "assistant":
                content = msg.get("content", [])
                if content and isinstance(content, list):
                    return content[0].get("text", {}).get("value", "").strip()
        return ""


# app/agents/agent2_global_intel.py
from typing import Dict, Any
import os
import re
import json
import asyncio
import aiohttp
import logging
import warnings
from datetime import datetime

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.logging import get_logger

class GlobalIntelligenceAgent(Agent):
    """Agent 2: Searches for external information using search services"""
    
    def __init__(self):
        super().__init__()
        self.logger = get_logger("agent2")
        
    @property
    def name(self) -> str:
        return "Global Intelligence Agent"
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a search query"""
        query = input_data.get("query", "")
        self.logger.info(f"🔍 Processing search query: {query}")
        
        # Extract clean search query
        clean_query = self._extract_search_query(query)
        
        # Search with timeout and fallback
        search_results = await self._handle_timeout(
            self._search(clean_query),
            timeout_seconds=settings.AGENT2_TIMEOUT,
            fallback_data={"results": []}
        )
        
        # Filter and summarize results
        summary = await self._handle_timeout(
            self._summarize_results(search_results, clean_query),
            timeout_seconds=settings.AGENT2_SUMMARY_TIMEOUT,
            fallback_data={"summary": f"Unable to find relevant information about '{clean_query}'"}
        )
        
        return {
            "query": query,
            "clean_query": clean_query,
            "results": search_results.get("results", []),
            "summary": summary.get("summary", "No summary available"),
            "timestamp": datetime.now().isoformat()
        }
    
    def _extract_search_query(self, message: str) -> str:
        """Extract clean query from user message"""
        m = re.match(r'^(search(?: for)?\s+)(.*)$', message, re.IGNORECASE)
        q = m.group(2).strip() if m else message.strip()
        return re.sub(r'\s+', ' ', q)
    
    async def _search(self, query: str) -> Dict[str, Any]:
        """Perform search using available providers"""
        self.logger.info(f"🔍 Searching for: {query}")
        
        # Try primary search provider (using Search1API for simplicity)
        try:
            results = await self._search1api(query)
            if results:
                self.logger.info(f"✅ Search returned {len(results)} results")
                return {"results": results}
        except Exception as e:
            self.logger.error(f"❌ Primary search error: {e}")
        
        # Fallback search as needed
        self.logger.warning("⚠️ Primary search failed, trying fallback")
        try:
            results = await self._fallback_search(query)
            if results:
                self.logger.info(f"✅ Fallback search returned {len(results)} results")
                return {"results": results}
        except Exception as e:
            self.logger.error(f"❌ Fallback search error: {e}")
        
        # Return empty results if all searches fail
        return {"results": []}
    
    async def _search1api(self, query: str, max_results: int = 5) -> list:
        """Search using Search1API"""
        api_key = settings.SEARCH1API_KEY
        if not api_key:
            raise ValueError('SEARCH1API_KEY not set')
        
        url = 'https://api.search1api.com/search'
        headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
        payload = {'query': query, 'search_service': 'google', 'max_results': max_results}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, ssl=False) as response:
                if response.status != 200:
                    text = await response.text()
                    raise Exception(f"Search API returned status {response.status}: {text}")
                
                data = await response.json()
                return data.get('results', [])
    
    async def _fallback_search(self, query: str) -> list:
        """Fallback search implementation"""
        # In a production system, this would be a different search provider
        # For this example, we'll return mock results
        return [
            {
                "title": f"Mock result for '{query}'",
                "description": "This is a fallback search result when primary search fails",
                "url": "https://example.com/result1"
            },
            {
                "title": f"Alternative information about '{query}'",
                "description": "Another fallback search result with different information",
                "url": "https://example.com/result2"
            }
        ]
    
    async def _summarize_results(self, search_data: Dict[str, Any], query: str) -> Dict[str, str]:
        """Summarize search results"""
        results = search_data.get("results", [])
        
        if not results:
            return {"summary": f"No information found about '{query}'"}
        
        # In a production system, this would use a summarization model
        # For this example, we'll create a basic summary
        titles = [r.get("title", "") for r in results if r.get("title")]
        descriptions = [r.get("description", "") for r in results if r.get("description")]
        
        summary = f"Found {len(results)} results about '{query}'.\n\n"
        summary += "Key points:\n"
        
        for i, (title, desc) in enumerate(zip(titles[:3], descriptions[:3]), 1):
            summary += f"{i}. {title}: {desc[:100]}...\n"
        
        return {"summary": summary}


# app/agents/agent3_consultant.py
from typing import Dict, Any
import asyncio
import logging
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.azure_helpers import extract_message
from app.utils.logging import get_logger

class ConsultantAgent(Agent):
    """Agent 3: Central coordinator that coordinates analysis and formulates responses"""
    
    def __init__(self, agent_manager):
        super().__init__()
        self.logger = get_logger("agent3")
        self.agent_manager = agent_manager  # Reference to agent manager for calling other agents
        self.client = None
        self.agent = None
    
    @property
    def name(self) -> str:
        return "Consultant Agent"
    
    async def setup_client(self):
        """Create client connection (async-friendly wrapper)"""
        if self.client is None or self.agent is None:
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._setup_client)
    
    def _setup_client(self):
        """Actual setup logic (runs in thread pool)"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=settings.AZURE_CONN_STRING
        )
        self.agent = self.client.agents.get_agent(settings.AGENT3_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a query by coordinating with other agents"""
        query = input_data.get("query", "")
        self.logger.info(f"📥 Processing query: {query}")
        
        # Setup Azure client
        await self.setup_client()
        
        # Step 1: Generate initial response
        initial_response = await self._handle_timeout(
            self._generate_initial_response(query),
            timeout_seconds=settings.AGENT3_INITIAL_TIMEOUT,
            fallback_data={"answer": f"I'm analyzing your query about '{query}'..."}
        )
        
        # Step 2: Evaluate if additional context is needed
        context_evaluation = await self._handle_timeout(
            self._evaluate_context_need(query, initial_response.get("answer", "")),
            timeout_seconds=settings.AGENT3_EVAL_TIMEOUT,
            fallback_data={"evaluation": "Needs both internal and external context"}
        )
        
        evaluation = context_evaluation.get("evaluation", "").lower()
        self.logger.info(f"🔍 Context evaluation: {evaluation}")
        
        # Step 3: Get internal company documents if needed
        internal_context = ""
        if "internal" in evaluation:
            # Formulate questions for internal knowledge
            internal_questions = await self._handle_timeout(
                self._formulate_internal_questions(query),
                timeout_seconds=settings.AGENT3_FORMULATE_TIMEOUT,
                fallback_data={"questions": query}
            )
            
            # Request information from Agent 1
            internal_result = await self.agent_manager.call_agent(
                "agent1",
                {"question": internal_questions.get("questions", query), "caller": "Agent3"}
            )
            
            internal_context = internal_result.get("response", "")
            self.logger.info(f"📄 Received internal context ({len(internal_context)} chars)")
        
        # Step 4: Get external search results if needed
        external_context = ""
        if "external" in evaluation:
            # Formulate search query
            search_query = await self._handle_timeout(
                self._formulate_search_questions(query),
                timeout_seconds=settings.AGENT3_FORMULATE_TIMEOUT,
                fallback_data={"search_query": query}
            )
            
            # Request information from Agent 2
            external_result = await self.agent_manager.call_agent(
                "agent2",
                {"query": search_query.get("search_query", query)}
            )
            
            external_context = external_result.get("summary", "")
            self.logger.info(f"🌐 Received external context ({len(external_context)} chars)")
        
        # Step 5: Generate final enhanced response
        enhanced_response = await self._handle_timeout(
            self._generate_enhanced_response(query, initial_response.get("answer", ""), internal_context, external_context),
            timeout_seconds=settings.AGENT3_ENHANCE_TIMEOUT,
            fallback_data={"enhanced_answer": initial_response.get("answer", "")}
        )
        
        return {
            "query": query,
            "initial_answer": initial_response.get("answer", ""),
            "context_evaluation": evaluation,
            "internal_context": internal_context,
            "external_context": external_context,
            "enhanced_answer": enhanced_response.get("enhanced_answer", ""),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_initial_response(self, query: str) -> Dict[str, str]:
        """Generate initial response without additional context"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            # Create thread
            thread = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_thread()
            )
            
            # Create message with the query
            prompt_initial = f"You are a strategic consultant. Answer clearly and directly:\n\n{query}"
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt_initial)
            )
            
            # Create and process run
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_INITIAL_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    answer = extract_message(messages)
                    return {"answer": answer}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating initial response: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _evaluate_context_need(self, question: str, initial_answer: str) -> Dict[str, str]:
        """Evaluate if additional context is needed"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/evaluation.txt", "r", encoding="utf-8") as f:
                eval_prompt = f.read().format(question=question, initial_answer=initial_answer)
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=eval_prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_EVAL_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    evaluation = extract_message(messages).lower().strip()
                    return {"evaluation": evaluation}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error evaluating context need: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _formulate_internal_questions(self, original_question: str) -> Dict[str, str]:
        """Formulate questions for internal documents"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/formulate_internal.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(original_question=original_question)
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_FORMULATE_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    questions = extract_message(messages)
                    self.logger.info(f"🔍 Generated internal questions: {questions}")
                    return {"questions": questions}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error formulating internal questions: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _formulate_search_questions(self, original_question: str) -> Dict[str, str]:
        """Formulate search query for external information"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/formulate_search.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(original_question=original_question)
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_FORMULATE_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    search_query = extract_message(messages)
                    self.logger.info(f"🔍 Generated search query: {search_query}")
                    return {"search_query": search_query}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error formulating search query: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _generate_enhanced_response(self, question: str, initial_answer: str, 
                                         internal_context: str, external_context: str) -> Dict[str, str]:
        """Generate enhanced response with additional context"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/combiNASHUN.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(
                    question=question,
                    internal_context=internal_context,
                    global_context=external_context,
                    initial_answer=initial_answer
                )
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_ENHANCE_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    enhanced_answer = extract_message(messages)
                    return {"enhanced_answer": enhanced_answer}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating enhanced response: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")


# app/agents/agent4_outcome_predictor.py
from typing import Dict, Any
import asyncio
import logging
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
import json
import re

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.azure_helpers import extract_message
from app.utils.logging import get_logger

class OutcomePredictorAgent(Agent):
    """Agent 4: Predicts outcomes and generates strategic branches"""
    
    def __init__(self, agent_manager):
        super().__init__()
        self.logger = get_logger("agent4")
        self.agent_manager = agent_manager
        self.client = None
        self.agent = None
    
    @property
    def name(self) -> str:
        return "Outcome Predictor Agent"
    
    async def setup_client(self):
        """Create client connection (async-friendly wrapper)"""
        if self.client is None or self.agent is None:
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._setup_client)
    
    def _setup_client(self):
        """Actual setup logic (runs in thread pool)"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=settings.AZURE_CONN_STRING
        )
        self.agent = self.client.agents.get_agent(settings.AGENT4_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process analysis and generate outcome predictions"""
        analysis = input_data.get("analysis", "")
        self.logger.info(f"📥 Processing analysis ({len(analysis)} chars)")
        
        # Setup Azure client
        await self.setup_client()
        
        # Step 1: Generate internal questions based on the analysis
        internal_questions = await self._handle_timeout(
            self._generate_internal_questions(analysis),
            timeout_seconds=settings.AGENT4_QUESTIONS_TIMEOUT,
            fallback_data={"questions": []}
        )
        
        # Step 2: Get internal context from Agent 1
        internal_context = ""
        if internal_questions.get("questions"):
            questions_str = "\n".join(internal_questions.get("questions", []))
            internal_result = await self.agent_manager.call_agent(
                "agent1",
                {"question": questions_str, "caller": "Agent4"}
            )
            internal_context = internal_result.get("response", "")
            self.logger.info(f"📄 Received internal context ({len(internal_context)} chars)")
        
        # Step 3: Generate branch predictions
        branches = await self._handle_timeout(
            self._generate_branches(analysis, internal_context),
            timeout_seconds=settings.AGENT4_BRANCHES_TIMEOUT,
            fallback_data={"branches": {}}
        )
        
        # Step 4: Generate final prediction
        final_prediction = await self._handle_timeout(
            self._generate_final_prediction(analysis, internal_context, branches.get("branches", {})),
            timeout_seconds=settings.AGENT4_PREDICTION_TIMEOUT,
            fallback_data={"prediction": ""}
        )
        
        return {
            "analysis": analysis,
            "internal_context": internal_context,
            "branches": branches.get("branches", {}),
            "final_prediction": final_prediction.get("prediction", ""),
            "selected_branch": final_prediction.get("selected_branch", ""),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_internal_questions(self, strategy: str) -> Dict[str, list]:
        """Generate questions for internal documents based on strategy"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/agent4_doc_inventory.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(action=strategy[:1000])  # Limit to prevent token overflows
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT4_QUESTIONS_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    response = extract_message(messages)
                    
                    # Parse the questions
                    questions = []
                    for line in response.splitlines():
                        line = line.strip()
                        if re.match(r'^\d+\.', line):  # Numbered line
                            question = re.sub(r'^\d+\.\s*', '', line)
                            questions.append(question)
                    
                    self.logger.info(f"🔍 Generated {len(questions)} internal questions")
                    return {"questions": questions}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating internal questions: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _generate_branches(self, strategy: str, internal_context: str) -> Dict[str, dict]:
        """Generate strategic branches based on analysis and context"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/agent4_branches.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(
                    brief=strategy[:2000],  # Limit to prevent token overflows
                    facts=internal_context[:1000]  # Limit to prevent token overflows
                )
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT4_BRANCHES_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    response = extract_message(messages)
                    
                    # Parse the branches
                    branches = self._parse_branches(response)
                    self.logger.info(f"🔍 Generated {len(branches)} branches")
                    return {"branches": branches}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating branches: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    def _parse_branches(self, response: str) -> dict:
        """Parse the branches from the response text"""
        branches = {}
        
        # Extract branch sections
        branch_sections = re.split(r'(?:^|\n)([A-C])\s+', response)[1:]
        
        # Group sections by branch
        for i in range(0, len(branch_sections), 2):
            if i+1 < len(branch_sections):
                branch_id = branch_sections[i]
                branch_content = branch_sections[i+1]
                
                # Extract branch details
                summary_match = re.search(r'(.+?)(?:\n|$)', branch_content)
                summary = summary_match.group(1).strip() if summary_match else ""
                
                pros = re.findall(r'Pros.*?[-•]\s*(.+?)(?:\n|$)', branch_content, re.DOTALL)
                cons = re.findall(r'Cons.*?[-•]\s*(.+?)(?:\n|$)', branch_content, re.DOTALL)
                
                cost_match = re.search(r'CostUSD.*?(\d+)', branch_content)
                cost = int(cost_match.group(1)) if cost_match else 0
                
                time_match = re.search(r'TimeMonths.*?(\d+)', branch_content)
                time = int(time_match.group(1)) if time_match else 0
                
                score_match = re.search(r'OverallScore.*?(\d+)', branch_content)
                score = int(score_match.group(1)) if score_match else 0
                
                action_items = re.findall(r'ActionItems.*?[-•]\s*(.+?)(?:\n|$)', branch_content, re.DOTALL)
                
                branches[branch_id] = {
                    "summary": summary,
                    "pros": [p.strip() for p in pros],
                    "cons": [c.strip() for c in cons],
                    "cost": cost,
                    "time": time,
                    "score": score,
                    "action_items": [a.strip() for a in action_items]
                }
        
        # Add recommendation if found
        recommendation_match = re.search(r'Recommendation:\s*([A-C])', response)
        if recommendation_match:
            branches["recommendation"] = recommendation_match.group(1)
        
        return branches
    
    async def _generate_final_prediction(self, analysis: str, internal_context: str, branches: dict) -> Dict[str, Any]:
        """Generate final prediction based on analysis, context, and branches"""
        # Determine which branch to use
        selected_branch = branches.get("recommendation", "B")  # Default to balanced approach
        branch_data = branches.get(selected_branch, {})
        
        # Extract prediction information
        if not branch_data:
            return {"prediction": "Unable to generate a prediction due to insufficient data", "selected_branch": ""}
        
        # Format prediction
        prediction = f"# Strategic Analysis and Outcome Prediction\n\n"
        prediction += f"## Selected Approach: Option {selected_branch} - {branch_data.get('summary', '')}\n\n"
        
        prediction += "### Key Benefits\n"
        for pro in branch_data.get("pros", []):
            prediction += f"- {pro}\n"
        
        prediction += "\n### Potential Challenges\n"
        for con in branch_data.get("cons", []):
            prediction += f"- {con}\n"
        
        prediction += f"\n### Implementation Timeline: {branch_data.get('time', 0)} months\n"
        prediction += f"### Estimated Cost: ${branch_data.get('cost', 0):,}\n"
        
        prediction += "\n### Action Plan\n"
        for i, action in enumerate(branch_data.get("action_items", []), 1):
            prediction += f"{i}. {action}\n"
        
        return {"prediction": prediction, "selected_branch": selected_branch}


# app/agents/agent5_task_dispatcher.py
from typing import Dict, Any, List
import asyncio
import logging
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
import json
import re

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.azure_helpers import extract_message
from app.utils.logging import get_logger

class TaskDispatcherAgent(Agent):
    """Agent 5: Converts optimization decisions into actionable tasks"""
    
    def __init__(self):
        super().__init__()
        self.logger = get_logger("agent5")
        self.client = None
        self.agent = None
        self.departments = self._load_departments()
    
    @property
    def name(self) -> str:
        return "Task Dispatcher Agent"
    
    def _load_departments(self) -> List[Dict[str, Any]]:
        """Load department information from JSON file"""
        try:
            with open("shared/departments.json", "r") as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error loading departments: {e}")
            return []
    
    async def setup_client(self):
        """Create client connection (async-friendly wrapper)"""
        if self.client is None or self.agent is None:
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._setup_client)
    
    def _setup_client(self):
        """Actual setup logic (runs in thread pool)"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=settings.AZURE_CONN_STRING
        )
        self.agent = self.client.agents.get_agent(settings.AGENT5_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process prediction and generate task assignments"""
        prediction = input_data.get("prediction", "")
        branches = context.get("results", {}).get("agent4", {}).get("branches", {})
        selected_branch = context.get("results", {}).get("agent4", {}).get("selected_branch", "B")
        branch_data = branches.get(selected_branch, {})
        
        self.logger.info(f"📥 Processing prediction ({len(prediction)} chars) with branch {selected_branch}")
        
        # Setup Azure client
        await self.setup_client()
        
        # Step 1: Parse the input
        parsed_input = await self._handle_timeout(
            self._parse_input(prediction),
            timeout_seconds=settings.AGENT5_PARSE_TIMEOUT,
            fallback_data={"action": "", "action_items": []}
        )
        
        # Use branch data if available, otherwise use parsed input
        action = branch_data.get("summary", parsed_input.get("action", ""))
        action_items = branch_data.get("action_items", parsed_input.get("action_items", []))
        
        # Step 2: Assign tasks to departments
        department_assignments = await self._handle_timeout(
            self._assign_tasks(action, action_items),
            timeout_seconds=settings.AGENT5_ASSIGN_TIMEOUT,
            fallback_data={"assignments": []}
        )
        
        # Step 3: Generate email templates
        email_templates = await self._handle_timeout(
            self._generate_emails(department_assignments.get("assignments", [])),
            timeout_seconds=settings.AGENT5_EMAIL_TIMEOUT,
            fallback_data={"templates": []}
        )
        
        # Step 4: Format response for summary card
        summary_card = self._format_summary_card(
            action, 
            action_items, 
            department_assignments.get("assignments", []),
            email_templates.get("templates", [])
        )
        
        return {
            "prediction": prediction,
            "action": action,
            "action_items": action_items,
            "department_assignments": department_assignments.get("assignments", []),
            "email_templates": email_templates.get("templates", []),
            "summary_card": summary_card,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _parse_input(self, strategic_input: str) -> Dict[str, Any]:
        """Parse the strategic input to extract action and action items"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/agent5_parse_input.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(raw_input=strategic_input[:2000])  # Limit to prevent token overflows
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT5_PARSE_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    response = extract_message(messages)
                    
                    # Try to parse JSON from the response
                    try:
                        parsed = json.loads(response)
                        self.logger.info(f"🔍 Parsed input: {parsed}")
                        return parsed
                    except json.JSONDecodeError:
                        self.logger.error(f"Error parsing JSON from response: {response}")
                        # Fallback: Try to extract using regex
                        action_match = re.search(r'"action"\s*:\s*"([^"]+)"', response)
                        action = action_match.group(1) if action_match else ""
                        
                        action_items = []
                        items_matches = re.findall(r'"actionItems"\s*:\s*\[\s*"([^"]+)"', response)
                        if items_matches:
                            action_items = [item.strip() for item in items_matches]
                        
                        return {
                            "branch": "B",  # Default to balanced
                            "action": action,
                            "actionItems": action_items
                        }
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error parsing input: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _assign_tasks(self, action: str, action_items: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """Assign tasks to appropriate departments"""
        # Map of common task keywords to departments
        keyword_mapping = {
            "IT": ["software", "hardware", "system", "network", "database", "automation", "digital", "technology", "tech", "computing"],
            "Operations": ["process", "workflow", "efficiency", "operation", "logistics", "supply chain", "inventory", "warehouse", "production", "manufacturing"],
            "Finance": ["budget", "cost", "expense", "financial", "funding", "investment", "revenue", "profit", "accounting", "fiscal"],
            "HR": ["employee", "staff", "training", "hiring", "recruitment", "onboarding", "personnel", "team", "talent", "workforce"],
            "Legal": ["compliance", "regulation", "contract", "legal", "agreement", "terms", "policy", "governance", "risk"],
            "Marketing": ["marketing", "promotion", "brand", "campaign", "market", "customer", "client", "audience", "advertising"],
            "Sales": ["sales", "selling", "revenue", "customer", "client", "account", "leads", "deals", "pricing"],
            "R&D": ["research", "development", "innovation", "prototype", "testing", "design", "experimentation"]
        }
        
        assignments = []
        
        # Match each action item to the most appropriate department
        for i, item in enumerate(action_items, 1):
            best_dept = None
            best_score = 0
            
            # Find the department with the most keyword matches
            for dept, keywords in keyword_mapping.items():
                item_lower = item.lower()
                score = sum(1 for kw in keywords if kw.lower() in item_lower)
                if score > best_score:
                    best_score = score
                    best_dept = dept
            
            # If no clear match, assign to Operations (default)
            if best_dept is None or best_score == 0:
                best_dept = "Operations"
            
            # Lookup department info
            dept_info = next((d for d in self.departments if d.get("department") == best_dept), {})
            
            assignments.append({
                "id": f"task-{i}",
                "task": item,
                "department": best_dept,
                "lead": dept_info.get("lead", "Department Lead"),
                "email": dept_info.get("email", "department@example.com"),
                "priority": "high" if i <= 2 else "medium",  # First two tasks are high priority
                "deadline": self._calculate_deadline(i),
                "duration": f"{i+1} weeks"  # Simple duration calculation
            })
        
        return {"assignments": assignments}
    
    def _calculate_deadline(self, task_index: int) -> str:
        """Calculate a deadline date based on task index"""
        from datetime import datetime, timedelta
        
        # Start date is now, each task starts 1 week after the previous
        start_date = datetime.now() + timedelta(days=task_index * 7)
        
        # Format to ISO date string
        return start_date.strftime("%Y-%m-%d")
    
    async def _generate_emails(self, assignments: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Generate email templates for task assignments"""
        templates = []
        
        # Group assignments by department
        dept_assignments = {}
        for assignment in assignments:
            dept = assignment.get("department")
            if dept not in dept_assignments:
                dept_assignments[dept] = []
            dept_assignments[dept].append(assignment)
        
        # Generate an email for each department
        for dept, dept_tasks in dept_assignments.items():
            if not dept_tasks:
                continue
                
            # Get department lead information
            lead = dept_tasks[0].get("lead", "Department Lead")
            email = dept_tasks[0].get("email", "department@example.com")
            
            # Create task list for email body
            task_list = ""
            for task in dept_tasks:
                priority = task.get("priority", "medium")
                deadline = task.get("deadline", "TBD")
                task_list += f"- {task.get('task')} ({priority.capitalize()} Priority, Due: {deadline})\n"
            
            # Generate email subject and body
            subject = f"Action Required: Implementation Tasks for {dept} Department"
            body = f"""Dear {lead},

I'm writing regarding our recently approved process optimization initiative. The analysis has identified key areas where your department will play a critical role in implementation.

Tasks for the {dept} team:
{task_list}

Please review these tasks and confirm your department's availability for a kickoff meeting next week. The full implementation plan with detailed timelines will be shared during the meeting.

Best regards,
TARS System
Process Optimization Team
"""
            
            templates.append({
                "department": dept,
                "to": email,
                "recipient": lead,
                "subject": subject,
                "body": body
            })
        
        return {"templates": templates}
    
    def _format_summary_card(self, action: str, action_items: List[str], 
                            assignments: List[Dict[str, Any]], 
                            email_templates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format response for summary card"""
        # Create business operations flow
        steps = []
        for i, item in enumerate(action_items, 1):
            matching_assignment = next((a for a in assignments if a.get("task") == item), {})
            dept = matching_assignment.get("department", "Operations")
            steps.append({
                "id": f"step{i}",
                "description": item,
                "department": dept
            })
        
        # Group department tasks
        dept_tasks = {}
        for assignment in assignments:
            dept = assignment.get("department")
            if dept not in dept_tasks:
                dept_tasks[dept] = {
                    "id": f"dept-{len(dept_tasks)+1}",
                    "department": dept,
                    "manager": assignment.get("lead", "Department Lead"),
                    "email": assignment.get("email", "department@example.com"),
                    "tasks": []
                }
            
            dept_tasks[dept]["tasks"].append({
                "id": assignment.get("id", f"task-{len(dept_tasks[dept]['tasks'])+1}"),
                "description": assignment.get("task", ""),
                "priority": assignment.get("priority", "medium"),
                "deadline": assignment.get("deadline", "")
            })
        
        # Add email templates to departments
        departments = []
        for dept_name, dept_info in dept_tasks.items():
            # Find matching email template
            email_template = next((e for e in email_templates if e.get("department") == dept_name), {})
            
            if email_template:
                dept_info["emailTemplate"] = {
                    "to": email_template.get("to", ""),
                    "recipient": email_template.get("recipient", ""),
                    "department": dept_name,
                    "subject": email_template.get("subject", ""),
                    "body": email_template.get("body", "")
                }
            else:
                dept_info["emailTemplate"] = {
                    "to": dept_info.get("email", ""),
                    "recipient": dept_info.get("manager", ""),
                    "department": dept_name,
                    "subject": f"Action Required: Implementation Tasks for {dept_name}",
                    "body": f"Tasks for the {dept_name} department..."
                }
            
            departments.append(dept_info)
        
        # Create summary card
        return {
            "businessOperationsFlow": {
                "summary": action,
                "steps": steps
            },
            "departments": departments
        }


# app/process_manager.py
from typing import Dict, Any, Optional, List
import asyncio
import logging
import time
from datetime import datetime
import traceback

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.logging import get_logger
from app.formatter import format_response

class ProcessManager:
    """Orchestrates the flow between agents"""
    
    def __init__(self, agents: Dict[str, Agent]):
        self.agents = agents
        self.logger = get_logger("process_manager")
    
    async def process_request(self, query: str) -> Dict[str, Any]:
        """Process a user query through the agent pipeline"""
        start_time = time.time()
        self.logger.info(f"🚀 Processing request: {query[:100]}...")
        
        # Initialize context for this request
        context = {
            "query": query,
            "start_time": start_time,
            "results": {},
            "errors": []
        }
        
        try:
            # Agent 3 (Consultant) is the entry point
            self.logger.info("📋 Step 1: Consulting with Agent 3 (Consultant)")
            agent3_result = await self._call_agent_with_fallback(
                "agent3", {"query": query}, context
            )
            context["results"]["agent3"] = agent3_result
            
            # Continue with Agent 4 (Outcome Predictor)
            self.logger.info("📋 Step 2: Predicting outcomes with Agent 4")
            agent4_result = await self._call_agent_with_fallback(
                "agent4", {"analysis": agent3_result.get("enhanced_answer", "")}, context
            )
            context["results"]["agent4"] = agent4_result
            
            # Finally, Agent 5 (Task Dispatcher)
            self.logger.info("📋 Step 3: Dispatching tasks with Agent 5")
            agent5_result = await self._call_agent_with_fallback(
                "agent5", {"prediction": agent4_result.get("final_prediction", "")}, context
            )
            context["results"]["agent5"] = agent5_result
            
            # Format the final response
            formatted_response = format_response(context)
            
            # Add processing metrics
            end_time = time.time()
            total_time = end_time - start_time
            self.logger.info(f"✅ Request processed in {total_time:.2f}s")
            
            return formatted_response
            
        except Exception as e:
            self.logger.error(f"❌ Error in process_request: {str(e)}")
            context["errors"].append({
                "stage": "process_manager",
                "error": str(e),
                "traceback": traceback.format_exc()
            })
            
            # Try to format partial results
            try:
                formatted_response = format_response(context)
                return formatted_response
            except:
                # Last resort fallback
                return {
                    "error": f"Processing failed: {str(e)}",
                    "chatResponse": f"I'm sorry, but I encountered an error while processing your request about '{query}'. Please try again or rephrase your query.",
                    "analysis": {
                        "businessFlow": {"nodes": [], "edges": []},
                        "analytics": self._generate_fallback_analytics(),
                        "newsAndImpact": {"newsItems": [], "impactItems": []}
                    },
                    "recommendations": {"options": []}
                }
    
    async def _call_agent_with_fallback(self, agent_id: str, input_data: Dict[str, Any], 
                                       context: Dict[str, Any]) -> Dict[str, Any]:
        """Call an agent with timeout and fallback handling"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                raise ValueError(f"Agent '{agent_id}' not found")
            
            # Set timeout based on agent
            timeout = getattr(settings, f"{agent_id.upper()}_TIMEOUT", 30)
            
            # Call the agent with timeout
            return await asyncio.wait_for(
                agent.process(input_data, context),
                timeout=timeout
            )
            
        except asyncio.TimeoutError:
            self.logger.error(f"⏱️ Timeout calling agent {agent_id}")
            context["errors"].append({
                "stage": agent_id,
                "error": f"Timeout after {timeout}s",
                "input": input_data
            })
            return self._generate_fallback_for_agent(agent_id, input_data, context)
            
        except Exception as e:
            self.logger.error(f"❌ Error calling agent {agent_id}: {str(e)}")
            context["errors"].append({
                "stage": agent_id,
                "error": str(e),
                "traceback": traceback.format_exc(),
                "input": input_data
            })
            return self._generate_fallback_for_agent(agent_id, input_data, context)
    
    def _generate_fallback_for_agent(self, agent_id: str, input_data: Dict[str, Any], 
                                    context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback data when an agent fails"""
        query = context.get("query", "")
        
        if agent_id == "agent3":
            return {
                "query": query,
                "initial_answer": f"I'm analyzing your query about '{query}'...",
                "context_evaluation": "Needs both internal and external context",
                "internal_context": "Unable to retrieve internal context",
                "external_context": "Unable to retrieve external context",
                "enhanced_answer": f"Based on your query about '{query}', I recommend optimizing your business processes by implementing automation and streamlining workflows. This can reduce costs and improve efficiency across departments.",
                "timestamp": datetime.now().isoformat()
            }
        
        elif agent_id == "agent4":
            return {
                "analysis": input_data.get("analysis", ""),
                "internal_context": "Unable to retrieve additional internal context",
                "branches": {
                    "A": {
                        "summary": "Conservative Approach - Minimal Process Changes",
                        "pros": ["Lower implementation risk", "Minimal disruption to operations"],
                        "cons": ["Limited cost savings", "Slower timeline to see benefits"],
                        "cost": 100000,
                        "time": 3,
                        "score": 6,
                        "action_items": [
                            "Document current processes in detail",
                            "Identify quick wins for immediate implementation",
                            "Implement targeted process improvements"
                        ]
                    },
                    "B": {
                        "summary": "Balanced Approach - Strategic Process Optimization",
                        "pros": ["Significant cost reduction", "Improved operational efficiency"],
                        "cons": ["Moderate implementation complexity", "Requires staff training"],
                        "cost": 250000,
                        "time": 6,
                        "score": 8,
                        "action_items": [
                            "Implement process automation for key workflows",
                            "Restructure team responsibilities for efficiency",
                            "Develop integrated systems for better data flow"
                        ]
                    },
                    "C": {
                        "summary": "Aggressive Approach - Complete Process Transformation",
                        "pros": ["Maximum cost savings", "Comprehensive modernization"],
                        "cons": ["High implementation risk", "Significant initial investment"],
                        "cost": 500000,
                        "time": 12,
                        "score": 7,
                        "action_items": [
                            "Replace legacy systems with modern solutions",
                            "Restructure organizational workflows",
                            "Implement advanced analytics and AI optimization"
                        ]
                    },
                    "recommendation": "B"
                },
                "final_prediction": "# Strategic Analysis and Outcome Prediction\n\n## Selected Approach: Option B - Strategic Process Optimization\n\n### Key Benefits\n- Significant cost reduction\n- Improved operational efficiency\n\n### Potential Challenges\n- Moderate implementation complexity\n- Requires staff training\n\n### Implementation Timeline: 6 months\n### Estimated Cost: $250,000\n\n### Action Plan\n1. Implement process automation for key workflows\n2. Restructure team responsibilities for efficiency\n3. Develop integrated systems for better data flow",
                "selected_branch": "B",
                "timestamp": datetime.now().isoformat()
            }
        
        elif agent_id == "agent5":
            return {
                "prediction": input_data.get("prediction", ""),
                "action": "Strategic Process Optimization",
                "action_items": [
                    "Implement process automation for key workflows",
                    "Restructure team responsibilities for efficiency",
                    "Develop integrated systems for better data flow"
                ],
                "department_assignments": [
                    {
                        "id": "task-1",
                        "task": "Implement process automation for key workflows",
                        "department": "IT",
                        "lead": "Alex Johnson",
                        "email": "alex.johnson@company.com",
                        "priority": "high",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "duration": "4 weeks"
                    },
                    {
                        "id": "task-2",
                        "task": "Restructure team responsibilities for efficiency",
                        "department": "Operations",
                        "lead": "Sarah Miller",
                        "email": "sarah.miller@company.com",
                        "priority": "high",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "duration": "6 weeks"
                    },
                    {
                        "id": "task-3",
                        "task": "Develop integrated systems for better data flow",
                        "department": "IT",
                        "lead": "Alex Johnson",
                        "email": "alex.johnson@company.com",
                        "priority": "medium",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "duration": "8 weeks"
                    }
                ],
                "email_templates": [],
                "summary_card": self._generate_fallback_summary_card(),
                "timestamp": datetime.now().isoformat()
            }
        
        else:
            return {
                "error": f"Unknown agent {agent_id}",
                "timestamp": datetime.now().isoformat()
            }
    
    def _generate_fallback_analytics(self) -> Dict[str, Any]:
        """Generate fallback analytics data"""
        return {
            "currentAnnualCost": 5000000,
            "efficiencyRating": 65,
            "averageProcessTime": 12.5,
            "riskAssessment": 45,
            "trends": {
                "costTrend": "increasing",
                "efficiencyTrend": "stable",
                "timeTrend": "increasing",
                "riskTrend": "stable"
            }
        }
    
    def _generate_fallback_summary_card(self) -> Dict[str, Any]:
        """Generate fallback summary card"""
        return {
            "businessOperationsFlow": {
                "summary": "Strategic Process Optimization",
                "steps": [
                    {"id": "step1", "description": "Implement process automation for key workflows", "department": "IT"},
                    {"id": "step2", "description": "Restructure team responsibilities for efficiency", "department": "Operations"},
                    {"id": "step3", "description": "Develop integrated systems for better data flow", "department": "IT"}
                ]
            },
            "departments": [
                {
                    "id": "dept-1",
                    "department": "IT",
                    "manager": "Alex Johnson",
                    "email": "alex.johnson@company.com",
                    "tasks": [
                        {
                            "id": "task-1",
                            "description": "Implement process automation for key workflows",
                            "priority": "high",
                            "deadline": datetime.now().strftime("%Y-%m-%d")
                        },
                        {
                            "id": "task-3",
                            "description": "Develop integrated systems for better data flow",
                            "priority": "medium",
                            "deadline": datetime.now().strftime("%Y-%m-%d")
                        }
                    ],
                    "emailTemplate": {
                        "to": "alex.johnson@company.com",
                        "recipient": "Alex Johnson",
                        "department": "IT",
                        "subject": "Action Required: IT Implementation Tasks",
                        "body": "Dear Alex,\n\nPlease prioritize the following tasks for our process optimization initiative:\n- Implement process automation for key workflows\n- Develop integrated systems for better data flow\n\nBest regards,\nTARS System"
                    }
                },
                {
                    "id": "dept-2",
                    "department": "Operations",
                    "manager": "Sarah Miller",
                    "email": "sarah.miller@company.com",
                    "tasks": [
                        {
                            "id": "task-2",
                            "description": "Restructure team responsibilities for efficiency",
                            "priority": "high",
                            "deadline": datetime.now().strftime("%Y-%m-%d")
                        }
                    ],
                    "emailTemplate": {
                        "to": "sarah.miller@company.com",
                        "recipient": "Sarah Miller",
                        "department": "Operations",
                        "subject": "Action Required: Operations Implementation Tasks",
                        "body": "Dear Sarah,\n\nPlease prioritize the following task for our process optimization initiative:\n- Restructure team responsibilities for efficiency\n\nBest regards,\nTARS System"
                    }
                }
            ]
        }
    
    async def call_agent(self, agent_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Public method to call a specific agent directly"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                raise ValueError(f"Agent '{agent_id}' not found")
            
            # Empty context for direct calls
            context = {"direct_call": True}
            
            # Call the agent
            return await agent.process(input_data, context)
            
        except Exception as e:
            self.logger.error(f"❌ Error in direct call to agent {agent_id}: {str(e)}")
            return {"error": str(e)}


# app/formatter.py
from typing import Dict, Any, List, Optional
import logging
import json
import re
from datetime import datetime

from app.utils.logging import get_logger

logger = get_logger("formatter")

def format_response(context: Dict[str, Any]) -> Dict[str, Any]:
    """Format agent results into the standardized API response"""
    
    # Extract data from agent results
    agent3_data = context.get("results", {}).get("agent3", {})
    agent4_data = context.get("results", {}).get("agent4", {})
    agent5_data = context.get("results", {}).get("agent5", {})
    
    # Create business flow visualization
    business_flow = create_business_flow(agent3_data, agent4_data)
    
    # Create analytics data
    analytics_data = create_analytics_data(agent3_data, agent4_data)
    
    # Create news and impact data
    news_impact_data = create_news_impact(agent3_data)
    
    # Create recommendation options
    options = create_options(agent4_data, agent5_data)
    
    # Create summary card (if available)
    summary_card = agent5_data.get("summary_card")
    
    # Create chat response
    chat_response = agent3_data.get("enhanced_answer", 
                    "I've analyzed your request and generated optimization options. " +
                    "You can review the detailed analysis and recommendations below.")
    
    # Return formatted response
    return {
        "analysis": {
            "businessFlow": business_flow,
            "analytics": analytics_data,
            "newsAndImpact": news_impact_data
        },
        "recommendations": {
            "options": options
        },
        "chatResponse": chat_response,
        "summaryCard": summary_card
    }

def create_business_flow(agent3_data: Dict[str, Any], agent4_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create business flow visualization data"""
    # Extract from contexts to find business processes
    internal_context = agent3_data.get("internal_context", "")
    external_context = agent3_data.get("external_context", "")
    enhanced_answer = agent3_data.get("enhanced_answer", "")
    
    # Try to find process steps or workflow in the text
    processes = extract_processes(internal_context + "\n" + external_context + "\n" + enhanced_answer)
    
    # If no processes found, create a basic flow
    if not processes:
        processes = ["Input/Start", "Assessment", "Processing", "Quality Control", "Output/End"]
    
    # Create nodes and edges
    nodes = []
    edges = []
    
    # Generate positions (simple left-to-right layout)
    width = 800
    height = 200
    step_width = width / (len(processes) + 1)
    
    for i, process in enumerate(processes):
        # Add node
        node_id = f"node-{i+1}"
        node_type = "start" if i == 0 else "end" if i == len(processes) - 1 else "process"
        
        nodes.append({
            "id": node_id,
            "label": process,
            "type": node_type,
            "position": {
                "x": (i + 1) * step_width,
                "y": height / 2
            }
        })
        
        # Add edge if not the first node
        if i > 0:
            edge_id = f"edge-{i}"
            source_id = f"node-{i}"
            target_id = node_id
            
            edges.append({
                "id": edge_id,
                "source": source_id,
                "target": target_id,
                "label": f"Step {i}"
            })
    
    return {
        "nodes": nodes,
        "edges": edges
    }

def extract_processes(text: str) -> List[str]:
    """Extract process steps from text"""
    # Try to find lines with "process", "step", "workflow" etc.
    processes = []
    
    # Look for numbered or bulleted lists
    lines = text.split("\n")
    
    # Pattern for numbered/bulleted items that might be process steps
    step_pattern = r"^(?:\d+\.\s+|\*\s+|-\s+)(.+)$"
    
    for line in lines:
        line = line.strip()
        match = re.match(step_pattern, line)
        if match and len(processes) < 10:  # Limit to 10 steps
            step_text = match.group(1)
            # Only include if reasonably short
            if 3 <= len(step_text) <= 30 and step_text not in processes:
                processes.append(step_text)
    
    # If we still don't have enough processes, look for likely process steps in the text
    if len(processes) < 3:
        process_indicators = ["process", "workflow", "step", "stage", "phase"]
        for indicator in process_indicators:
            pattern = rf"{indicator}[:\s]+([^\.]+)"
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if 3 <= len(match) <= 30 and match not in processes:
                    processes.append(match.strip())
                    if len(processes) >= 10:
                        break
            if len(processes) >= 10:
                break
    
    return processes

def create_analytics_data(agent3_data: Dict[str, Any], agent4_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create analytics data"""
    # Extract from contexts to find metrics
    internal_context = agent3_data.get("internal