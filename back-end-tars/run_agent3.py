import sys
import argparse
from agents.agent3_consultant.handler import run_handler
from agents.agent3_consultant.interactive import chat_loop

# Add to run_agent1.py, run_agent2.py, and run_agent3.py
import sys
sys.stdout.reconfigure(encoding='utf-8')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8003, help="Port to run the agent on")
    parser.add_argument("mode", nargs="?", default="serve", help="Mode to run in (serve or chat)")
    args = parser.parse_args()

    if args.mode == "chat":
        chat_loop()
    else:
        print(f"🧠 Agent 3 (Consultant) A2A Server is starting on port {args.port}...")
        run_handler(port=args.port)
