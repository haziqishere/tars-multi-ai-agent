from flask import Flask, request, jsonify
from agents.agent3_consultant.logic import ask_agent

app = Flask(__name__)

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def handle_task():
    task = request.json
    task_type = task.get("task_type")
    if task_type != "global.news.summarize":
        return jsonify({"error": f"Unsupported task_type: {task_type}"}), 400

    parts = task.get("input", {}).get("parts", [])
    text_input = ""
    for part in parts:
        if part.get("type") == "text":
            text_input += part.get("text", "") + "\n"

    print("📥 Received summarization request:")
    print(text_input.strip())

    summary = ask_agent(text_input.strip())

    print("🧪 Summary generated:", summary)

    response = {
        "status": "completed",
        "output": {
            "artifacts": [
                {
                    "type": "text",
                    "text": summary
                }
            ]
        }
    }
    return jsonify(response), 200

@app.route("/.well-known/agent.json", methods=["GET"])
def serve_agent_card():
    try:
        with open("agents/agent3_consultant/agent.json", "r") as f:
            card = f.read()
        return card, 200, {"Content-Type": "application/json"}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def run_handler():
    app.run(host="0.0.0.0", port=8003)
