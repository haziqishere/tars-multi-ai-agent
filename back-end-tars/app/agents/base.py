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