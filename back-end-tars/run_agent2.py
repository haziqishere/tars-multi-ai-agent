from agents.agent2_global_intel.handler import run_handler

# Add to run_agent1.py, run_agent2.py, and run_agent3.py
import sys
sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    print("🧠 Agent 2 (Global Intel) A2A Server is starting...")
    run_handler()
