import asyncio
import os
import sys
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# Add paths
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import modules (Mocking TypeScript client call via subprocess or direct DB check in future)
# For Python-only collector, we need a Python Twitter client OR bridge to TS.
# The task says "Fetch tweets using Phase 1 Twitter client". Phase 1 client is TypeScript.
# Options: 
# 1. Re-implement minimal Python Twitter client (Faster execution now)
# 2. Call TS script via subprocess (Slower, dependency heavy)
# 3. Assume TS client runs separately and populates a 'raw_tweets' table? 
# Task implies this collector does the fetching.
# I will implement a lightweight Python Twitter fetcher here to match the TS logic for the Agent.

import requests
from ml.sentiment_analyzer import SentimentAnalyzer

load_dotenv()

class TwitterCollector:
    def __init__(self):
        self.bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        self.base_url = "https://api.twitter.com/2"

    def search_tweets(self, symbol: str, limit=10):
        if not self.bearer_token:
            print("Twitter Token missing")
            return []
            
        query = f"(${symbol} OR {symbol}) lang:en -is:retweet"
        try:
            response = requests.get(
                f"{self.base_url}/tweets/search/recent",
                headers={"Authorization": f"Bearer {self.bearer_token}"},
                params={
                    "query": query,
                    "max_results": min(limit, 100),
                    "tweet.fields": "created_at,public_metrics,author_id"
                },
                timeout=10
            )
            if response.status_code == 200:
                return response.json().get('data', [])
            elif response.status_code == 429:
                print("Rate limit hit")
                return []
            else:
                print(f"Twitter Error: {response.text}")
                return []
        except Exception as e:
            print(f"Network Error: {e}")
            return []

class SentimentCollectorAgent:
    def __init__(self):
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.supabase: Client = create_client(url, key)
        self.twitter = TwitterCollector()
        self.analyzer = SentimentAnalyzer()
        self.symbols = ["BTC", "ETH", "BNB", "SOL"]

    async def run_cycle(self):
        print(f"Starting Sentiment Cycle: {datetime.now()}")
        
        for symbol in self.symbols:
            print(f"Processing {symbol}...")
            # 1. Collect
            tweets = self.twitter.search_tweets(symbol, limit=50) # 50 tweets
            if not tweets:
                print(f"No tweets found for {symbol}")
                continue
                
            # 2. Analyze
            texts = [t['text'] for t in tweets]
            results = self.analyzer.batch_analyze(texts)
            
            # 3. Store Tweets
            tweet_records = []
            for i, res in enumerate(results):
                t_raw = tweets[i]
                tweet_records.append({
                    "tweet_id": t_raw['id'],
                    "symbol": symbol,
                    "text": t_raw['text'],
                    "sentiment": res['sentiment'],
                    "confidence": res['confidence'],
                    "created_at": t_raw['created_at'],
                    "analyzed_at": datetime.now(timezone.utc).isoformat()
                })
            
            if tweet_records:
                try:
                    self.supabase.table("sentiment_tweets").upsert(tweet_records, on_conflict="tweet_id").execute()
                except Exception as e:
                    print(f"DB Error (Tweets): {e}")

            # 4. Aggregate & Store Score
            score = self.analyzer.aggregate_sentiment(results)
            avg_conf = sum(r['confidence'] for r in results) / len(results)
            
            try:
                self.supabase.table("social_sentiment").insert({
                    "symbol": symbol,
                    "source": "twitter",
                    "sentiment_score": score,
                    "volume": len(tweets),
                    "avg_confidence": avg_conf,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }).execute()
                print(f"Saved {symbol} score: {score:.4f} (Vol: {len(tweets)})")
            except Exception as e:
                print(f"DB Error (Score): {e}")
                
        print("Cycle Complete.")

if __name__ == "__main__":
    agent = SentimentCollectorAgent()
    asyncio.run(agent.run_cycle())
