from agents.agent3_consultant.logic import ask_agent

def chat_loop():
    print("💬 Welcome to Strategic Consultant Agent (Agent 3)")
    print("Type your question (or 'exit' to quit):\n")

    while True:
        user_input = input("🧑‍💼 You: ").strip()
        # Exit on explicit commands
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Ending chat. Goodbye.")
            break
        # Skip empty lines
        if not user_input:
            continue

        print("🧠 Thinking...")
        response = ask_agent(user_input)
        print("\n🤖 Agent 3:\n")
        print(response)
        print("\n---\n")