# TARS Multi-AI Agent System Code Compilation

## Project Overview

TARS is a multi-agent AI system designed to analyze and optimize business processes. The system consists of 5 specialized AI agents working together to process user queries, gather relevant information, and generate optimization recommendations.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   FastAPI API   │◄────►│  Agent Manager  │◄────►│  Agent System   │
│  (HTTP Server)  │      │  (Coordinator)  │      │ (5 AI Agents)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         ▲                                                  ▲
         │                                                  │
         ▼                                                  ▼
┌─────────────────┐                              ┌─────────────────┐
│   Client App    │                              │  Azure AI       │
│  (Front-end)    │                              │  Services       │
└─────────────────┘                              └─────────────────┘
```

### Agent System

The system consists of 5 specialized AI agents:

1. **Agent 1 (Enterprise Knowledge)**: Retrieves information from internal company documents
2. **Agent 2 (Global Intel)**: Searches for external information using search services 
3. **Agent 3 (Consultant)**: Central agent that coordinates analysis and formulates responses
4. **Agent 4 (Outcome Predictor)**: Predicts outcomes and generates strategic branches
5. **Agent 5 (Task Dispatcher)**: Converts optimization decisions into actionable tasks

### Communication Flow

```
                      ┌─────────────┐
           ┌─────────►│   Agent 2   │───────────┐
           │          │ Global Intel│           │
           │          └─────────────┘           │
           │                                    ▼
┌─────────────┐       ┌─────────────┐      ┌─────────────┐
│   Agent 3   │◄─────►│   Agent 1   │      │   Agent 4   │
│ Consultant  │       │ Enterprise  │◄────►│   Outcome   │
│ (Central)   │       │  Knowledge  │      │  Predictor  │
└─────────────┘       └─────────────┘      └─────────────┘
        ▲                                        │
        │                                        ▼
        │                                  ┌─────────────┐
        └──────────────────────────────────►   Agent 5   │
                                           │    Task     │
                                           │ Dispatcher  │
                                           └─────────────┘
```

## Project Structure

```
.
├── agents/
│   ├── __init__.py
│   ├── agent1_enterprise_knowledge/
│   │   ├── __init__.py
│   │   ├── agent.json
│   │   ├── client.py
│   │   ├── handler.py
│   │   └── logic.py
│   ├── agent2_global_intel/
│   │   ├── __init__.py
│   │   ├── agent.json
│   │   ├── client.py
│   │   ├── handler.py
│   │   ├── logic.py
│   │   └── search.py
│   ├── agent3_consultant/
│   │   ├── __init__.py
│   │   ├── agent.json
│   │   ├── client.py
│   │   ├── handler.py
│   │   ├── interactive.py
│   │   └── logic.py
│   ├── agent4_outcome_predictor/
│   │   ├── __init__.py
│   │   ├── agent.json
│   │   ├── client.py
│   │   ├── handler.py
│   │   ├── interactive.py
│   │   └── logic.py
│   └── agent5_task_dispatcher/
│       ├── __init__.py
│       ├── agent.json
│       ├── client.py
│       ├── handler.py
│       ├── interactive.py
│       └── logic.py
├── api/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── optimization.py
│   └── services/
│       ├── __init__.py
│       └── agent_manager.py
├── prompts/
│   ├── agent4_branches.txt
│   ├── agent4_doc_inventory.txt
│   ├── agent5_parse_input.txt
│   ├── combiNASHUN.txt
│   ├── evaluation.txt
│   ├── formulate_internal.txt
│   └── formulate_search.txt
├── shared/
│   ├── departments.json
│   └── utils.py
├── tests/
│   ├── __init__.py
│   ├── testbrave.py
│   ├── testfirecrawl.py
│   └── testtavily.py
├── API Documentation.txt
├── MCP.json
├── docker-compose.yml
├── Dockerfile
├── interactive.py
├── requirements.txt
├── run.py
├── run_agent1.py
├── run_agent2.py
├── run_agent3.py
├── run_agent4.py
├── run_agent5.py
└── run_all.py
```

## Component Descriptions

### API Layer (`/api`)

The API layer provides HTTP endpoints for client applications to interact with the TARS system.

#### `main.py`
- FastAPI application setup
- CORS middleware configuration
- Endpoint registration
- Error handling
- Application events (startup/shutdown)

#### `models.py`
- Pydantic models for request/response validation
- OptimizationRequest model for user queries
- Comprehensive response models for:
  - Business flow (nodes, edges)
  - Analytics data
  - News and impact analysis
  - Recommendations
  - Summary cards with department tasks

#### `routes/optimization.py`
- `/optimization` endpoint handler
- Processes user queries
- Invokes agent manager
- Returns optimization analysis and recommendations

#### `services/agent_manager.py`
- Manages agent processes (start/stop)
- Orchestrates communication between agents
- Processes user queries by coordinating agents
- Formats agent outputs into API response format

### Agent System (`/agents`)

Each agent has a similar structure:

#### Common Files
- **`__init__.py`**: Module initialization
- **`agent.json`**: Agent configuration
- **`client.py`**: Client for inter-agent communication
- **`handler.py`**: API endpoint handlers
- **`logic.py`**: Core agent logic/processing
- **`interactive.py`**: (Some agents) CLI interface for testing

#### Agent 1: Enterprise Knowledge (`/agents/agent1_enterprise_knowledge`)
- Connects to Azure AI Services
- Processes internal document requests
- Threaded request handling with timeout
- Response extraction and error handling
- Thread management and cleanup

```python
# Core functionality
def answer_question(question: str, caller: str = "Agent1") -> str:
    """Process a question using internal knowledge base"""
    return _agent.process_request(question, caller)
