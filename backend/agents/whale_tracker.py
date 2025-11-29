import asyncio
import os
import sys
import requests
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Add backend root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

class WhaleTrackerAgent:
    def __init__(self):
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            print("Warning: Supabase credentials missing")
            self.supabase = None
        else:
            self.supabase: Client = create_client(url, key)
            
        # Thresholds
        self.btc_threshold = 1000000 # $1M
        self.eth_threshold = 1000000 # $1M
        
    def fetch_btc_whales(self):
        """Fetch large BTC transactions from Blockchain.info"""
        # Using unconfirmed transactions for speed, or latest blocks
        # API: https://blockchain.info/unconfirmed-transactions?format=json
        # Note: This is a high volume stream. For specific whale tracking, 
        # we might filter by known addresses or just large value outputs.
        
        print("Scanning BTC Chain...")
        try:
            res = requests.get("https://blockchain.info/unconfirmed-transactions?format=json")
            data = res.json()
            
            txs = data.get('txs', [])
            whales = []
            
            # Current BTC Price (Mock or fetch)
            btc_price = 95000 # Approximation for logic check
            
            for tx in txs:
                # Calculate total output value
                total_satoshi = sum(out.get('value', 0) for out in tx.get('out', []))
                value_usd = (total_satoshi / 1e8) * btc_price
                
                if value_usd > self.btc_threshold:
                    whales.append({
                        "symbol": "BTC",
                        "wallet_address": tx['inputs'][0]['prev_out']['addr'] if tx['inputs'] else "unknown",
                        "amount_usd": value_usd,
                        "transaction_hash": tx['hash'],
                        "direction": "MOVE",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
            
            return whales
        except Exception as e:
            print(f"BTC Scan Error: {e}")
            return []

    async def run_cycle(self):
        if not self.supabase:
            return

        # 1. BTC Whales
        btc_activity = self.fetch_btc_whales()
        if btc_activity:
            print(f"Found {len(btc_activity)} BTC Whales")
            try:
                self.supabase.table("whale_activity").upsert(
                    btc_activity, on_conflict="transaction_hash"
                ).execute()
            except Exception as e:
                print(f"DB Error: {e}")
        
        # 2. ETH Whales (Requires Etherscan Key usually, skipping for generic MVP or use free endpoint)
        # Placeholder for ETH logic
        
        await asyncio.sleep(600) # 10 minutes

if __name__ == "__main__":
    agent = WhaleTrackerAgent()
    # Single run for testing
    asyncio.run(agent.run_cycle())
