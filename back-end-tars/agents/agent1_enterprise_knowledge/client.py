import requests

def load_agent_card(agent3_base_url: str):
    url = f"{agent3_base_url}/.well-known/agent.json"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def send_doc_context(agent3_base_url: str, doc_content: str) -> str:
    payload = {
        "task_type": "enterprise.doc.extract",
        "input": {
            "parts": [
                {"type": "text", "text": doc_content}
            ]
        }
    }
    response = requests.post(f"{agent3_base_url}/a2a/v1/tasks/send", json=payload)
    if response.status_code == 200:
        return response.json().get("output", {}).get("artifacts", [{}])[0].get("text", "")
    return f"Error: {response.status_code} {response.text}"