```

#### Agent 2: Global Intel (`/agents/agent2_global_intel`)
- Connects to external search APIs using MCP (Model Context Protocol)
- Implements search providers (Brave Search, Firecrawl)
- Results parsing and normalization
- Fallback strategies for failed searches

```python
# Core functionality in search.py
def run_search_tools(user_query: str) -> list:
    """Perform web search using primary providers with failover"""
    q = extract_search_query(user_query)
    # Try primary search
    # Fall back to secondary if needed
```

#### Agent 3: Consultant (`/agents/agent3_consultant`)
- Central coordinator for the agent system
- Evaluates context needs for different queries
- Formulates internal and external search queries
- Combines information from multiple agents
- Generates comprehensive analysis

```python
# Core functionality
def ask_agent(question: str) -> str:
    """Process a query by coordinating with other agents"""
    # Initial response
    # Evaluate if additional context needed
    # Get internal company documents if needed
    # Get external search results if needed
    # Generate final response
```

#### Agent 4: Outcome Predictor (`/agents/agent4_outcome_predictor`)
- Generates questions based on strategic analysis
- Fetches internal facts from Agent 1
- Predicts outcomes with multiple strategic branches
- Validates and sanitizes structured outputs

```python
# Core process flow
def predict_all(analysis: str) -> dict:
    """
    1. Generate sub-questions from analysis
    2. Fetch facts from Agent 1
    3. Predict outcomes based on facts
    4. Auto-select best branch
    5. Send to Agent 5 for task dispatch
    """
```

#### Agent 5: Task Dispatcher (`/agents/agent5_task_dispatcher`)
- Parses strategic decisions into concrete tasks
- Assigns tasks to appropriate departments
- Generates email templates for task assignments
- Formats output into summaryCard format for API

```python
# Core functionality
def parse_input(raw_input: str) -> dict:
    """Extract branch, action, and action items"""

def assign_tasks(branch: str, action: str, items: list[str]) -> list[dict]:
    """Assign tasks to appropriate departments"""

def generate_email(lead_name, lead_email, branch, branch_label, action, tasks):
    """Generate email templates for task assignment"""
