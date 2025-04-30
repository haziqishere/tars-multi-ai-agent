from flask import Flask, request, jsonify
import logging
from agents.agent2_global_intel.logic import handle_global_query

# Silence noisy logs from HTTP libraries if desired
logging.getLogger("urllib3").setLevel(logging.WARNING)

app = Flask(__name__)

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def receive_task():
    try:
        # 1) Parse and log the incoming task
        payload = request.get_json(force=True)
        print(f"[Agent 2] Received payload: {payload}")

        # 2) Extract the query text
        query = (
            payload
            .get("input", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        print(f"[Agent 2] Extracted query: {query}")

        # 3) Delegate to your core logic
        response_text = handle_global_query(query)
        print(f"[Agent 2] Response text:\n{response_text}\n")

        # 4) Build and return the standard A2A response
        response = {
            "status": "completed",
            "output": {
                "artifacts": [
                    {"type": "text", "text": response_text}
                ]
            }
        }
        return jsonify(response), 200

    except Exception as e:
        # 5) Log and surface any errors
        print(f"[Agent 2] Error during handling: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/.well-known/agent.json", methods=["GET"])
def serve_agent_card():
    try:
        with open("agents/agent2_global_intel/agent.json", "r") as f:
            card = f.read()
        return card, 200, {"Content-Type": "application/json"}
    except Exception as e:
        print(f"[Agent 2] Error serving agent.json: {e}")
        return jsonify({"error": str(e)}), 500

def run_handler(host="0.0.0.0", port=8002):
    print(f"🧠 Agent 2 A2A Server listening on {host}:{port}")
    app.run(host=host, port=port)

if __name__ == "__main__":
    run_handler()
