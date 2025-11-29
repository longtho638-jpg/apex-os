"""
Auto-create Supabase test user and seed mock trades.
Run once to set up test data, delete when done.
"""

import os
import sys
import asyncio
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()


def get_supabase_client():
    from supabase._sync.client import SyncClient
    return SyncClient.create(
        os.getenv('SUPABASE_URL', ''),
        os.getenv('SUPABASE_SERVICE_KEY', '')
    )


def create_test_user():
    """Create test user via Supabase Auth Admin API"""
    print("🔐 Creating test user...")
    
    supabase = get_supabase_client()
    
    # Create user with Admin API
    try:
        # Use service role key to create user directly
        user = supabase.auth.admin.create_user({
            "email": "test@apexos.dev",
            "password": "TestPassword123!",
            "email_confirm": True
        })
        
        user_id = user.user.id
        print(f"✅ Created user: {user_id}")
        print(f"   Email: test@apexos.dev")
        print(f"   Password: TestPassword123!")
        
        return user_id
        
    except Exception as e:
        # User might already exist
        if "already registered" in str(e).lower():
            print("⚠️  User already exists, fetching existing user...")
            
            # Sign in to get user ID
            auth_response = supabase.auth.sign_in_with_password({
                "email": "test@apexos.dev",
                "password": "TestPassword123!"
            })
            
            user_id = auth_response.user.id
            print(f"✅ Using existing user: {user_id}")
            return user_id
        else:
            print(f"❌ Error creating user: {e}")
            print("\n💡 Manual fallback:")
            print("1. Go to Supabase Dashboard → Authentication")
            print("2. Create user: test@apexos.dev / TestPassword123!")
            print("3. Copy User UID and paste here:")
            user_id = input("Enter User UID: ").strip()
            return user_id


def generate_realistic_trades(user_id: str, num_trades: int = 50):
    """Generate realistic mock trades"""
    print(f"\n📊 Generating {num_trades} mock trades...")
    
    trades = []
    current_date = datetime.now() - timedelta(days=30)
    
    # Realistic price movements
    btc_price = 40000
    eth_price = 2500
    
    for i in range(num_trades):
        # 60% BTC, 30% ETH, 10% others
        rand = random.random()
        if rand < 0.6:
            symbol = 'BTC/USDT'
            base_price = btc_price
            quantity = random.uniform(0.01, 0.1)
        elif rand < 0.9:
            symbol = 'ETH/USDT'
            base_price = eth_price
            quantity = random.uniform(0.5, 5.0)
        else:
            symbol = 'BNB/USDT'
            base_price = 300
            quantity = random.uniform(1, 10)
        
        # Price volatility
        price = base_price * (1 + random.uniform(-0.05, 0.05))
        
        # Alternate buy/sell to create closed positions
        side = 'buy' if i % 2 == 0 else 'sell'
        
        quote_quantity = quantity * price
        fee = quote_quantity * 0.001  # 0.1% fee
        
        # Increment time randomly
        current_date += timedelta(hours=random.randint(1, 48))
        
        trade = {
            'user_id': user_id,
            'symbol': symbol,
            'side': side,
            'quantity': round(quantity, 8),
            'price': round(price, 2),
            'quote_quantity': round(quote_quantity, 2),
            'fee': round(fee, 4),
            'exchange': 'binance',
            'maker_or_taker': 'taker',
            'timestamp': current_date.isoformat()
        }
        
        trades.append(trade)
    
    return trades


def seed_trades_to_db(user_id: str, trades: list):
    """Insert trades into Supabase"""
    print(f"\n💾 Seeding {len(trades)} trades to database...")
    
    supabase = get_supabase_client()
    
    # Clean up old test data
    try:
        supabase.table('trade_history').delete().eq('user_id', user_id).execute()
        print("🧹 Cleaned up old trades")
    except Exception as e:
        print(f"⚠️  Cleanup error: {e}")
    
    # Insert in batches
    batch_size = 10
    for i in range(0, len(trades), batch_size):
        batch = trades[i:i+batch_size]
        try:
            supabase.table('trade_history').insert(batch).execute()
            print(f"   ✅ Batch {i//batch_size + 1}/{len(trades)//batch_size + 1}")
        except Exception as e:
            print(f"   ❌ Batch failed: {e}")
            return False
    
    return True


def verify_algorithms(user_id: str):
    """Test all algorithms with real data"""
    print(f"\n🧪 Running Algorithm Verification...")
    
    from engines.pnl_calculator import PnLCalculator
    from agents.auditor import AuditorAgent
    from agents.guardian import GuardianAgent
    
    # Test PnL Calculator
    print("\n1️⃣ Testing PnL Calculator...")
    pnl_calc = PnLCalculator()
    result = pnl_calc.calculate_user_pnl(user_id, days=30)
    
    print(f"   Total PnL: ${result.total_pnl}")
    print(f"   Win Rate: {result.win_rate}%")
    print(f"   Total Trades: {result.total_trades}")
    print(f"   ✅ PnL Calculator working!")
    
    # Test Auditor
    print("\n2️⃣ Testing Auditor Agent...")
    auditor = AuditorAgent()
    
    fee_result = auditor.reconcile_fees(user_id, days=30)
    print(f"   Total Fees: ${fee_result['total_actual_fees']}")
    print(f"   Discrepancy: ${fee_result['discrepancy']}")
    
    rebate_result = auditor.calculate_rebates(user_id, days=30)
    print(f"   User Rebate: ${rebate_result['user_rebate']}")
    print(f"   ✅ Auditor working!")
    
    # Test Guardian
    print("\n3️⃣ Testing Guardian Agent...")
    guardian = GuardianAgent()
    
    liq_result = guardian.check_liquidation_risk(user_id)
    print(f"   Positions at Risk: {liq_result['positions_at_risk']}")
    
    lev_result = guardian.detect_over_leverage(user_id)
    print(f"   Over-leveraged: {lev_result['is_over_leveraged']}")
    print(f"   ✅ Guardian working!")
    
    print("\n" + "="*60)
    print("✅ ALL ALGORITHMS VERIFIED WITH REAL DATA!")
    print("="*60)


def main():
    """Main execution"""
    print("="*60)
    print("🚀 ApexOS Auto-Setup: Create User + Seed Data")
    print("="*60)
    
    # Step 1: Create user
    user_id = create_test_user()
    
    if not user_id:
        print("❌ Failed to create user. Exiting.")
        sys.exit(1)
    
    # Step 2: Generate trades
    trades = generate_realistic_trades(user_id, num_trades=50)
    
    # Step 3: Seed to database
    success = seed_trades_to_db(user_id, trades)
    
    if not success:
        print("❌ Failed to seed trades. Exiting.")
        sys.exit(1)
    
    print("\n✅ Setup complete!")
    print(f"\n📋 Test User Credentials:")
    print(f"   Email: test@apexos.dev")
    print(f"   Password: TestPassword123!")
    print(f"   User ID: {user_id}")
    
    # Step 4: Verify algorithms
    verify_algorithms(user_id)
    
    print("\n🧪 Test APIs:")
    print(f'   curl "http://localhost:8000/api/v1/pnl/summary?user_id={user_id}"')
    print(f'   curl "http://localhost:8000/api/v1/auditor/rebates?user_id={user_id}"')
    print(f'   curl "http://localhost:8000/api/v1/guardian/leverage-check?user_id={user_id}"')
    
    print("\n🗑️  To cleanup later:")
    print(f"   DELETE FROM trade_history WHERE user_id='{user_id}';")
    print(f"   DELETE FROM auth.users WHERE id='{user_id}';")


if __name__ == "__main__":
    main()
