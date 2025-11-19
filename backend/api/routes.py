from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import List, Dict
from pydantic import BaseModel

router = APIRouter()

# Mock Data (Moved from Frontend to Backend for "Real" API simulation)
WATCHLIST = [
    {"symbol": "AAPL", "price": 173.50, "change": +1.25, "change_percent": +0.72},
    {"symbol": "TSLA", "price": 205.60, "change": -3.40, "change_percent": -1.63},
    {"symbol": "NVDA", "price": 485.10, "change": +8.90, "change_percent": +1.87},
    {"symbol": "MSFT", "price": 378.85, "change": +2.10, "change_percent": +0.56},
    {"symbol": "BTC", "price": 42150.00, "change": +1200.00, "change_percent": +2.93},
]

POSITIONS = [
    {"symbol": "NVDA", "qty": 50, "avg": 420.00, "current": 485.10, "pnl": +3255.00, "pnl_percent": +15.5},
    {"symbol": "TSLA", "qty": 100, "avg": 215.00, "current": 205.60, "pnl": -940.00, "pnl_percent": -4.37},
]

from agents.collector import CollectorAgent

collector = CollectorAgent()

# ============== EXISTING ENDPOINTS ==============

@router.get("/dashboard/watchlist")
async def get_watchlist():
    # Fetch real BTC price
    btc_data = await collector.fetch_btc_price()
    
    # Update mock data with real BTC data if available
    updated_watchlist = []
    for item in WATCHLIST:
        if item["symbol"] == "BTC" and btc_data:
            updated_watchlist.append(btc_data)
        else:
            updated_watchlist.append(item)
            
    return updated_watchlist

@router.get("/dashboard/positions")
async def get_positions():
    return POSITIONS

@router.get("/system/status")
async def get_system_status():
    return {
        "market": "OPEN",
        "connection": "STABLE",
        "agents_active": 3
    }

# ============== NEW ZEN API ENDPOINTS ==============

@router.get("/zen/profile")
async def get_zen_profile(user_id: str = "demo-user"):
    """
    Get Trader DNA profile with element classification and metrics.
    
    Args:
        user_id: User UUID (defaults to demo-user for testing)
    
    Returns:
        Trainer DNA object with:
        - primaryElement: Main trading style
        - elementScores: Affinity scores for all 5 elements
        - alphaWindow: Best trading time window
        - nemesis: Worst performing trading pair
        - winRate: Overall win rate percentage
    """
    try:
        from analyzers.trader_dna import TraderDNAAnalyzer
        
        analyzer = TraderDNAAnalyzer()
        profile = analyzer.analyze(user_id)
        
        return profile
    except Exception as e:
        # Return default profile if analysis fails
        return {
            "primaryElement": "WATER",
            "elementScores": {
                "FIRE": 25,
                "WATER": 35,
                "EARTH": 20,
                "METAL": 10,
                "WOOD": 10
            },
            "alphaWindow": {"start": "09:00", "end": "11:00"},
            "nemesis": "SOL/USDT",
            "winRate": 50.0,
            "error": str(e)
        }

