import sys
import argparse
from agents.agent5_task_dispatcher.handler import run_handler
from agents.agent5_task_dispatcher.interactive import chat_loop

# ensure UTF-8 output in Windows consoles
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8005, help="Port to run the agent on")
    parser.add_argument("mode", nargs="?", default="serve", help="Mode to run in (serve or chat)")
    args = parser.parse_args()
    
    if args.mode == "chat":
        chat_loop()
    else:
        print(f"🧠 Agent 5 (Task Dispatcher) A2A Server is starting on port {args.port}...")
        run_handler(port=args.port)
