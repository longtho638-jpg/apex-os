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

from api.routes import router as api_router
from api.verification_routes import router as verification_router

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(verification_router, prefix="/api/v1")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
