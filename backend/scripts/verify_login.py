import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env.local
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(project_root, '.env.local')
load_dotenv(env_path)

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    sys.exit(1)

try:
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    sys.exit(1)

# Read credentials
cred_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.admin_credentials')
email = None
password = None

try:
    with open(cred_path, 'r') as f:
        for line in f:
            if line.startswith("Email:"):
                email = line.split(":", 1)[1].strip()
            elif line.startswith("Password:"):
                password = line.split(":", 1)[1].strip()
except FileNotFoundError:
    print("Error: .admin_credentials file not found.")
    sys.exit(1)

if not email or not password:
    print("Error: Could not parse Email or Password from .admin_credentials")
    sys.exit(1)

print(f"🔐 Verifying login for: {email}")

try:
    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    print("✅ Login Successful!")
    print(f"   User ID: {response.user.id}")
    print(f"   Email: {response.user.email}")
except Exception as e:
    print(f"❌ Login Failed: {e}")
    sys.exit(1)
