import os

try:
    from .story_service import app
except ImportError:  # Fallback when running as script
    from story_service import app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))

