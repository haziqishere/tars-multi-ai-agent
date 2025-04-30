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
        self.agent_start_times = {}
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
            
            # Run the agent process with explicit "serve" argument
            process = subprocess.Popen(
                ["python3", "-X", "utf8", script_path, "serve"],
                cwd=self.base_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            self.agent_processes[agent_id] = process
            self.agent_statuses[agent_id] = True
            self.agent_start_times[agent_id] = time.time()
            
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
        if agent_id in self.agent_start_times:
            del self.agent_start_times[agent_id]
        logger.info(f"Agent {agent_id} has stopped")
    
    def get_agent_uptime(self, agent_id: str) -> int:
        """
        Get the uptime of an agent in seconds.
        
        Args:
            agent_id: Identifier for the agent
            
        Returns:
            Uptime in seconds or 0 if agent is not running
        """
        if agent_id in self.agent_start_times:
            return int(time.time() - self.agent_start_times[agent_id])
        return 0
    
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
                if agent_id in self.agent_start_times:
                    del self.agent_start_times[agent_id]
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