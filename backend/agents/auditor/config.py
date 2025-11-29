import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic import ValidationError
from pydantic_settings import BaseSettings

# Load environment variables
backend_env = Path(__file__).parent.parent.parent / '.env'
root_env = Path(__file__).parent.parent.parent.parent / '.env.local'

if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)

class Settings(BaseSettings):
    NEXT_PUBLIC_SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    class Config:
        case_sensitive = True
        extra = "ignore"

try:
    settings = Settings()
except ValidationError as e:
    print("❌ Configuration Error:")
    print(e)
    exit(1)
