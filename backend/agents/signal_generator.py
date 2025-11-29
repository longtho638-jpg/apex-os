import asyncio
import os
import sys
import pandas as pd
from datetime import datetime, timezone, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Add paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.ensemble_model import EnsembleModel
from ml.enhanced_features import EnhancedFeatureEngineer

load_dotenv()

class SignalGeneratorAgent:
    def __init__(self):
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase: Client = create_client(url, key)
        
        self.model = EnsembleModel()
        self.feature_engineer = EnhancedFeatureEngineer()
        self.symbols = ["BTC", "ETH", "BNB", "SOL"]
        self.symbols_map = {"BTC": "BTCUSDT", "ETH": "ETHUSDT", "BNB": "BNBUSDT", "SOL": "SOLUSDT"}

    async def fetch_price_data(self, symbol: str) -> pd.DataFrame:
        # Fetch last 100 candles from DB
        db_symbol = self.symbols_map.get(symbol, symbol + "USDT")
        res = self.supabase.table("market_data_ohlcv")\
            .select("*")\
            .eq("symbol", db_symbol)\
            .eq("interval", "5m")\
            .order("open_time", desc=True)\
            .limit(100)\
            .execute()
            
        if not res.data:
            return pd.DataFrame()
            
        df = pd.DataFrame(res.data)
        df = df.sort_values('open_time')
        return df

    async def fetch_sentiment(self, symbol: str) -> float:
        # Get latest sentiment score
        res = self.supabase.table("social_sentiment")\
            .select("sentiment_score")\
            .eq("symbol", symbol)\
            .order("timestamp", desc=True)\
            .limit(1)\
            .execute()
            
        if res.data:
            return float(res.data[0]['sentiment_score'])
        return 0.0

    async def generate_signals(self):
        print(f"Generating signals at {datetime.now()}")
        
        generated = []
        for symbol in self.symbols:
            # 1. Gather Data
            df = await self.fetch_price_data(symbol)
            if df.empty:
                print(f"No price data for {symbol}")
                continue
                
            sentiment = await self.fetch_sentiment(symbol)
            
            # 2. Volume Features
            # We compute enhanced features which includes volume/order flow logic
            # For realtime order flow, we might call the analyzer directly, 
            # but enhanced_features does that.
            df_enhanced = self.feature_engineer.create_enhanced_features(df, self.symbols_map[symbol])
            
            # Extract volume signals for ensemble
            last_row = df_enhanced.iloc[-1]
            volume_signals = {
                "order_imbalance": float(last_row.get('order_imbalance', 0.5)),
                "mfi": float(last_row.get('mfi_14', 50))
            }
            
            # 3. Predict
            result = self.model.predict_ensemble(df, sentiment, volume_signals)
            result['symbol'] = symbol
            
            # 4. Store if High Confidence
            if result['confidence'] >= 0.6: # Threshold
                signal_record = {
                    "symbol": symbol,
                    "prediction": result['prediction'],
                    "confidence": result['confidence'],
                    "entry_price": float(last_row['close']),
                    "price_contrib": result['contributions']['price'],
                    "sentiment_contrib": result['contributions']['sentiment'],
                    "volume_contrib": result['contributions']['volume'],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat(),
                    "status": "active"
                }
                
                try:
                    self.supabase.table("trading_signals").insert(signal_record).execute()
                    generated.append(signal_record)
                    print(f"SIGNAL: {symbol} {result['prediction']} ({result['confidence']:.2f})")
                except Exception as e:
                    print(f"DB Error: {e}")
                    
        return generated

if __name__ == "__main__":
    agent = SignalGeneratorAgent()
    asyncio.run(agent.generate_signals())
