from typing import Dict, Any, Optional, List
import asyncio
import logging
import time
from datetime import datetime, timedelta
import traceback
import re
import random

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.logging import get_logger
from app.formatter import format_response

class ProcessManager:
    """Orchestrates the flow between agents"""
    
    def __init__(self, agents: Dict[str, Agent]):
        self.agents = agents
        self.logger = get_logger("process_manager")
    
    async def process_request(self, query: str, branch_select: str = None) -> Dict[str, Any]:
        """
        Process a user query through the multi-agent system.
        """
        start_time = time.time()
        self.logger.info(f"🚀 Processing request: {query[:100]}...")
        
        # Track which parts used fallback data
        fallback_info = {
            "agent1_fallback": False,
            "agent2_fallback": False,
            "agent3_fallback": False,
            "agent4_fallback": False,
            "agent5_fallback": False
        }
        
        try:
            # Step 1: Consult with Agent 3 (Consultant)
            self.logger.info("📋 Step 1: Consulting with Agent 3 (Consultant)")
            try:
                agent3 = self.agents.get("agent3")
                consultant_result = await agent3.optimize(query)
                if "strategy" not in consultant_result or not consultant_result["strategy"]:
                    self.logger.warning("Agent 3 did not return a strategy, using fallback")
                    fallback_info["agent3_fallback"] = True
                    consultant_result = {
                        "query": query,
                        "strategy": "Based on industry best practices and company context, we recommend implementing a multi-phase customer service optimization plan focused on technology integration, staff training, and process automation.",
                        "internal_context": "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation.",
                        "external_context": "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
                    }
            except Exception as e:
                self.logger.error(f"⏱️ Error calling agent agent3: {str(e)}")
                fallback_info["agent3_fallback"] = True
                consultant_result = {
                    "query": query,
                    "strategy": "Based on industry best practices and company context, we recommend implementing a multi-phase customer service optimization plan focused on technology integration, staff training, and process automation.",
                    "internal_context": "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation.",
                    "external_context": "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
                }
            
            # Step 2: Predict outcomes with Agent 4
            self.logger.info("📋 Step 2: Predicting outcomes with Agent 4")
            try:
                agent4 = self.agents.get("agent4")
                prediction_result = await agent4.predict(consultant_result["strategy"])
                if "branches" not in prediction_result or not prediction_result["branches"]:
                    self.logger.warning("Agent 4 did not return branches, using fallback")
                    fallback_info["agent4_fallback"] = True
                    prediction_result = {
                        "branches": [
                            {"id": "A", "content": "Implement AI-powered customer service chatbots to handle routine inquiries, reducing wait times and allowing human agents to focus on complex issues."},
                            {"id": "B", "content": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge."},
                            {"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."}
                        ]
                    }
            except Exception as e:
                self.logger.error(f"⏱️ Error calling agent agent4: {str(e)}")
                fallback_info["agent4_fallback"] = True
                prediction_result = {
                    "branches": [
                        {"id": "A", "content": "Implement AI-powered customer service chatbots to handle routine inquiries, reducing wait times and allowing human agents to focus on complex issues."},
                        {"id": "B", "content": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge."},
                        {"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."}
                    ]
                }
            
            # Generate dispatch results for ALL branches, not just the selected one
            all_dispatch_results = {}
            for branch in prediction_result["branches"]:
                branch_id = branch["id"]
                branch_content = branch["content"]
                
                try:
                    self.logger.info(f"Processing branch {branch_id}")
                    agent5 = self.agents.get("agent5")
                    branch_dispatch = await agent5.dispatch(branch_content)
                    
                    # Ensure we have required fields
                    if not branch_dispatch.get("action_items"):
                        self.logger.warning(f"Branch {branch_id} dispatch missing action items")
                        fallback_info["agent5_fallback"] = True
                        branch_dispatch["action_items"] = [
                            f"Implement {branch_id} approach to customer service optimization",
                            f"Develop training program for {branch_id} implementation",
                            f"Establish metrics to track {branch_id} effectiveness"
                        ]
                    
                    # Store branch data in the branch itself for later use
                    branch["action_items"] = branch_dispatch.get("action_items", [])
                    all_dispatch_results[branch_id] = branch_dispatch
                    
                except Exception as e:
                    self.logger.error(f"⏱️ Error calling agent agent5 for branch {branch_id}: {str(e)}")
                    fallback_info["agent5_fallback"] = True
                    
                    # Still store fallback data
                    branch["action_items"] = [
                        f"Implement {branch_id} approach to customer service optimization",
                        f"Develop training program for {branch_id} implementation",
                        f"Establish metrics to track {branch_id} effectiveness"
                    ]
                    
                    all_dispatch_results[branch_id] = {
                        "action": f"Strategic {branch_id} Approach",
                        "action_items": branch["action_items"]
                    }
            
            # Select branch (default to B if not specified)
            selected_branch = branch_select if branch_select in ["A", "B", "C"] else "B"
            self.logger.info(f"Selected branch: {selected_branch}")
            
            # Generate business analytics based on the query and strategy
            analytics_data = self._generate_analytics_data(query, consultant_result["strategy"])
            
            # Generate business flow data
            business_flow = self._generate_business_flow(query, consultant_result["strategy"])
            
            # Generate news and impact data
            news_and_impact = self._generate_news_and_impact(query, consultant_result["external_context"])
            
            # Generate email templates for all branches
            email_templates = self._generate_email_templates(query, all_dispatch_results)
            
            # Generate the summary card for all branches with email templates
            summary_cards = {}
            for branch_id, dispatch_result in all_dispatch_results.items():
                summary_cards[branch_id] = self._generate_summary_card(branch_id, dispatch_result, email_templates.get(branch_id, []))
            
            # Format the recommendations options
            options = []
            for branch in prediction_result["branches"]:
                branch_id = branch["id"]
                options.append(
                    self._process_branch_for_api(
                        branch_id, 
                        branch, 
                        branch_id == selected_branch
                    )
                )
            
            # Prepare the API response that matches our documented structure
            execution_time = round(time.time() - start_time, 2)
            self.logger.info(f"✅ Request processed in {execution_time}s")
            
            # Determine overall system status
            any_fallbacks = any(fallback_info.values())
            system_status = "partial" if any_fallbacks else "complete"
            
            # Generate chat response
            selected_option = next((opt for opt in options if opt["selected"]), options[0])
            chat_response = f"I've analyzed your request about \"{query}\" and identified {len(options)} optimization approaches. The recommended approach is {selected_option['title']}. This would result in significant improvements including {selected_option['costReduction']} and can be implemented in {selected_option['timeToImplement']}."
            
            # Build the final API response
            response = {
                "analysis": {
                    "businessFlow": business_flow,
                    "analytics": analytics_data,
                    "newsAndImpact": news_and_impact
                },
                "recommendations": {
                    "options": options
                },
                "chatResponse": chat_response,
                "summaryCard": {
                    "activeOption": selected_branch,
                    "allOptions": summary_cards
                },
                "context": {
                    "internal": consultant_result.get("internal_context", ""),
                    "external": consultant_result.get("external_context", "")
                },
                "system_info": {
                    "execution_time": execution_time,
                    "status": system_status,
                    "fallbacks": fallback_info
                }
            }
            
            return response
        
        except Exception as e:
            # Catch-all exception handler
            execution_time = round(time.time() - start_time, 2)
            self.logger.error(f"❌ Error processing request: {str(e)}")
            
            # Return a complete fallback response
            return self._generate_fallback_response(query, execution_time)
    
    def _log_agent_status_summary(self, status_dict: Dict[str, str]) -> None:
        """Log a summary of agent statuses"""
        status_summary = []
        for agent, status in status_dict.items():
            status_emoji = "✅" if status == "completed" else "❌"
            status_summary.append(f"{agent}: {status_emoji} {status}")
        
        self.logger.info("Agent Status Summary:")
        for status in status_summary:
            self.logger.info(f"  {status}")
    
    def _get_placeholder_info(self, context: Dict[str, Any]) -> Dict[str, bool]:
        """Determine which parts of the response contain placeholder data"""
        placeholder_info = {}
        
        # Check which agents used fallback data
        for agent_id, status in context.get("agent_status", {}).items():
            placeholder_info[agent_id] = (status != "completed")
        
        return placeholder_info
    
    async def _call_agent_with_fallback(self, agent_id: str, input_data: Dict[str, Any], 
                                       context: Dict[str, Any]) -> tuple[Dict[str, Any], str]:
        """Call an agent with timeout and fallback handling"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                raise ValueError(f"Agent '{agent_id}' not found")
            
            # Set timeout based on agent with a default higher timeout
            # Use specific AGENT5_TIMEOUT for agent5 if available
            if agent_id == "agent5" and hasattr(settings, "AGENT5_TIMEOUT"):
                timeout = settings.AGENT5_TIMEOUT
            else:
                timeout = getattr(settings, f"{agent_id.upper()}_TIMEOUT", 60)
            
            self.logger.info(f"🔄 Calling {agent_id} with timeout {timeout}s")
            
            # Call the agent with timeout
            result = await asyncio.wait_for(
                agent.process(input_data, context),
                timeout=timeout
            )
            
            return result, "completed"
            
        except asyncio.TimeoutError:
            self.logger.error(f"⏱️ Timeout calling agent {agent_id} after {timeout}s")
            context["errors"].append({
                "stage": agent_id,
                "error": f"Timeout after {timeout}s",
                "input": input_data
            })
            fallback = self._generate_fallback_for_agent(agent_id, input_data, context)
            return fallback, "timeout"
            
        except Exception as e:
            self.logger.error(f"❌ Error calling agent {agent_id}: {str(e)}")
            context["errors"].append({
                "stage": agent_id,
                "error": str(e),
                "traceback": traceback.format_exc(),
                "input": input_data
            })
            fallback = self._generate_fallback_for_agent(agent_id, input_data, context)
            return fallback, "error"
    
    def _generate_fallback_for_agent(self, agent_id: str, input_data: Dict[str, Any], 
                                    context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate fallback data when an agent fails"""
        query = context.get("query", "")
        self.logger.info(f"⚠️ Generating fallback data for agent {agent_id}")
        
        if agent_id == "agent3":
            return {
                "query": query,
                "initial_answer": f"I'm analyzing your query about '{query}'...",
                "context_evaluation": "Needs both internal and external context",
                "internal_context": "Unable to retrieve internal context",
                "external_context": "Unable to retrieve external context",
                "enhanced_answer": f"Based on your query about '{query}', I recommend optimizing your business processes by implementing automation and streamlining workflows. This can reduce costs and improve efficiency across departments.",
                "timestamp": datetime.now().isoformat(),
                "is_fallback": True  # Mark as fallback data
            }
        
        elif agent_id == "agent4":
            return {
                "analysis": input_data.get("analysis", ""),
                "internal_context": "Unable to retrieve additional internal context",
                "branches": {
                    "A": {
                        "summary": "Conservative Approach - Minimal Process Changes",
                        "pros": ["Lower implementation risk", "Minimal disruption to operations"],
                        "cons": ["Limited cost savings", "Slower timeline to see benefits"],
                        "cost": 100000,
                        "time": 3,
                        "score": 6,
                        "action_items": [
                            "Document current processes in detail",
                            "Identify quick wins for immediate implementation",
                            "Implement targeted process improvements"
                        ]
                    },
                    "B": {
                        "summary": "Balanced Approach - Strategic Process Optimization",
                        "pros": ["Significant cost reduction", "Improved operational efficiency"],
                        "cons": ["Moderate implementation complexity", "Requires staff training"],
                        "cost": 250000,
                        "time": 6,
                        "score": 8,
                        "action_items": [
                            "Implement process automation for key workflows",
                            "Restructure team responsibilities for efficiency",
                            "Develop integrated systems for better data flow"
                        ]
                    },
                    "C": {
                        "summary": "Aggressive Approach - Complete Process Transformation",
                        "pros": ["Maximum cost savings", "Comprehensive modernization"],
                        "cons": ["High implementation risk", "Significant initial investment"],
                        "cost": 500000,
                        "time": 12,
                        "score": 7,
                        "action_items": [
                            "Replace legacy systems with modern solutions",
                            "Restructure organizational workflows",
                            "Implement advanced analytics and AI optimization"
                        ]
                    },
                    "recommendation": "B"
                },
                "final_prediction": "# Strategic Analysis and Outcome Prediction\n\n## Selected Approach: Option B - Strategic Process Optimization\n\n### Key Benefits\n- Significant cost reduction\n- Improved operational efficiency\n\n### Potential Challenges\n- Moderate implementation complexity\n- Requires staff training\n\n### Implementation Timeline: 6 months\n### Estimated Cost: $250,000\n\n### Action Plan\n1. Implement process automation for key workflows\n2. Restructure team responsibilities for efficiency\n3. Develop integrated systems for better data flow",
                "selected_branch": "B",
                "timestamp": datetime.now().isoformat(),
                "is_fallback": True  # Mark as fallback data
            }
        
        elif agent_id == "agent5":
            return {
                "prediction": input_data.get("prediction", ""),
                "action": "Strategic Process Optimization",
                "action_items": [
                    "Implement process automation for key workflows",
                    "Restructure team responsibilities for efficiency",
                    "Develop integrated systems for better data flow"
                ],
                "department_assignments": [
                    {
                        "id": "task-1",
                        "task": "Implement process automation for key workflows",
                        "department": "IT",
                        "lead": "Alex Johnson",
                        "email": "alex.johnson@company.com",
                        "priority": "high",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "duration": "4 weeks"
                    },
                    {
                        "id": "task-2",
                        "task": "Restructure team responsibilities for efficiency",
                        "department": "Operations",
                        "lead": "Sarah Miller",
                        "email": "sarah.miller@company.com",
                        "priority": "high",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "duration": "6 weeks"
                    },
                    {
                        "id": "task-3",
                        "task": "Develop integrated systems for better data flow",
                        "department": "IT",
                        "lead": "Alex Johnson",
                        "email": "alex.johnson@company.com",
                        "priority": "medium",
                        "deadline": datetime.now().strftime("%Y-%m-%d"),
                        "duration": "8 weeks"
                    }
                ],
                "email_templates": [],
                "summary_card": self._generate_fallback_summary_card(),
                "timestamp": datetime.now().isoformat(),
                "is_fallback": True  # Mark as fallback data
            }
        
        else:
            return {
                "error": f"Unknown agent {agent_id}",
                "timestamp": datetime.now().isoformat(),
                "is_fallback": True  # Mark as fallback data
            }
    
    def _generate_fallback_analytics(self) -> Dict[str, Any]:
        """Generate fallback analytics data"""
        return {
            "currentAnnualCost": 5000000,
            "efficiencyRating": 65,
            "averageProcessTime": 12.5,
            "riskAssessment": 45,
            "trends": {
                "costTrend": "increasing",
                "efficiencyTrend": "stable",
                "timeTrend": "increasing",
                "riskTrend": "stable"
            },
            "is_fallback": True  # Mark as fallback data
        }
    
    def _generate_fallback_summary_card(self) -> Dict[str, Any]:
        """Generate fallback summary card"""
        # Define fallback steps with departments (still needed for department assignments)
        steps = [
            {"id": "step1", "description": "Implement process automation for key workflows", "department": "IT"},
            {"id": "step2", "description": "Restructure team responsibilities for efficiency", "department": "Operations"},
            {"id": "step3", "description": "Develop integrated systems for better data flow", "department": "IT"}
        ]
        
        # Create nodes and edges structure for visualization
        nodes = [
            {
                "id": "node-1",
                "label": "Process Start",
                "type": "start",
                "position": {"x": 50, "y": 100}
            },
            {
                "id": "node-2",
                "label": "Process Automation",
                "type": "process",
                "position": {"x": 200, "y": 100},
                "status": {"type": "new", "label": "+ New Process"}
            },
            {
                "id": "node-3",
                "label": "Team Restructuring",
                "type": "process",
                "position": {"x": 350, "y": 100}
            },
            {
                "id": "node-4", 
                "label": "Systems Integration",
                "type": "process",
                "position": {"x": 500, "y": 100},
                "status": {"type": "new", "label": "+ New Process"}
            },
            {
                "id": "node-5",
                "label": "Process End",
                "type": "end",
                "position": {"x": 650, "y": 100}
            }
        ]
        
        edges = [
            {
                "id": "edge-1",
                "source": "node-1",
                "target": "node-2",
                "label": "Start",
                "flowType": "optimized"
            },
            {
                "id": "edge-2",
                "source": "node-2",
                "target": "node-3",
                "label": "Automation Complete",
                "flowType": "optimized"
            },
            {
                "id": "edge-3",
                "source": "node-3",
                "target": "node-4",
                "label": "New Structure Ready",
                "flowType": "optimized"
            },
            {
                "id": "edge-4",
                "source": "node-4",
                "target": "node-5",
                "label": "Integration Complete",
                "flowType": "optimized"
            }
        ]
        
        return {
            "businessOperationsFlow": {
                "summary": "Strategic Process Optimization",
                "nodes": nodes,
                "edges": edges
            },
            "departments": [
                {
                    "id": "dept-1",
                    "department": "IT",
                    "manager": "Alex Johnson",
                    "email": "alex.johnson@company.com",
                    "tasks": [
                        {
                            "id": "task-1",
                            "description": "Implement process automation for key workflows",
                            "priority": "high",
                            "deadline": datetime.now().strftime("%Y-%m-%d")
                        },
                        {
                            "id": "task-3",
                            "description": "Develop integrated systems for better data flow",
                            "priority": "medium",
                            "deadline": datetime.now().strftime("%Y-%m-%d")
                        }
                    ],
                    "emailTemplate": {
                        "to": "alex.johnson@company.com",
                        "recipient": "Alex Johnson",
                        "department": "IT",
                        "subject": "Action Required: IT Implementation Tasks",
                        "body": "Dear Alex,\n\nPlease prioritize the following tasks for our process optimization initiative:\n- Implement process automation for key workflows\n- Develop integrated systems for better data flow\n\nBest regards,\nTARS System"
                    }
                },
                {
                    "id": "dept-2",
                    "department": "Operations",
                    "manager": "Sarah Miller",
                    "email": "sarah.miller@company.com",
                    "tasks": [
                        {
                            "id": "task-2",
                            "description": "Restructure team responsibilities for efficiency",
                            "priority": "high",
                            "deadline": datetime.now().strftime("%Y-%m-%d")
                        }
                    ],
                    "emailTemplate": {
                        "to": "sarah.miller@company.com",
                        "recipient": "Sarah Miller",
                        "department": "Operations",
                        "subject": "Action Required: Operations Implementation Tasks",
                        "body": "Dear Sarah,\n\nPlease prioritize the following task for our process optimization initiative:\n- Restructure team responsibilities for efficiency\n\nBest regards,\nTARS System"
                    }
                }
            ],
            "is_fallback": True  # Mark as fallback data
        }
    
    async def call_agent(self, agent_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Public method to call a specific agent directly"""
        try:
            agent = self.agents.get(agent_id)
            if not agent:
                raise ValueError(f"Agent '{agent_id}' not found")
            
            # Empty context for direct calls
            context = {"direct_call": True}
            
            # Call the agent
            result = await agent.process(input_data, context)
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Error in direct call to agent {agent_id}: {str(e)}")
            return {"error": str(e), "is_fallback": True}

    def _generate_email_templates(self, query: str, all_dispatch_results: Dict[str, Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Generate email templates for all branches"""
        email_templates = {}
        
        # Define standard departments with managers and contact info
        departments = [
            {"id": "dept-1", "name": "Customer Service", "manager": "Alex Johnson", "email": "alex.johnson@company.com"},
            {"id": "dept-2", "name": "IT", "manager": "Sarah Miller", "email": "sarah.miller@company.com"},
            {"id": "dept-3", "name": "Training", "manager": "David Chen", "email": "david.chen@company.com"},
            {"id": "dept-4", "name": "Operations", "manager": "Maria Rodriguez", "email": "maria.rodriguez@company.com"},
            {"id": "dept-5", "name": "Finance", "manager": "James Wilson", "email": "james.wilson@company.com"}
        ]
        
        # Process each branch
        for branch_id, dispatch_result in all_dispatch_results.items():
            branch_templates = []
            action_items = dispatch_result.get("action_items", [])
            
            # Generate a relevant branch summary
            branch_title = dispatch_result.get("action", f"Option {branch_id}")
            if branch_id == "A":
                branch_description = "AI Chatbot Implementation"
                deadline_days = 30  # Shorter timeline for Option A
            elif branch_id == "B":
                branch_description = "Comprehensive Training Program Development"
                deadline_days = 45  # Medium timeline for Option B
            else:  # branch_id == "C"
                branch_description = "Customer Feedback System Implementation"
                deadline_days = 60  # Longer timeline for Option C
            
            # If no action items, create defaults based on branch
            if not action_items:
                if branch_id == "A":
                    action_items = [
                        "Implement AI chatbot system for handling routine customer inquiries",
                        "Design conversation flows and knowledge base for the AI system",
                        "Integrate chatbot with existing customer service platforms",
                        "Train customer service team on chatbot supervision and escalation"
                    ]
                elif branch_id == "B":
                    action_items = [
                        "Develop comprehensive customer service training curriculum",
                        "Create skills assessment framework for CS representatives",
                        "Implement regular coaching and feedback mechanisms",
                        "Design metrics to evaluate training effectiveness"
                    ]
                else:  # branch_id == "C"
                    action_items = [
                        "Design customer feedback collection system across channels",
                        "Develop real-time feedback analysis dashboard",
                        "Create processes to convert feedback into actionable improvements",
                        "Train teams on responding to customer input effectively"
                    ]
            
            # Intelligently assign departments to action items
            item_dept_assignments = []
            for item in action_items:
                item_lower = item.lower()
                
                # Try to intelligently match items to departments
                if any(kw in item_lower for kw in ["system", "technology", "technical", "chatbot", "ai", "integration", "platform", "integration"]):
                    assigned_dept = next((d for d in departments if d["name"] == "IT"), departments[1])
                elif any(kw in item_lower for kw in ["train", "skill", "learning", "coaching", "development", "curriculum"]):
                    assigned_dept = next((d for d in departments if d["name"] == "Training"), departments[2])
                elif any(kw in item_lower for kw in ["customer", "service", "inquiry", "agent", "representative"]):
                    assigned_dept = next((d for d in departments if d["name"] == "Customer Service"), departments[0])
                elif any(kw in item_lower for kw in ["process", "workflow", "operation", "procedure"]):
                    assigned_dept = next((d for d in departments if d["name"] == "Operations"), departments[3])
                elif any(kw in item_lower for kw in ["cost", "budget", "financial", "funding", "expense"]):
                    assigned_dept = next((d for d in departments if d["name"] == "Finance"), departments[4])
                else:
                    # Assign to a department based on item index
                    assigned_dept = departments[len(item_dept_assignments) % len(departments)]
                
                item_dept_assignments.append((item, assigned_dept))
            
            # Group tasks by department
            dept_tasks = {}
            for item, dept in item_dept_assignments:
                if dept["name"] not in dept_tasks:
                    dept_tasks[dept["name"]] = {"dept": dept, "tasks": []}
                dept_tasks[dept["name"]]["tasks"].append(item)
            
            # Generate email for each department with tasks
            for dept_name, data in dept_tasks.items():
                dept = data["dept"]
                tasks = data["tasks"]
                
                # Skip if no tasks
                if not tasks:
                    continue
                
                # Create task list for email body
                task_list = ""
                for i, task in enumerate(tasks):
                    deadline_date = (datetime.now() + timedelta(days=deadline_days + i * 7)).strftime("%B %d, %Y")
                    priority = "High" if i == 0 else "Medium"
                    task_list += f"{i+1}. {task} ({priority} Priority, Due: {deadline_date})\n"
                
                # Generate email subject and body
                subject = f"Action Required: {branch_description} for {dept['name']} Department"
                body = f"""Dear {dept['manager']},

I'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option {branch_id}: {branch_description}.

The analysis has identified key areas where your department will play a critical role in implementation:

{task_list}

This optimization is expected to result in significant improvements in customer satisfaction and operational efficiency. Your team's contribution is essential to our success.

Please review these tasks and confirm your department's availability for a kickoff meeting next week. The full implementation plan with detailed timelines will be shared during the meeting.

Best regards,
TARS System
Customer Service Optimization Team"""
                
                # Add email template
                branch_templates.append({
                    "to": dept["email"],
                    "recipient": dept["manager"],
                    "department": dept["name"],
                    "subject": subject,
                    "body": body
                })
            
            # Ensure we have at least 3 emails per branch
            while len(branch_templates) < 3:
                # Determine which departments we're missing
                existing_depts = [template["department"] for template in branch_templates]
                missing_depts = [d for d in departments if d["name"] not in existing_depts]
                
                if not missing_depts:  # If we've used all departments, just pick one
                    dept = departments[len(branch_templates) % len(departments)]
                else:
                    dept = missing_depts[0]
                
                # Create a generic task for this department
                if branch_id == "A":
                    generic_task = f"Support the implementation of AI chatbot technology for the customer service department"
                elif branch_id == "B":
                    generic_task = f"Assist with training program development for customer service representatives"
                else:  # branch_id == "C"
                    generic_task = f"Help implement customer feedback collection and analysis systems"
                
                # Generate deadline and subject
                deadline_date = (datetime.now() + timedelta(days=deadline_days)).strftime("%B %d, %Y")
                subject = f"Support Required: {branch_description} Implementation"
                
                # Generate email body
                body = f"""Dear {dept['manager']},

I'm writing regarding our customer service optimization initiative. We're implementing Option {branch_id}: {branch_description}.

We need your department's support with the following task:
1. {generic_task} (Medium Priority, Due: {deadline_date})

Your team's support is vital to the success of this initiative. Please let me know if you have any questions or concerns.

Best regards,
TARS System
Customer Service Optimization Team"""
                
                # Add the template
                branch_templates.append({
                    "to": dept["email"],
                    "recipient": dept["manager"],
                    "department": dept["name"],
                    "subject": subject,
                    "body": body
                })
            
            # Store templates for this branch
            email_templates[branch_id] = branch_templates
        
        # Verify we have templates for all branches (A, B, C)
        for branch_id in ["A", "B", "C"]:
            if branch_id not in email_templates:
                self.logger.warning(f"No email templates found for branch {branch_id}, generating fallbacks")
                email_templates[branch_id] = self._generate_fallback_emails_for_branch(branch_id)
        
        return email_templates

    def _generate_fallback_emails_for_branch(self, branch_id: str) -> List[Dict[str, Any]]:
        """Generate fallback email templates for a branch if none were created"""
        templates = []
        
        # Define standard departments with managers and contact info
        departments = [
            {"id": "dept-1", "name": "Customer Service", "manager": "Alex Johnson", "email": "alex.johnson@company.com"},
            {"id": "dept-2", "name": "IT", "manager": "Sarah Miller", "email": "sarah.miller@company.com"},
            {"id": "dept-3", "name": "Training", "manager": "David Chen", "email": "david.chen@company.com"},
            {"id": "dept-4", "name": "Operations", "manager": "Maria Rodriguez", "email": "maria.rodriguez@company.com"}
        ]
        
        # Generate branch-specific content
        if branch_id == "A":
            title = "AI Chatbot Implementation"
            tasks = [
                {"dept": "Customer Service", "task": "Define required chatbot capabilities and use cases", "priority": "High"},
                {"dept": "IT", "task": "Evaluate and select AI chatbot platforms", "priority": "High"},
                {"dept": "Training", "task": "Develop training for customer service team on chatbot management", "priority": "Medium"},
                {"dept": "Operations", "task": "Redesign workflows to incorporate AI-assisted support", "priority": "Medium"}
            ]
        elif branch_id == "B":
            title = "Training Program Development"
            tasks = [
                {"dept": "Training", "task": "Design comprehensive customer service training curriculum", "priority": "High"},
                {"dept": "Customer Service", "task": "Identify skill gaps and training priorities", "priority": "High"},
                {"dept": "Operations", "task": "Revise schedules to accommodate training sessions", "priority": "Medium"},
                {"dept": "IT", "task": "Implement learning management system for training delivery", "priority": "Medium"}
            ]
        else:  # branch_id == "C"
            title = "Customer Feedback System"
            tasks = [
                {"dept": "Operations", "task": "Design customer feedback collection process", "priority": "High"},
                {"dept": "IT", "task": "Implement feedback collection and analysis tools", "priority": "High"},
                {"dept": "Customer Service", "task": "Train team on responding to customer feedback", "priority": "Medium"},
                {"dept": "Training", "task": "Develop training on converting feedback to actionable improvements", "priority": "Medium"}
            ]
        
        # Generate email for each department
        for task in tasks:
            dept = next((d for d in departments if d["name"] == task["dept"]), departments[0])
            deadline_date = (datetime.now() + timedelta(days=30)).strftime("%B %d, %Y")
            
            # Generate email subject and body
            subject = f"Action Required: {title} Implementation"
            body = f"""Dear {dept['manager']},

I'm writing regarding our customer service optimization initiative. We're implementing Option {branch_id}: {title}.

Your department is responsible for the following task:
- {task["task"]} ({task["priority"]} Priority, Due: {deadline_date})

This task is critical to the success of our optimization initiative. Please review and confirm your availability for our kickoff meeting next week.

Best regards,
TARS System
Customer Service Optimization Team"""
            
            # Add email template
            templates.append({
                "to": dept["email"],
                "recipient": dept["manager"],
                "department": dept["name"],
                "subject": subject,
                "body": body
            })
        
        return templates

    def _generate_summary_card(self, branch_id: str, dispatch_result: Dict[str, Any], email_templates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a summary card for a branch"""
        
        # Create business operations flow
        steps = []
        action_items = dispatch_result.get("action_items", [])
        
        # If no action items, use defaults
        if not action_items:
            if branch_id == "A":
                action_items = [
                    "Implement AI chatbot system for handling routine customer inquiries",
                    "Design conversation flows and knowledge base for the AI system",
                    "Integrate chatbot with existing customer service platforms",
                    "Train customer service team on chatbot supervision and escalation"
                ]
            elif branch_id == "B":
                action_items = [
                    "Develop comprehensive customer service training curriculum",
                    "Create skills assessment framework for CS representatives",
                    "Implement regular coaching and feedback mechanisms",
                    "Design metrics to evaluate training effectiveness"
                ]
            else:  # branch_id == "C"
                action_items = [
                    "Design customer feedback collection system across channels",
                    "Develop real-time feedback analysis dashboard",
                    "Create processes to convert feedback into actionable improvements",
                    "Train teams on responding to customer input effectively"
                ]
        
        # Create steps from action items (still needed for backward compatibility and department assignment)
        for i, item in enumerate(action_items):
            # Assign a department based on the item content
            item_lower = item.lower()
            if "technology" in item_lower or "system" in item_lower or "chatbot" in item_lower or "ai" in item_lower or "platform" in item_lower or "integration" in item_lower:
                department = "IT"
            elif "train" in item_lower or "skill" in item_lower or "learning" in item_lower or "coaching" in item_lower:
                department = "Training"
            elif "customer" in item_lower or "service" in item_lower or "inquiry" in item_lower or "representative" in item_lower:
                department = "Customer Service"
            elif "process" in item_lower or "workflow" in item_lower or "operation" in item_lower:
                department = "Operations"
            else:
                # Assign to a department based on item index
                departments = ["Customer Service", "IT", "Training", "Operations", "Finance"]
                department = departments[i % len(departments)]
            
            steps.append({
                "id": f"step-{branch_id}-{i+1}",
                "description": item,
                "department": department
            })
        
        # Create nodes and edges structure (new code for improved visualization)
        nodes = []
        edges = []
        
        # Add process start node
        nodes.append({
            "id": f"node-{branch_id}-1",
            "label": "Process Start",
            "type": "start",
            "position": {"x": 50, "y": 100}
        })
        
        # Generate risk/reward type based on branch ID
        status_type = None
        status_label = None
        flow_type = "standard"
        
        if branch_id == "A":
            flow_type = "standard"  # Conservative approach
        elif branch_id == "B":
            flow_type = "optimized"  # Balanced approach 
        else:  # branch_id == "C"
            flow_type = "optimized"  # Aggressive approach
            
        # Create nodes for each action item
        for i, item in enumerate(action_items):
            # Add node for each action item
            node_id = f"node-{branch_id}-{i+2}"  # +2 because we start with node 1 as Process Start
            
            # Determine if this node needs status highlighting
            node_status = None
            
            # For branch B or C, mark new processes
            if (branch_id in ["B", "C"] and ("new" in item.lower() or "implement" in item.lower() or 
                                          "develop" in item.lower() or "create" in item.lower())):
                node_status = {
                    "type": "new", 
                    "label": "+ New Process"
                }
            
            # For branch C, mark critical processes
            if branch_id == "C" and ("critical" in item.lower() or "key" in item.lower() or 
                                  "essential" in item.lower() or "vital" in item.lower()):
                node_status = {
                    "type": "warning", 
                    "label": "⚠ Critical"
                }
            
            # Calculate position (simple left-to-right layout)
            x_pos = 200 + i * 150
            y_variation = 0
            
            # Add some variation to y-position for visual appeal in branches B and C
            if branch_id in ["B", "C"] and i % 2 == 1:
                y_variation = 50
                if i % 4 == 3:  # Alternate direction
                    y_variation = -50
                    
            node = {
                "id": node_id,
                "label": item[:30] + ("..." if len(item) > 30 else ""),  # Truncate long labels
                "type": "process",
                "position": {"x": x_pos, "y": 100 + y_variation}
            }
            
            # Add status if present
            if node_status:
                node["status"] = node_status
                
            nodes.append(node)
        
        # Add process end node
        nodes.append({
            "id": f"node-{branch_id}-{len(action_items)+2}",
            "label": "Process End",
            "type": "end",
            "position": {"x": 200 + len(action_items) * 150, "y": 100}
        })
        
        # Create edges connecting all nodes
        edge_labels = []
        
        # Generate edge labels based on branch ID and context
        if branch_id == "A":
            edge_labels = ["Start Analysis", "Requirements Complete", "System Ready", "Implementation Complete"]
        elif branch_id == "B":
            edge_labels = ["Start", "Tech Path", "Training Path", "Tech Ready", "Staff Ready", "Implementation Complete"]
        else:  # branch_id == "C"
            edge_labels = ["Start", "Planning", "Development", "Training", "Integration", "Deployment", "Complete"]
        
        # Fallback edge labels if we don't have enough
        generic_edge_labels = ["Next Step", "Continue", "Proceed", "Advance", "Move Forward", "Progress"]
        
        # Create edges connecting nodes in sequence
        for i in range(len(nodes) - 1):
            # Get or generate an edge label
            if i < len(edge_labels):
                edge_label = edge_labels[i]
            else:
                edge_label = generic_edge_labels[i % len(generic_edge_labels)]
            
            edges.append({
                "id": f"edge-{branch_id}-{i+1}",
                "source": nodes[i]["id"],
                "target": nodes[i+1]["id"],
                "label": edge_label,
                "flowType": flow_type
            })
        
        # Create departments section
        departments = []
        
        # If no email templates, use empty array to allow generating from steps
        if not email_templates:
            email_templates = []
        
        # Map of department names to their details
        dept_mapping = {}
        
        # First add departments from email templates
        for email in email_templates:
            dept_name = email["department"]
            if dept_name not in dept_mapping:
                dept_id = f"dept-{branch_id}-{len(dept_mapping)+1}"
                dept_mapping[dept_name] = {
                    "id": dept_id,
                    "department": dept_name,
                    "manager": email["recipient"],
                    "email": email["to"],
                    "tasks": [],
                    "emailTemplate": email
                }
        
        # Add tasks to departments from steps
        for i, step in enumerate(steps):
            dept_name = step["department"]
            # If department not in mapping yet, add it with default values
            if dept_name not in dept_mapping:
                dept_id = f"dept-{branch_id}-{len(dept_mapping)+1}"
                manager = "Department Manager"  # Default
                email = "department@company.com"  # Default
                
                # Try to find existing department info in other email templates
                for template in email_templates:
                    if template["department"] == dept_name:
                        manager = template["recipient"]
                        email = template["to"]
                        break
                
                dept_mapping[dept_name] = {
                    "id": dept_id,
                    "department": dept_name,
                    "manager": manager,
                    "email": email,
                    "tasks": [],
                    "emailTemplate": {
                        "to": email,
                        "recipient": manager,
                        "department": dept_name,
                        "subject": f"Action Required: Implementation Tasks for {dept_name}",
                        "body": f"Dear {manager},\n\nThis is regarding the implementation of Option {branch_id} for our customer service optimization initiative."
                    }
                }
            
            # Add task to this department
            deadline = (datetime.now() + timedelta(days=14 + i * 7)).strftime("%Y-%m-%d")
            dept_mapping[dept_name]["tasks"].append({
                "id": f"task-{branch_id}-{i+1}",
                "description": step["description"],
                "priority": "high" if i == 0 else "medium",
                "deadline": deadline
            })
        
        # Convert department mapping to list
        departments = list(dept_mapping.values())
        
        # If we still have no departments (shouldn't happen), create a default
        if not departments:
            departments = [{
                "id": f"dept-{branch_id}-1",
                "department": "Customer Service",
                "manager": "Alex Johnson",
                "email": "alex.johnson@company.com",
                "tasks": [
                    {
                        "id": f"task-{branch_id}-1",
                        "description": "Implement customer service optimization changes",
                        "priority": "high",
                        "deadline": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")
                    }
                ],
                "emailTemplate": {
                    "to": "alex.johnson@company.com",
                    "recipient": "Alex Johnson",
                    "department": "Customer Service",
                    "subject": f"Action Required: Customer Service Optimization",
                    "body": "Dear Alex Johnson,\n\nI'm writing regarding our customer service optimization initiative. Your department will play a key role in the implementation."
                }
            }]
        
        # Generate a descriptive summary based on branch ID
        if branch_id == "A":
            summary = "Conservative approach (lower risk, lower reward) - Gradual implementation of technology integration with minimal system changes to maintain stability."
        elif branch_id == "B":
            summary = "Balanced approach (moderate risk, moderate reward) - Implement customer service optimization gradually, combining moderate technology upgrades, training, and phased process automation."
        else:  # branch_id == "C"
            summary = "Aggressive approach (higher risk, higher reward) - Rapid, company-wide implementation of advanced technologies, comprehensive training, and end-to-end process automation."
        
        # Override with dispatch result action if available
        if dispatch_result.get("action"):
            summary = dispatch_result["action"]
        
        return {
            "businessOperationsFlow": {
                "summary": summary,
                "nodes": nodes,
                "edges": edges
            },
            "departments": departments
        }

    def _generate_analytics_data(self, query: str, strategy: str) -> Dict[str, Any]:
        """Generate analytics data based on query and strategy"""
        # Customize analytics based on customer service
        if "customer service" in query.lower():
            return {
                "currentAnnualCost": 5750000,
                "efficiencyRating": 68, 
                "averageProcessTime": 12.5,  # hours to resolve a ticket
                "riskAssessment": 55,
                "trends": {
                    "costTrend": "increasing",
                    "efficiencyTrend": "stable",
                    "timeTrend": "increasing",
                    "riskTrend": "stable"
                }
            }
        else:
            # Generic analytics for other domains
            current_annual_cost = random.randint(3000000, 8000000)
            efficiency_rating = random.randint(50, 80)
            
            return {
                "currentAnnualCost": current_annual_cost,
                "efficiencyRating": efficiency_rating,
                "averageProcessTime": round(random.uniform(8.5, 18.5), 1),
                "riskAssessment": random.randint(40, 75),
                "trends": {
                    "costTrend": random.choice(["increasing", "decreasing", "stable"]),
                    "efficiencyTrend": random.choice(["improving", "worsening", "stable"]),
                    "timeTrend": random.choice(["increasing", "decreasing", "stable"]),
                    "riskTrend": random.choice(["improving", "worsening", "stable"])
                }
            }

    def _generate_business_flow(self, query: str, strategy: str) -> Dict[str, Any]:
        """Generate business flow data based on query and strategy"""
        
        # Customer service specific workflow if the query mentions it
        if "customer service" in query.lower():
            # Generate customer service workflow nodes
            nodes = [
                {"id": "node-1", "label": "Customer Inquiry", "type": "start", "position": {"x": 50, "y": 100}},
                {"id": "node-2", "label": "IVR System", "type": "process", "position": {"x": 200, "y": 100}},
                {"id": "node-3", "label": "Queue Assignment", "type": "process", "position": {"x": 350, "y": 100}},
                {"id": "node-4", "label": "Agent Response", "type": "process", "position": {"x": 500, "y": 100}, 
                 "status": {"type": "critical", "label": "⚠ Bottleneck"}},
                {"id": "node-5", "label": "Issue Resolution", "type": "process", "position": {"x": 650, "y": 100}},
                {"id": "node-6", "label": "Follow-up", "type": "process", "position": {"x": 800, "y": 100}},
                {"id": "node-7", "label": "Case Closure", "type": "end", "position": {"x": 950, "y": 100}}
            ]
            
            # Generate edges between nodes
            edges = [
                {"id": "edge-1", "source": "node-1", "target": "node-2", "label": "Initial Contact"},
                {"id": "edge-2", "source": "node-2", "target": "node-3", "label": "Categorization"},
                {"id": "edge-3", "source": "node-3", "target": "node-4", "label": "Assignment", "flowType": "critical"},
                {"id": "edge-4", "source": "node-4", "target": "node-5", "label": "Processing"},
                {"id": "edge-5", "source": "node-5", "target": "node-6", "label": "Quality Check"},
                {"id": "edge-6", "source": "node-6", "target": "node-7", "label": "Completion"}
            ]
        else:
            # Generic business process for other domains
            nodes = [
                {"id": "node-1", "label": "Process Start", "type": "start", "position": {"x": 50, "y": 100}},
                {"id": "node-2", "label": "Input Validation", "type": "process", "position": {"x": 200, "y": 100}},
                {"id": "node-3", "label": "Data Processing", "type": "process", "position": {"x": 350, "y": 100}},
                {"id": "node-4", "label": "Business Logic", "type": "process", "position": {"x": 500, "y": 100}},
                {"id": "node-5", "label": "Approval", "type": "process", "position": {"x": 650, "y": 100},
                 "status": {"type": "warning", "label": "⚠ Bottleneck"}},
                {"id": "node-6", "label": "Output Generation", "type": "process", "position": {"x": 800, "y": 100}},
                {"id": "node-7", "label": "Process End", "type": "end", "position": {"x": 950, "y": 100}}
            ]
            
            # Generate edges between nodes
            edges = [
                {"id": "edge-1", "source": "node-1", "target": "node-2", "label": "Input"},
                {"id": "edge-2", "source": "node-2", "target": "node-3", "label": "Validated Data"},
                {"id": "edge-3", "source": "node-3", "target": "node-4", "label": "Processed Data"},
                {"id": "edge-4", "source": "node-4", "target": "node-5", "label": "Decision"},
                {"id": "edge-5", "source": "node-5", "target": "node-6", "label": "Approved"},
                {"id": "edge-6", "source": "node-6", "target": "node-7", "label": "Completion"}
            ]
        
        return {
            "nodes": nodes,
            "edges": edges
        }

    def _generate_news_and_impact(self, query: str, external_context: str) -> Dict[str, Any]:
        """Generate news and impact data based on external context"""
        
        # Generate news items
        news_items = [
            {
                "id": "news-1",
                "title": "Industry Shift to AI-Powered Customer Service",
                "date": (datetime.now() - timedelta(days=10)).strftime("%B %d, %Y"),
                "impact": "positive",
                "description": "Major competitors are adopting AI chatbots with 35% reduction in response times."
            },
            {
                "id": "news-2",
                "title": "Rising Customer Expectations for Omnichannel Support",
                "date": (datetime.now() - timedelta(days=5)).strftime("%B %d, %Y"),
                "impact": "negative",
                "description": "Customers now expect seamless integration across support channels, increasing complexity."
            },
            {
                "id": "news-3",
                "title": "New Training Methodology Shows Promise",
                "date": (datetime.now() - timedelta(days=1)).strftime("%B %d, %Y"),
                "impact": "positive",
                "description": "Scenario-based training program decreases time-to-proficiency by 40%."
            }
        ]
        
        # Generate impact items
        impact_items = [
            {
                "id": "impact-1",
                "title": "Customer Retention Risk",
                "description": "Continued service delays could result in 12% customer attrition within 6 months",
                "probability": 75,
                "impact": 85
            },
            {
                "id": "impact-2",
                "title": "Competitive Advantage",
                "description": "Implementing suggested optimizations could provide 18-month lead over competition",
                "probability": 65,
                "impact": 80
            },
            {
                "id": "impact-3",
                "title": "Cost Reduction Opportunity",
                "description": "Process automation could reduce operational costs by up to 22%",
                "probability": 82,
                "impact": 70
            }
        ]
        
        return {
            "newsItems": news_items,
            "impactItems": impact_items
        }

    def _estimate_implementation_time(self, branch_id: str) -> str:
        """Estimate implementation time based on branch"""
        if branch_id == "A":
            return "1-3 months"
        elif branch_id == "B":
            return "3-6 months"
        else:  # branch_id == "C"
            return "6-12 months"

    def _estimate_cost_reduction(self, branch_id: str) -> str:
        """Estimate cost reduction based on branch"""
        if branch_id == "A":
            return "10-15% cost reduction"
        elif branch_id == "B":
            return "15-25% cost reduction"
        else:  # branch_id == "C"
            return "25-40% cost reduction"

    def _generate_additional_metrics(self, branch_id: str) -> List[Dict[str, str]]:
        """Generate additional metrics based on branch"""
        if branch_id == "A":
            return [
                {"label": "Response Time Improvement", "value": "20%"},
                {"label": "Implementation Complexity", "value": "Low"}
            ]
        elif branch_id == "B":
            return [
                {"label": "Response Time Improvement", "value": "40%"},
                {"label": "Implementation Complexity", "value": "Medium"},
                {"label": "ROI", "value": "180% over 2 years"}
            ]
        else:  # branch_id == "C"
            return [
                {"label": "Response Time Improvement", "value": "65%"},
                {"label": "Implementation Complexity", "value": "High"},
                {"label": "ROI", "value": "220% over 3 years"},
                {"label": "Training Requirements", "value": "Extensive"}
            ]

    def _generate_fallback_response(self, query: str, execution_time: float) -> Dict[str, Any]:
        """Generate a complete fallback response"""
        return {
            "analysis": {
                "businessFlow": self._generate_business_flow(query, ""),
                "analytics": self._generate_analytics_data(query, ""),
                "newsAndImpact": self._generate_news_and_impact(query, "")
            },
            "recommendations": {
                "options": [
                    {
                        "id": "option-A",
                        "title": "Implement AI-powered customer service chatbots",
                        "description": "Implement AI-powered customer service chatbots to handle routine inquiries, reducing wait times and allowing human agents to focus on complex issues.",
                        "timeToImplement": "1-3 months",
                        "costReduction": "10-15% cost reduction",
                        "additionalMetrics": [
                            {"label": "Response Time Improvement", "value": "20%"},
                            {"label": "Implementation Complexity", "value": "Low"}
                        ],
                        "selected": False
                    },
                    {
                        "id": "option-B",
                        "title": "Comprehensive training and development programs",
                        "description": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge.",
                        "timeToImplement": "3-6 months",
                        "costReduction": "15-25% cost reduction",
                        "additionalMetrics": [
                            {"label": "Response Time Improvement", "value": "40%"},
                            {"label": "Implementation Complexity", "value": "Medium"},
                            {"label": "ROI", "value": "180% over 2 years"}
                        ],
                        "selected": True
                    },
                    {
                        "id": "option-C",
                        "title": "Establish a customer feedback loop",
                        "description": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input.",
                        "timeToImplement": "6-12 months",
                        "costReduction": "25-40% cost reduction",
                        "additionalMetrics": [
                            {"label": "Response Time Improvement", "value": "65%"},
                            {"label": "Implementation Complexity", "value": "High"},
                            {"label": "ROI", "value": "220% over 3 years"},
                            {"label": "Training Requirements", "value": "Extensive"}
                        ],
                        "selected": False
                    }
                ]
            },
            "chatResponse": f"I've analyzed your request about \"{query}\" and identified several optimization approaches. The recommended balanced approach would involve comprehensive training and development programs, resulting in significant improvements including 15-25% cost reduction and can be implemented in 3-6 months.",
            "summaryCard": {
                "activeOption": "B",
                "allOptions": {
                    "A": self._generate_summary_card("A", {"action": "AI Chatbot Implementation", "action_items": ["Implement AI chatbots", "Train staff on bot management", "Monitor and optimize chatbot effectiveness"]}, []),
                    "B": self._generate_summary_card("B", {"action": "Training Program Development", "action_items": ["Develop comprehensive training curriculum", "Implement skills assessment program", "Establish mentorship opportunities"]}, []),
                    "C": self._generate_summary_card("C", {"action": "Customer Feedback System", "action_items": ["Develop customer survey mechanism", "Implement real-time feedback analysis", "Create action item generation process"]}, [])
                }
            },
            "context": {
                "internal": "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation.",
                "external": "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
            },
            "system_info": {
                "execution_time": execution_time,
                "status": "fallback",
                "fallbacks": {
                    "agent1_fallback": True,
                    "agent2_fallback": True,
                    "agent3_fallback": True,
                    "agent4_fallback": True,
                    "agent5_fallback": True
                }
            }
        }

    def _process_branch_for_api(self, branch_id: str, branch: Dict[str, Any], is_selected: bool) -> Dict[str, Any]:
        """Format a branch for API output"""
        content = branch.get("content", "")
        
        # Ensure we have at least a title
        title_match = re.search(r"^([^.!?]+[.!?])", content)
        title = title_match.group(1).strip() if title_match else f"Option {branch_id}"
        
        # Generate metrics based on branch ID
        if branch_id == "A":
            time_to_implement = "1-3 months"
            cost_reduction = "10-15% cost reduction"
            additional_metrics = [
                {"label": "Response Time Improvement", "value": "20%"},
                {"label": "Implementation Complexity", "value": "Low"}
            ]
        elif branch_id == "B":
            time_to_implement = "3-6 months"
            cost_reduction = "15-25% cost reduction"
            additional_metrics = [
                {"label": "Response Time Improvement", "value": "40%"},
                {"label": "Implementation Complexity", "value": "Medium"},
                {"label": "ROI", "value": "180% over 2 years"}
            ]
        else:  # branch_id == "C"
            time_to_implement = "6-12 months"
            cost_reduction = "25-40% cost reduction"
            additional_metrics = [
                {"label": "Response Time Improvement", "value": "65%"},
                {"label": "Implementation Complexity", "value": "High"},
                {"label": "ROI", "value": "220% over 3 years"},
                {"label": "Training Requirements", "value": "Extensive"}
            ]
        
        # Generate financial impact data
        financial_impact = []
        if branch_id == "A":
            financial_impact = [
                {
                    "metricName": "Annual Operating Costs",
                    "current": 5750000,
                    "projected": 5175000,
                    "change": -10,
                    "unit": "$"
                },
                {
                    "metricName": "Response Time",
                    "current": 24,
                    "projected": 19.2,
                    "change": -20,
                    "unit": "hours"
                }
            ]
        elif branch_id == "B":
            financial_impact = [
                {
                    "metricName": "Annual Operating Costs",
                    "current": 5750000,
                    "projected": 4600000,
                    "change": -20,
                    "unit": "$"
                },
                {
                    "metricName": "Response Time",
                    "current": 24,
                    "projected": 14.4,
                    "change": -40,
                    "unit": "hours"
                },
                {
                    "metricName": "Customer Satisfaction",
                    "current": 72,
                    "projected": 86,
                    "change": 19,
                    "unit": "%"
                }
            ]
        else:  # branch_id == "C"
            financial_impact = [
                {
                    "metricName": "Annual Operating Costs",
                    "current": 5750000,
                    "projected": 3737500,
                    "change": -35,
                    "unit": "$"
                },
                {
                    "metricName": "Response Time",
                    "current": 24,
                    "projected": 8.4,
                    "change": -65,
                    "unit": "hours"
                },
                {
                    "metricName": "Customer Satisfaction",
                    "current": 72,
                    "projected": 92,
                    "change": 28,
                    "unit": "%"
                },
                {
                    "metricName": "Employee Turnover",
                    "current": 25,
                    "projected": 15,
                    "change": -40,
                    "unit": "%"
                }
            ]
        
        # Implementation plan - convert action items to implementation tasks
        implementation_plan = []
        if "action_items" in branch:
            for i, item in enumerate(branch["action_items"]):
                implementation_plan.append({
                    "id": f"task-{branch_id}-{i+1}",
                    "department": "IT" if "system" in item.lower() or "technology" in item.lower() or "chatbot" in item.lower()
                                else "Training" if "training" in item.lower() or "skill" in item.lower()
                                else "Customer Service" if "customer" in item.lower() or "service" in item.lower()
                                else "Operations",
                    "task": item,
                    "duration": f"{(i+1)*2} weeks",
                    "status": "pending"
                })
        
        # Return formatted branch data
        return {
            "id": f"option-{branch_id}",
            "title": title,
            "description": content,
            "timeToImplement": time_to_implement,
            "costReduction": cost_reduction,
            "additionalMetrics": additional_metrics,
            "selected": is_selected,
            "financialImpact": financial_impact,
            "implementationPlan": implementation_plan
        } 