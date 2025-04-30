import sys
from agents.agent5_task_dispatcher.handler import run_handler
from agents.agent5_task_dispatcher.interactive import chat_loop

# ensure UTF-8 output in Windows consoles
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

if __name__ == "__main__":
    mode = sys.argv[1].lower() if len(sys.argv) > 1 else "serve"
    if mode == "chat":
        chat_loop()
    else:
        run_handler()
