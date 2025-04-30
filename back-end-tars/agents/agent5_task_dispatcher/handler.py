from flask import Flask, request, jsonify
from agents.agent5_task_dispatcher.logic import parse_input, plan_tasks, send_tasks

app = Flask(__name__)

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def handle_request():
    raw = request.get_data(as_text=True)
    try:
        inp    = parse_input(raw)
        drafts = plan_tasks(inp["branch"], inp["action"], inp["actionItems"])
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    results = send_tasks(drafts)
    return jsonify({"drafts": drafts, "results": results})

def run_handler(host="0.0.0.0", port=8080):
    print(f"🧠 Agent 5 A2A listening on {host}:{port}")
    app.run(host=host, port=port)
