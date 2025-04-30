import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the FastAPI application
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",  # Bind to all interfaces
        port=port,
        reload=True      # Enable auto-reload for development
    )