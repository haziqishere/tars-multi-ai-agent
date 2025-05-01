import os, json, logging
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from agents.agent3_consultant.client import request_internal_docs
from shared.utils import extract_latest_assistant_message
from agents.agent4_outcome_predictor.client import send_to_agent5
import re


# ── Silence noisy logs ──────────────────────────────
for pkg in ("azure", "urllib3"):
    logging.getLogger(pkg).setLevel(logging.ERROR)

# ── Foundry client init ─────────────────────────────
load_dotenv()
_CONN = os.getenv("AZURE_CONN_STRING")
_A4   = os.getenv("AGENT4_ID")
if not _CONN or not _A4:
    raise RuntimeError("AZURE_CONN_STRING or AGENT4_ID missing")

proj   = AIProjectClient.from_connection_string(_CONN, credential=DefaultAzureCredential())
agent4 = proj.agents.get_agent(_A4)
print(f"🔌 Connected to Agent 4 ➜ {agent4.name}")

# ── 1) Generate sub-questions ───────────────────────
def generate_sub_questions(analysis: str) -> list[str]:
    """Generate focused questions from strategic analysis"""
    if not analysis or not analysis.strip():
        print("[Agent 4] ⚠️ Warning: Empty analysis received")
        return []
        
    prompt = (
        "You are a Strategy Analyst. Based on the final strategic analysis below,\n"
        "formulate 3 specific questions to gather internal facts from company documents.\n"
        "Focus on procurement dependencies, contract terms, and supplier diversification metrics.\n\n"
        f"{analysis}\n\n"
        "Format: Return exactly 3 numbered questions, one per line."
    )
    
    try:
        thread = proj.agents.create_thread()
        proj.agents.create_message(thread.id, role="user", content=prompt)
        run = proj.agents.create_and_process_run(thread.id, agent_id=agent4.id)
        
        msgs = list(proj.agents.list_messages(thread.id).data)
        raw = extract_latest_assistant_message(msgs)
        
        # Clean and validate questions
        questions = []
        for line in raw.splitlines():
            line = line.strip()
            if line and any(line.startswith(f"{i}.") for i in range(1, 4)):
                questions.append(line)
                
        if len(questions) != 3:
            print(f"[Agent 4] ⚠️ Warning: Expected 3 questions, got {len(questions)}")
            return []
            
        print("[Agent 4] ✅ Generated questions:")
        for q in questions:
            print(f"  • {q}")
            
        return questions
        
    except Exception as e:
        print(f"[Agent 4] ❌ Failed to generate questions: {e}")
        return []

# ── 2) Fetch those facts from Agent 1 ───────────────
def fetch_internal_facts(subqs: list[str]) -> str:
    """Fetch facts from Agent1 based on generated questions"""
    if not subqs:
        print("[Agent 4] ⚠️ No valid questions to send to Agent1")
        return "Error: No valid questions generated"
        
    # Clean up formatting
    cleaned = []
    for i, q in enumerate(subqs, 1):
        # Remove any existing numbering
        q = re.sub(r'^\d+\.?\s*', '', q.strip())
        cleaned.append(f"{i}. {q}")
        
    joined = "\n".join(cleaned)
    print(f"[Agent 4] 📝 Fetching internal facts for:\n{joined}")
    
    try:
        facts = request_internal_docs(joined, caller="Agent4")
        if facts and not facts.startswith("Error"):
            print(f"[Agent 4] ✅ Received facts from Agent1")
            print(facts) 
            return facts
        else:
            print(f"[Agent 4] ⚠️ Agent1 returned error: {facts}")
            return f"Error fetching facts: {facts}"
    except Exception as e:
        print(f"[Agent 4] ❌ Failed to fetch facts: {e}")
        return f"Error: {str(e)}"

