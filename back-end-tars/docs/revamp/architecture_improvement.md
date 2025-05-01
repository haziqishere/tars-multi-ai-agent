# TARS Multi-Agent System - Improved Architecture

## Overview

This document outlines an improved architecture for the TARS Multi-Agent System, addressing the current issues with agent communication and response formatting. The architecture consolidates the separate agent servers into a unified FastAPI application with a more robust coordination mechanism.

## Key Improvements

1. **Unified Application**: Consolidate all agents into a single FastAPI application
2. **Process Manager**: Central orchestrator for agent coordination 
3. **Pipeline Pattern**: Structured flow of data between agents
4. **Enhanced Error Handling**: Graceful fallbacks and retries
5. **State Management**: Centralized state for the entire process
6. **Standardized Response Format**: Consistent JSON output

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FastAPI Application                            │
│                                                                     │
│  ┌─────────────┐       ┌─────────────────┐      ┌───────────────┐   │
│  │  API Routes │───────▶ Process Manager │─────▶│ Response      │   │
│  │  /optimize  │       │ (Orchestrator)  │      │ Formatter     │   │
│  └─────────────┘       └─────────────────┘      └───────────────┘   │
│          │                     │                        ▲           │
│          │                     ▼                        │           │
│          │      ┌───────────────────────────────────────┐           │
│          │      │            Agent Pipeline             │           │
│          │      │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │           │
│          │      │  │  1  │─▶│  3  │─▶│  4  │─▶│  5  │   │           │
│          │      │  └─────┘  └─────┘  └─────┘  └─────┘   │           │
│          │      │     ▲        │                        │           │
│          │      │     │        ▼                        │           │
│          │      │  ┌─────┐                              │           │
│          │      │  │  2  │                              │           │
│          │      │  └─────┘                              │           │
│          │      └───────────────────────────────────────┘           │
│          │                                                          │
│          │                                                          │
│          ▼                                                          │
│  ┌─────────────┐                                                    │
│  │ Monitoring  │                                                    │
│  │ & Logging   │                                                    │
│  └─────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Components

### 1. Agent Interface

Define a common interface that all agents will implement:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class Agent(ABC):
    """Base interface for all TARS agents"""
    
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
    def name(self) -> str:
        """Return the agent's name"""
        pass
```

### 2. Agent Implementations

Each agent will be implemented as a class that inherits from the Agent interface:

```python
class EnterpriseKnowledgeAgent(Agent):
    """Agent 1: Retrieves information from internal company documents"""
    
    @property
    def name(self) -> str:
        return "Enterprise Knowledge Agent"
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        # Implementation using existing logic.py functionality
        # ...
```

### 3. Process Manager

A central orchestrator that manages the flow of data between agents:

```python
class ProcessManager:
    """Orchestrates the flow between agents"""
    
    def __init__(self, agents: Dict[str, Agent]):
        self.agents = agents
        self.context = {}
    
    async def process_request(self, query: str) -> Dict[str, Any]:
        """Process a user query through the agent pipeline"""
        
        # Initialize context for this request
        self.context = {"query": query, "results": {}}
        
        try:
            # Agent 3 (Consultant) is the entry point
            agent3_result = await self.agents["agent3"].process(
                {"query": query}, 
                self.context
            )
            self.context["results"]["agent3"] = agent3_result
            
            # Continue with Agent 4 (Outcome Predictor)
            agent4_result = await self.agents["agent4"].process(
                {"analysis": agent3_result.get("enhanced_answer", "")},
                self.context
            )
            self.context["results"]["agent4"] = agent4_result
            
            # Finally, Agent 5 (Task Dispatcher)
            agent5_result = await self.agents["agent5"].process(
                {"prediction": agent4_result.get("final_prediction", "")},
                self.context
            )
            self.context["results"]["agent5"] = agent5_result
            
            # Format the final response
            return self.format_response()
            
        except Exception as e:
            # Handle errors gracefully
            return {
                "error": f"Processing failed: {str(e)}",
                "partial_results": self.context.get("results", {})
            }
    
    def format_response(self) -> Dict[str, Any]:
        """Format the agent results into the API response structure"""
        # Implementation to transform context into proper API response
        # ...
```

### 4. API Routes

The FastAPI routes that expose the TARS functionality:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class OptimizationRequest(BaseModel):
    query: str
    
@app.post("/api/optimization")
async def optimize(request: OptimizationRequest):
    """Process an optimization request"""
    try:
        result = await process_manager.process_request(request.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 5. Response Formatter

A dedicated component to ensure consistent JSON response format:

```python
def format_response(agent_results: Dict[str, Any]) -> Dict[str, Any]:
    """Format agent results into the standardized API response"""
    
    # Extract data from agent results
    agent3_data = agent_results.get("agent3", {})
    agent4_data = agent_results.get("agent4", {})
    agent5_data = agent_results.get("agent5", {})
    
    # Create business flow visualization
    business_flow = create_business_flow(agent3_data, agent4_data)
    
    # Create analytics data
    analytics_data = create_analytics_data(agent3_data, agent4_data)
    
    # Create news and impact data
    news_impact_data = create_news_impact(agent3_data)
    
    # Create recommendation options
    options = create_options(agent4_data)
    
    # Create summary card (if available)
    summary_card = create_summary_card(agent5_data) if agent5_data else None
    
    # Create chat response
    chat_response = agent3_data.get("enhanced_answer", "No response generated")
    
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

## Benefits of This Approach

1. **Simplified Architecture**: Single application instead of multiple servers
2. **Improved Reliability**: Centralized error handling and recovery
3. **Better Debugging**: Single process makes debugging easier
4. **Consistent State**: Shared context across all agents
5. **Reduced Overhead**: No HTTP overhead for inter-agent communication
6. **Graceful Degradation**: Partial results available even if some agents fail
7. **Easier Deployment**: Single application to deploy and scale