from agents.agent2_global_intel.handler import run_handler
import argparse
import sys

# Add to run_agent1.py, run_agent2.py, and run_agent3.py
import sys
sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8002, help="Port to run the agent on")
    args = parser.parse_args()
    
    print(f"🧠 Agent 2 (Global Intel) A2A Server is starting on port {args.port}...")
    run_handler(port=args.port)
