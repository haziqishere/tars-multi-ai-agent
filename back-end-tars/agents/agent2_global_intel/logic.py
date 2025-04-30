# === File: logic.py ===
# Azure AI Foundry orchestration and high-level logic
import json
import time
import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv
from .search import run_search_tools

# Load Azure credentials
load_dotenv()
connection_string = os.getenv('AZURE_CONN_STRING')
agent_id = os.getenv('AGENT2_ID')

# Initialize client and agent
project_client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=connection_string
)
agent = project_client.agents.get_agent(agent_id)
AGENT2_THREAD = project_client.agents.create_thread().id
print(f"🔵 [Agent 2] Initialized with thread: {AGENT2_THREAD}")

# Send a prompt to a fresh thread and return assistant reply
def analyze_with_new_thread(prompt: str, timeout: int = 120) -> str:
    thread = project_client.agents.create_thread().id
    project_client.agents.create_message(thread_id=thread, role='user', content=prompt)
    run = project_client.agents.create_and_process_run(thread_id=thread, agent_id=agent.id)
    start = time.time()
    while run.status.name not in ('COMPLETED','FAILED'):
        if time.time() - start > timeout:
            raise TimeoutError('Analysis timed out')
        time.sleep(2)
        run = project_client.agents.get_run(thread, run.id)
    # extract assistant message
    for msg in reversed(project_client.agents.list_messages(thread_id=thread).data):
        if msg.role.lower() == 'assistant':
            return ''.join(txt.text.value for txt in getattr(msg,'text_messages',[]))
    raise RuntimeError('No assistant message found')

# Summarize search results JSON via Azure
def filter_search_results(raw_json: dict) -> str:
    if not raw_json.get('results'):
        return 'No results found'
    prompt = (
        f"Analyze these search results and summarize each entry:\n{json.dumps(raw_json)}"
    )
    return analyze_with_new_thread(prompt)

# Main entrypoint
def handle_global_query(query: str) -> str:
    # run_search_tools returns a list; wrap it so filter_search_results can .get('results')
    raw_list = run_search_tools(query)
    raw = { 'results': raw_list }
    return filter_search_results(raw)
