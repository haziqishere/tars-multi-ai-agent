import os
import json
import re
import datetime
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from agents.agent5_task_dispatcher.client import GraphClient

load_dotenv()

# === Azure AI Foundry setup ===
print("🔌 [Agent5] Initializing Azure Foundry client…")
conn_str = os.getenv("AZURE_CONN_STRING")
agent_id = os.getenv("AGENT5_ID")
project_client = AIProjectClient.from_connection_string(
    credential=DefaultAzureCredential(),
    conn_str=conn_str
)
agent = project_client.agents.get_agent(agent_id)
print(f"✅ [Agent5] Connected to agent ID {agent.id}")

def _get_assistant_reply(thread_id):
    """
    Fetch the last assistant message, flatten chunks,
    strip any ``` fences, and return pure JSON/text.
    """
    msgs = list(project_client.agents.list_messages(thread_id=thread_id).data)
    ams  = [m for m in msgs if m.role == "assistant"]
    if not ams:
        raise RuntimeError("❌ [Agent5] No assistant reply found")

    raw = ams[-1].content
    # 1) flatten list chunks
    if isinstance(raw, list):
        text = "".join(c.get("text",{}).get("value","") for c in raw)
    else:
        text = raw

    # 2) strip any ```…``` block
    fence_re = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.S)
    m = fence_re.search(text)
    if m:
        return m.group(1).strip()

    # 3) otherwise return the raw text
    return text.strip()

def parse_input(raw_input: str) -> dict:
    print(f"🔍 [Agent5] parse_input received raw input:\n{raw_input}\n")
    # try JSON first
    try:
        obj = json.loads(raw_input)
        if all(k in obj for k in ("branch","action","actionItems")):
            print("✔️ [Agent5] Input was valid JSON, skipping LLM parse.")
            return obj
    except Exception:
        pass

    # else ask the agent
    prompt_t = open(
        "prompts/agent5_parse_input.txt",
        encoding="utf-8"
    ).read()
    prompt = prompt_t.replace("{raw_input}", raw_input)
    print("🔍 [Agent5] Asking agent to normalize input…")
    tid = project_client.agents.create_thread().id
    project_client.agents.create_message(thread_id=tid, role="user", content=prompt)
    project_client.agents.create_and_process_run(thread_id=tid, agent_id=agent.id)

    reply = _get_assistant_reply(tid)
    print(f"🔍 [Agent5] parse_input LLM reply:\n{reply}\n")
    parsed = json.loads(reply)
    return parsed

def assign_tasks(branch: str, action: str, items: list[str]) -> list[dict]:
    deps = list(load_departments().keys())
    print(f"🔍 [Agent5] assign_tasks for branch={branch}, action={action}")
    bullets = "\n".join(f"- {i}" for i in items)
    prompt = (
        f"You are Task Dispatcher. Departments: {', '.join(deps)}.\n\n"
        f"Strategic action: **{action}** (Branch {branch}).\n\n"
        f"Tasks:\n{bullets}\n\n"
        "For each task pick the single best department and return JSON:\n"
        "[\n  {\"dept\":\"…\",\"task\":\"…\"}, …\n]"
    )
    print(f"🔍 [Agent5] Sending assign_tasks prompt…")
    tid = project_client.agents.create_thread().id
    project_client.agents.create_message(tid, role="user", content=prompt)
    project_client.agents.create_and_process_run(tid, agent_id=agent.id)

    reply = _get_assistant_reply(tid)
    print(f"🔍 [Agent5] assign_tasks LLM reply:\n{reply}\n")
    return json.loads(reply)


def generate_email(lead_name, lead_email, branch, branch_label, action, tasks):
    """
    tasks may be either a single string or a list of strings.
    We normalize to a bullet list in the prompt.
    """
    # Normalize tasks → bullet list
    if isinstance(tasks, list):
        task_lines = "\n".join(f"- {t}" for t in tasks)
        task_desc  = f"list these tasks:\n{task_lines}"
    else:
        task_desc  = f"list this task: '{tasks}'"

    prompt = (
        f"Write a professional, friendly email to {lead_name} <{lead_email}>\n"
        f"Subject: Action Required – Branch {branch}: {action}\n"
        f"Body: Greet {lead_name}, explain that CSuite approved the {branch_label} branch for '{action}', "
        f"{task_desc}, offer to clarify, and sign off 'Task Dispatcher'."
    )

    tid = project_client.agents.create_thread().id
    project_client.agents.create_message(tid, role="user", content=prompt)
    project_client.agents.create_and_process_run(tid, agent_id=agent.id)
    reply = _get_assistant_reply(tid)
    return reply

def load_departments():
    raw = json.load(open("shared/departments.json"))
    return {
        item["dept"]: {
            "leadName":  item["lead"],
            "leadEmail": item["email"],
            "label":     item.get("label", item["dept"])
        }
        for item in raw
    }


