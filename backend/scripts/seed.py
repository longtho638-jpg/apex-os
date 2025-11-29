import os
import sys
import asyncio
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Add parent directory to path to import core modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env vars
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    sys.exit(1)

supabase: Client = create_client(url, key)

async def seed_data():
    print("🌱 Starting Database Seed...")

    # 1. Create Mock Users (In a real scenario, we'd use Supabase Auth Admin API or just insert into public.users if triggers are set up. 
    # For this seed, we'll assume we can insert into public.users directly for testing, 
    # BUT normally public.users is linked to auth.users. 
    # To make this simple and work without auth.users for now (if RLS allows or if we bypass), 
    # we will generate random UUIDs. NOTE: This might fail if foreign key constraints to auth.users are strictly enforced and we don't have those users in Auth.
    # For MVP/Dev, we often disable the FK constraint or create the Auth user first.
    # Let's assume we just insert into public.users and hope the FK to auth.users isn't strict or we are in a dev mode where we can handle this.
    # ACTUALLY: The schema I wrote has `id uuid references auth.users`. This will fail if we don't have auth users.
    # WORKAROUND: For this seed script to work easily, we will just print instructions to create users or we'd need the Service Role Key to create Auth users.
    # Let's try to use a hardcoded UUID that matches a 'dev' user if possible, or just generate one and warn.)
    
    # For the purpose of this demo, let's assume we have a valid User ID. 
    # If you are running this, replace this UUID with your actual Supabase User ID from the dashboard to see data!
    DEMO_USER_ID = "00000000-0000-0000-0000-000000000000" # Placeholder
    print(f"⚠️  Using Placeholder User ID: {DEMO_USER_ID}")
    print("⚠️  PLEASE UPDATE 'DEMO_USER_ID' in seed.py with your actual Supabase UID if you want to see data in your dashboard!")

    # 2. Seed Portfolio Snapshots (History)
    print("... Seeding Portfolio Snapshots")
    snapshots = []
    base_balance = 10000.0
    for i in range(30):
        date = datetime.now() - timedelta(days=30-i)
        change_percent = random.uniform(-2.0, 3.0)
        base_balance = base_balance * (1 + change_percent/100)
        pnl = base_balance - 10000.0
        
        snapshots.append({
            "user_id": DEMO_USER_ID,
            "total_balance": round(base_balance, 2),
            "total_pnl": round(pnl, 2),
            "pnl_percent": round((pnl/10000.0)*100, 2),
            "snapshot_at": date.isoformat()
        })
    
    # Batch insert (Supabase-py doesn't support massive batching well in all versions, but loop is fine for 30 items)
    # supabase.table("portfolio_snapshots").insert(snapshots).execute() 
    # Commented out to prevent crash if table doesn't exist or ID is invalid.
    # We will try one insert to check connection.
    try:
        # supabase.table("portfolio_snapshots").insert(snapshots[0]).execute()
        print(f"   -> Prepared {len(snapshots)} snapshots (Skipping actual insert to avoid FK error with placeholder ID)")
    except Exception as e:
        print(f"   -> Error inserting snapshots: {e}")

    # 3. Seed Guardian Alerts
    print("... Seeding Guardian Alerts")
    alerts = [
        {
            "user_id": DEMO_USER_ID,
            "level": "success",
            "message": "No liquidation risk detected. Margin health is good.",
            "is_read": False,
            "created_at": (datetime.now() - timedelta(hours=1)).isoformat()
        },
        {
            "user_id": DEMO_USER_ID,
            "level": "info",
            "message": "Margin utilization stable at 15%.",
            "is_read": True,
            "created_at": (datetime.now() - timedelta(minutes=10)).isoformat()
        },
        {
            "user_id": DEMO_USER_ID,
            "level": "warning",
            "message": "Funding rate for BTC/USDT is high (-0.03%). Consider closing shorts.",
            "is_read": False,
            "created_at": (datetime.now() - timedelta(hours=5)).isoformat()
        }
    ]
    # supabase.table("guardian_alerts").insert(alerts).execute()
    print(f"   -> Prepared {len(alerts)} alerts")

    # 4. Seed Agent Logs
    print("... Seeding Agent Logs")
    logs = [
        {"user_id": DEMO_USER_ID, "agent_name": "Auditor", "action": "Calculating Daily PnL", "status": "completed"},
        {"user_id": DEMO_USER_ID, "agent_name": "Collector", "action": "Syncing Wallet Balance", "status": "completed"},
        {"user_id": DEMO_USER_ID, "agent_name": "Guardian", "action": "Sentiment Analysis: Neutral", "status": "completed"},
        {"user_id": DEMO_USER_ID, "agent_name": "Guardian", "action": "API Key Permission Check", "status": "completed"},
    ]
    # supabase.table("agent_logs").insert(logs).execute()
    print(f"   -> Prepared {len(logs)} logs")

    print("\n✅ Seed Script Finished (Dry Run).")
    print("To actually insert data:")
    print("1. Create a user in Supabase Auth.")
    print("2. Copy the User UID.")
    print("3. Update 'DEMO_USER_ID' in this script.")
    print("4. Uncomment the insert lines.")
    print("5. Run: python backend/scripts/seed.py")

if __name__ == "__main__":
    asyncio.run(seed_data())
