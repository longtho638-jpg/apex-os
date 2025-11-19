"""
Seed mock trades for testing PnL Calculator and Auditor Agent.
This script creates realistic trade data to verify algorithm accuracy.
"""

from datetime import datetime, timedelta
import random
import os
import sys

# Add parent to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()


def get_supabase_client():
    from supabase._sync.client import SyncClient
    return SyncClient.create(
        os.getenv('SUPABASE_URL', ''),
        os.getenv('SUPABASE_SERVICE_KEY', '')
    )


def generate_mock_trades(user_id: str, num_trades: int = 50):
    """
    Generate realistic mock trades for testing.
    
    Strategy:
    - Start with BTC at $40,000
    - Simulate 50 trades over 30 days
    - Mix of profitable and losing trades
    - Include partial position closes
    """
    
    trades = []
    base_price = 40000
    current_date = datetime.now() - timedelta(days=30)
    
    symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
    
    for i in range(num_trades):
        symbol = random.choice(symbols)
        
        # Price movement (±5% from base)
        if symbol == 'BTC/USDT':
            price = base_price * (1 + random.uniform(-0.05, 0.05))
        elif symbol == 'ETH/USDT':
            price = 2500 * (1 + random.uniform(-0.05, 0.05))
        else:
            price = 300 * (1 + random.uniform(-0.05, 0.05))
        
        # Alternate buy/sell to create closed positions
        side = 'buy' if i % 2 == 0 else 'sell'
        
        # Quantity
        if symbol == 'BTC/USDT':
            quantity = random.uniform(0.01, 0.1)
        elif symbol == 'ETH/USDT':
            quantity = random.uniform(0.1, 1.0)
        else:
            quantity = random.uniform(1, 10)
        
        quote_quantity = quantity * price
        
        # Fee (0.1% for Binance)
        fee = quote_quantity * 0.001
        
        # Increment time
        current_date += timedelta(hours=random.randint(1, 24))
        
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


def seed_mock_trades():
    """Main seeding function"""
    print("🌱 Seeding Mock Trades for Testing...")
    
    # WARNING: Update this with your actual Supabase user ID
    USER_ID = "00000000-0000-0000-0000-000000000000"
    
    print(f"⚠️  Using USER_ID: {USER_ID}")
    print("⚠️  Make sure this matches a real user in auth.users!")
    
    # Generate trades
    trades = generate_mock_trades(USER_ID, num_trades=50)
    print(f"✅ Generated {len(trades)} mock trades")
    
    # Insert into database
    try:
        supabase = get_supabase_client()
        
        # Delete existing mock trades for this user (cleanup)
        print("🧹 Cleaning up old trades...")
        supabase.table('trade_history').delete().eq('user_id', USER_ID).execute()
        
        # Insert in batches
        batch_size = 10
        for i in range(0, len(trades), batch_size):
            batch = trades[i:i+batch_size]
            supabase.table('trade_history').insert(batch).execute()
            print(f"   Inserted batch {i//batch_size + 1}/{len(trades)//batch_size + 1}")
        
        print(f"\n✅ Successfully seeded {len(trades)} trades!")
        print(f"\n📊 Summary:")
        print(f"   - BTC/USDT: {sum(1 for t in trades if t['symbol'] == 'BTC/USDT')} trades")
        print(f"   - ETH/USDT: {sum(1 for t in trades if t['symbol'] == 'ETH/USDT')} trades")
        print(f"   - BNB/USDT: {sum(1 for t in trades if t['symbol'] == 'BNB/USDT')} trades")
        print(f"   - Buy orders: {sum(1 for t in trades if t['side'] == 'buy')}")
        print(f"   - Sell orders: {sum(1 for t in trades if t['side'] == 'sell')}")
        
        print(f"\n🧪 Test APIs:")
        print(f"   curl http://localhost:8000/api/pnl/summary?user_id={USER_ID}")
        print(f"   curl -X POST http://localhost:8000/api/auditor/reconcile?user_id={USER_ID}")
        print(f"   curl http://localhost:8000/api/auditor/rebates?user_id={USER_ID}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Troubleshooting:")
        print("1. Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env")
        print("2. Create a user in Supabase Auth and update USER_ID above")
        print("3. Run the migration: python backend/scripts/run_migration.py")


if __name__ == "__main__":
    seed_mock_trades()
