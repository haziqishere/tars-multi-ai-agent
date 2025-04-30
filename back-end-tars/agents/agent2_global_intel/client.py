import requests
import json

def load_agent_card(agent3_base_url: str):
    """
    Fetches the agent card of Agent 3 (Consultant).
    """
    url = f"{agent3_base_url}/.well-known/agent.json"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def send_summarization_task(agent3_base_url: str, content_to_summarize: str) -> str:
    """
    Sends a summarization task to Agent 3 and returns the summary.
    """
    # You could load Agent 3's card if needed:
    # agent_card = load_agent_card(agent3_base_url)
    task_type = "global.news.summarize"  # must match Agent 3's card

    payload = {
        "task_type": task_type,
        "input": {
            "parts": [
                {
                    "type": "text",
                    "text": content_to_summarize
                }
            ]
        }
    }

    task_url = f"{agent3_base_url}/a2a/v1/tasks/send"
    print(f"📤 Sending summarization task to: {task_url}")
    response = requests.post(task_url, json=payload)
    
    if response.status_code == 200:
        resp_json = response.json()
        # Extract the summary text from the response
        summary = resp_json.get("output", {}).get("artifacts", [{}])[0].get("text", "")
        return summary
    else:
        return f"Error: {response.status_code} {response.text}"
