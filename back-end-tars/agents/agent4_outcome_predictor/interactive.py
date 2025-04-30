import json, requests
from .logic import predict_all

AGENT5_URL = "http://localhost:8080/a2a/v1/tasks/send"

def chat_loop():
    print("🧠 Agent 4 Outcome Predictor REPL")
    print("Paste the final strategic analysis from Agent 3 (or 'exit'):\n")

    while True:
        raw = input("> ")
        if raw.strip().lower() in ("exit","quit"): break

        # 1) Get 3 branch outcomes
        branches = predict_all([raw])

        # 2) Display them
        for b in branches:
            print("\n" + "-"*40)
            print(f"Branch {b['branch']}: {b['summary']}")
            print(f"  CostUSD: {b['costUSD']}, TimeMonths: {b['timeMonths']}")
            print(f"  TariffSaving%: {b['tariffSavingPercent']}, Risk(s): {b['supplyRisk']}/{b['complianceRisk']}")
            print(f"  Score: {b['overallScore']}")
            print("  ActionItems:")
            for task in b["actionItems"]:
                print("   -", task)
        print("-"*40)

        # 3) User picks
        choice = input("➡ Choose branch (A/B/C): ").strip().upper()
        chosen = next((b for b in branches if b["branch"]==choice), None)
        if not chosen:
            print(f"❌ Invalid choice '{choice}'. Try again.\n")
            continue

        # 4) Send that branch to Agent 5
        print(f"🚀 [Agent 4] Sending chosen branch ({choice}) to Agent 5…")
        try:
            resp = requests.post(AGENT5_URL, json=chosen, timeout=60)
            resp.raise_for_status()
            result = resp.json()
            print("📤 [Agent 5] Draft email results:\n", json.dumps(result, indent=2))
        except Exception as e:
            print(f"❌ [Agent 4] Failed sending to Agent 5: {e}")

        print("\n=== Done ===\n")

if __name__ == "__main__":
    chat_loop()
