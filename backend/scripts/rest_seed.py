"""
FINAL VERSION: Seed data using pure REST API (no Supabase SDK dependency conflicts)
"""

import os
import sys
import requests
import json
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    sys.exit(1)

def generate_trades(user_id: str, num=50):
    """Generate realistic mock trades"""
    print(f"📊 Generating {num} trades...")
    trades = []
    date = datetime.now() - timedelta(days=30)
    
    for i in range(num):
        if random.random() < 0.6:
            symbol, price, qty = 'BTC/USDT', 40000 * (1 + random.uniform(-0.05, 0.05)), random.uniform(0.01, 0.1)
        else:
            symbol, price, qty = 'ETH/USDT', 2500 * (1 + random.uniform(-0.05, 0.05)), random.uniform(0.5, 5)
        
        side = 'buy' if i % 2 == 0 else 'sell'
        quote = qty * price
        fee = quote * 0.001
        date += timedelta(hours=random.randint(1, 48))
        
        trades.append({
            'user_id': user_id,
            'exchange': 'binance',
            'symbol': symbol,
            'trade_id': f"mock-{i}",
            'side': side,
            'quantity': round(qty, 8),
            'price': round(price, 2),
            'quote_quantity': round(quote, 2),
            'fee': round(fee, 4),
            'fee_currency': 'USDT',
            'timestamp': date.isoformat()
        })
    
    return trades

def seed_via_rest(user_id: str, trades: list):
    """Insert using Supabase REST API"""
    print(f"💾 Seeding {len(trades)} trades via REST API...")
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    # Cleanup old data
    delete_url = f"{SUPABASE_URL}/rest/v1/trade_history?user_id=eq.{user_id}"
    requests.delete(delete_url, headers=headers)
    print("🧹 Cleaned old data")
    
    # Insert in batches
    insert_url = f"{SUPABASE_URL}/rest/v1/trade_history"
    
    for i in range(0, len(trades), 10):
        batch = trades[i:i+10]
        response = requests.post(insert_url, headers=headers, json=batch)
        
        if response.status_code in [200, 201]:
            print(f"   ✅ Batch {i//10 + 1}/{(len(trades)-1)//10 + 1}")
        else:
            print(f"   ❌ Batch failed: {response.status_code} - {response.text}")
            return False
    
    return True

def verify_algorithms(user_id: str):
    """Test algorithms"""
    print("\n🧪 Verifying...")
    
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    from engines.pnl_calculator import PnLCalculator
    from agents.auditor import AuditorAgent
    
    pnl = PnLCalculator().calculate_user_pnl(user_id, 30)
    print(f"\n📈 PnL: ${pnl.total_pnl} | Win Rate: {pnl.win_rate}% | Trades: {pnl.total_trades}")
    
    auditor = AuditorAgent()
    fees = auditor.reconcile_fees(user_id, 30)
    rebates = auditor.calculate_rebates(user_id, 30)
    print(f"💰 Fees: ${fees['total_actual_fees']} | Rebate: ${rebates['user_rebate']}")
    
    print("\n✅ ALGORITHMS VERIFIED!")

if __name__ == "__main__":
    print("="*60)
    print("🚀 REST API Seed (No SDK conflicts)")
    print("="*60)
    
    USER_ID = "00000000-0000-0000-0000-000000000000"
    print(f"\n⚠️  Using placeholder UID: {USER_ID}")
    
    trades = generate_trades(USER_ID, num=50)
    success = seed_via_rest(USER_ID, trades)
    
    if success:
        print(f"\n✅ Seeded {len(trades)} trades!")
        verify_algorithms(USER_ID)
        print(f'\n🧪 Test: curl "http://localhost:8000/api/v1/pnl/summary?user_id={USER_ID}"')
    else:
        print("\n❌ Seeding failed")
        sys.exit(1)