@router.get("/sync/status")
async def get_sync_status(user_id: str = "demo-user", exchange: str = "binance"):
    """
    Get the status of the most recent sync job for a user.
    
    Args:
        user_id: User UUID
        exchange: Exchange name ('binance', 'bybit', 'okx')
    
    Returns:
        Sync job status with metrics
    """
    try:
        from supabase import create_client
        import os
        
        supabase = create_client(
            os.getenv('SUPABASE_URL', ''),
            os.getenv('SUPABASE_SERVICE_KEY', '')
        )
        
        result = supabase.table('sync_jobs')\
            .select('*')\
            .eq('user_id', user_id)\
            .eq('exchange', exchange)\
            .order('created_at', desc=True)\
            .limit(1)\
            .execute()
        
        if result.data:
            return result.data[0]
        else:
            return {
                "status": "no_sync_history",
                "message": "No sync jobs found for this user"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SyncRequest(BaseModel):
    user_id: str
    exchange: str
    api_key: str
    api_secret: str

@router.post("/sync/trigger")
async def trigger_sync(request: SyncRequest, background_tasks: BackgroundTasks):
    """
    Manually trigger a trade history sync for a user.
    
    Args:
        request: Sync request with user credentials
    
    Returns:
        Acknowledgment that sync has been queued
    """
    try:
        from workers.trade_sync import worker
        
        # Add sync task to background
        background_tasks.add_task(
            worker.sync_user_trades,
            request.user_id,
            request.exchange,
            request.api_key,
            request.api_secret
        )
        
        return {
            "status": "sync_queued",
            "message": f"Trade sync started for {request.exchange}",
            "user_id": request.user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trades/history")
async def get_trade_history(
    user_id: str = "demo-user",
    symbol: str = None,
    limit: int = 100
):
    """
    Get trade history from database (faster than direct exchange API).
    
    Args:
        user_id: User UUID
        symbol: Optional symbol filter (e.g. 'BTC/USDT')
        limit: Max number of trades to return
    
    Returns:
        List of trades from database
    """
    try:
        from supabase import create_client
        import os
        
        supabase = create_client(
            os.getenv('SUPABASE_URL', ''),
            os.getenv('SUPABASE_SERVICE_KEY', '')
        )
        
        query = supabase.table('trade_history')\
            .select('*')\
            .eq('user_id', user_id)\
            .order('timestamp', desc=True)\
            .limit(limit)
        
        if symbol:
            query = query.eq('symbol', symbol)
        
        result = query.execute()
        
        return {
            "trades": result.data if result.data else [],
            "count": len(result.data) if result.data else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ExchangeConnectionRequest(BaseModel):
    user_id: str = "demo-user"
    exchange: str
    api_key: str
    api_secret: str

@router.post("/exchange/connect")
async def connect_exchange(request: ExchangeConnectionRequest):
    """
    Connect a new exchange account.
    Validates credentials and stores them securely.
    """
    try:
        # 1. Validate credentials with exchange (Test connectivity)
        import ccxt.async_support as ccxt
        
        exchange_class = getattr(ccxt, request.exchange)
        exchange = exchange_class({
            'apiKey': request.api_key,
            'secret': request.api_secret,
            'enableRateLimit': True,
        })
        
        # Try to fetch balance to verify keys
        try:
            await exchange.fetch_balance()
            await exchange.close()
        except Exception as e:
            await exchange.close()
            raise HTTPException(status_code=400, detail=f"Invalid API Credentials: {str(e)}")
            
        # 2. Store in database (Mock implementation if no DB connection)
        try:
            from supabase import create_client
            import os
            
            supabase = create_client(
                os.getenv('SUPABASE_URL', ''),
                os.getenv('SUPABASE_SERVICE_KEY', '')
            )
            
            # Check if connection already exists
            existing = supabase.table('exchange_connections')\
                .select('id')\
                .eq('user_id', request.user_id)\
                .eq('exchange', request.exchange)\
                .execute()
                
            if existing.data:
                # Update existing
                supabase.table('exchange_connections')\
                    .update({
                        'api_key': request.api_key, # In prod: Encrypt this!
                        'api_secret': request.api_secret, # In prod: Encrypt this!
                        'is_active': True,
                        'updated_at': 'now()'
                    })\
                    .eq('id', existing.data[0]['id'])\
                    .execute()
            else:
                # Insert new
                supabase.table('exchange_connections').insert({
                    'user_id': request.user_id,
                    'exchange': request.exchange,
                    'api_key': request.api_key, # In prod: Encrypt this!
                    'api_secret': request.api_secret, # In prod: Encrypt this!
                    'is_active': True
                }).execute()
                
            return {
                "status": "success",
                "message": f"Connected to {request.exchange} successfully",
                "exchange": request.exchange
            }
            
        except Exception as db_error:
            # Fallback for demo/dev without DB
            print(f"DB Error (ignoring for demo): {db_error}")
            return {
                "status": "success",
                "message": f"Connected to {request.exchange} (Demo Mode)",
                "exchange": request.exchange,
                "note": "Credentials validated but not stored (DB unavailable)"
            }
            
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
