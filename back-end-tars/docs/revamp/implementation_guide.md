# TARS Implementation Guide

This guide provides step-by-step instructions for implementing the improved TARS architecture.

## Getting Started

### Project Structure

First, set up the following directory structure for the new architecture:

```
tars/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── formatter.py         # Response formatting
│   ├── process_manager.py   # Orchestration
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py          # Agent interface
│   │   ├── agent1_enterprise_knowledge.py
│   │   ├── agent2_global_intel.py
│   │   ├── agent3_consultant.py
│   │   ├── agent4_outcome_predictor.py
│   │   └── agent5_task_dispatcher.py
│   └── utils/
│       ├── __init__.py
│       ├── config.py        # Pydantic settings
│       ├── logging.py       # Logging utilities
│       └── azure_helpers.py # Azure utility functions
├── prompts/                 # Keep existing prompts folder
│   ├── agent4_branches.txt
│   ├── agent5_parse_input.txt
│   └── ...
├── shared/                  # Keep existing shared folder
│   ├── departments.json
│   └── utils.py
├── .env                     # Environment variables
├── requirements.txt
└── run.py                   # Entry point script
```

### Installation

1. Install the dependencies:

```bash
pip install -r requirements.txt
```

2. Set up environment variables in `.env`:

```
AZURE_CONN_STRING=your_connection_string
AGENT1_ID=your_agent1_id
AGENT2_ID=your_agent2_id
AGENT3_ID=your_agent3_id
AGENT4_ID=your_agent4_id
AGENT5_ID=your_agent5_id
SEARCH1API_KEY=your_search_api_key
PORT=8000
DEBUG=true
```

## Implementation Steps

### 1. Set Up Agent Interface

Create the base Agent interface in `app/agents/base.py`:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
import asyncio

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
```

### 2. Implement Configuration

Create the configuration module in `app/utils/config.py`:

```python
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
    
    # CORS settings
    CORS_ORIGINS: list = ["*"]
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

### 3. Implement Agent Classes

Implement each agent by adapting the core logic from the original implementation, but wrapping it in the new interface. For example, for Agent 1:

```python
# app/agents/agent1_enterprise_knowledge.py
from typing import Dict, Any
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
import os
import time
import asyncio

from app.agents.base import Agent
from app.utils.config import settings

class EnterpriseKnowledgeAgent(Agent):
    """Agent 1: Retrieves information from internal company documents"""
    
    @property
    def name(self) -> str:
        return "Enterprise Knowledge Agent"
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a question using internal knowledge base"""
        question = input_data.get("question", "")
        caller = input_data.get("caller", "Agent3")
        
        self.logger.info(f"📥 Received from {caller}: {question}")
        
        # Adapt the existing logic to be async-friendly
        result = await self._handle_timeout(
            self._process_request(question),
            timeout_seconds=settings.AGENT1_TIMEOUT,
            fallback_data={"response": f"Unable to retrieve information about '{question}'"}
        )
        
        return {
            "question": question,
            "response": result.get("response", "No response generated"),
            "caller": caller
        }
    
    async def _process_request(self, question: str) -> Dict[str, Any]:
        """Core processing logic as async coroutine"""
        # Async version of the original process_request method
        # ...
```

Repeat this pattern for each agent, adapting the core logic to be async-friendly and use the new interface.

### 4. Implement Process Manager

Create the Process Manager in `app/process_manager.py`:

```python
from typing import Dict, Any
import asyncio
import logging
import time
import traceback

from app.agents.base import Agent
from app.utils.config import settings
from app.formatter import format_response

class ProcessManager:
    """Orchestrates the flow between agents"""
    
    def __init__(self, agents: Dict[str, Agent]):
        self.agents = agents
        self.logger = logging.getLogger("tars.process_manager")
    
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
            
            # Continue with other agents in sequence
            # ...
            
            # Format the final response
            return format_response(context)
            
        except Exception as e:
            self.logger.error(f"❌ Error in process_request: {str(e)}")
            context["errors"].append({
                "stage": "process_manager",
                "error": str(e),
                "traceback": traceback.format_exc()
            })
            
            # Try to format partial results
            try:
                return format_response(context)
            except:
                # Last resort fallback
                return {
                    "error": f"Processing failed: {str(e)}",
                    "chatResponse": f"I'm sorry, but I encountered an error while processing your request."
                }
    
    async def _call_agent_with_fallback(self, agent_id: str, input_data: Dict[str, Any], 
                                       context: Dict[str, Any]) -> Dict[str, Any]:
        """Call an agent with timeout and fallback handling"""
        # Implementation with timeout and fallback
        # ...
```

### 5. Implement Response Formatter

Create the response formatter in `app/formatter.py`:

```python
from typing import Dict, Any, List, Optional
import logging
import json
import re
from datetime import datetime

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
    
    # ... more formatting logic ...
    
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
```

### 6. Implement FastAPI Application

Create the FastAPI application in `app/main.py`:

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from typing import Dict, Any

from app.utils.config import settings
from app.process_manager import ProcessManager
from app.agents.agent1_enterprise_knowledge import EnterpriseKnowledgeAgent
from app.agents.agent2_global_intel import GlobalIntelligenceAgent
from app.agents.agent3_consultant import ConsultantAgent
from app.agents.agent4_outcome_predictor import OutcomePredictorAgent
from app.agents.agent5_task_dispatcher import TaskDispatcherAgent

# Configure root logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tars.main")

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
process_manager = None

@app.on_event("startup")
async def startup_event():
    """Initialize components on startup"""
    global process_manager
    logger.info("Initializing agents and process manager")
    
    # Initialize agents and process manager
    # ...

# API Routes
@app.post("/api/optimization")
async def optimize(request: OptimizationRequest):
    """Process an optimization request"""
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
```

### 7. Create Entry Point Script

Create a simple entry point script in `run.py`:

```python
import uvicorn
from app.utils.config import settings

if __name__ == "__main__":
    print(f"Starting TARS Multi-Agent System on port {settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
```

## Testing the Implementation

### Unit Testing

Create unit tests for each component to ensure they work correctly in isolation:

1. Test the Agent interface with mock implementations
2. Test the Process Manager with mock agents
3. Test the Response Formatter with sample data
4. Test the FastAPI endpoints with test clients

### Integration Testing

Test the entire system end-to-end:

1. Start the FastAPI server
2. Send sample requests to the `/api/optimization` endpoint
3. Verify the responses are correctly formatted
4. Check error handling by simulating agent failures

## Deployment Considerations

### Environment Variables

Ensure all necessary environment variables are set in production:

- `AZURE_CONN_STRING`: Connection string for Azure AI services
- `AGENT1_ID` through `AGENT5_ID`: Azure agent IDs
- `SEARCH1API_KEY`: API key for search services
- `PORT`: Server port (default 8000)
- `DEBUG`: Set to false in production

### Containerization

Create a Dockerfile for containerization:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "run.py"]
```

### Scaling Considerations

For production deployment:

1. Use Gunicorn with multiple workers for better concurrency
2. Consider using Redis for shared state if scaling horizontally
3. Implement proper monitoring and logging for production use
4. Set appropriate timeout values based on production performance

## Conclusion

This implementation guide provides a structured approach to rebuilding the TARS multi-agent system with improved reliability, maintainability, and performance. By following these steps, you'll create a robust system that maintains the specialized capabilities of each agent while eliminating the issues with the current architecture.