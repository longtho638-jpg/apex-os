import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Robustly load .env from backend directory
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print(f"❌ Error: Missing credentials in {env_path}")
    sys.exit(1)

# Skip connection check due to library version issue
# We will proceed to instruct the user to run the SQL manually

print(f"Credentials loaded for: {url}")


print("\n" + "="*50)
print("⚠️  ACTION REQUIRED: EXECUTE MIGRATION")
print("="*50)
print("Since we are using Supabase API (HTTP), we cannot execute raw SQL directly.")
print("Please go to your Supabase Dashboard -> SQL Editor -> New Query")
print("And paste the content of: backend/database/master_migration.sql")
print("="*50)
