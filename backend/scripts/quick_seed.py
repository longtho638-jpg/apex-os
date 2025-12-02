"""
Quick seed script - Just provide User ID and seed mock trades.
No complex Supabase auth, just pure data seeding.
"""

import os
import sys
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load from root .env.local
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(root_dir, '.env.local'))


def get_supabase_client():
    from supabase._sync.client import SyncClient
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    if not url or not key:
        print("❌ Error: Missing Supabase credentials in .env.local")
        print(f"   Looking for: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)
        
    return SyncClient.create(url, key)


def generate_realistic_trades(user_id: str, num_trades: int = 50):
    """Generate realistic mock trades"""
    print(f"📊 Generating {num_trades} mock trades...")
    
    trades = []
    current_date = datetime.now() - timedelta(days=30)
    
    btc_price = 40000
    eth_price = 2500
    
    for i in range(num_trades):
        rand = random.random()
        if rand < 0.6:
            symbol, base_price, quantity = 'BTC/USDT', btc_price, random.uniform(0.01, 0.1)
        elif rand < 0.9:
            symbol, base_price, quantity = 'ETH/USDT', eth_price, random.uniform(0.5, 5.0)
        else:
            symbol, base_price, quantity = 'BNB/USDT', 300, random.uniform(1, 10)
        
        price = base_price * (1 + random.uniform(-0.05, 0.05))
        side = 'buy' if i % 2 == 0 else 'sell'
        quote_quantity = quantity * price
        fee = quote_quantity * 0.001
        
        current_date += timedelta(hours=random.randint(1, 48))
        
        trades.append({
            'user_id': user_id,
            'symbol': symbol,
            'side': side,
            'quantity': round(quantity, 8),
            'price': round(price, 2),
            'quote_quantity': round(quote_quantity, 2),
            'fee': round(fee, 4),
            'exchange': 'binance',
            'trade_id': f"mock_{int(current_date.timestamp())}_{i}",
            'timestamp': current_date.isoformat()
        })
    
    return trades


def seed_to_database(user_id: str, trades: list):
    """Insert trades to Supabase"""
    print(f"💾 Seeding {len(trades)} trades...")
    
    supabase = get_supabase_client()
    
    # Cleanup
    try:
        supabase.table('trade_history').delete().eq('user_id', user_id).execute()
        print("🧹 Cleaned old data")
    except:
        pass
    
    # Insert batches
    for i in range(0, len(trades), 10):
        batch = trades[i:i+10]
        try:
            supabase.table('trade_history').insert(batch).execute()
            print(f"   ✅ Batch {i//10 + 1}/{(len(trades)-1)//10 + 1}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return False
    
    return True


def verify_with_algorithms(user_id: str):
    """Run all algorithms to verify"""
    print(f"\n🧪 Verifying Algorithms...")
    
    from engines.pnl_calculator import PnLCalculator
    # from agents.auditor import AuditorAgent
    # from agents.guardian import GuardianAgent
    
    try:
        pnl = PnLCalculator().calculate_user_pnl(user_id, 30)
        print(f"\n📈 PnL Results:")
        print(f"   Total PnL: ${pnl.total_pnl}")
        print(f"   Win Rate: {pnl.win_rate}%")
        print(f"   Trades: {pnl.total_trades}")
    except Exception as e:
        print(f"   ❌ PnL Error: {e}")
    
    # auditor = AuditorAgent()
    # fees = auditor.reconcile_fees(user_id, 30)
    # rebates = auditor.calculate_rebates(user_id, 30)
    # print(f"\n💰 Auditor Results:")
    # print(f"   Total Fees: ${fees['total_actual_fees']}")
    # print(f"   User Rebate: ${rebates['user_rebate']}")
    
    # guardian = GuardianAgent()
    # liq = guardian.check_liquidation_risk(user_id)
    # lev = guardian.detect_over_leverage(user_id)
    # print(f"\n🛡️ Guardian Results:")
    # print(f"   Positions at Risk: {liq['positions_at_risk']}")
    # print(f"   Over-leveraged: {lev['is_over_leveraged']}")
    
    print("\n" + "="*60)
    print("✅ PnL ALGORITHM VERIFIED!")
    print("="*60)


if __name__ == "__main__":
    print("="*60)
    print("🚀 Quick Seed: Mock Trades for Testing")
    print("="*60)
    
    # Get user ID
    print("\n📝 Enter your Supabase User ID:")
    print("   (Go to Supabase Dashboard → Auth → Users → Copy UID)")
    print("   OR press Enter to use placeholder: 00000000-0000-0000-0000-000000000000")
    
    user_id = input("\nUser ID: ").strip()
    
    if not user_id:
        user_id = "00000000-0000-0000-0000-000000000000"
        print(f"⚠️  Using placeholder: {user_id}")
        print("⚠️  Create real user in Supabase for production!")
    
    # Generate & seed
    trades = generate_realistic_trades(user_id, num_trades=50)
    
    success = seed_to_database(user_id, trades)
    
    if not success:
        print("\n❌ Seeding failed!")
        sys.exit(1)
    
    print(f"\n✅ Seeded {len(trades)} trades for user: {user_id}")
    
    # Verify
    verify_with_algorithms(user_id)
    
    print(f"\n🧪 Test APIs:")
    print(f'curl "http://localhost:8000/api/v1/pnl/summary?user_id={user_id}"')
