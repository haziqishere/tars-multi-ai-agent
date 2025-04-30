import sys
from agents.agent3_consultant.handler import run_handler
from agents.agent3_consultant.interactive import chat_loop

# Add to run_agent1.py, run_agent2.py, and run_agent3.py
import sys
sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "serve"

    if mode == "chat":
        chat_loop()
    else:
        print("🧠 Agent 3 (Consultant) A2A Server is starting...")
        run_handler()
