from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

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
class OptimizationRequest(BaseModel):
    query: str

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
        query = request.query
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
        reload=settings.DEBUG,
        timeout_keep_alive=300,  # Extended keep-alive timeout
        timeout_graceful_shutdown=300  # Extended graceful shutdown timeout
    ) 