def plan_tasks(branch, action, items):
    """
    1) ask LLM to assign each raw item to a dept,
    2) group by dept,
    3) generate one email per dept with all its tasks.
    """
    deps       = load_departments()
    label      = deps.get(branch, {}).get("label", branch)
    assigns    = assign_tasks(branch, action, items)

    # Group tasks per department
    grouped = {}
    for a in assigns:
        dept = a["dept"]
        task = a["task"]
        grouped.setdefault(dept, []).append(task)

    drafts = []
    for dept, tasks in grouped.items():
        info = deps.get(dept)
        if not info:
            raise KeyError(f"Unknown dept: {dept}")

        subject = f"Action Required – Branch {branch}: {action}"
        body    = generate_email(
            info["leadName"],
            info["leadEmail"],
            branch, label,
            action,
            tasks  # pass list here
        )

        drafts.append({
            "department": dept,
            "leadName":   info["leadName"],
            "leadEmail":  info["leadEmail"],
            "subject":    subject,
            "body":       body
        })

    return drafts

def load_mcp_config():
    """
    Read MCP.json and return the Graph server config
    """
    mcp = json.load(open("MCP.json"))
    return mcp["mcpServers"]["graph"]

def send_tasks(drafts):
    """Display email drafts in terminal"""
    print("\n[Agent 5] 📧 EMAIL DRAFTS")
    print("="*80)
    
    for draft in drafts:
        print(f"\n📤 Email to: {draft['leadName']} ({draft['department']})")
        print(f"📧 Address: {draft['leadEmail']}")
        print("-"*80)
        print(f"\nSubject: {draft['subject']}")
        print("-"*80)
        print(draft['body'])
        print("="*80)
    
    print("\n[Agent 5] ✅ Task allocation complete")
    return [{"department": d["department"], 
             "leadEmail": d["leadEmail"], 
             "status": "drafted"} for d in drafts]

def generate_summary_card(branch, action, drafts):
    """
    Generate API-compatible summary card data for email templates.
    This function transforms the draft emails into the format required by the API.
    
    Args:
        branch: The branch name for the operation
        action: The action being taken
        drafts: List of email drafts with department, lead, and content info
        
    Returns:
        A dictionary matching the summaryCard format in the API
    """
    # Generate a unique step ID for each department
    current_date = datetime.datetime.now()
    
    # Create business operations flow
    flow_steps = []
    step_id = 1
    
    for draft in drafts:
        flow_steps.append({
            "id": f"step{step_id}",
            "description": f"{draft['department']} implementation for {action}",
            "department": draft['department']
        })
        step_id += 1
    
    # Create summary flow
    business_flow = {
        "summary": f"Optimized {len(flow_steps)}-step process for {branch}: {action}",
        "steps": flow_steps
    }
    
    # Create department tasks and email templates
    departments = []
    dept_id = 1
    
    for draft in drafts:
        # Generate tasks with priorities and deadlines
        tasks = []
        task_id = 1
        
        # Extract tasks from the email body
        task_matches = re.findall(r'\d+\.\s+(.*?)(?=\n\d+\.|\n\n|$)', draft['body'], re.DOTALL)
        
        for i, task_desc in enumerate(task_matches):
            # Create realistic deadlines (increasing by 15 days)
            deadline_date = current_date + datetime.timedelta(days=15 * (i + 1))
            deadline_str = deadline_date.strftime("%Y-%m-%d")
            
            # Assign priority based on position (first is high, then medium, then low)
            priority = "high" if i == 0 else ("medium" if i == 1 else "low")
            
            tasks.append({
                "id": f"task{dept_id}-{task_id}",
                "description": task_desc.strip(),
                "priority": priority,
                "deadline": deadline_str
            })
            task_id += 1
        
        # Create email template
        email_template = {
            "to": draft['leadEmail'],
            "recipient": draft['leadName'],
            "department": draft['department'],
            "subject": draft['subject'],
            "body": draft['body']
        }
        
        # Create department entry
        departments.append({
            "id": f"dept-{dept_id}",
            "department": draft['department'],
            "manager": draft['leadName'],
            "email": draft['leadEmail'],
            "tasks": tasks,
            "emailTemplate": email_template
        })
        dept_id += 1
    
    # Return the complete summary card
    return {
        "businessOperationsFlow": business_flow,
        "departments": departments
    }

def create_api_response(query, branch, action, drafts):
    """
    Create a complete API response with summaryCard based on the agent's output.
    
    Args:
        query: The original user query
        branch: The branch name for the operation
        action: The action being taken
        drafts: List of email drafts with department, lead, and content info
        
    Returns:
        A dictionary matching the complete API response format
    """
    # First, generate the summary card
    summary_card = generate_summary_card(branch, action, drafts)
    
    # For now, we'll use a placeholder for the rest of the response
    # In a real implementation, this would incorporate data from all agents
    return {
        "summaryCard": summary_card
    }
