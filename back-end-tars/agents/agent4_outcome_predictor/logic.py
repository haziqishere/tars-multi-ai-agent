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
        branches = json.loads(clean)
        if not isinstance(branches, list):
            raise ValueError("Response must be a JSON array")
        print(f"[Agent 4] 🎯 Generated outcome branches:\n{json.dumps(branches, indent=2)}")
        return branches
    except (json.JSONDecodeError, ValueError) as e:
        print(f"❌ JSON parse error: {e}\nRaw response:\n{raw}")
        return []

# ── 4) Select a branch ─────────────────────────────
def select_branch(branches: list[dict]) -> dict:
    print("\n[Agent 4] 📊 STRATEGIC BRANCHES ANALYSIS")
    print("="*80)
    
    for branch in branches:
        print(f"\n🔍 BRANCH {branch['branch']}: {branch['summary']}")
        print("-"*80)
        print(f"\nDetailed Strategy:")
        print(branch['details'])
        
        print("\n📈 Implementation Metrics:")
        print(f"• Cost: ${branch['costUSD']:,}")
        print(f"• Timeline: {branch['timeMonths']} months")
        print(f"• Tariff Savings: {branch['tariffSavingPercent']}%")
        print(f"• Risk Levels - Supply: {branch['supplyRisk']}, Compliance: {branch['complianceRisk']}")
        print(f"• Overall Score: {branch['overallScore']}/10")
        
        print("\n📋 Action Items:")
        for i, item in enumerate(branch['actionItems'], 1):
            print(f"{i}. {item}")
            
        print("\n✅ Key Benefits:")
        for benefit in branch['benefits']:
            print(f"• {benefit}")
            
        print("\n⚠️ Key Challenges:")
        for challenge in branch['challenges']:
            print(f"• {challenge}")
        print("\n" + "="*80)
    
    while True:
        choice = input("\n[Agent 4] Select branch (A/B/C): ").upper()
        if choice in ['A', 'B', 'C']:
            selected = next(b for b in branches if b['branch'] == choice)
            print(f"\n[Agent 4] ✅ Selected Branch {choice}")
            print("[Agent 4] 📤 Forwarding to Agent 5 for task allocation...")
            send_to_agent5(selected)
            return selected
        print("Invalid choice. Please enter A, B, or C.")

# ── Public entry-point ─────────────────────────────
def predict_all(analyses: list[str]) -> dict:  # Changed return type to dict
    results = []
    for analysis in analyses:
        print("[Agent 4] 🔄 Generating outcome branches…")
        subqs = generate_sub_questions(analysis)
        facts = fetch_internal_facts(subqs)
        branches = predict_outcomes(analysis, facts)
        if branches:
            selected_branch = select_branch(branches)
            return selected_branch  # Return only the selected branch
    return {}  # Return empty dict if no branches generated
