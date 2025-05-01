def extract_message(messages: list) -> str:
    """Extract the assistant message from the thread"""
    for msg in reversed(messages):
        if msg.get("role") == "assistant":
            content = msg.get("content", [])
            if content and isinstance(content, list):
                return content[0].get("text", {}).get("value", "").strip()
    return "" 