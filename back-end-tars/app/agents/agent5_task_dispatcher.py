from typing import Dict, Any, List
import asyncio
import logging
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
import json
import re

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.azure_helpers import extract_message
from app.utils.logging import get_logger

class TaskDispatcherAgent(Agent):
    """Agent 5: Converts optimization decisions into actionable tasks"""
    
    def __init__(self):
        super().__init__()
        self.logger = get_logger("agent5")
        self.client = None
        self.agent = None
        self.departments = self._load_departments()
    
    @property
    def name(self) -> str:
        return "Task Dispatcher Agent"
    
    def _load_departments(self) -> List[Dict[str, Any]]:
        """Load department information from JSON file"""
        try:
            with open("shared/departments.json", "r") as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error loading departments: {e}")
            return []
    
    async def setup_client(self):
        """Create client connection (async-friendly wrapper)"""
        if self.client is None or self.agent is None:
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._setup_client)
    
    def _setup_client(self):
        """Actual setup logic (runs in thread pool)"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=settings.AZURE_CONN_STRING
        )
        self.agent = self.client.agents.get_agent(settings.AGENT5_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process prediction and generate task assignments"""
        prediction = input_data.get("prediction", "")
        branches = context.get("results", {}).get("agent4", {}).get("branches", {})
        selected_branch = context.get("results", {}).get("agent4", {}).get("selected_branch", "B")
        branch_data = branches.get(selected_branch, {})
        
        self.logger.info(f"📥 Processing prediction ({len(prediction)} chars) with branch {selected_branch}")
        
        # Setup Azure client
        await self.setup_client()
        
        # Step 1: Parse the input
        parsed_input = await self._handle_timeout(
            self._parse_input(prediction),
            timeout_seconds=settings.AGENT5_PARSE_TIMEOUT,
            fallback_data={"action": "", "action_items": []}
        )
        
        # Use branch data if available, otherwise use parsed input
        action = branch_data.get("summary", parsed_input.get("action", ""))
        action_items = branch_data.get("action_items", parsed_input.get("action_items", []))
        
        # Step 2: Assign tasks to departments
        department_assignments = await self._handle_timeout(
            self._assign_tasks(action, action_items),
            timeout_seconds=settings.AGENT5_ASSIGN_TIMEOUT,
            fallback_data={"assignments": []}
        )
        
        # Step 3: Generate email templates
        email_templates = await self._handle_timeout(
            self._generate_emails(department_assignments.get("assignments", [])),
            timeout_seconds=settings.AGENT5_EMAIL_TIMEOUT,
            fallback_data={"templates": []}
        )
        
        # Step 4: Format response for summary card
        summary_card = self._format_summary_card(
            action, 
            action_items, 
            department_assignments.get("assignments", []),
            email_templates.get("templates", [])
        )
        
        return {
            "prediction": prediction,
            "action": action,
            "action_items": action_items,
            "department_assignments": department_assignments.get("assignments", []),
            "email_templates": email_templates.get("templates", []),
            "summary_card": summary_card,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _parse_input(self, strategic_input: str) -> Dict[str, Any]:
        """Parse the strategic input to extract action and action items"""
        
        self.logger.info(f"Parsing strategic input ({len(strategic_input)} chars):\n{strategic_input[:200]}...")
        
        # If strategic_input is very short or not properly formatted, provide default data
        if len(strategic_input) < 100:
            self.logger.warning(f"Strategic input too short ({len(strategic_input)} chars), using default values")
            return {
                "action": "Strategic Process Optimization",
                "action_items": [
                    "Implement process automation for key workflows",
                    "Restructure team responsibilities for efficiency",
                    "Develop integrated systems for better data flow"
                ]
            }
        
        try:
            # Direct parsing of the input without using Azure client
            action = ""
            action_items = []
            
            # Look for selected approach or similar headings
            approach_match = re.search(r"Selected Approach:.*?([^\n]+)", strategic_input)
            if approach_match:
                action = approach_match.group(1).strip()
                
            # If no action found, try other patterns
            if not action:
                action_match = re.search(r"#.*?([^\n]+)", strategic_input)
                if action_match:
                    action = action_match.group(1).strip()
            
            # If still no action, use a default
            if not action:
                action = "Strategic Process Optimization"
            
            # Look for action items in the action plan or similar sections
            action_plan = re.search(r"Action Plan\s*(?:\n|:|$)(.*?)(?:\n\s*#|\Z)", strategic_input, re.DOTALL)
            if action_plan:
                # Look for numbered items
                items = re.findall(r"\d+\.\s*([^\n]+)", action_plan.group(1))
                if items:
                    action_items = [item.strip() for item in items]
            
            # If no action items found, look for bullet points
            if not action_items:
                bullet_items = re.findall(r"[-*•]\s*([^\n]+)", strategic_input)
                if bullet_items:
                    action_items = [item.strip() for item in bullet_items]
            
            # If still no action items, provide defaults
            if not action_items:
                action_items = [
                    "Implement process automation for key workflows",
                    "Restructure team responsibilities for efficiency",
                    "Develop integrated systems for better data flow"
                ]
            
            result = {
                "action": action,
                "action_items": action_items
            }
            
            self.logger.info(f"Successfully parsed input: {action} with {len(action_items)} action items")
            return result
            
        except Exception as e:
            self.logger.error(f"Error parsing input: {str(e)}")
            # Return default values on error
            return {
                "action": "Strategic Process Optimization",
                "action_items": [
                    "Implement process automation for key workflows",
                    "Restructure team responsibilities for efficiency",
                    "Develop integrated systems for better data flow"
                ]
            }
            
    async def _assign_tasks(self, action: str, action_items: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """Assign tasks to appropriate departments"""
        # Map of common task keywords to departments
        keyword_mapping = {
            "IT": ["software", "hardware", "system", "network", "database", "automation", "digital", "technology", "tech", "computing"],
            "Operations": ["process", "workflow", "efficiency", "operation", "logistics", "supply chain", "inventory", "warehouse", "production", "manufacturing"],
            "Finance": ["budget", "cost", "expense", "financial", "funding", "investment", "revenue", "profit", "accounting", "fiscal"],
            "HR": ["employee", "staff", "training", "hiring", "recruitment", "onboarding", "personnel", "team", "talent", "workforce"],
            "Legal": ["compliance", "regulation", "contract", "legal", "agreement", "terms", "policy", "governance", "risk"],
            "Marketing": ["marketing", "promotion", "brand", "campaign", "market", "customer", "client", "audience", "advertising"],
            "Sales": ["sales", "selling", "revenue", "customer", "client", "account", "leads", "deals", "pricing"],
            "R&D": ["research", "development", "innovation", "prototype", "testing", "design", "experimentation"]
        }
        
        assignments = []
        
        # Match each action item to the most appropriate department
        for i, item in enumerate(action_items, 1):
            best_dept = None
            best_score = 0
            
            # Find the department with the most keyword matches
            for dept, keywords in keyword_mapping.items():
                item_lower = item.lower()
                score = sum(1 for kw in keywords if kw.lower() in item_lower)
                if score > best_score:
                    best_score = score
                    best_dept = dept
            
            # If no clear match, assign to Operations (default)
            if best_dept is None or best_score == 0:
                best_dept = "Operations"
            
            # Lookup department info
            dept_info = next((d for d in self.departments if d.get("department") == best_dept), {})
            
            assignments.append({
                "id": f"task-{i}",
                "task": item,
                "department": best_dept,
                "lead": dept_info.get("lead", "Department Lead"),
                "email": dept_info.get("email", "department@example.com"),
                "priority": "high" if i <= 2 else "medium",  # First two tasks are high priority
                "deadline": self._calculate_deadline(i),
                "duration": f"{i+1} weeks"  # Simple duration calculation
            })
        
        return {"assignments": assignments}
    
    def _calculate_deadline(self, task_index: int) -> str:
        """Calculate a deadline date based on task index"""
        from datetime import datetime, timedelta
        
        # Start date is now, each task starts 1 week after the previous
        start_date = datetime.now() + timedelta(days=task_index * 7)
        
        # Format to ISO date string
        return start_date.strftime("%Y-%m-%d")
    
    async def _generate_emails(self, assignments: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Generate email templates for task assignments"""
        templates = []
        
        # Group assignments by department
        dept_assignments = {}
        for assignment in assignments:
            dept = assignment.get("department")
            if dept not in dept_assignments:
                dept_assignments[dept] = []
            dept_assignments[dept].append(assignment)
        
        # Generate an email for each department
        for dept, dept_tasks in dept_assignments.items():
            if not dept_tasks:
                continue
                
            # Get department lead information
            lead = dept_tasks[0].get("lead", "Department Lead")
            email = dept_tasks[0].get("email", "department@example.com")
            
            # Create task list for email body
            task_list = ""
            for task in dept_tasks:
                priority = task.get("priority", "medium")
                deadline = task.get("deadline", "TBD")
                task_list += f"- {task.get('task')} ({priority.capitalize()} Priority, Due: {deadline})\n"
            
            # Generate email subject and body
            subject = f"Action Required: Implementation Tasks for {dept} Department"
            body = f"""Dear {lead},

I'm writing regarding our recently approved process optimization initiative. The analysis has identified key areas where your department will play a critical role in implementation.

Tasks for the {dept} team:
{task_list}

Please review these tasks and confirm your department's availability for a kickoff meeting next week. The full implementation plan with detailed timelines will be shared during the meeting.

Best regards,
TARS System
Process Optimization Team
"""
            
            templates.append({
                "department": dept,
                "to": email,
                "recipient": lead,
                "subject": subject,
                "body": body
            })
        
        return {"templates": templates}
    
    def _format_summary_card(self, action: str, action_items: List[str], 
                            assignments: List[Dict[str, Any]], 
                            email_templates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Format response for summary card"""
        # Create business operations flow
        steps = []
        for i, item in enumerate(action_items, 1):
            matching_assignment = next((a for a in assignments if a.get("task") == item), {})
            dept = matching_assignment.get("department", "Operations")
            steps.append({
                "id": f"step{i}",
                "description": item,
                "department": dept
            })
        
        # Group department tasks
        dept_tasks = {}
        for assignment in assignments:
            dept = assignment.get("department")
            if dept not in dept_tasks:
                dept_tasks[dept] = {
                    "id": f"dept-{len(dept_tasks)+1}",
                    "department": dept,
                    "manager": assignment.get("lead", "Department Lead"),
                    "email": assignment.get("email", "department@example.com"),
                    "tasks": []
                }
            
            dept_tasks[dept]["tasks"].append({
                "id": assignment.get("id", f"task-{len(dept_tasks[dept]['tasks'])+1}"),
                "description": assignment.get("task", ""),
                "priority": assignment.get("priority", "medium"),
                "deadline": assignment.get("deadline", "")
            })
        
        # Add email templates to departments
        departments = []
        for dept_name, dept_info in dept_tasks.items():
            # Find matching email template
            email_template = next((e for e in email_templates if e.get("department") == dept_name), {})
            
            if email_template:
                dept_info["emailTemplate"] = {
                    "to": email_template.get("to", ""),
                    "recipient": email_template.get("recipient", ""),
                    "department": dept_name,
                    "subject": email_template.get("subject", ""),
                    "body": email_template.get("body", "")
                }
            else:
                dept_info["emailTemplate"] = {
                    "to": dept_info.get("email", ""),
                    "recipient": dept_info.get("manager", ""),
                    "department": dept_name,
                    "subject": f"Action Required: Implementation Tasks for {dept_name}",
                    "body": f"Tasks for the {dept_name} department..."
                }
            
            departments.append(dept_info)
        
        # Create summary card
        return {
            "businessOperationsFlow": {
                "summary": action,
                "steps": steps
            },
            "departments": departments
        }

    async def dispatch(self, branch_content: str) -> Dict[str, Any]:
        """Generate tasks from a selected branch"""
        self.logger.info(f"📋 Dispatching tasks for branch content ({len(branch_content)} chars)")
        
        try:
            # Parse the branch content to extract action items
            parsed_input = self._parse_branch_content(branch_content)
            
            # Assign tasks to departments
            department_assignments = await self._handle_timeout(
                self._assign_tasks(parsed_input.get("action", ""), parsed_input.get("action_items", [])),
                timeout_seconds=settings.AGENT5_ASSIGN_TIMEOUT,
                fallback_data={"assignments": []}
            )
            
            # Prepare final result
            result = {
                "action": parsed_input.get("action", "Strategic Customer Service Optimization"),
                "action_items": parsed_input.get("action_items", [
                    "Implement AI-powered customer service chatbots",
                    "Develop comprehensive training programs for representatives",
                    "Establish a customer feedback system"
                ]),
                "department_assignments": department_assignments.get("assignments", [])
            }
            
            return result
        
        except Exception as e:
            self.logger.error(f"Error in dispatch method: {str(e)}")
            # Return default data on error
            return {
                "action": "Strategic Customer Service Optimization",
                "action_items": [
                    "Implement AI-powered customer service chatbots",
                    "Develop comprehensive training programs for representatives",
                    "Establish a customer feedback system"
                ],
                "department_assignments": []
            }
        
    def _parse_branch_content(self, content: str) -> Dict[str, Any]:
        """Parse branch content to extract action and action items"""
        self.logger.info(f"Parsing branch content ({len(content)} chars):\n{content[:200]}...")
        
        try:
            # Default values in case we can't extract anything
            default_action = "Strategic Customer Service Optimization"
            default_items = [
                "Implement process automation for key workflows",
                "Provide comprehensive staff training on customer engagement",
                "Establish quality monitoring and feedback systems"
            ]
            
            # If content is too short, use defaults
            if not content or len(content) < 20:
                self.logger.warning("Branch content too short, using defaults")
                return {
                    "action": default_action,
                    "action_items": default_items
                }
            
            # Extract action (use the whole content as action if it's a single sentence)
            if "." not in content and len(content) < 200:
                action = content.strip()
                action_items = default_items
            else:
                # Extract first sentence as action
                action_match = re.search(r'^([^.!?]+[.!?])', content)
                action = action_match.group(1).strip() if action_match else default_action
                
                # Try to extract meaningful action items
                # First look for bullet points
                bullet_items = re.findall(r'[-*•]\s*([^\n]+)', content)
                if bullet_items:
                    action_items = [item.strip() for item in bullet_items]
                
                # Next try to find numbered items
                elif re.search(r'\d+\.', content):
                    numbered_items = re.findall(r'\d+\.\s*([^\n]+)', content)
                    if numbered_items:
                        action_items = [item.strip() for item in numbered_items]
                
                # If we didn't find any structured items, split by sentences and take a few
                else:
                    sentences = re.findall(r'[^.!?]+[.!?]', content)
                    if len(sentences) > 1:
                        # Skip the first sentence (action) and take the next few as action items
                        action_items = [s.strip() for s in sentences[1:4] if len(s.strip()) > 20]
                        
                        # If no sentences were long enough, create generic ones
                        if not action_items:
                            parts = action.lower().split()
                            if len(parts) > 5:
                                action_items = [
                                    f"Implement {parts[0]} {parts[1]} strategy",
                                    f"Develop {parts[2]} {parts[3]} procedures",
                                    f"Monitor and evaluate {parts[0]} effectiveness"
                                ]
                            else:
                                action_items = default_items
                    else:
                        # Not enough sentences, use defaults based on action
                        action_items = default_items
            
            # Ensure we have at least 3 action items
            while len(action_items) < 3:
                if len(action_items) == 0:
                    action_items.append("Implement automated customer service solutions")
                elif len(action_items) == 1:
                    action_items.append("Develop comprehensive training programs")
                elif len(action_items) == 2:
                    action_items.append("Establish quality monitoring and feedback systems")
            
            # Clean up action items - ensure they're complete sentences
            for i, item in enumerate(action_items):
                # If the item doesn't end with punctuation, add a period
                if not item[-1] in ".!?":
                    action_items[i] = item + "."
                
                # If item is very short, expand it
                if len(item) < 15:
                    if "train" in item.lower():
                        action_items[i] = f"Develop a comprehensive training program for {item}."
                    elif "implement" in item.lower() or "deploy" in item.lower():
                        action_items[i] = f"{item} across all customer service teams."
                    elif "monitor" in item.lower() or "track" in item.lower():
                        action_items[i] = f"{item} and create regular performance reports."
            
            result = {
                "action": action,
                "action_items": action_items[:5]  # Limit to 5 items to avoid overwhelming
            }
            
            self.logger.info(f"Successfully parsed branch content: {action}")
            self.logger.info(f"Action items: {action_items}")
            return result
        
        except Exception as e:
            self.logger.error(f"Error parsing branch content: {str(e)}")
            return {
                "action": "Strategic Customer Service Optimization",
                "action_items": [
                    "Implement AI-powered customer service chatbots",
                    "Develop comprehensive training programs for representatives",
                    "Establish a customer feedback system"
                ]
            } 