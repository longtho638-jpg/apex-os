import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import ValidationError
from pydantic_settings import BaseSettings

# Load environment variables
# Try to load from backend/.env first, then fallback to root .env.local
backend_env = Path(__file__).parent.parent.parent / '.env'
root_env = Path(__file__).parent.parent.parent.parent / '.env.local'

if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)
else:
    print("⚠️  Warning: No .env file found.")

class Settings(BaseSettings):
    NEXT_PUBLIC_SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Agent Settings
    GUARDIAN_CHECK_INTERVAL: int = 60  # seconds
    REDIS_URL: str = "redis://localhost:6379"
    
    # Trading Thresholds
    WHALE_THRESHOLD_USDT: float = 100000.0  # Alert if order value > $100k
    HFT_LIMIT: int = 10  # Alert if > 10 trades per minute
    
    class Config:
        case_sensitive = True
        extra = "ignore" # Ignore other env vars

try:
    settings = Settings()
except ValidationError as e:
    print("❌ Configuration Error:")
    print(e)
    exit(1)
