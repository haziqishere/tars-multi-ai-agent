import json
import time
import requests
from azure.identity import DefaultAzureCredential

class GraphClient:
    def __init__(self, mcp_config: dict):
        self.endpoint = mcp_config["sendMailEndpoint"]
        self.credential = DefaultAzureCredential()

    def send_email(self, to_email: str, subject: str, body: str):
        token = self.credential.get_token("https://graph.microsoft.com/.default").token
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        message = {
            "message": {
                "subject": subject,
                "body": {"contentType": "HTML", "content": body},
                "toRecipients": [{"emailAddress": {"address": to_email}}]
            }
        }
        last_error = None
        for attempt in range(3):
            try:
                resp = requests.post(self.endpoint, json=message, headers=headers)
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                last_error = e
                time.sleep(2 ** attempt)
        raise last_error
