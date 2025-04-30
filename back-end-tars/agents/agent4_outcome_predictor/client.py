# Called by Agent 3
import os
import json
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

# Load environment variables
load_dotenv()
_CONN = os.getenv("AZURE_CONN_STRING")
_AGENT_ID = os.getenv("AGENT4_ID")

if not _CONN:
    raise ValueError("AZURE_CONN_STRING environment variable is missing. Check your .env file.")
if not _AGENT_ID:
    raise ValueError("AGENT4_ID environment variable is missing. Check your .env file.")

_project = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=_CONN
)
_agent  = _project.agents.get_agent(_AGENT_ID)

def run_prediction(actions: list[str]) -> list[dict]:
    thread = _project.agents.create_thread()
    _project.agents.create_message(thread.id, role="user",
        content=json.dumps({"actions": actions}))
    _project.agents.create_and_process_run(thread.id, _agent.id)
    msgs = _project.agents.list_messages(thread.id)
    return json.loads(msgs.text_messages[-1].content)

def send_to_agent5(selected_branch: dict) -> dict:
    """Send selected branch to Agent 5"""
    import requests
    
    response = requests.post(
        "http://localhost:8080/a2a/v1/tasks/send",  # Match Agent 5's port
        json={
            "branch": selected_branch["branch"],
            "action": selected_branch["summary"], 
            "actionItems": selected_branch["actionItems"]
        }
    )
    return response.json()
