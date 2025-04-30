import os
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential


def extract_latest_assistant_message(messages: list) -> str:
    """Return the latest assistant text."""
    for m in sorted(messages, key=lambda x: x.get("created_at", 0), reverse=True):
        if m.get("role") == "assistant":
            block = m.get("content", [])
            if block and isinstance(block, list):
                return block[0].get("text", {}).get("value", "").strip()
    return ""


def formulate_from_template(
    project_client: AIProjectClient,
    agent_id: str,
    prompt_path: str,
    **fmt_args
) -> str:
    """
    Read template, format it with fmt_args, send as USER message,
    and return assistant's reply text.
    """
    with open(prompt_path, "r", encoding="utf-8") as f:
        template = f.read()
    prompt = template.format(**fmt_args)

    thread = project_client.agents.create_thread()
    project_client.agents.create_message(
        thread_id=thread.id, role="user", content=prompt
    )
    project_client.agents.create_and_process_run(
        thread_id=thread.id, agent_id=agent_id
    )

    msgs = list(project_client.agents.list_messages(thread_id=thread.id).data)
    return extract_latest_assistant_message(msgs)