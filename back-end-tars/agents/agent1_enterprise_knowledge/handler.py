from flask import Flask, request, jsonify
from agents.agent1_enterprise_knowledge.logic import answer_question
import logging

# Silence Azure AI Foundry debug logs
logging.getLogger("azure").setLevel(logging.WARNING)

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def receive_task():
    # 1) Parse incoming payload
    payload = request.get_json(force=True)
    caller  = request.headers.get("X-Caller-Agent", "Unknown")
    print(f"[Agent 1] Received from {caller}: {payload}")

    # 2) Extract the question text
    question = (
        payload
        .get("input", {})
        .get("parts", [{}])[0]
        .get("text", "")
    )

    # 3) Run your core logic
    try:
        response_text = answer_question(question, caller)
    except Exception as e:
        print(f"[Agent 1] Error processing question: {e}")
        return jsonify({"error": str(e)}), 500

    # 4) Build and log the response
    response = {
        "status": "completed",
        "output": {
            "artifacts": [
                {"type": "text", "text": response_text}
            ]
        }
    }
    print(f"[Agent 1] Responding to {caller}: {response_text}")

    # 5) Return JSON
    return jsonify(response), 200

def run_handler(host="0.0.0.0", port=8001):
    print(f"🧠 Agent 1 A2A Server listening on {host}:{port}")
    app.run(host=host, port=port)

if __name__ == "__main__":
    run_handler()
