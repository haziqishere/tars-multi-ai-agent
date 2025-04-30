import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# URLs for Agent 1 and Agent 2 (local deployment)
AGENT1_BASE_URL = "http://localhost:8001"
AGENT2_BASE_URL = "http://localhost:8002"
AGENT4_BASE_URL = "http://localhost:8004"


# --- AGENT 1 REQUESTS (Internal Docs) ---
def request_internal_docs(question: str, caller: str = "Agent3") -> str:
    """
    Ask Agent 1’s /tasks/send for internal-doc QA.
    The X-Caller-Agent header tells Agent 1 who’s asking.
    """
    payload = {
        "task_type": "enterprise.doc.qa",
        "input": {"parts": [{"type": "text", "text": question}]}
    }
    headers = {"X-Caller-Agent": caller}
    url = f"{AGENT1_BASE_URL}/a2a/v1/tasks/send"

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json().get("output", {}) \
                      .get("artifacts", [{}])[0] \
                      .get("text", "")
    except Exception as e:
        return f"[Error Agent 1: {e}]"

# --- AGENT 2 REQUESTS (Global Intel) ---
def request_global_intel(query: str) -> str:
    payload = {
        "task_type": "global.news.search",
        "input": {
            "parts": [
                {"type": "text", "text": query}
            ]
        }
    }
    url = f"{AGENT2_BASE_URL}/a2a/v1/tasks/send"
    response = requests.post(url, json=payload, verify=False, timeout=30)
    if response.status_code == 200:
        return response.json().get("output", {}).get("artifacts", [{}])[0].get("text", "")
    else:
        return f"[Error Agent 2: {response.status_code}] {response.text}"

def request_outcome_predictions(full_context: str) -> list[dict]:
    """
    Call Agent 4’s /a2a/v1/tasks/send endpoint (or a dedicated one)
    passing the entire strategic analysis text.
    """
    payload = {"actions": [full_context]}
    url = f"{AGENT4_BASE_URL}/a2a/v1/tasks/send"
    try:
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": f"[Error Agent 4: {e}]"}