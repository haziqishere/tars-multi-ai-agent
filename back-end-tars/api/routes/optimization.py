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