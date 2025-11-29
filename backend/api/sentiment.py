from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add backend root to path to import ml modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.sentiment_analyzer import SentimentAnalyzer
from supabase import create_client, Client

app = FastAPI()

# Initialize Supabase
url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if not url or not key:
    print("Warning: Supabase credentials missing. DB features will fail.")
    
supabase: Client = create_client(url, key) if url and key else None

# Initialize Model (Global load on startup)
analyzer = SentimentAnalyzer()

class TweetInput(BaseModel):
    text: str
    id: Optional[str] = None

class AnalysisRequest(BaseModel):
    tweets: List[TweetInput]
    symbol: str

@app.post("/api/sentiment/analyze")
async def analyze_tweets(request: AnalysisRequest):
    texts = [t.text for t in request.tweets]
    results = analyzer.batch_analyze(texts)
    
    score = analyzer.aggregate_sentiment(results)
    
    # Prepare response
    return {
        "symbol": request.symbol,
        "sentiment_score": score,
        "volume": len(results),
        "results": results
    }

@app.get("/api/sentiment/{symbol}")
async def get_sentiment(symbol: str):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database unavailable")
        
    # Fetch latest sentiment
    response = supabase.table("social_sentiment")\
        .select("*")\
        .eq("symbol", symbol)\
        .order("timestamp", desc=True)\
        .limit(1)\
        .execute()
        
    if not response.data:
        return {"symbol": symbol, "sentiment_score": 0, "status": "no_data"}
        
    return response.data[0]
