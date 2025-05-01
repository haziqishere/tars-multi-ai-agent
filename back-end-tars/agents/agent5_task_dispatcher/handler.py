from flask import Flask, request, jsonify
from agents.agent5_task_dispatcher.logic import parse_input, plan_tasks, send_tasks, create_api_response

app = Flask(__name__)

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def handle_request():
    raw = request.get_data(as_text=True)
    try:
        # Parse input data
        inp = parse_input(raw)
        
        # Extract query if available, or use default
        query = inp.get("query", "Optimize business process")
        
        # Generate email drafts
        drafts = plan_tasks(inp["branch"], inp["action"], inp["actionItems"])
        
        # Create API-compatible response with summary card
        api_response = create_api_response(query, inp["branch"], inp["action"], drafts)
        
        # Send tasks for terminal display
        results = send_tasks(drafts)
        
        # Return both the drafts for compatibility and the new API format
        return jsonify({
            "drafts": drafts, 
            "results": results,
            "api_response": api_response
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

def run_handler(host="0.0.0.0", port=8005):
    print(f"🧠 Agent 5 A2A listening on {host}:{port}")
    # Enable debug mode
    app.run(host=host, port=port, debug=True)
