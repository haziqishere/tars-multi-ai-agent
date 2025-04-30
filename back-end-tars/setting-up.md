# TARS Multi-Agent System API Solution

This document contains a complete solution for implementing a REST API backend for the TARS Multi-Agent System, including Docker configuration, abstraction layer implementation, and deployment guides.

## Table of Contents

1. [Docker Configuration](#docker-configuration)
2. [Project Structure](#project-structure)
3. [API Models](#api-models)
4. [Agent Manager Service (Abstraction Layer)](#agent-manager-service-abstraction-layer)
5. [API Routes](#api-routes)
6. [Main FastAPI Application](#main-fastapi-application)
7. [Package Initialization Files](#package-initialization-files)
8. [Deployment Guide](#deployment-guide)
9. [Implementation Plan](#implementation-plan)
10. [Developer Guide](#developer-guide)
11. [Docker Run Script](#docker-run-script)
12. [Requirements File](#requirements-file)

---

## Docker Configuration

### Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port for the API
EXPOSE 8000

# Command to run the API server
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### .devcontainer/devcontainer.json

```json
{
    "name": "AI Agents API",
    "dockerFile": "../Dockerfile",
    "context": "..",
    "runArgs": [
        "--network=host"
    ],
    "customizations": {
        "vscode": {
            "extensions": [
                "ms-python.python",
                "ms-python.vscode-pylance",
                "redhat.vscode-yaml",
                "ms-azuretools.vscode-docker"
            ],
            "settings": {
                "python.linting.enabled": true,
                "python.linting.pylintEnabled": true,
                "python.formatting.provider": "black",
                "editor.formatOnSave": true,
                "python.formatting.blackArgs": [
                    "--line-length",
                    "100"
                ]
            }
        }
    },
    "forwardPorts": [8000],
    "postCreateCommand": "pip install -r requirements.txt"
}
```

---

## Project Structure

```
project/
├── .devcontainer/
│   └── devcontainer.json
├── api/
│   ├── __init__.py
│   ├── main.py              # Main FastAPI application
│   ├── models.py            # Pydantic models for request/response
│   ├── routes/
│   │   ├── __init__.py
│   │   └── optimization.py  # Endpoint handlers
│   └── services/
│       ├── __init__.py
│       └── agent_manager.py # Abstraction layer
├── agents/                  # Your existing agents
├── Dockerfile
├── README.md
└── requirements.txt
```

---

## API Models

### api/models.py

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


# Main Response Model
class OptimizationResponse(BaseModel):
    analysis: Analysis
    recommendations: Recommendations
    chatResponse: str


# Error Response Model
class ErrorResponse(BaseModel):
    error: str
```

---

## Agent Manager Service (Abstraction Layer)

### api/services/agent_manager.py

```python
import os
import json
import logging
import subprocess
import threading
import time
from typing import Dict, Any, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("agent_manager")

class AgentManager:
    """
    Abstraction layer between the AI Agents and the REST API.
    Manages starting, stopping, and communicating with the agent processes.
    """
    
    def __init__(self, base_dir: str = None):
        """
        Initialize the Agent Manager.
        
        Args:
            base_dir: Base directory where agent code is located
        """
        self.base_dir = base_dir or os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
        self.agent_processes = {}
        self.agent_statuses = {
            "agent1": False,
            "agent2": False,
            "agent3": False,
            "agent4": False,
            "agent5": False
        }
        logger.info(f"AgentManager initialized with base_dir: {self.base_dir}")
        
    def start_agents(self) -> Dict[str, bool]:
        """
        Start all AI agent processes if they're not already running.
        
        Returns:
            Dictionary of agent names and their running status
        """
        for agent_id in self.agent_statuses.keys():
            if not self.agent_statuses[agent_id]:
                self._start_agent(agent_id)
                
        # Allow time for agents to fully initialize
        time.sleep(5)
        return self.agent_statuses
    
    def _start_agent(self, agent_id: str) -> bool:
        """
        Start a specific agent process.
        
        Args:
            agent_id: Identifier for the agent (agent1, agent2, etc.)
            
        Returns:
            Boolean indicating if the agent was successfully started
        """
        if agent_id in self.agent_processes and self.agent_processes[agent_id].poll() is None:
            logger.info(f"Agent {agent_id} is already running")
            return True
            
        try:
            script_path = os.path.join(self.base_dir, f"run_{agent_id}.py")
            
            # Run the agent process
            process = subprocess.Popen(
                ["python3", "-X", "utf8", script_path],
                cwd=self.base_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            self.agent_processes[agent_id] = process
            self.agent_statuses[agent_id] = True
            
            # Start a thread to monitor the process output
            threading.Thread(
                target=self._monitor_agent_output,
                args=(agent_id, process),
                daemon=True
            ).start()
            
            logger.info(f"Successfully started {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start {agent_id}: {str(e)}")
            self.agent_statuses[agent_id] = False
            return False
    
    def _monitor_agent_output(self, agent_id: str, process: subprocess.Popen) -> None:
        """
        Monitor and log the output of an agent process.
        
        Args:
            agent_id: Identifier for the agent
            process: The subprocess.Popen object for the agent
        """
        for line in process.stdout:
            logger.info(f"[{agent_id}] {line.strip()}")
            
        # If we get here, the process has ended
        self.agent_statuses[agent_id] = False
        logger.info(f"Agent {agent_id} has stopped")
    
    def stop_agents(self) -> Dict[str, bool]:
        """
        Stop all running agent processes.
        
        Returns:
            Dictionary of agent names and their running status
        """
        for agent_id, process in self.agent_processes.items():
            if process.poll() is None:  # If the process is still running
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                
                self.agent_statuses[agent_id] = False
                logger.info(f"Stopped agent {agent_id}")
        
        return self.agent_statuses
    
    async def process_query(self, query: str) -> Dict[str, Any]:
        """
        Process a query through the AI agent system.
        
        Args:
            query: The user's query string
            
        Returns:
            Processed response data as a dictionary
        """
        # Ensure all agents are running
        self.start_agents()
        
        try:
            import httpx
            import asyncio
            import json
            
            logger.info(f"Processing query: {query}")
            
            # Step 1: Send the query to Agent 3 (Consultant Agent)
            # Agent 3 is the entry point for the system
            agent3_url = "http://localhost:8003/a2a/v1/tasks/send"
            
            payload = {
                "task_type": "global.news.summarize",
                "input": {
                    "parts": [
                        {
                            "type": "text",
                            "text": query
                        }
                    ]
                }
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Send request to Agent 3
                logger.info(f"Sending query to Agent 3: {query}")
                try:
                    response = await client.post(agent3_url, json=payload)
                    response.raise_for_status()
                    
                    # Extract response from Agent 3
                    agent3_response = response.json()
                    agent3_text = agent3_response.get("output", {}).get("artifacts", [{}])[0].get("text", "")
                    logger.info(f"Received response from Agent 3: {agent3_text[:100]}...")
                    
                    # Step 2: The agent system will automatically handle the workflow between
                    # Agent 3 -> Agent 4 -> Agent 5 as configured in the agents' code
                    
                    # Step 3: Wait for the processing to complete and gather results
                    # In a production system, this would use a more robust mechanism like
                    # webhooks, message queues, or a database to track the workflow state
                    
                    # For the first version, we'll use a polling approach to check Agent 4's status
                    agent4_url = "http://localhost:8004/a2a/v1/tasks/send"
                    
                    # Give time for Agent 3 to process and trigger Agent 4
                    await asyncio.sleep(5)
                    
                    # Step 4: Transform the agent outputs into the API response format
                    # For now, use our template response with the actual chat response
                    response = self._generate_response_template(query, agent3_text)
                    
                    # TODO for future improvement: 
                    # - Add monitoring of Agent 4/5 to get their outputs
                    # - Parse the outputs to build the full response structure
                    
                    return response
                    
                except httpx.HTTPStatusError as e:
                    logger.error(f"HTTP error when communicating with Agent 3: {e}")
                    # Fall back to sample response if communication fails
                    return self._generate_sample_response(query)
                    
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            # Fall back to sample response if anything goes wrong
            return self._generate_sample_response(query)
            
    def _generate_response_template(self, query: str, agent_response: str) -> Dict[str, Any]:
        """
        Generate a response using the template structure but incorporating
        the actual agent response.
        
        Args:
            query: The user's query string
            agent_response: The text response from Agent 3
            
        Returns:
            A response dictionary matching the API format
        """
        # Start with the sample response as a template
        response = self._generate_sample_response(query)
        
        # Update the chat response with the actual agent output
        response["chatResponse"] = agent_response
        
        # In the future, this could parse agent_response to extract more structured data
        # to fill in the analysis and recommendations sections
        
        return response
    
    def _generate_sample_response(self, query: str) -> Dict[str, Any]:
        """
        Generate a sample response based on the API documentation.
        This is a placeholder until the actual integration is complete.
        
        Args:
            query: The user's query string
            
        Returns:
            A sample response matching the expected format
        """
        # Note: In a real implementation, this would be replaced with actual
        # communication with your agent system
        
        # For now, we'll generate a simple response that matches the API structure
        # In the real implementation, this would come from Agent 3/4/5 output
        
        # Example response (similar to what's in the API docs)
        return {
            "analysis": {
                "businessFlow": {
                    "nodes": [
                        {"id": "node-1", "label": "Raw Materials Intake", "type": "start", "position": {"x": 50, "y": 100}},
                        {"id": "node-2", "label": "Quality Control", "type": "process", "position": {"x": 200, "y": 50}},
                        {"id": "node-3", "label": "Production Line A", "type": "process", "position": {"x": 350, "y": 100}},
                        {"id": "node-4", "label": "Production Line B", "type": "process", "position": {"x": 350, "y": 200}},
                        {"id": "node-5", "label": "Assembly", "type": "process", "position": {"x": 500, "y": 150}},
                        {"id": "node-6", "label": "Packaging", "type": "process", "position": {"x": 650, "y": 100}},
                        {"id": "node-7", "label": "Warehouse", "type": "end", "position": {"x": 800, "y": 150}}
                    ],
                    "edges": [
                        {"id": "edge-1", "source": "node-1", "target": "node-2", "label": "Inspection"},
                        {"id": "edge-2", "source": "node-2", "target": "node-3", "label": "Passed QC - High Priority"},
                        {"id": "edge-3", "source": "node-2", "target": "node-4", "label": "Passed QC - Standard"},
                        {"id": "edge-4", "source": "node-3", "target": "node-5", "label": "Component A"},
                        {"id": "edge-5", "source": "node-4", "target": "node-5", "label": "Component B"},
                        {"id": "edge-6", "source": "node-5", "target": "node-6", "label": "Assembled Product"},
                        {"id": "edge-7", "source": "node-6", "target": "node-7", "label": "Finished Goods"}
                    ]
                },
                "analytics": {
                    "currentAnnualCost": 8750000,
                    "efficiencyRating": 73,
                    "averageProcessTime": 14.5,
                    "riskAssessment": 63,
                    "trends": {
                        "costTrend": "increasing",
                        "efficiencyTrend": "stable",
                        "timeTrend": "increasing",
                        "riskTrend": "worsening"
                    }
                },
                "newsAndImpact": {
                    "newsItems": [
                        {
                            "id": "news-1",
                            "title": "New Tariff Regulations",
                            "date": "April 15, 2025",
                            "impact": "negative",
                            "description": "New tariffs of 25% imposed on key materials affecting Production Line B."
                        }
                    ],
                    "impactItems": [
                        {
                            "id": "impact-1",
                            "title": "Supply Chain Disruption",
                            "description": "Potential delays in raw material sourcing affecting production timeline",
                            "probability": 68,
                            "impact": 72
                        }
                    ]
                }
            },
            "recommendations": {
                "options": [
                    {
                        "id": "option-1",
                        "title": "Process Automation Strategy",
                        "description": "Implement AI-driven automation in the manufacturing workflow.",
                        "timeToImplement": "3-4 months",
                        "costReduction": "22% cost reduction",
                        "additionalMetrics": [
                            {
                                "label": "ROI",
                                "value": "134% in 12 months"
                            }
                        ],
                        "nodes": [
                            {"id": "node-1", "label": "Raw Materials Intake", "type": "start", "position": {"x": 50, "y": 100}},
                            {"id": "node-2", "label": "Automated Quality Control", "type": "process", "position": {"x": 200, "y": 100}}
                        ],
                        "edges": [
                            {"id": "edge-1", "source": "node-1", "target": "node-2", "label": "AI Sorting"}
                        ],
                        "financialImpact": [
                            {
                                "metricName": "Annual Operating Costs",
                                "current": 8750000,
                                "projected": 6825000,
                                "change": -22,
                                "unit": "$"
                            }
                        ],
                        "implementationPlan": [
                            {
                                "id": "task-1-1",
                                "department": "IT",
                                "task": "Setup automation infrastructure",
                                "duration": "4 weeks",
                                "status": "pending"
                            }
                        ]
                    }
                ]
            },
            "chatResponse": f"I've analyzed your request about \"{query}\" and generated optimization options. You can review the detailed business flow analysis, along with alternatives for process optimization."
        }

# Create a singleton instance
agent_manager = AgentManager()
```

---

## API Routes

### api/routes/optimization.py

```python
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

from api.models import OptimizationRequest, OptimizationResponse, ErrorResponse
from api.services.agent_manager import agent_manager

router = APIRouter()

@router.post(
    "/optimization", 
    response_model=OptimizationResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Process business optimization request",
    description="Analyzes a business process and generates optimization recommendations"
)
async def optimize_process(request: OptimizationRequest) -> Dict[str, Any]:
    """
    Process an optimization request and return analysis and recommendations.
    
    Args:
        request: The optimization request object containing the user query
        
    Returns:
        A dictionary with analysis, recommendations, and chat response
        
    Raises:
        HTTPException: If the query is invalid or an error occurs during processing
    """
    try:
        # Validate input
        if not request.query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
            
        # Process the query through the agent system
        result = await agent_manager.process_query(request.query)
        
        return result
        
    except Exception as e:
        # Log the exception
        import logging
        logging.error(f"Error processing optimization request: {str(e)}")
        
        # Return a standardized error response
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process optimization request"
        )
```

---

## Main FastAPI Application

### api/main.py

```python
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from api.routes.optimization import router as optimization_router
from api.services.agent_manager import agent_manager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("api")

# Create FastAPI app
app = FastAPI(
    title="TARS Multi-Agent System API",
    description="API for the TARS Multi-Agent System which analyzes and optimizes business processes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (update this for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(optimization_router, prefix="/api", tags=["Optimization"])

# Exception handler
@app.exception_handler(Exception)
async def handle_exception(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred"}
    )

# Startup event - Initialize agent manager
@app.on_event("startup")
async def startup_event():
    logger.info("Starting TARS Multi-Agent System API")
    try:
        # Start all agents on application startup
        agent_statuses = agent_manager.start_agents()
        logger.info(f"Agent statuses: {agent_statuses}")
    except Exception as e:
        logger.error(f"Error starting agents: {str(e)}")

# Shutdown event - Cleanup resources
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down TARS Multi-Agent System API")
    try:
        # Stop all agents on application shutdown
        agent_manager.stop_agents()
    except Exception as e:
        logger.error(f"Error stopping agents: {str(e)}")

# Root endpoint
@app.get("/", tags=["Health"])
async def root():
    return {"status": "operational", "message": "TARS Multi-Agent System API is running"}

# Healthcheck endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

# Agent status endpoint
@app.get("/api/agent-status", tags=["Diagnostics"])
async def agent_status():
    return {"agents": agent_manager.agent_statuses}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
```

---

## Package Initialization Files

### api/__init__.py

```python
# API package
```

### api/routes/__init__.py

```python
# Routes package
```

### api/services/__init__.py

```python
# Services package
```

---

## Deployment Guide

```markdown
# TARS Multi-Agent System Deployment Guide

This guide provides detailed steps for deploying the TARS Multi-Agent System API with Docker.

## Step 1: Prepare Your Environment

1. Ensure you have Docker installed:
   ```bash
   docker --version
   ```
   If Docker is not installed, follow the [official Docker installation guide](https://docs.docker.com/get-docker/).

2. Ensure you have Git installed:
   ```bash
   git --version
   ```
   If Git is not installed, follow the [official Git installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).

## Step 2: Clone the Repository

1. Clone the repository containing the AI Agents and the API code:
   ```bash
   git clone <repository-url>
   cd tars-multi-agent-api
   ```

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add required environment variables to the `.env` file:
   ```
   PORT=8000
   AZURE_CONN_STRING=<your-azure-connection-string>
   AGENT1_ID=<your-agent1-id>
   AGENT2_ID=<your-agent2-id>
   AGENT3_ID=<your-agent3-id>
   AGENT4_ID=<your-agent4-id>
   AGENT5_ID=<your-agent5-id>
   ```

## Step 4: Build the Docker Image

1. Build the Docker image:
   ```bash
   docker build -t tars-multi-agent-api .
   ```

2. Verify the image was created:
   ```bash
   docker images
   ```
   You should see `tars-multi-agent-api` in the list.

## Step 5: Run the Docker Container

1. Start the container:
   ```bash
   docker run -d -p 8000:8000 --name tars-api-container tars-multi-agent-api
   ```

2. Verify the container is running:
   ```bash
   docker ps
   ```
   You should see `tars-api-container` with the status "Up".

## Step 6: Test the API

1. Test the API health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```
   Expected response: `{"status":"healthy"}`

2. Test the agent status endpoint:
   ```bash
   curl http://localhost:8000/api/agent-status
   ```
   Expected response: A JSON object showing the status of each agent.

3. Test the optimization endpoint:
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"query":"Analyze our manufacturing process"}' http://localhost:8000/api/optimization
   ```

## Step 7: View API Documentation

1. Open the Swagger UI in your browser:
   ```
   http://localhost:8000/docs
   ```

2. Explore the available endpoints and test them through the UI.

## Step 8: Monitor the Application

1. View container logs:
   ```bash
   docker logs -f tars-api-container
   ```

2. Check the status of the agents:
   ```bash
   curl http://localhost:8000/api/agent-status
   ```

## Step 9: Stop the Container

1. Stop the container:
   ```bash
   docker stop tars-api-container
   ```

2. Remove the container when no longer needed:
   ```bash
   docker rm tars-api-container
   ```

## Troubleshooting

### Problem: Container fails to start

1. Check the logs:
   ```bash
   docker logs tars-api-container
   ```

2. Verify the environment variables are correctly set:
   ```bash
   docker exec -it tars-api-container env
   ```

3. Check if the ports are already in use:
   ```bash
   sudo lsof -i :8000
   ```

### Problem: Agents fail to start

1. Check the agent logs through the container logs:
   ```bash
   docker logs tars-api-container | grep "Agent"
   ```

2. Verify the agent processes:
   ```bash
   docker exec -it tars-api-container ps aux
   ```

## Next Steps

After successful deployment, you can:

1. Configure your front-end application to use the API
2. Set up monitoring and alerts
3. Implement a CI/CD pipeline for automated deployment
```

---

## Implementation Plan

```markdown
# TARS Multi-Agent System - Implementation Plan

This document outlines the implementation plan for enhancing the abstraction layer between the AI Agents and the REST API.

## Current State

The current implementation includes:
- A basic FastAPI server with the required API endpoint
- An agent manager service that can start and monitor agent processes
- A simplified communication mechanism with Agent 3
- Placeholder response generation based on the API documentation

## Future Improvements

### Phase 1: Robust Agent Communication (2 weeks)

1. **Implement HTTP-based Agent Communication**
   - Develop a client module for each agent's API
   - Implement proper error handling and retry logic
   - Add request/response logging for debugging
   - Set up proper authentication if required

2. **Enhance Agent Process Management**
   - Implement health checks for each agent
   - Add automatic restart capability for failed agents
   - Create a centralized logging system
   - Add process resource monitoring (CPU, memory)

3. **Create Response Parser**
   - Develop a parser for Agent 3's unstructured text output
   - Extract structured data for the API response
   - Map agent outputs to the API response structure
   - Create fallback mechanisms for missing data

### Phase 2: Advanced Workflow Management (3 weeks)

1. **Implement Workflow Tracking**
   - Create a database schema for tracking query workflows
   - Add workflow state tracking (submitted, processing, completed)
   - Implement query result caching for identical requests
   - Add timeout handling for long-running queries

2. **Job Queue Implementation**
   - Set up a message queue system (RabbitMQ or Redis)
   - Implement a job scheduler for agent tasks
   - Add rate limiting to prevent agent overload
   - Set up priority queues for important requests

3. **Agent Coordination Improvements**
   - Implement a workflow engine for coordinating agent tasks
   - Add parallel processing capabilities where possible
   - Create a feedback mechanism between agents
   - Implement conditional execution paths based on intermediate results

### Phase 3: Monitoring and Administration (2 weeks)

1. **Admin Dashboard**
   - Create a web-based admin interface
   - Add real-time agent status monitoring
   - Implement agent log viewer
   - Add performance metrics and statistics

2. **Alerting System**
   - Set up alerts for agent failures
   - Create notifications for system overload
   - Implement error rate monitoring
   - Add proactive system health checks

3. **Analytics and Reporting**
   - Develop usage analytics
   - Create performance reports
   - Add query success/failure tracking
   - Implement user feedback collection

### Phase 4: System Optimization (3 weeks)

1. **Performance Tuning**
   - Optimize agent communication patterns
   - Implement request batching for efficiency
   - Add caching for frequent queries
   - Profile and optimize bottlenecks

2. **Scalability Improvements**
   - Make the system horizontally scalable
   - Implement agent instance pooling
   - Add load balancing for agent requests
   - Create auto-scaling capabilities

3. **Resilience Enhancements**
   - Implement circuit breakers for agent calls
   - Add graceful degradation strategies
   - Create fallback responses for unavailable agents
   - Implement comprehensive disaster recovery

## Implementation Timeline

| Phase | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 1 | Agent Communication | 1 week | None |
| 1 | Process Management | 0.5 week | None |
| 1 | Response Parser | 0.5 week | Agent Communication |
| 2 | Workflow Tracking | 1 week | Phase 1 |
| 2 | Job Queue | 1 week | Workflow Tracking |
| 2 | Agent Coordination | 1 week | Job Queue |
| 3 | Admin Dashboard | 1 week | Phase 2 |
| 3 | Alerting System | 0.5 week | Admin Dashboard |
| 3 | Analytics | 0.5 week | Alerting System |
| 4 | Performance Tuning | 1 week | Phase 3 |
| 4 | Scalability | 1 week | Performance Tuning |
| 4 | Resilience | 1 week | Scalability |

## Resource Requirements

- 1 Backend Developer (Full-time)
- 1 DevOps Engineer (Part-time)
- 1 QA Engineer (Part-time)

## Technical Debt Considerations

1. The current abstraction layer uses a polling-based approach for monitoring agent progress, which should be replaced with an event-driven architecture.
2. Error handling is currently basic and should be enhanced with proper retry logic and circuit breakers.
3. The system lacks proper authentication and authorization mechanisms.
4. There is no persistent storage for queries and results, limiting troubleshooting capabilities.

## Success Metrics

- API response time < 5 seconds for 95% of requests
- Agent startup time < 10 seconds
- System uptime > 99.9%
- Failed query rate < 1%
- Query throughput > 10 queries per minute
```

---

## Developer Guide

```markdown
# TARS Multi-Agent System - Developer Guide

This guide provides detailed instructions for developers who need to extend or modify the abstraction layer between the AI Agents and the REST API.

## System Overview

The TARS Multi-Agent System consists of:

1. **Five AI Agents**:
   - Agent 1: Enterprise Knowledge - Retrieves information from internal documents
   - Agent 2: Global Intelligence - Gathers information from external sources
   - Agent 3: Consultant - Analyzes and summarizes information
   - Agent 4: Outcome Predictor - Predicts potential outcomes of strategic decisions
   - Agent 5: Task Dispatcher - Assigns tasks based on outcomes

2. **REST API Layer**:
   - FastAPI application that provides endpoints for the front-end
   - Handles request validation, routing, and response formatting

3. **Abstraction Layer**:
   - Manages agent processes
   - Facilitates communication between the API and agents
   - Transforms agent outputs into standardized API responses

## Understanding the Code Structure

```
api/
├── models.py              # Pydantic models for request/response
├── routes/
│   └── optimization.py    # API endpoint handlers
└── services/
    └── agent_manager.py   # Abstraction layer for AI Agents
```

The key component is `agent_manager.py`, which handles:
- Starting and stopping agent processes
- Sending requests to agents
- Processing agent responses
- Transforming data into the API response format

## Step-by-Step Guide to Modify the Abstraction Layer

### 1. Understanding the AgentManager Class

The `AgentManager` class in `api/services/agent_manager.py` is the main interface between the API and the agents. It has these key methods:

- `start_agents()`: Starts all agent processes
- `stop_agents()`: Stops all agent processes
- `process_query()`: Processes a query through the agent system
- `_monitor_agent_output()`: Monitors agent process outputs
- `_generate_sample_response()`: Generates a response based on the API documentation

### 2. Modifying Agent Communication

To modify how the API communicates with the agents:

1. Open `api/services/agent_manager.py`
2. Locate the `process_query()` method
3. Modify the HTTP request to Agent 3
4. Update the response parsing logic

Example:

```python
# Current implementation
async def process_query(self, query: str) -> Dict[str, Any]:
    # ... existing code ...
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(agent3_url, json=payload)
        # ... processing response ...
        
    # ... returning result ...
```

To add a new parameter to the agent request:

```python
# Modified implementation
async def process_query(self, query: str, additional_param: str = None) -> Dict[str, Any]:
    # ... existing code ...
    
    payload = {
        "task_type": "global.news.summarize",
        "input": {
            "parts": [
                {
                    "type": "text",
                    "text": query
                }
            ]
        }
    }
    
    # Add the additional parameter if provided
    if additional_param:
        payload["additional_param"] = additional_param
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(agent3_url, json=payload)
        # ... processing response ...
        
    # ... returning result ...
```

### 3. Adding Support for New Agent 5 Output

To handle the output from Agent 5:

1. Create a response parser for Agent 5's output:

```python
def _parse_agent5_response(self, response_text: str) -> Dict[str, Any]:
    """
    Parse the response from Agent 5 and transform it into API response format.
    
    Args:
        response_text: Raw text response from Agent 5
        
    Returns:
        Parsed data in the format required for the API response
    """
    # This is a placeholder. Implement actual parsing logic based on the
    # format of Agent 5's output.
    try:
        # Example: If Agent 5 outputs JSON
        import json
        data = json.loads(response_text)
        
        # Transform the data into the required format
        # ...
        
        return data
    except json.JSONDecodeError:
        # Fallback if the response is not valid JSON
        logger.error("Failed to parse Agent 5 response as JSON")
        return {}
```

2. Add the call to Agent 5 in the `process_query()` method:

```python
async def process_query(self, query: str) -> Dict[str, Any]:
    # ... existing code for Agent 3 ...
    
    # Now also get results from Agent 5
    agent5_url = "http://localhost:8080/a2a/v1/tasks/send"
    
    try:
        # Send the Agent 3 response to Agent 5
        agent5_payload = {
            "branch": "A",  # This might need to be extracted from Agent 3's response
            "action": "Process optimization",
            "actionItems": ["Task 1", "Task 2"]  # Extract from Agent 3's response
        }
        
        agent5_response = await client.post(agent5_url, json=agent5_payload)
        agent5_response.raise_for_status()
        agent5_data = agent5_response.json()
        
        # Parse Agent 5's response
        agent5_parsed = self._parse_agent5_response(agent5_data)
        
        # Incorporate Agent 5's results into the response
        response = self._generate_response_template(query, agent3_text)
        response.update(agent5_parsed)
        
        return response
    except Exception as e:
        logger.error(f"Error communicating with Agent 5: {str(e)}")
        return self._generate_response_template(query, agent3_text)
```

### 4. Modifying the Response Format

To change the response format:

1. Update the Pydantic models in `api/models.py`
2. Modify the `_generate_response_template()` method in `agent_manager.py`

Example:

```python
def _generate_response_template(self, query: str, agent_response: str) -> Dict[str, Any]:
    """
    Generate a response using the template structure but incorporating
    the actual agent response.
    
    Args:
        query: The user's query string
        agent_response: The text response from Agent 3
        
    Returns:
        A response dictionary matching the API format
    """
    # Extract key components from the agent response
    # This is a simplified example - in practice, you'd need more sophisticated parsing
    import re
    
    # Extract strategic implications (lines following "### Strategic Implications")
    strategic_implications = []
    for match in re.finditer(r'### Strategic Implications\s*\n((?:- .*\n?)*)', agent_response):
        implications_text = match.group(1)
        # Split by bullet points and clean up
        implications = [
            line.strip('- ').strip() 
            for line in implications_text.split('\n') 
            if line.strip().startswith('- ')
        ]
        strategic_implications.extend(implications)
    
    # Build response with the extracted data
    response = {
        "analysis": {
            "businessFlow": {
                # Your business flow data
            },
            "analytics": {
                # Your analytics data
            },
            "newsAndImpact": {
                "newsItems": [],
                "impactItems": []
            }
        },
        "recommendations": {
            "options": [
                {
                    "id": "option-1",
                    "title": "Process Optimization Strategy",
                    "description": "Based on the analysis",
                    # Add strategic implications from the agent response
                    "strategicImplications": strategic_implications,
                    # Other fields...
                }
            ]
        },
        "chatResponse": agent_response
    }
    
    return response
```

### 5. Adding New API Endpoints

To add a new API endpoint:

1. Create a new route file in `api/routes/` or extend the existing one
2. Add the new endpoint to the FastAPI application in `api/main.py`

Example for adding an agent status endpoint:

```python
# In api/routes/diagnostics.py
from fastapi import APIRouter, HTTPException
from api.services.agent_manager import agent_manager

router = APIRouter()

@router.get("/agent-details", tags=["Diagnostics"])
async def agent_details():
    """
    Get detailed information about each agent's status and performance.
    """
    # Collect detailed information from each agent
    details = {}
    
    for agent_id, status in agent_manager.agent_statuses.items():
        details[agent_id] = {
            "running": status,
            "uptime": agent_manager.get_agent_uptime(agent_id),
            "memory_usage": agent_manager.get_agent_memory_usage(agent_id),
            "requests_processed": agent_manager.get_agent_request_count(agent_id)
        }
    
    return details
```

Then in `api/main.py`:

```python
# Import the new router
from api.routes.diagnostics import router as diagnostics_router

# Add the router to the app
app.include_router(diagnostics_router, prefix="/api", tags=["Diagnostics"])
```

### 6. Testing Your Changes

Always test your changes with:

1. **Unit Tests**:
   - Create tests for individual components
   - Test agent response parsing
   - Test error handling

2. **Integration Tests**:
   - Test the full workflow from API request to response
   - Test with different query types
   - Test error scenarios

3. **Manual Testing**:
   - Use the API documentation UI (Swagger UI)
   - Try different query formats
   - Verify the responses match the expected format

## Common Gotchas and Troubleshooting

1. **Agent Process Management**:
   - Ensure you handle subprocess cleanup properly
   - Watch for zombie processes
   - Monitor for memory leaks

2. **Error Handling**:
   - Always handle exceptions when communicating with agents
   - Provide meaningful error messages
   - Implement retry logic for transient failures

3. **Response Parsing**:
   - Agent responses may change format
   - Plan for missing or malformed data
   - Use defensive programming techniques

4. **Performance Considerations**:
   - Be careful with blocking operations
   - Use async where appropriate
   - Consider timeout handling

## Next Steps for Improvements

1. **Message Queue Integration**:
   - Implement a message queue (RabbitMQ, Redis) for agent communication
   - Create a worker pool for processing requests
   - Add support for asynchronous processing

2. **Database Integration**:
   - Add a database to store query results
   - Implement caching for frequently asked questions
   - Track query history and performance metrics

3. **Authentication and Authorization**:
   - Add user authentication
   - Implement role-based access control
   - Add rate limiting for API users

## Contribution Guidelines

1. Follow the existing code style
2. Add appropriate error handling
3. Write tests for new functionality
4. Update documentation with changes
5. Use meaningful commit messages
```

---

## Docker Run Script

### run.sh

```bash
#!/bin/bash

# Build the Docker image
docker build -t tars-multi-agent-api .

# Run the container
docker run -p 8000:8000 --name tars-api-container tars-multi-agent-api
```

---

## Requirements File

### requirements.txt

```
fastapi==0.104.1
uvicorn==0.23.2
pydantic==2.4.2
python-dotenv==1.0.0
httpx==0.25.0
python-multipart==0.0.6
azure-identity==1.15.0
azure-ai-projects==1.0.0b1
```

---

## README.md

```markdown
# TARS Multi-Agent System API

This repository contains the API server for the TARS Multi-Agent System, a collection of AI agents that work together to analyze business processes and provide optimization recommendations.

## System Architecture

The system is built with the following components:

- **FastAPI Backend**: Provides REST API endpoints for the front-end to communicate with
- **AI Agent System**: A collection of five specialized AI agents that work together to process business queries
- **Docker Container**: Packages the entire system for easy deployment

The architecture follows this flow:
1. Front-end sends a query to the REST API endpoint
2. The API server processes the request and forwards it to the AI Agent system
3. The AI Agents analyze the query and generate recommendations
4. The API server compiles the response and sends it back to the front-end

## Getting Started

### Prerequisites

- Docker
- Git
- Python 3.9+ (for local development outside Docker)

### Setup Instructions

1. **Clone the repository**:

```bash
git clone <repository-url>
cd tars-multi-agent-api
```

2. **Build and run the Docker container**:

```bash
# Make the run script executable
chmod +x run.sh

# Build and run
./run.sh
```

Alternatively, you can build and run manually:

```bash
# Build the Docker image
docker build -t tars-multi-agent-api .

# Run the container
docker run -p 8000:8000 --name tars-api-container tars-multi-agent-api
```

3. **Verify the API is running**:

Visit `http://localhost:8000/docs` in your browser to see the Swagger documentation.

### Development Environment

For development with Visual Studio Code, you can use the included DevContainer configuration:

1. Open the project folder in VS Code
2. When prompted, select "Reopen in Container"
3. VS Code will build the container and provide a development environment

## API Documentation

### Endpoints

#### `POST /api/optimization`

Process a business optimization request.

**Request Body**:
```json
{
  "query": "Analyze and optimize our manufacturing supply chain process"
}
```

**Response**: The response follows the structure documented in the API Documentation.

## Project Structure

```
project/
├── .devcontainer/
│   └── devcontainer.json      # VS Code Dev Container configuration
├── api/
│   ├── main.py                # Main FastAPI application
│   ├── models.py              # Pydantic models for request/response
│   ├── routes/
│   │   └── optimization.py    # Endpoint handlers
│   └── services/
│       └── agent_manager.py   # Abstraction layer for AI Agents
├── agents/                    # AI Agent code
├── Dockerfile                 # Docker configuration
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Integration with Front-end

To integrate with the front-end, make API requests to the endpoint:

```javascript
// Example using fetch
const response = await fetch('http://localhost:8000/api/optimization', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'Analyze and optimize our manufacturing supply chain process'
  }),
});

const data = await response.json();
// Process the response data
```

## Environment Variables

The application uses the following environment variables:

- `PORT`: Port for the API server (default: 8000)
- Additional environment variables may be required by the AI Agents

## Troubleshooting

### Agent Status Checking

You can check the status of the AI Agents by visiting:
```
http://localhost:8000/api/agent-status
```

### Logs

To view container logs:
```bash
docker logs tars-api-container
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[Specify your license here]
```