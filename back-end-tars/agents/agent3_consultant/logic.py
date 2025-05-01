from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
import os
import re
import logging
import traceback
import time
from agents.agent3_consultant.client import request_internal_docs, request_global_intel, request_outcome_predictions
from shared.utils import extract_latest_assistant_message, formulate_from_template

from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("agent3_logic")

# Log startup
logger.info("[Agent 3 LOGIC] Initializing...")

# Load environment variables
load_dotenv()

# Azure AI Foundry setup - Handle initialization failures gracefully
project_client = None
agent = None

try:
    # Azure AI Foundry setup
    connection_string = os.getenv("AZURE_CONN_STRING")
    agent_id = os.getenv("AGENT3_ID")

    if not connection_string:
        logger.error("[Agent 3 LOGIC] AZURE_CONN_STRING environment variable not set")
        raise ValueError("AZURE_CONN_STRING environment variable not set")
        
    if not agent_id:
        logger.error("[Agent 3 LOGIC] AGENT3_ID environment variable not set")
        raise ValueError("AGENT3_ID environment variable not set")
    
    logger.info("[Agent 3 LOGIC] Setting up Azure AI Project client...")
    project_client = AIProjectClient.from_connection_string(
        credential=DefaultAzureCredential(),
        conn_str=connection_string
    )
    agent = project_client.agents.get_agent(agent_id)
    logger.info(f"[Agent 3 LOGIC] Successfully connected to agent: {agent_id}")
    
except Exception as e:
    logger.error(f"[Agent 3 LOGIC] Error during Azure client initialization: {e}")
    traceback.print_exc()
    # Continue execution - the ask_agent function will check if project_client is None


def remove_consecutive_duplicates(text: str) -> str:
    """Remove consecutive duplicate sentences or phrases from text."""
    if not text:
        return ""
    try:
        chunks = re.split(r'(\. |\! |\? |\n)', text)
        deduped, prev = [], None
        for chunk in chunks:
            if chunk and chunk != prev:
                deduped.append(chunk)
            prev = chunk
        return ''.join(deduped).strip()
    except Exception as e:
        logger.warning(f"[Agent 3 LOGIC] Error removing duplicates: {e}")
        return text  # Return original text if error occurs


def evaluate_context_need(question: str, initial_answer: str) -> str:
    """Evaluate if additional context is needed."""
    if not project_client or not agent:
        logger.error("[Agent 3 LOGIC] Cannot evaluate context need - client not initialized")
        return "needs both internal and external context"  # Conservative default
        
    try:
        logger.info("[Agent 3 LOGIC] Evaluating if additional context is needed...")
        thread = project_client.agents.create_thread()
        
        # Load the evaluation prompt
        try:
            with open("prompts/evaluation.txt", "r", encoding="utf-8") as f:
                eval_prompt = f.read().format(question=question, initial_answer=initial_answer)
        except Exception as f_err:
            logger.error(f"[Agent 3 LOGIC] Failed to load evaluation prompt: {f_err}")
            return "needs both internal and external context"  # Conservative default
            
        project_client.agents.create_message(thread_id=thread.id, role="user", content=eval_prompt)
        run = project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
        
        # Poll for completion with timeout
        start_time = time.time()
        timeout = 60  # 60 seconds timeout
        while run.status.name not in ('COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'):
            if time.time() - start_time > timeout:
                logger.warning("[Agent 3 LOGIC] Evaluation timed out")
                return "needs both internal and external context"  # Conservative default on timeout
                
            time.sleep(2)
            run = project_client.agents.get_run(thread_id=thread.id, run_id=run.id)
            logger.debug(f"[Agent 3 LOGIC] Evaluation run status: {run.status.name}")
            
        if run.status.name != 'COMPLETED':
            logger.warning(f"[Agent 3 LOGIC] Evaluation run failed with status: {run.status.name}")
            return "needs both internal and external context"  # Conservative default on failure
            
        messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
        evaluation = extract_latest_assistant_message(messages).lower().strip()
        logger.info(f"[Agent 3 LOGIC] Context Evaluation Result: {evaluation}")
        return evaluation
        
    except Exception as e:
        logger.error(f"[Agent 3 LOGIC] Error during context evaluation: {e}")
        traceback.print_exc()
        return "needs both internal and external context"  # Conservative default


