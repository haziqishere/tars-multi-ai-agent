import uvicorn
from app.utils.config import settings

if __name__ == "__main__":
    print(f"Starting TARS Multi-Agent System on port {settings.PORT}")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        timeout_keep_alive=300,  # Extended keep-alive timeout to 5 minutes
        timeout_graceful_shutdown=300  # Extended graceful shutdown timeout to 5 minutes
    )