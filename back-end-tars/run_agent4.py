import sys
from agents.agent4_outcome_predictor.handler import run_handler
from agents.agent4_outcome_predictor.interactive import chat_loop

sys.stdout.reconfigure(encoding="utf-8")

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "serve"
    if mode == "chat":
        chat_loop()
    else:
        print("🧠 Agent 4 (Outcome Predictor) A2A Server is starting...")
        run_handler()
