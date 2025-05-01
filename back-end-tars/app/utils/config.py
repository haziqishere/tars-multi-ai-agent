from pydantic_settings import BaseSettings
import os
from typing import Optional, List, Dict, Any, ClassVar

class Settings(BaseSettings):
    """Application settings loaded from environment variables with defaults"""
    
    # API settings
    APP_NAME: str = "TARS Multi-Agent System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server settings
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Azure settings
    AZURE_CONN_STRING: str = os.getenv("AZURE_CONN_STRING", "")
    AGENT1_ID: str = os.getenv("AGENT1_ID", "")
    AGENT2_ID: str = os.getenv("AGENT2_ID", "")
    AGENT3_ID: str = os.getenv("AGENT3_ID", "")
    AGENT4_ID: str = os.getenv("AGENT4_ID", "")
    AGENT5_ID: str = os.getenv("AGENT5_ID", "")
    
    # Search API keys
    SEARCH1API_KEY: Optional[str] = os.getenv("SEARCH1API_KEY", "")
    
    # Timeout settings
    AGENT1_TIMEOUT: int = 30
    AGENT2_TIMEOUT: int = 30
    AGENT3_TIMEOUT: int = 45
    AGENT4_TIMEOUT: int = 45
    AGENT5_TIMEOUT: int = 120
    
    # Specific component timeouts
    AGENT2_SUMMARY_TIMEOUT: int = 30
    AGENT3_INITIAL_TIMEOUT: int = 45
    AGENT3_EVAL_TIMEOUT: int = 30
    AGENT3_FORMULATE_TIMEOUT: int = 30
    AGENT3_ENHANCE_TIMEOUT: int = 60
    AGENT4_QUESTIONS_TIMEOUT: int = 30
    AGENT4_BRANCHES_TIMEOUT: int = 60
    AGENT4_PREDICTION_TIMEOUT: int = 45
    AGENT5_PARSE_TIMEOUT: int = 45
    AGENT5_ASSIGN_TIMEOUT: int = 45
    AGENT5_EMAIL_TIMEOUT: int = 45
    
    # Maximum retries for API calls
    MAX_RETRIES: int = 3
    
    # Model configurations for each agent
    AGENT1_MODEL: str = "gpt-4-turbo"
    AGENT2_MODEL: str = "gpt-4-turbo"
    AGENT3_MODEL: str = "gpt-4-turbo"
    AGENT4_MODEL: str = "gpt-4-turbo"
    AGENT5_MODEL: str = "gpt-4-turbo"
    
    # Flags for enabling/disabling specific agents
    ENABLE_AGENT1: bool = True
    ENABLE_AGENT2: bool = True
    ENABLE_AGENT3: bool = True
    ENABLE_AGENT4: bool = True
    ENABLE_AGENT5: bool = True
    
    # Cross-Origin Resource Sharing settings
    CORS_ORIGINS: list = ["*"]
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra fields in the environment

settings = Settings() 