import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env.local from project root
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(project_root, '.env.local')
load_dotenv(env_path)

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# Try both common names for service key
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print(f"Error: Missing Supabase credentials in {env_path}")
    print("Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) are set.")
    sys.exit(1)

try:
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    sys.exit(1)

EMAIL = "billwill.mentor@gmail.com"
PASSWORD = "ApexAdmin2025!"

print(f"🔍 Checking admin user: {EMAIL}")

try:
    # 1. Try to create the user
    attributes = {
        "email": EMAIL,
        "password": PASSWORD,
        "email_confirm": True
    }
    user = supabase.auth.admin.create_user(attributes)
    print(f"✅ Admin user created successfully!")
    print(f"   ID: {user.user.id}")
    print(f"   Email: {EMAIL}")
    print(f"   Password: {PASSWORD}")

except Exception as e:
    error_str = str(e).lower()
    print(f"DEBUG: Error string: {error_str}")
    
    # Check for various "user exists" error messages
    if "already registered" in error_str or "unique constraint" in error_str or "already been registered" in error_str:
        print("⚠️  User already exists. Updating password...")
        
        try:
            # 2. Find user ID to update
            users_response = supabase.auth.admin.list_users()
            
            users_list = []
            if hasattr(users_response, 'users'):
                users_list = users_response.users
            elif isinstance(users_response, list):
                users_list = users_response
            
            target_user = None
            for u in users_list:
                if u.email == EMAIL:
                    target_user = u
                    break
            
            if target_user:
                # 3. Update password
                supabase.auth.admin.update_user_by_id(
                    target_user.id,
                    {"password": PASSWORD}
                )
                print(f"✅ Admin password updated successfully!")
                print(f"   ID: {target_user.id}")
                print(f"   Email: {EMAIL}")
                print(f"   Password: {PASSWORD}")
            else:
                print("❌ User exists but could not be found in list (check pagination?).")
                
        except Exception as update_error:
            print(f"❌ Error updating user via list: {update_error}")
            print("⚠️  Attempting fallback using UUID from .admin_credentials...")
            
            # Fallback: Read UUID from .admin_credentials
            try:
                cred_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.admin_credentials')
                fallback_id = None
                with open(cred_path, 'r') as f:
                    for line in f:
                        if line.startswith("UUID:"):
                            fallback_id = line.split(":", 1)[1].strip()
                            break
                
                if fallback_id:
                    supabase.auth.admin.update_user_by_id(
                        fallback_id,
                        {"password": PASSWORD}
                    )
                    print(f"✅ Admin password updated successfully (via fallback ID)!")
                    print(f"   ID: {fallback_id}")
                    print(f"   Email: {EMAIL}")
                    print(f"   Password: {PASSWORD}")
                else:
                    print("❌ No UUID found in .admin_credentials for fallback.")
            except Exception as fallback_error:
                print(f"❌ Fallback update failed: {fallback_error}")
    else:
        print(f"❌ Error creating user: {e}")