def formulate_internal_questions(original_question: str) -> str:
    """Formulate questions for Agent 1 (internal documents)."""
    if not project_client or not agent:
        logger.error("[Agent 3 LOGIC] Cannot formulate internal questions - client not initialized")
        return f"Error: Azure client not initialized. Question was: {original_question}"
        
    try:
        prompt_path = "prompts/formulate_internal.txt"
        logger.info(f"[Agent 3 LOGIC] Generating internal questions using {prompt_path}...")
        
        try:
            q = formulate_from_template(
                project_client,
                agent.id,
                prompt_path,
                original_question=original_question
            )
            logger.info(f"[Agent 3 LOGIC] Generated internal questions: {q}")
            return q
        except Exception as template_err:
            logger.error(f"[Agent 3 LOGIC] Error in formulate_from_template: {template_err}")
            # Create a basic fallback question
            return f"What internal documents contain information relevant to: {original_question}"
            
    except Exception as e:
        logger.error(f"[Agent 3 LOGIC] Error formulating internal questions: {e}")
        traceback.print_exc()
        return f"Error formulating internal questions: {str(e)}"


def formulate_search_questions(original_question: str) -> str:
    """Formulate questions for Agent 2 (external search)."""
    if not project_client or not agent:
        logger.error("[Agent 3 LOGIC] Cannot formulate search questions - client not initialized")
        return f"Error: Azure client not initialized. Search query was: {original_question}"
        
    try:
        logger.info("[Agent 3 LOGIC] Generating external search query...")
        thread = project_client.agents.create_thread()
        
        # Load the search formulation prompt
        try:
            with open("prompts/formulate_search.txt", "r", encoding="utf-8") as f:
                prompt_template = f.read()
        except Exception as f_err:
            logger.error(f"[Agent 3 LOGIC] Failed to load search prompt: {f_err}")
            return f"Current 2025 information about {original_question}"  # Basic fallback
            
        prompt = prompt_template.format(original_question=original_question)
        project_client.agents.create_message(thread_id=thread.id, role="user", content=prompt)
        run = project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
        
        # Poll for completion with timeout
        start_time = time.time()
        timeout = 60  # 60 seconds timeout
        while run.status.name not in ('COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'):
            if time.time() - start_time > timeout:
                logger.warning("[Agent 3 LOGIC] Search formulation timed out")
                return f"Current 2025 information about {original_question}"  # Basic fallback
                
            time.sleep(2)
            run = project_client.agents.get_run(thread_id=thread.id, run_id=run.id)
            logger.debug(f"[Agent 3 LOGIC] Search formulation run status: {run.status.name}")
            
        if run.status.name != 'COMPLETED':
            logger.warning(f"[Agent 3 LOGIC] Search formulation run failed with status: {run.status.name}")
            return f"Current 2025 information about {original_question}"  # Basic fallback
            
        messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
        search_query = extract_latest_assistant_message(messages)
        logger.info(f"[Agent 3 LOGIC] Generated search query: {search_query}")
        return search_query
        
    except Exception as e:
        logger.error(f"[Agent 3 LOGIC] Error formulating search query: {e}")
        traceback.print_exc()
        return f"Current 2025 information about {original_question}"  # Basic fallback


