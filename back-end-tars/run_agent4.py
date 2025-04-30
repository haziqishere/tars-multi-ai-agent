import sys
import argparse
from agents.agent4_outcome_predictor.handler import run_handler
from agents.agent4_outcome_predictor.interactive import chat_loop

sys.stdout.reconfigure(encoding="utf-8")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8004, help="Port to run the agent on")
    parser.add_argument("mode", nargs="?", default="serve", help="Mode to run in (serve or chat)")
    args = parser.parse_args()
    
    if args.mode == "chat":
        chat_loop()
    else:
        print(f"🧠 Agent 4 (Outcome Predictor) A2A Server is starting on port {args.port}...")
        run_handler(port=args.port)
