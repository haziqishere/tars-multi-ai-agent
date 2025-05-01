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