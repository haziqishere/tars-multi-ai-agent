import os
import logging
import time
from threading import Lock
from datetime import datetime
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import RunStatus
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# ─── LOGGING CONFIG ───────────────────────────────────────────────────
# 1) Configure root logger to only show INFO+ with your prefix
logging.basicConfig(level=logging.INFO, format='[AGENT 1] %(message)s')

# 2) Silence all the Azure/HTTP/urllib3 noise at WARNING+
for noisy in (
    "azure",
    "azure.identity",
    "azure.ai",
    "azure.core.pipeline.policies.http_logging_policy",
    "urllib3",
):
    logging.getLogger(noisy).setLevel(logging.WARNING)
# ──────────────────────────────────────────────────────────────────────

# Basic setup
load_dotenv()

# Config
CONN_STR    = os.getenv("AZURE_CONN_STRING")
AGENT_ID    = os.getenv("AGENT1_ID")
MAX_RETRIES = 3
TIMEOUT_S   = 25  # shorter timeout

class Agent1:
    def __init__(self):
        self.lock = Lock()
        self.setup_client()

    def setup_client(self):
        """Create fresh client connection"""
        self.client = AIProjectClient.from_connection_string(
            credential=DefaultAzureCredential(),
            conn_str=CONN_STR
        )
        self.agent = self.client.agents.get_agent(AGENT_ID)
        logging.info("Created fresh client connection")

    def process_request(self, question: str, caller: str) -> str:
        with self.lock:
            thread = None
            try:
                self.setup_client()
                thread = self.client.agents.create_thread()
                logging.info(f"Created thread {thread.id}")
                self.client.agents.create_message(thread.id, role="user", content=question)
                run = self.client.agents.create_and_process_run(thread.id, agent_id=self.agent.id)

                waited = 0
                while waited < TIMEOUT_S:
                    run = self.client.agents.get_run(thread_id=thread.id, run_id=run.id)
                    logging.info(f"Status: {run.status}")
                    if run.status == RunStatus.COMPLETED:
                        msgs = list(self.client.agents.list_messages(thread.id).data)
                        resp = self._extract_message(msgs)
                        return resp or RuntimeError("Empty response")
                    if run.status in (RunStatus.FAILED, RunStatus.CANCELLED, RunStatus.EXPIRED):
                        raise RuntimeError(f"Run failed: {run.status}")
                    time.sleep(1)
                    waited += 1

                raise RuntimeError(f"Timeout after {TIMEOUT_S}s")

            except Exception as e:
                logging.error(f"Error processing request: {e}")
                return f"Error: {e}"

            finally:
                if thread:
                    try:
                        self.client.agents.delete_thread(thread.id)
                        logging.info(f"Cleaned up thread {thread.id}")
                    except:
                        pass
                self.client = None
                self.agent = None

    def _extract_message(self, messages: list) -> str:
        for msg in reversed(messages):
            if msg.get("role") == "assistant":
                content = msg.get("content", [])
                if content and isinstance(content, list):
                    return content[0].get("text", {}).get("value", "").strip()
        return ""

# Single instance (now quiet on import)
_agent = Agent1()

def answer_question(question: str, caller: str = "Agent1") -> str:
    logging.info(f"📥 Received from {caller}: {question}")
    return _agent.process_request(question, caller)
