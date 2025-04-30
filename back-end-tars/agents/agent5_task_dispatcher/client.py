import json
import time
import requests
import logging
from azure.identity import DefaultAzureCredential, AzureCliCredential

logger = logging.getLogger("agent_manager")

class GraphClient:
    def __init__(self, mcp_config: dict):
        self.endpoint = mcp_config["sendMailEndpoint"]
        
        # Try to use AzureCliCredential first, then fall back to DefaultAzureCredential
        try:
            logger.info("🔌 [Agent5] Initializing Azure CLI credential...")
            self.credential = AzureCliCredential()
            # Test the credential by getting a token
            token = self.credential.get_token("https://graph.microsoft.com/.default").token
            logger.info("✅ Successfully authenticated with Azure CLI")
        except Exception as e:
            logger.warning(f"⚠️ Failed to authenticate with Azure CLI: {str(e)}")
            logger.info("🔄 Trying DefaultAzureCredential as fallback...")
            try:
                self.credential = DefaultAzureCredential(logging_enable=True)
                token = self.credential.get_token("https://graph.microsoft.com/.default").token
                logger.info("✅ Successfully authenticated with DefaultAzureCredential")
            except Exception as e:
                logger.error(f"❌ Authentication failed: {str(e)}")
                raise

    def send_email(self, to_email: str, subject: str, body: str):
        try:
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
        except Exception as e:
            logger.error(f"❌ Error sending email: {str(e)}")
            raise
