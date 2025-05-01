from flask import Flask, request, jsonify
import logging
from .logic import predict_all

logging.getLogger("azure").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)

app = Flask(__name__)

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def handle_request():
    payload = request.get_json(force=True)
    print(f"[Agent 4] Received from Agent 3: {payload!r}")

    analyses = payload.get("actions")
    if not isinstance(analyses, list) or not all(isinstance(a, str) for a in analyses):
        err = "Invalid payload: expected {'actions':[<analysis string>,…]}"
        print(f"[Agent 4] ❌ {err}")
        return jsonify({"error": err}), 400

    try:
        branches = predict_all(analyses)
        print(f"[Agent 4] ✅ Returning {len(branches)} branches")
        return jsonify(branches), 200
    except Exception as e:
        print(f"[Agent 4] ❌ Exception in predict_all: {e}")
        return jsonify({"error": str(e)}), 500

def run_handler(host="0.0.0.0", port=8004):
    print(f"🧠 Agent 4 (Outcome Predictor) A2A Server is starting...")
    # Enable debug mode
    app.run(host=host, port=port, debug=True)

if __name__ == "__main__":
    run_handler()