def ask_agent(question: str) -> str:
    """Main function to process a query and generate a response."""
    # Add debug log to confirm function is entered
    logger.info(f"[Agent 3 LOGIC] Entering ask_agent with question: '{question}'")
    
    print("\n" + "="*50)
    print(f"[Agent 3 LOGIC] RECEIVED QUESTION: \"{question}\"")
    print("="*50 + "\n")

    # Check if Azure client is initialized
    if not project_client or not agent:
        error_message = "[Error: Agent 3's Azure AI client failed to initialize. Cannot process request.]"
        logger.error("[Agent 3 LOGIC] Cannot process request - client not initialized")
        return error_message

    try:
        # Initial response attempt
        logger.info("[Agent 3 LOGIC] Attempting initial response...")
        thread = project_client.agents.create_thread()
        prompt_initial = f"You are a strategic consultant. Answer clearly and directly:\n\n{question}"
        project_client.agents.create_message(thread_id=thread.id, role="user", content=prompt_initial)
        
        logger.info("[Agent 3 LOGIC] Creating initial run...")
        run = project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
        
        # Poll for completion with timeout
        start_time = time.time()
        timeout = 60  # 60 seconds timeout
        while run.status.name not in ('COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'):
            if time.time() - start_time > timeout:
                logger.warning("[Agent 3 LOGIC] Initial response timed out")
                raise TimeoutError("Initial response generation timed out after 60 seconds")
                
            time.sleep(2)
            run = project_client.agents.get_run(thread_id=thread.id, run_id=run.id)
            logger.debug(f"[Agent 3 LOGIC] Initial run status: {run.status.name}")
            
        if run.status.name != 'COMPLETED':
            logger.warning(f"[Agent 3 LOGIC] Initial run failed with status: {run.status.name}")
            raise RuntimeError(f"Initial response generation failed with status: {run.status.name}")
            
        messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
        answer = extract_latest_assistant_message(messages)
        if not answer:
            logger.warning("[Agent 3 LOGIC] No response received from initial query")
            answer = "No initial response could be generated."

        print("\n[Agent 3 LOGIC] INITIAL RESPONSE:")
        print("-"*30)
        print(answer)
        print("-"*30 + "\n")

        # Evaluate if context is needed
        context_need = evaluate_context_need(question, answer)
        
        # Default to requiring both contexts if we got an error string
        if "error:" in context_need.lower():
            logger.warning(f"[Agent 3 LOGIC] Context evaluation returned error: {context_need}")
            context_need = "needs both internal and external context"

        internal_context = ""
        global_context = ""

        # If sufficient, we can skip context gathering - but Agent 4 still needs to be called
        if "sufficient" in context_need:
            logger.info("[Agent 3 LOGIC] Initial answer sufficient - no additional context needed")
            enhanced_answer = answer  # Use initial answer directly
        else:
            # Need to gather context
            logger.info(f"[Agent 3 LOGIC] Additional context required ({context_need}) - querying relevant agents...")

            # Get internal context if needed
            if "internal" in context_need:
                try:
                    internal_q1 = formulate_internal_questions(question)
                    if "error:" in internal_q1.lower():
                        logger.warning(f"[Agent 3 LOGIC] Error formulating internal questions: {internal_q1}")
                        internal_q1 = f"What internal documents contain information relevant to: {question}"
                        
                    logger.info(f"[Agent 3 LOGIC] Requesting internal docs from Agent 1: {internal_q1}")
                    internal_context = request_internal_docs(internal_q1)
                    
                    if "[Error Agent 1:" in internal_context:
                        logger.warning(f"[Agent 3 LOGIC] Error from Agent 1: {internal_context}")
                    elif not internal_context:
                        logger.warning("[Agent 3 LOGIC] Empty response from Agent 1")
                        internal_context = "No relevant internal documents found."
                    else:
                        logger.info(f"[Agent 3 LOGIC] Received internal context from Agent 1 ({len(internal_context)} chars)")
                    
                except Exception as e:
                    logger.error(f"[Agent 3 LOGIC] Error when requesting internal docs: {e}")
                    internal_context = f"[Error requesting internal documents: {str(e)}]"

            # Get external context if needed
            if "external" in context_need:
                try:
                    global_q1 = formulate_search_questions(question)
                    if "error:" in global_q1.lower():
                        logger.warning(f"[Agent 3 LOGIC] Error formulating search query: {global_q1}")
                        global_q1 = f"Current 2025 information about {question}"
                        
                    logger.info(f"[Agent 3 LOGIC] Requesting global intel from Agent 2: {global_q1}")
                    global_context = request_global_intel(global_q1)
                    
                    if "[Error Agent 2:" in global_context:
                        logger.warning(f"[Agent 3 LOGIC] Error from Agent 2: {global_context}")
                    elif not global_context:
                        logger.warning("[Agent 3 LOGIC] Empty response from Agent 2")
                        global_context = "No relevant external information found."
                    else:
                        logger.info(f"[Agent 3 LOGIC] Received global context from Agent 2 ({len(global_context)} chars)")
                
                except Exception as e:
                    logger.error(f"[Agent 3 LOGIC] Error when requesting global intel: {e}")
                    global_context = f"[Error requesting external information: {str(e)}]"

            # Now generate enhanced response with contexts
            try:
                logger.info("[Agent 3 LOGIC] Generating enhanced response with contexts...")
                
                # Load the final response template
                try:
                    with open("prompts/combiNASHUN.txt", "r", encoding="utf-8") as f:
                        prompt_template = f.read()
                except Exception as f_err:
                    logger.error(f"[Agent 3 LOGIC] Failed to load combiNASHUN.txt: {f_err}")
                    raise
                    
                # Fill in the template
                enhanced_prompt = prompt_template.format(
                    question=question,
                    internal_context=internal_context or "No internal context available.",
                    global_context=global_context or "No external context available.",
                    initial_answer=answer
                )
                
                logger.debug(f"[Agent 3 LOGIC] Enhanced prompt length: {len(enhanced_prompt)} chars")
                
                # Create a new thread for the enhanced response
                thread = project_client.agents.create_thread()
                project_client.agents.create_message(thread_id=thread.id, role="user", content=enhanced_prompt)
                
                logger.info("[Agent 3 LOGIC] Creating enhanced response run...")
                run = project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
                
                # Poll for completion with longer timeout
                start_time = time.time()
                timeout = 120  # 120 seconds timeout for enhanced response
                while run.status.name not in ('COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'):
                    if time.time() - start_time > timeout:
                        logger.warning("[Agent 3 LOGIC] Enhanced response timed out")
                        raise TimeoutError("Enhanced response generation timed out after 120 seconds")
                        
                    time.sleep(2)
                    run = project_client.agents.get_run(thread_id=thread.id, run_id=run.id)
                    logger.debug(f"[Agent 3 LOGIC] Enhanced run status: {run.status.name}")
                    
                if run.status.name != 'COMPLETED':
                    logger.warning(f"[Agent 3 LOGIC] Enhanced run failed with status: {run.status.name}")
                    raise RuntimeError(f"Enhanced response generation failed with status: {run.status.name}")
                    
                messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
                enhanced_answer = extract_latest_assistant_message(messages)
                
                if not enhanced_answer:
                    logger.warning("[Agent 3 LOGIC] No response received from enhanced query")
                    enhanced_answer = "[No clear answer generated even after context enrichment.]"
                else:
                    enhanced_answer = remove_consecutive_duplicates(enhanced_answer)
                    
            except Exception as e:
                logger.error(f"[Agent 3 LOGIC] Error generating enhanced response: {e}")
                traceback.print_exc()
                # Fall back to initial answer if enhanced fails
                enhanced_answer = answer or "[No clear answer generated.]"

        # Final answer is either the enhanced one or the initial one if sufficient/fallback
        logger.info("[Agent 3 LOGIC] Final response preparation complete")
        
        # Hand off to Agent 4 (don't let this block the response)
        try:
            logger.info("[Agent 3 LOGIC] Forwarding analysis to Agent 4...")
            result = request_outcome_predictions(enhanced_answer)
            logger.info(f"[Agent 3 LOGIC] Agent 4 processing result: {result}")
        except Exception as e:
            logger.error(f"[Agent 3 LOGIC] Error forwarding to Agent 4: {e}")
            # Continue with response even if Agent 4 handoff fails
        
        return enhanced_answer or "[No clear answer generated.]"

    except Exception as e:
        error_message = f"[Error in Agent 3 processing: {str(e)}]"
        logger.error(f"[Agent 3 LOGIC] Unhandled exception in ask_agent: {e}")
        traceback.print_exc()
        return error_message
