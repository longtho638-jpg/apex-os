from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sentry_sdk
from sentry_sdk.integrations.starlette import StarletteIntegration
from sentry_sdk.integrations.fastapi import FastApiIntegration
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import sys
import os

# Add current directory to sys.path to allow imports from 'api', 'core', etc.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.routes import router as api_router
from api.admin_endpoints import router as admin_router
from api.referrals import router as referrals_router
from api.agents import router as agents_router
from api.money_engine import router as money_engine_router
from api.verification_routes import router as verification_router

# WebSocket support
import socketio
import asyncio
from core.websocket import sio, broadcast_market_data

# ... (lines 23-62 omitted for brevity in tool call, but I need to be precise with replace_file_content)
# Actually, I can't skip lines in ReplacementContent if I use a range.
# I'll do two edits or one large edit if they are close.
# They are far apart (line 21 vs 63).
# I will use multi_replace_file_content.


# Load environment variables
load_dotenv()

# Initialize Sentry with explicit integrations and disable defaults to avoid conflicts
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=0.1,
    environment=os.getenv("ENVIRONMENT", "development"),
    default_integrations=False,
    integrations=[
        StarletteIntegration(),
        FastApiIntegration(),
    ],
)

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Apex Financial OS API",
    description="Backend API for Apex Financial OS Agents",
    version="1.0.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(referrals_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(money_engine_router, prefix="/api/v1")  # ✅ Money Engine
app.include_router(verification_router, prefix="/api/v1")  # ✅ Apex Smart-Switch Verification

@app.on_event("startup")
async def startup_event():
    # Start the WebSocket broadcast task
    asyncio.create_task(broadcast_market_data())


@app.get("/")
async def root():
    return {
        "status": "online",
        "system": "Apex Financial OS",
        "version": "1.0.0",
        "agents": {
            "collector": "standby",
            "auditor": "standby",
            "guardian": "standby"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Mount Socket.IO - Must be done before running
app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
