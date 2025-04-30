from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
import os
import re
from agents.agent3_consultant.client import request_internal_docs, request_global_intel, request_outcome_predictions
from shared.utils import extract_latest_assistant_message, formulate_from_template

from dotenv import load_dotenv

load_dotenv()

# Azure AI Foundry setup
connection_string = os.getenv("AZURE_CONN_STRING")
agent_id = os.getenv("AGENT3_ID")

project_client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=connection_string
)
agent = project_client.agents.get_agent(agent_id)

def remove_consecutive_duplicates(text: str) -> str:
    chunks = re.split(r'(\. |\! |\? |\n)', text)
    deduped, prev = [], None
    for chunk in chunks:
        if chunk and chunk != prev:
            deduped.append(chunk)
        prev = chunk
    return ''.join(deduped).strip()

def evaluate_context_need(question: str, initial_answer: str) -> str:
    thread = project_client.agents.create_thread()
    with open("prompts/evaluation.txt", "r", encoding="utf-8") as f:
        eval_prompt = f.read().format(question=question, initial_answer=initial_answer)
    project_client.agents.create_message(thread_id=thread.id, role="user", content=eval_prompt)
    project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
    messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
    evaluation = extract_latest_assistant_message(messages).lower().strip()
    print(f"🔍 [Agent 3] Context Evaluation Result: {evaluation}")
    return evaluation

def formulate_internal_questions(original_question: str) -> str:
    prompt_path = "prompts/formulate_internal.txt"
    print(f"🔍 [Agent 3] Generating internal questions…")
    q = formulate_from_template(
        project_client,
        agent.id,
        prompt_path,
        original_question=original_question
    )
    print(f"🔍 [Agent 3] Generated internal question: {q}")
    return q

def formulate_search_questions(original_question: str) -> str:
    thread = project_client.agents.create_thread()
    with open("prompts/formulate_search.txt", "r", encoding="utf-8") as f:
        prompt_template = f.read()
    prompt = prompt_template.format(original_question=original_question)
    project_client.agents.create_message(thread_id=thread.id, role="user", content=prompt)
    project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
    messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
    search_query = extract_latest_assistant_message(messages)
    print(f"🔍 [Agent 3] Generated search query: {search_query}")
    return search_query

def ask_agent(question: str) -> str:
    print("\n" + "="*50)
    print(f"📥 [Agent 3] RECEIVED QUESTION: \"{question}\"")
    print("="*50 + "\n")

    print("🤔 [Agent 3] Attempting initial response...")
    thread = project_client.agents.create_thread()
    prompt_initial = f"You are a strategic consultant. Answer clearly and directly:\n\n{question}"
    project_client.agents.create_message(thread_id=thread.id, role="user", content=prompt_initial)
    project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
    messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
    answer = extract_latest_assistant_message(messages)

    print("\n📤 [Agent 3] INITIAL RESPONSE:")
    print("-"*30)
    print(answer)
    print("-"*30 + "\n")

    # Evaluate if context is needed
    context_need = evaluate_context_need(question, answer)
    if "sufficient" in context_need:
        print("✅ [Agent 3] Initial answer sufficient - no additional context needed")
        return answer

    print("⚠️ [Agent 3] Additional context required - querying relevant agents...")
    internal_context = ""
    global_context = ""

    if "internal" in context_need:
        internal_q1 = formulate_internal_questions(question)
        internal_context = request_internal_docs(internal_q1)
        if internal_context.count("###") < 3:
            print("⚠️ [Agent 3] Not all sub-questions were answered by Agent 1.")
        print(f"\n📥 [Agent 1 → Agent 3] RECEIVED INTERNAL CONTEXT:\n{'-'*30}\n{internal_context}\n{'-'*30}")

    if "external" in context_need:
        global_q1 = formulate_search_questions(question)
        global_context = request_global_intel(global_q1)
        print(f"\n📥 [Agent 2 → Agent 3] RECEIVED GLOBAL CONTEXT:\n{'-'*30}\n{global_context}\n{'-'*30}")

    # Load final RAG response prompt
    thread = project_client.agents.create_thread()
    with open("prompts/combiNASHUN.txt", "r", encoding="utf-8") as f:
        prompt_template = f.read()

    enhanced_prompt = prompt_template.format(
        question=question,
        internal_context=internal_context,
        global_context=global_context,
        initial_answer=answer
    )

    print(f"[DEBUG] Global context length: {len(global_context.strip())}")

    project_client.agents.create_message(thread_id=thread.id, role="user", content=enhanced_prompt)
    project_client.agents.create_and_process_run(thread_id=thread.id, agent_id=agent.id)
    messages = list(project_client.agents.list_messages(thread_id=thread.id).data)
    enhanced_answer = remove_consecutive_duplicates(extract_latest_assistant_message(messages))

    # ─── FINAL ANSWER FOR THE C-SUITE ────────────────────────────────
    print("\n📤 [Agent 3] FINAL RESPONSE:")
    print("-"*30)
    print(enhanced_answer)
    print("-"*30)

    # ─── HAND-OFF TO AGENT 4 (SYNCHRONOUS) ───────────────────────────
    print("🔗 [Agent 3] Forwarding analysis to Agent 4 for outcome prediction…")
    try:
        result = request_outcome_predictions(enhanced_answer)
        print(f"[Agent 3] Agent 4 processing complete: {result}")
    except Exception as e:
        print(f"[Agent 3] Agent 4 hand-off error: {e}")

    return enhanced_answer or "[No clear answer generated even after context enrichment.]"
