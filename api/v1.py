import sys
import os

# Add the project root to sys.path so we can import backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.main import app

@app.get("/api/debug")
async def debug_route():
    return {"message": "Python Backend is Running!", "path": sys.path}
