from flask import Flask, request, jsonify
from agents.agent3_consultant.logic import ask_agent
import logging
import traceback

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("agent3_handler")

app = Flask(__name__)

@app.route("/a2a/v1/tasks/send", methods=["POST"])
def handle_task():
    try:
        task = request.json
        logger.info(f"[Agent 3 HANDLER] Received task payload: {task}")
        
        # Check for different payload formats (direct agent_manager call vs standard A2A)
        if "query" in task:
            logger.info("[Agent 3 HANDLER] Detected direct query format")
            text_input = task.get("query", "").strip()
            if not text_input:
                logger.warning("[Agent 3 HANDLER] Empty query received")
                return jsonify({"error": "Query cannot be empty"}), 400
        else:
            # Standard A2A format
            task_type = task.get("task_type")
            if task_type != "global.news.summarize":
                logger.warning(f"[Agent 3 HANDLER] Unsupported task_type: {task_type}")
                return jsonify({"error": f"Unsupported task_type: {task_type}"}), 400

            logger.info("[Agent 3 HANDLER] Processing standard A2A task")
            parts = task.get("input", {}).get("parts", [])
            text_input = ""
            for part in parts:
                if part.get("type") == "text":
                    text_input += part.get("text", "") + "\n"
            text_input = text_input.strip()
        
        if not text_input:
            logger.warning("[Agent 3 HANDLER] Empty text input after processing")
            return jsonify({"error": "No text input found in the request"}), 400

        logger.info(f"[Agent 3 HANDLER] 📥 Extracted input: \"{text_input}\"")

        # Call the core logic function with exception handling
        try:
            logger.info("[Agent 3 HANDLER] Calling ask_agent logic function...")
            summary = ask_agent(text_input)
            logger.info(f"[Agent 3 HANDLER] ask_agent returned summary of length: {len(summary)}")
            
            # Check if the logic returned an error message
            if summary.startswith("[Error") or summary == "[No clear answer generated even after context enrichment.]":
                logger.warning(f"[Agent 3 HANDLER] Logic function returned error: {summary}")
                return jsonify({
                    "status": "failed",
                    "error": summary,
                    "output": {
                        "artifacts": [{"type": "text", "text": summary}]
                    }
                }), 500
            
        except Exception as e:
            logger.error(f"[Agent 3 HANDLER] Exception in ask_agent: {e}")
            traceback.print_exc()
            return jsonify({
                "status": "failed",
                "error": f"Error in Agent 3 logic: {str(e)}",
                "output": {
                    "artifacts": [{"type": "text", "text": f"[Error in Agent 3 processing: {str(e)}]"}]
                }
            }), 500

        logger.info("[Agent 3 HANDLER] 🧪 Summary generated successfully")

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
    
    except Exception as e:
        logger.error(f"[Agent 3 HANDLER] Unhandled exception: {e}")
        traceback.print_exc()
        return jsonify({
            "status": "failed",
            "error": f"Unhandled exception in Agent 3 handler: {str(e)}",
            "output": {
                "artifacts": [{"type": "text", "text": f"[Error in Agent 3 handler: {str(e)}]"}]
            }
        }), 500

@app.route("/.well-known/agent.json", methods=["GET"])
def serve_agent_card():
    try:
        with open("agents/agent3_consultant/agent.json", "r") as f:
            card = f.read()
        return card, 200, {"Content-Type": "application/json"}
    except Exception as e:
        logger.error(f"[Agent 3 HANDLER] Error serving agent card: {e}")
        return jsonify({"error": str(e)}), 500

def run_handler(host="0.0.0.0", port=8003):
    print(f"🧠 Agent 3 (Consultant) A2A Server is starting...")
    # Enable debug mode
    app.run(host=host, port=port, debug=True)
