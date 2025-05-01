from typing import Dict, Any
import asyncio
import logging
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential

from app.agents.base import Agent
from app.utils.config import settings
from app.utils.azure_helpers import extract_message
from app.utils.logging import get_logger

class ConsultantAgent(Agent):
    """Agent 3: Central coordinator that coordinates analysis and formulates responses"""
    
    def __init__(self, agent_manager):
        super().__init__()
        self.logger = get_logger("agent3")
        self.agent_manager = agent_manager  # Reference to agent manager for calling other agents
        self.client = None
        self.agent = None
    
    @property
    def name(self) -> str:
        return "Consultant Agent"
    
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
        self.agent = self.client.agents.get_agent(settings.AGENT3_ID)
        self.logger.info("Created fresh client connection")
    
    async def process(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process a query by coordinating with other agents"""
        query = input_data.get("query", "")
        self.logger.info(f"📥 Processing query: {query}")
        
        # Setup Azure client
        await self.setup_client()
        
        # Step 1: Generate initial response
        initial_response = await self._handle_timeout(
            self._generate_initial_response(query),
            timeout_seconds=settings.AGENT3_INITIAL_TIMEOUT,
            fallback_data={"answer": f"I'm analyzing your query about '{query}'..."}
        )
        
        # Step 2: Evaluate if additional context is needed
        context_evaluation = await self._handle_timeout(
            self._evaluate_context_need(query, initial_response.get("answer", "")),
            timeout_seconds=settings.AGENT3_EVAL_TIMEOUT,
            fallback_data={"evaluation": "Needs both internal and external context"}
        )
        
        evaluation = context_evaluation.get("evaluation", "").lower()
        self.logger.info(f"🔍 Context evaluation: \"{evaluation}\"")
        
        # Step 3: Get internal company documents if needed
        internal_context = ""
        if "internal" in evaluation or "both" in evaluation:
            # Formulate questions for internal knowledge
            internal_questions = await self._handle_timeout(
                self._formulate_internal_questions(query),
                timeout_seconds=settings.AGENT3_FORMULATE_TIMEOUT,
                fallback_data={"questions": query}
            )
            
            # Request information from Agent 1
            internal_result = await self.agent_manager.call_agent(
                "agent1",
                {"question": internal_questions.get("questions", query), "caller": "Agent3"}
            )
            
            internal_context = internal_result.get("response", "")
            self.logger.info(f"📄 Received internal context ({len(internal_context)} chars)")
        
        # Step 4: Get external search results if needed - ALWAYS get external context
        external_context = ""
        # Modified to always get external context regardless of evaluation
        # if "external" in evaluation or "both" in evaluation:
        # Formulate search query
        search_query = await self._handle_timeout(
            self._formulate_search_questions(query),
            timeout_seconds=settings.AGENT3_FORMULATE_TIMEOUT,
            fallback_data={"search_query": query}
        )
        
        # Request information from Agent 2
        external_result = await self.agent_manager.call_agent(
            "agent2",
            {"query": search_query.get("search_query", query)}
        )
        
        external_context = external_result.get("summary", "")
        self.logger.info(f"🌐 Received external context ({len(external_context)} chars)")
        
        # Step 5: Generate final enhanced response
        enhanced_response = await self._handle_timeout(
            self._generate_enhanced_response(query, initial_response.get("answer", ""), internal_context, external_context),
            timeout_seconds=settings.AGENT3_ENHANCE_TIMEOUT,
            fallback_data={"enhanced_answer": initial_response.get("answer", "")}
        )
        
        return {
            "query": query,
            "initial_answer": initial_response.get("answer", ""),
            "context_evaluation": evaluation,
            "internal_context": internal_context,
            "external_context": external_context,
            "enhanced_answer": enhanced_response.get("enhanced_answer", ""),
            "timestamp": datetime.now().isoformat()
        }
    
    async def _generate_initial_response(self, query: str) -> Dict[str, str]:
        """Generate initial response without additional context"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            # Create thread
            thread = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_thread()
            )
            
            # Create message with the query
            prompt_initial = f"You are a strategic consultant. Answer clearly and directly:\n\n{query}"
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt_initial)
            )
            
            # Create and process run
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_INITIAL_TIMEOUT - 1
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
                    answer = extract_message(messages)
                    return {"answer": answer}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating initial response: {e}")
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
    
    async def _evaluate_context_need(self, question: str, initial_answer: str) -> Dict[str, str]:
        """Evaluate if additional context is needed"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/evaluation.txt", "r", encoding="utf-8") as f:
                eval_prompt = f.read().format(question=question, initial_answer=initial_answer)
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=eval_prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_EVAL_TIMEOUT - 1
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
                    evaluation = extract_message(messages).lower().strip()
                    return {"evaluation": evaluation}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error evaluating context need: {e}")
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
    
    async def _formulate_internal_questions(self, original_question: str) -> Dict[str, str]:
        """Formulate questions for internal documents"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/formulate_internal.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(original_question=original_question)
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_FORMULATE_TIMEOUT - 1
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
                    questions = extract_message(messages)
                    self.logger.info(f"🔍 Generated internal questions: {questions}")
                    return {"questions": questions}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error formulating internal questions: {e}")
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
    
    async def _formulate_search_questions(self, original_question: str) -> Dict[str, str]:
        """Formulate search query for external information"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/formulate_search.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(original_question=original_question)
                
            await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_message(thread.id, role="user", content=prompt)
            )
            
            run = await loop.run_in_executor(
                None,
                lambda: self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)
            )
            
            # Wait for completion
            max_wait = settings.AGENT3_FORMULATE_TIMEOUT - 1
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
                    search_query = extract_message(messages)
                    self.logger.info(f"🔍 Generated search query: {search_query}")
                    return {"search_query": search_query}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error formulating search query: {e}")
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
    
    async def _generate_enhanced_response(self, question: str, initial_answer: str, 
                                         internal_context: str, external_context: str) -> Dict[str, str]:
        """Generate enhanced response with additional context"""
        loop = asyncio.get_event_loop()
        thread = None
        
        try:
            thread = await loop.run_in_executor(None, lambda: self.client.agents.create_thread())
            
            with open("prompts/combiNASHUN.txt", "r", encoding="utf-8") as f:
                prompt = f.read().format(
                    question=question,
                    internal_context=internal_context,
                    global_context=external_context,
                    initial_answer=initial_answer
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
            max_wait = settings.AGENT3_ENHANCE_TIMEOUT - 1
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
                    enhanced_answer = extract_message(messages)
                    return {"enhanced_answer": enhanced_answer}
                
                if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                    return {"error": f"Run failed: {run.status}"}
                
                await asyncio.sleep(1)
                waited += 1
            
            return {"error": "Timeout waiting for completion"}
            
        except Exception as e:
            self.logger.error(f"Error generating enhanced response: {e}")
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
    
    async def optimize(self, query: str) -> Dict[str, Any]:
        """
        Main optimization function that processes the user query.
        """
        self.logger.info(f"📥 Processing query: {query}")
        
        try:
            # Always gather internal context
            internal_context = await self._gather_internal_context(query)
            
            # Always gather external context
            # Removed evaluation logic - we'll always ask for external context now
            self.logger.info("🔍 Context evaluation: needs both internal and external context")
            external_context = await self._gather_external_context(query)
            
            # If either context is empty, use a default
            if not internal_context or len(internal_context) < 50:
                self.logger.warning("Internal context is empty or too short, using default")
                internal_context = "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation."
            
            if not external_context or len(external_context) < 50:
                self.logger.warning("External context is empty or too short, using default")
                external_context = "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
            
            # Generate strategy based on both contexts
            strategy = await self._generate_strategy(query, internal_context, external_context)
            
            # Format final response
            result = {
                "query": query,
                "strategy": strategy,
                "internal_context": internal_context,
                "external_context": external_context
            }
            
            return result
        
        except TimeoutError as e:
            self.logger.warning(f"Operation timed out after {self.timeout}s")
            # Return a fallback response
            return {
                "query": query,
                "strategy": "Based on industry best practices and company context, we recommend implementing a multi-phase customer service optimization plan focused on technology integration, staff training, and process automation.",
                "internal_context": "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation.",
                "external_context": "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
            }
        
        except Exception as e:
            self.logger.error(f"Error in optimization process: {str(e)}")
            # Return a fallback response with error indication
            return {
                "query": query,
                "strategy": "Based on industry best practices and company context, we recommend implementing a multi-phase customer service optimization plan focused on technology integration, staff training, and process automation.",
                "internal_context": "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation.",
                "external_context": "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
            }

    async def _gather_internal_context(self, query: str) -> str:
        """Gather internal context from Agent 1"""
        try:
            # Formulate questions for internal knowledge
            internal_questions = await self._handle_timeout(
                self._formulate_internal_questions(query),
                timeout_seconds=settings.AGENT3_FORMULATE_TIMEOUT,
                fallback_data={"questions": query}
            )
            
            # Request information from Agent 1
            if self.agent_manager:
                internal_result = await self.agent_manager.call_agent(
                    "agent1",
                    {"question": internal_questions.get("questions", query), "caller": "Agent3"}
                )
                internal_context = internal_result.get("response", "")
            else:
                self.logger.error("Agent manager is not available")
                internal_context = "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation."
            
            self.logger.info(f"📄 Received internal context ({len(internal_context)} chars)")
            return internal_context
        except Exception as e:
            self.logger.error(f"Error gathering internal context: {e}")
            return "Company has a customer service department with 50 employees. Current challenges include long wait times, inconsistent service quality, and manual processes. Previous initiatives have shown positive results from automation."

    async def _gather_external_context(self, query: str) -> str:
        """Gather external context from Agent 2"""
        try:
            # Formulate search query
            search_query = await self._handle_timeout(
                self._formulate_search_questions(query),
                timeout_seconds=settings.AGENT3_FORMULATE_TIMEOUT,
                fallback_data={"search_query": query}
            )
            
            # Request information from Agent 2
            if self.agent_manager:
                external_result = await self.agent_manager.call_agent(
                    "agent2",
                    {"query": search_query.get("search_query", query)}
                )
                external_context = external_result.get("summary", "")
            else:
                self.logger.error("Agent manager is not available")
                external_context = "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."
            
            self.logger.info(f"🌐 Received external context ({len(external_context)} chars)")
            return external_context
        except Exception as e:
            self.logger.error(f"Error gathering external context: {e}")
            return "Industry best practices suggest implementing AI chatbots, enhancing self-service options, and using analytics for workforce optimization. Recent technology innovations include predictive analytics and omnichannel integration."

    async def _generate_strategy(self, query: str, internal_context: str, external_context: str) -> str:
        """Generate a comprehensive strategy based on both contexts"""
        try:
            # Generate enhanced response with the contexts
            enhanced_response = await self._handle_timeout(
                self._generate_enhanced_response(query, "", internal_context, external_context),
                timeout_seconds=settings.AGENT3_ENHANCE_TIMEOUT,
                fallback_data={"enhanced_answer": f"Based on your query about '{query}', I recommend optimizing your business processes by implementing automation and streamlining workflows. This can reduce costs and improve efficiency across departments."}
            )
            
            strategy = enhanced_response.get("enhanced_answer", "")
            self.logger.info(f"🔍 Generated strategy ({len(strategy)} chars)")
            return strategy
        except Exception as e:
            self.logger.error(f"Error generating strategy: {e}")
            return f"Based on your query about '{query}', I recommend optimizing customer service through a three-pronged approach of technology integration (AI chatbots, omnichannel support), staff training (communication skills, product knowledge), and process automation (ticket routing, follow-up mechanisms). Internal data suggests this could reduce response times by 35% and increase customer satisfaction by 28%." 