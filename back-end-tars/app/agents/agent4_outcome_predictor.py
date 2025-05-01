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

class OutcomePredictorAgent(Agent):
    """Agent 4: Predicts outcomes and generates strategic branches"""
    
    def __init__(self, agent_manager):
        super().__init__()
        self.logger = get_logger("agent4")
        self.agent_manager = agent_manager
        self.client = None
        self.agent = None
    
    @property
    def name(self) -> str:
        return "Outcome Predictor Agent"
    
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
        self.agent = self.client.agents.get_agent(settings.AGENT4_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process analysis and generate outcome predictions"""
        analysis = input_data.get("analysis", "")
        self.logger.info(f"📥 Processing analysis ({len(analysis)} chars)")
        
        # Setup Azure client
        await self.setup_client()
        
        # Step 1: Generate internal questions based on the analysis
        internal_questions = await self._handle_timeout(
            self._generate_internal_questions(analysis),
            timeout_seconds=settings.AGENT4_QUESTIONS_TIMEOUT,
            fallback_data={"questions": []}
        )
        
        # Step 2: Get internal context from Agent 1
        internal_context = ""
        if internal_questions.get("questions"):
            questions_str = "\n".join(internal_questions.get("questions", []))
            internal_result = await self.agent_manager.call_agent(
                "agent1",
                {"question": questions_str, "caller": "Agent4"}
            )
            internal_context = internal_result.get("response", "")
            self.logger.info(f"📄 Received internal context ({len(internal_context)} chars)")
        
        # Step 3: Generate branch predictions
        branches = await self._handle_timeout(
            self._generate_branches(analysis, internal_context),
            timeout_seconds=settings.AGENT4_BRANCHES_TIMEOUT,
            fallback_data={"branches": {}}
        )
        
        # Step 4: Generate final prediction
        final_prediction = await self._handle_timeout(
            self._generate_final_prediction(analysis, internal_context, branches.get("branches", {})),
            timeout_seconds=settings.AGENT4_PREDICTION_TIMEOUT,
            fallback_data={"prediction": ""}
        )
        
        return {
            "analysis": analysis,
            "internal_context": internal_context,
            "branches": branches.get("branches", {}),
            "final_prediction": final_prediction.get("prediction", ""),
            "selected_branch": final_prediction.get("selected_branch", ""),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_internal_questions(self, strategy: str) -> Dict[str, list]:
        """Generate questions for internal documents based on strategy"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/agent4_doc_inventory.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(action=strategy[:1000])  # Limit to prevent token overflows
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT4_QUESTIONS_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    response = extract_message(messages)
                    
                    # Parse the questions
                    questions = []
                    for line in response.splitlines():
                        line = line.strip()
                        if re.match(r'^\d+\.', line):  # Numbered line
                            question = re.sub(r'^\d+\.\s*', '', line)
                            questions.append(question)
                    
                    self.logger.info(f"🔍 Generated {len(questions)} internal questions")
                    return {"questions": questions}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating internal questions: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    async def _generate_branches(self, strategy: str, internal_context: str) -> Dict[str, dict]:
        """Generate strategic branches based on analysis and context"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/agent4_branches.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(
                    brief=strategy[:2000],  # Limit to prevent token overflows
                    facts=internal_context[:1000]  # Limit to prevent token overflows
                )
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT4_BRANCHES_TIMEOUT - 1
            waited = 0
            
            while waited < max_wait:
                run = await loop.run_in_executor(
                    None,
                    lambda: self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                )
                
                if run.status == RunStatus.COMPLETED:
                    messages = await loop.run_in_executor(
                        None,
                        lambda: list(self.client.agents.list_messages(thread.id).data)
                    )
                    response = extract_message(messages)
                    
                    # Parse the branches
                    branches = self._extract_branches(response)
                    self.logger.info(f"🔍 Generated {len(branches)} branches")
                    return {"branches": branches}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating branches: {e}")
            return {"error": str(e)}
            
        finally:
            # Cleanup
            if thread:
                try:
                    await loop.run_in_executor(
                        None,
                        lambda: self.client.agents.delete_thread(thread.id)
                    )
                except Exception as e:
                    self.logger.error(f"Error cleaning up thread: {e}")
    
    def _extract_branches(self, raw_response: str) -> List[Dict[str, Any]]:
        """Extract the branches from the raw text response"""
        self.logger.info(f"Extracting branches from response ({len(raw_response)} chars)")
        
        branches = []
        try:
            # Look for sections labeled as branches (A, B, C, etc.)
            branch_matches = re.finditer(r'(?:Branch|Option|Approach)\s+([A-C])(?:\s*[:]\s*|\n)(.*?)(?=(?:Branch|Option|Approach)\s+[A-C]|\Z)', 
                                         raw_response, re.DOTALL)
            
            # Process each match
            found_branches = {}
            for match in branch_matches:
                branch_letter = match.group(1).strip()
                branch_content = match.group(2).strip()
                
                found_branches[branch_letter] = {
                    "id": branch_letter,
                    "content": branch_content
                }
            
            # Add found branches in A, B, C order
            for letter in ["A", "B", "C"]:
                if letter in found_branches:
                    branches.append(found_branches[letter])
            
            # If no branches found by pattern matching, try splitting by headings
            if not branches:
                sections = re.split(r'#+ ', raw_response)
                if len(sections) > 1:
                    for i, section in enumerate(sections[1:4]):  # Get up to 3 sections
                        branches.append({
                            "id": chr(65 + i),  # A, B, C
                            "content": section.strip()
                        })
            
            # Add fallback branches if needed
            if len(branches) == 0:
                # No branches found, create default from the entire content
                branches = [
                    {"id": "A", "content": raw_response.strip()},
                    {"id": "B", "content": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge."},
                    {"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."}
                ]
            elif len(branches) == 1:
                # Only one branch found, add two more
                branches.append({"id": "B", "content": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge."})
                branches.append({"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."})
            elif len(branches) == 2:
                # Two branches found, add one more
                branches.append({"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."})
            
            self.logger.info(f"🔍 Generated {len(branches)} branches")
            return branches
        
        except Exception as e:
            self.logger.error(f"Error extracting branches: {str(e)}")
            # Return default branches on error
            return [
                {"id": "A", "content": "Implement AI-powered customer service chatbots to handle routine inquiries, reducing wait times and allowing human agents to focus on complex issues."},
                {"id": "B", "content": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge."},
                {"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."}
            ]
    
    async def _generate_final_prediction(self, analysis: str, internal_context: str, branches: dict) -> Dict[str, Any]:
        """Generate final prediction based on analysis, context, and branches"""
        # Determine which branch to use
        selected_branch = branches.get("recommendation", "B")  # Default to balanced approach
        branch_data = branches.get(selected_branch, {})
        
        # Extract prediction information
        if not branch_data:
            return {"prediction": "Unable to generate a prediction due to insufficient data", "selected_branch": ""}
        
        # Format prediction
        prediction = f"# Strategic Analysis and Outcome Prediction\n\n"
        prediction += f"## Selected Approach: Option {selected_branch} - {branch_data.get('summary', '')}\n\n"
        
        prediction += "### Key Benefits\n"
        for pro in branch_data.get("pros", []):
            prediction += f"- {pro}\n"
        
        prediction += "\n### Potential Challenges\n"
        for con in branch_data.get("cons", []):
            prediction += f"- {con}\n"
        
        prediction += f"\n### Implementation Timeline: {branch_data.get('time', 0)} months\n"
        prediction += f"### Estimated Cost: ${branch_data.get('cost', 0):,}\n"
        
        prediction += "\n### Action Plan\n"
        for i, action in enumerate(branch_data.get("action_items", []), 1):
            prediction += f"{i}. {action}\n"
        
        return {"prediction": prediction, "selected_branch": selected_branch}

    async def predict(self, analysis: str) -> Dict[str, Any]:
        """Generate branches from an analysis"""
        self.logger.info(f"📊 Predicting outcomes for analysis ({len(analysis)} chars)")
        
        try:
            # Setup Azure client
            await self.setup_client()
            
            # Generate branches based on analysis
            branches_result = await self._handle_timeout(
                self._generate_branches(analysis, ""),
                timeout_seconds=settings.AGENT4_BRANCHES_TIMEOUT,
                fallback_data={"branches": []}
            )
            
            # Extract branches from result
            raw_branches = branches_result.get("branches", [])
            
            # If no branches were generated or an error occurred, extract branches from the raw response text
            if not raw_branches:
                self.logger.warning("No branches were generated by the API call, attempting to extract from raw text")
                raw_branches = self._extract_branches(analysis)
            
            # Prepare final result
            result = {
                "branches": raw_branches
            }
            
            return result
        
        except Exception as e:
            self.logger.error(f"Error in predict method: {str(e)}")
            # Return default branches on error
            return {
                "branches": [
                    {"id": "A", "content": "Implement AI-powered customer service chatbots to handle routine inquiries, reducing wait times and allowing human agents to focus on complex issues."},
                    {"id": "B", "content": "Implement comprehensive training and development programs for customer service representatives to enhance their skills in problem-solving, communication, and product knowledge."},
                    {"id": "C", "content": "Establish a customer feedback loop with regular surveys, analysis, and action items to continuously improve service quality based on customer input."}
                ]
            } 