import json
from agents.agent5_task_dispatcher.logic import parse_input, plan_tasks, send_tasks

def chat_loop():
    print("🧠 Agent 5 Task Dispatcher REPL")
    while True:
        raw = input("Payload (JSON or free text, or 'exit'): ")
        if raw.lower() in ("exit","quit"): break

        try:
            # 1) Normalize
            norm = parse_input(raw)
            print(f"📑 [Agent5] Normalized input: {norm}\n")

            # 2) Plan/draft
            drafts = plan_tasks(norm["branch"], norm["action"], norm["actionItems"])

            # 3) Display
            print("\n--- DRAFT EMAILS ---\n")
            for d in drafts:
                print(f"To:      {d['leadEmail']}")
                print(f"Subject: {d['subject']}\n{d['body']}\n")
                print("-"*40 + "\n")

            # 4) Confirm
            if input("Send these emails? (yes/no): ").strip().lower() not in ("yes","y"):
                print("🛑 [Agent5] Aborted send.\n")
                continue

            # 5) Send
            results = send_tasks(drafts)
            print("\n--- SEND RESULTS ---")
            print(json.dumps(results, indent=2), "\n")

        except Exception as e:
            print(f"❌ ERROR: {e}\n")

if __name__ == "__main__":
    chat_loop()
