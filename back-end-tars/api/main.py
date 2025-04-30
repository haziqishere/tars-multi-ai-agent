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