# ── 3) Predict outcomes with embedded context ──────
def predict_outcomes(analysis: str, facts: str) -> list[dict]:
    prompt = (
        "You are an expert Strategy Outcome Predictor. Based on:\n\n"
        f"1) ANALYSIS:\n{analysis}\n\n"
        f"2) INTERNAL FACTS:\n{facts}\n\n"
        "Create three detailed strategic branches (A=Conservative, B=Balanced, C=Aggressive) as a JSON array.\n"
        "Each branch must include:\n"
        "- branch: one of [\"A\",\"B\",\"C\"]\n"
        "- summary: Clear one-sentence strategy overview\n"
        "- details: 2-3 paragraphs explaining approach, benefits, and challenges\n"
        "- costUSD: Total implementation cost\n"
        "- timeMonths: Implementation timeline\n"
        "- tariffSavingPercent: Expected tariff reduction\n"
        "- supplyRisk: Risk level [\"Low\",\"Med\",\"High\"]\n"
        "- complianceRisk: Risk level [\"Low\",\"Med\",\"High\"]\n"
        "- overallScore: Score 0-10\n"
        "- actionItems: 3-4 specific action steps\n"
        "- benefits: List of 2-3 key benefits\n"
        "- challenges: List of 2-3 main challenges\n\n"
        "IMPORTANT: Response must be valid JSON array."
    )

    thread = proj.agents.create_thread()
    proj.agents.create_message(thread.id, role="user", content=prompt)
    proj.agents.create_and_process_run(thread.id, agent_id=agent4.id)
    msgs = list(proj.agents.list_messages(thread.id).data)
    raw  = extract_latest_assistant_message(msgs)

    # ── Clean & validate JSON ───────────────────────
    try:
        clean = raw.strip('`').lstrip("json").strip()
        # Handle potential markdown code block fences
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.endswith("```"):
            clean = clean[:-3]
        clean = clean.strip()
        
        branches = json.loads(clean)
        if not isinstance(branches, list):
            raise ValueError("Response must be a JSON array")
        # Validate basic structure of each branch
        for branch in branches:
            if not all(k in branch for k in ["branch", "summary", "actionItems"]):
                 raise ValueError(f"Branch missing required keys: {branch.get('branch', 'Unknown')}")
        print(f"[Agent 4] 🎯 Generated outcome branches:\n{json.dumps(branches, indent=2)}")
        return branches
    except (json.JSONDecodeError, ValueError) as e:
        print(f"❌ JSON parse error: {e}\nRaw response:\n{raw}")
        return []

# ── Public entry-point ─────────────────────────────
def predict_all(analysis: str) -> dict:
    """
    Generates branches, auto-selects one, calls Agent 5, and returns results.
    """
    print("[Agent 4] 🔄 Generating outcome branches…")
    subqs = generate_sub_questions(analysis)
    if not subqs:
        print("[Agent 4] ⚠️ No sub-questions generated, cannot proceed.")
        return {"branches": [], "summary_card": None, "error": "Failed to generate sub-questions"}
        
    facts = fetch_internal_facts(subqs)
    if facts.startswith("Error"):
         print(f"[Agent 4] ⚠️ Error fetching facts: {facts}")
         # Proceed without facts, or return error? Let's proceed for now.
         facts = f"Could not retrieve internal facts: {facts}" # Pass error info

    branches = predict_outcomes(analysis, facts)
    
    selected_branch = None
    summary_card_info = None
    agent5_error = None

    if branches:
        # Auto-select branch 'B' (Balanced) if available, otherwise the first one
        selected_branch = next((b for b in branches if b.get('branch') == 'B'), branches[0])
        
        print(f"\n[Agent 4] ✅ Auto-Selected Branch {selected_branch.get('branch', 'N/A')}")
        print("[Agent 4] 📤 Forwarding to Agent 5 for task allocation...")
        try:
            # Ensure selected_branch has the required keys for send_to_agent5
            if all(k in selected_branch for k in ["branch", "summary", "actionItems"]):
                 agent5_response = send_to_agent5(selected_branch)
                 # Agent 5 handler returns {"drafts": ..., "results": ..., "api_response": ...}
                 summary_card_info = agent5_response.get("api_response", {}).get("summaryCard")
                 if not summary_card_info:
                     print("[Agent 4] ⚠️ Agent 5 did not return a summary card in api_response.")
                     agent5_error = agent5_response.get("error", "Agent 5 returned no summary card.")
                 else:
                      print("[Agent 4] ✅ Received summary card info from Agent 5.")
            else:
                agent5_error = "Selected branch missing required keys for Agent 5."
                print(f"[Agent 4] ❌ Error: {agent5_error}")

        except Exception as e:
            agent5_error = f"Failed to send to Agent 5: {str(e)}"
            print(f"[Agent 4] ❌ Error: {agent5_error}")
            
    else:
        print("[Agent 4] ⚠️ No outcome branches were generated.")

    return {
        "branches": branches,
        "selected_branch_auto": selected_branch, # Include the auto-selected branch for context
        "summary_card": summary_card_info,
        "error": agent5_error # Include any error from Agent 5 call
    }
