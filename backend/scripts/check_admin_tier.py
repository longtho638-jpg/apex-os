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

print(f"🔐 Verifying tier for: {email}")

try:
    # Login
    auth_response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    user_id = auth_response.user.id
    print(f"✅ Login Successful! User ID: {user_id}")
    
    # Check users table
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    
    if response.data:
        user_data = response.data[0]
        tier = user_data.get('subscription_tier')
        print(f"📊 Current Tier in DB: {tier}")
        
        if tier != 'admin':
            print("⚠️  WARNING: User is NOT admin!")
            
            # Attempt to fix
            print("🛠  Attempting to fix tier to 'admin'...")
            update_response = supabase.table("users").update({"subscription_tier": "admin"}).eq("id", user_id).execute()
            
            if update_response.data:
                print("✅ Tier updated to 'admin' successfully!")
                print(f"   New Tier: {update_response.data[0].get('subscription_tier')}")
            else:
                print("❌ Failed to update tier.")
        else:
            print("✅ User is correctly set as 'admin'.")
            
    else:
        print("❌ User record not found in 'users' table.")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
