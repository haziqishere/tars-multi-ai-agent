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
                    
                    # Step 2: Check for Agent 5's output to get the summaryCard data
                    # Allow time for processing to complete through the agent chain
                    await asyncio.sleep(10)
                    
                    # Try to get Agent 5's output for the summaryCard
                    agent5_url = "http://localhost:8005/a2a/v1/tasks/send"
                    summary_card_data = None
                    
                    try:
                        # For demonstration purposes, we're sending a simple query to agent5
                        # In a production system, there would be a more robust message passing system
                        agent5_payload = {
                            "branch": "Operations",
                            "action": "Process Optimization",
                            "actionItems": ["Automate quality control", "Reduce production cycle time", "Improve supply chain visibility"],
                            "query": query
                        }
                        
                        agent5_response = await client.post(agent5_url, json=agent5_payload)
                        if agent5_response.status_code == 200:
                            agent5_data = agent5_response.json()
                            if "api_response" in agent5_data and "summaryCard" in agent5_data["api_response"]:
                                summary_card_data = agent5_data["api_response"]["summaryCard"]
                                logger.info("Successfully retrieved summaryCard data from Agent 5")
                    except Exception as e:
                        logger.warning(f"Error retrieving Agent 5 summaryCard data: {str(e)}")
                    
                    # Step 3: Transform the agent outputs into the API response format
                    response = self._generate_response_template(query, agent3_text)
                    
                    # If we have summaryCard data from Agent 5, use it
                    if summary_card_data:
                        response["summaryCard"] = summary_card_data
                        logger.info("Integrated summaryCard data from Agent 5 into response")
                    
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
            "chatResponse": f"I've analyzed your request about \"{query}\" and generated optimization options. You can review the detailed business flow analysis, along with alternatives for process optimization.",
            "summaryCard": {
                "businessOperationsFlow": {
                    "summary": "Optimized 5-step procurement process with automated vendor validation",
                    "steps": [
                        {"id": "step1", "description": "Automated requisition approval", "department": "Procurement"},
                        {"id": "step2", "description": "AI-powered vendor selection", "department": "Vendor Relations"},
                        {"id": "step3", "description": "Contract negotiation assistance", "department": "Legal"},
                        {"id": "step4", "description": "Digital invoice processing", "department": "Finance"},
                        {"id": "step5", "description": "Payment automation", "department": "Finance"}
                    ]
                },
                "departments": [
                    {
                        "id": "dept-1",
                        "department": "Procurement",
                        "manager": "Alex Johnson",
                        "email": "alex.johnson@company.com",
                        "tasks": [
                            {
                                "id": "task1-1",
                                "description": "Update requisition form with new validation fields",
                                "priority": "high",
                                "deadline": "2025-05-15"
                            },
                            {
                                "id": "task1-2",
                                "description": "Configure automated PO generation rules",
                                "priority": "medium",
                                "deadline": "2025-05-30"
                            },
                            {
                                "id": "task1-3",
                                "description": "Train team on new system",
                                "priority": "medium",
                                "deadline": "2025-06-15"
                            }
                        ],
                        "emailTemplate": {
                            "to": "alex.johnson@company.com",
                            "recipient": "Alex Johnson",
                            "department": "Procurement",
                            "subject": "Action Required: Procurement Process Optimization Implementation",
                            "body": "Dear Alex,\n\nI'm reaching out regarding the recently approved procurement process optimization. The analysis has identified key areas where your department will play a critical role in implementation.\n\nKey tasks for the Procurement team:\n1. Update requisition form with new validation fields (High Priority, Due: May 15, 2025)\n2. Configure automated PO generation rules (Medium Priority, Due: May 30, 2025)\n3. Train team on new system (Medium Priority, Due: June 15, 2025)\n\nThe expected outcomes include a 30% reduction in processing time and 15% cost savings.\n\nPlease review the attached implementation schedule and confirm your team's availability for the kickoff meeting next Monday at 10:00 AM.\n\nBest regards,\nTARS System\nRan By J. Doe, Head of Operations"
                        }
                    },
                    {
                        "id": "dept-2",
                        "department": "Vendor Relations",
                        "manager": "Sarah Miller",
                        "email": "sarah.miller@company.com",
                        "tasks": [
                            {
                                "id": "task2-1",
                                "description": "Create vendor scoring criteria",
                                "priority": "high",
                                "deadline": "2025-05-20"
                            },
                            {
                                "id": "task2-2",
                                "description": "Update vendor database with new fields",
                                "priority": "medium",
                                "deadline": "2025-06-05"
                            }
                        ],
                        "emailTemplate": {
                            "to": "sarah.miller@company.com",
                            "recipient": "Sarah Miller",
                            "department": "Vendor Relations",
                            "subject": "Action Required: Vendor Selection Process Updates",
                            "body": "Dear Sarah,\n\nFollowing our recent process optimization approval, we need your team's expertise to implement the new AI-powered vendor selection system.\n\nKey tasks for the Vendor Relations team:\n1. Create vendor scoring criteria (High Priority, Due: May 20, 2025)\n2. Update vendor database with new fields (Medium Priority, Due: June 05, 2025)\n\nThis new system will help reduce vendor selection time by 40% and improve quality scoring by 25%.\n\nLet's connect this week to discuss the implementation details further.\n\nBest regards,\nTARS System\nRan By J. Doe, Head of Operations"
                        }
                    }
                ]
            }
        }

# Create a singleton instance
agent_manager = AgentManager()