```

### MCP (Model Context Protocol) Configuration (`/MCP.json`)

Configuration for external API connections:

```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"]
    },
    "firecrawl-mcp": {
      "command": "firecrawl-mcp",
      "args": []
    }
  }
}
```

### Shared Utilities (`/shared`)

#### `departments.json`
- Department information used for task assignment
- Includes lead name, email, and department description

#### `utils.py`
- Shared utility functions used by multiple agents
- Functions for message extraction and prompt formatting

### Starter Scripts

- **`run.py`**: Main FastAPI server starter
- **`run_agent1.py`** through **`run_agent5.py`**: Individual agent starters
- **`run_all.py`**: Launches all agents in separate terminals
- **`interactive.py`**: CLI interface for testing individual components

## Data Flow

1. User submits a query via the `/api/optimization` endpoint
2. API forwards the query to Agent Manager
3. Agent Manager starts all agents if not running
4. Agent Manager sends the query to Agent 3 (Consultant)
5. Agent 3 evaluates whether additional context is needed:
   - If internal data needed: Request information from Agent 1
   - If external data needed: Request information from Agent 2
6. Agent 3 formulates an analysis based on all gathered information
7. Agent 4 (Outcome Predictor) receives analysis and:
   - Generates sub-questions for Agent 1
   - Creates multiple strategic branches (Conservative, Balanced, Aggressive)
   - Sends selected branch to Agent 5
8. Agent 5 (Task Dispatcher) processes the selected branch:
   - Parses action items into specific tasks
   - Assigns tasks to departments
   - Generates email templates
9. Agent Manager combines all outputs into standardized API response
10. API returns comprehensive response to the client

## Key Dependencies

- **Azure AI Projects Client**: For AI agent capabilities
- **FastAPI**: Web API framework
- **Uvicorn**: ASGI server implementation
- **HTTPX**: Async HTTP client
- **Pydantic**: Data validation and settings management
- **Model Context Protocol (MCP)**: External service integration

## Authentication and Security

- Azure Identity for Azure AI service authentication
- HTTP endpoints do not currently implement authentication (development mode)
- Inter-agent communication occurs locally over HTTP

## Configuration

The system relies on environment variables:
- `AZURE_CONN_STRING`: Azure AI Project connection string
- `AGENT1_ID` through `AGENT5_ID`: Azure agent IDs
- `PORT`: HTTP server port (default: 8000)
- Various API keys for search services

## Potential Issues

1. **Timeout Handling**: Fixed timeouts might be too short for complex queries
2. **Error Propagation**: Some error conditions might not be properly handled between agents
3. **Process Management**: Agent processes are managed manually without health checks
4. **Search Fallbacks**: Search service failures could cascade through the system
5. **Response Format Consistency**: Agent outputs might need additional validation

## Deployment Approach

The system can be deployed using either:
1. Docker containers (via provided Dockerfile and docker-compose.yml)
2. Azure deployment (via deploy_azure.sh)

Each agent is designed to run as a separate service, with the main API coordinating communication.

---

# Full Source Code for Key Components

## agents/agent1_enterprise_knowledge/logic.py
```python
import os
import logging
import time
from threading import Lock
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# ─── LOGGING CONFIG ───────────────────────────────────────────────────
# 1) Configure root logger to only show INFO+ with your prefix
logging.basicConfig(level=logging.INFO, format='[AGENT 1] %(message)s')

# 2) Silence all the Azure/HTTP/urllib3 noise at WARNING+
for noisy in (
    "azure",
    "azure.identity",
    "azure.ai",
    "azure.core.pipeline.policies.http_logging_policy",
    "urllib3",
):
    logging.getLogger(noisy).setLevel(logging.WARNING)
# ──────────────────────────────────────────────────────────────────────

# Basic setup
load_dotenv()

# Config
CONN_STR    = os.getenv("AZURE_CONN_STRING")
AGENT_ID    = os.getenv("AGENT1_ID")
MAX_RETRIES = 3
TIMEOUT_S   = 25  # shorter timeout

class Agent1:
    def __init__(self):
        self.lock = Lock()
        self.setup_client()

    def setup_client(self):
        """Create fresh client connection"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=CONN_STR
        )
        self.agent = self.client.agents.get_agent(AGENT_ID)
        logging.info("Created fresh client connection")

    def process_request(self, question: str, caller: str) -> str:
        with self.lock:
            thread = None
            try:
                self.setup_client()
                thread = self.client.agents.create_thread()
                logging.info(f"Created thread {thread.id}")
                self.client.agents.create_message(thread.id, role="user", content=question)
                run = self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)

                waited = 0
                while waited < TIMEOUT_S:
                    run = self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                    logging.info(f"Status: {run.status}")
                    if run.status == RunStatus.COMPLETED:
                        msgs = list(self.client.agents.list_messages(thread.id).data)
                        resp = self._extract_message(msgs)
                        return resp or RuntimeError("Empty response")
                    if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                        raise RuntimeError(f"Run failed: {run.status}")
                    time.sleep(1)
                    waited += 1

                raise RuntimeError(f"Timeout after {TIMEOUT_S}s")

            except Exception as e:
                logging.error(f"Error processing request: {e}")
                return f"Error: {e}"

            finally:
                if thread:
                    try:
                        self.client.agents.delete_thread(thread.id)
                        logging.info(f"Cleaned up thread {thread.id}")
                    except:
                        pass
                self.client = None
                self.agent = None

    def _extract_message(self, messages: list) -> str:
        for msg in reversed(messages):
            if msg.get("role") == "assistant":
                content = msg.get("content", [])
                if content and isinstance(content, list):
                    return content[0].get("text", {}).get("value", "").strip()
        return ""

# Single instance (now quiet on import)
_agent = Agent1()

def answer_question(question: str, caller: str = "Agent1") -> str:
    logging.info(f"📥 Received from {caller}: {question}")
    return _agent.process_request(question, caller)
```

## agents/agent2_global_intel/search.py
```python
...existing code...
```

## agents/agent3_consultant/logic.py
```python
...existing code...
```

## agents/agent4_outcome_predictor/logic.py
```python
...existing code...
```

## agents/agent5_task_dispatcher/logic.py
```python
...existing code...
```

## api/main.py
```python
...existing code...
```

## api/models.py
```python
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
```

## api/services/agent_manager.py
```python
...existing code...
```