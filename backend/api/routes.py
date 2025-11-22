from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from typing import List, Dict, Optional
from pydantic import BaseModel

# from core.database import db
# from core.security import encrypt_value
# from engines.pnl_calculator import PnLCalculator
# from agents.collector import CollectorAgent
# from agents.auditor import AuditorAgent
# from agents.guardian import GuardianAgent

# collector = CollectorAgent()
# auditor = AuditorAgent()
# guardian = GuardianAgent()

async def get_current_user():
    return {}

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

# from core.database import db
# from core.security import encrypt_value
# from agents.collector import CollectorAgent

# collector = CollectorAgent()

# ============== EXISTING ENDPOINTS ==============

# @router.get("/dashboard/watchlist")
# async def get_watchlist():
#     # Fetch real BTC price
#     # btc_data = await collector.fetch_btc_price()
#     btc_data = None
    
#     # Update mock data with real BTC data if available
#     updated_watchlist = []
#     for item in WATCHLIST:
#         if item["symbol"] == "BTC" and btc_data:
#             updated_watchlist.append(btc_data)
#         else:
#             updated_watchlist.append(item)
            
#     return updated_watchlist

# @router.get("/dashboard/positions")
# async def get_positions():
#     return POSITIONS

# @router.get("/system/status")
# async def get_system_status():
#     return {
#         "market": "OPEN",
#         "connection": "STABLE",
#         "agents_active": 3
#     }

# # ============== NEW ZEN API ENDPOINTS ==============

# @router.get("/zen/profile")
# async def get_zen_profile(user_id: str = "demo-user"):
#     """
#     Get Trader DNA profile with element classification and metrics.
    
#     Args:
#         user_id: User UUID (defaults to demo-user for testing)
    
#     Returns:
#         Trainer DNA object with:
#         - primaryElement: Main trading style
#         - elementScores: Affinity scores for all 5 elements
#         - alphaWindow: Best trading time window
#         - nemesis: Worst performing trading pair
#         - winRate: Overall win rate percentage
#     """
#     try:
#         from analyzers.trader_dna import TraderDNAAnalyzer
        
#         analyzer = TraderDNAAnalyzer()
#         profile = analyzer.analyze(user_id)
        
#         return profile
#     except Exception as e:
#         # Return default profile if analysis fails
#         return {
#             "primaryElement": "WATER",
#             "elementScores": {
#                 "FIRE": 25,
#                 "WATER": 35,
#                 "EARTH": 20,
#                 "METAL": 10,
#                 "WOOD": 10
#             },
#             "alphaWindow": {"start": "09:00", "end": "11:00"},
#             "nemesis": "SOL/USDT",
#             "winRate": 50.0,
#             "error": str(e)
#         }

# @router.get("/sync/status")
# async def get_sync_status(user_id: str = "demo-user", exchange: str = "binance"):
#     """
#     Get the status of the most recent sync job for a user.
    
#     Args:
#         user_id: User UUID
#         exchange: Exchange name ('binance', 'bybit', 'okx')
    
#     Returns:
#         Sync job status with metrics
#     """
#     try:
#         from supabase import create_client
#         import os
        
#         supabase = create_client(
#             os.getenv('SUPABASE_URL', ''),
#             os.getenv('SUPABASE_SERVICE_KEY', '')
#         )
        
#         result = supabase.table('sync_jobs')\
#             .select('*')\
#             .eq('user_id', user_id)\
#             .eq('exchange', exchange)\
#             .order('created_at', desc=True)\
#             .limit(1)\
#             .execute()
        
#         if result.data:
#             return result.data[0]
#         else:
#             return {
#                 "status": "no_sync_history",
#                 "message": "No sync jobs found for this user"
#             }
            
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== PNL ENDPOINTS ====================

# @router.get("/pnl/summary")
# async def get_pnl_summary(user_id: str = "demo-user", days: int = 30):
#     """
#     Get comprehensive PnL summary for user.
    
#     Args:
#         user_id: User UUID
#         days: Look back period (default 30)
        
#     Returns:
#         Complete PnL breakdown with statistics
#     """
#     try:
#         calculator = PnLCalculator()
#         result = calculator.calculate_user_pnl(user_id, days)
        
#         return {
#             "realized_pnl": result.realized_pnl,
#             "unrealized_pnl": result.unrealized_pnl,
#             "total_pnl": result.total_pnl,
#             "total_fees": result.total_fees,
#             "total_funding_fees": result.total_funding_fees,
#             "win_rate": result.win_rate,
#             "total_trades": result.total_trades,
#             "winning_trades": result.winning_trades,
#             "losing_trades": result.losing_trades,
#             "largest_win": result.largest_win,
#             "largest_loss": result.largest_loss,
#             "average_win": result.average_win,
#             "average_loss": result.average_loss,
#             "profit_factor": result.profit_factor
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== AUDITOR ENDPOINTS ====================

# @router.post("/auditor/reconcile")
# async def reconcile_fees(user_id: str = "demo-user", days: int = 30):
#     """
#     Run fee reconciliation audit.
#     Compares expected fees vs actual fees to detect discrepancies.
#     """
#     try:
#         result = auditor.reconcile_fees(user_id, days)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/auditor/rebates")
# async def get_rebates(user_id: str = "demo-user", days: int = 30):
#     """
#     Calculate rebate owed to user based on commission splits.
#     """
#     try:
#         result = auditor.calculate_rebates(user_id, days)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/auditor/tax-report")
# async def get_tax_report(user_id: str = "demo-user", year: int = 2024):
#     """
#     Generate annual tax report with CSV export.
#     """
#     try:
#         result = auditor.generate_tax_report(user_id, year)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== GUARDIAN ENDPOINTS ====================

# @router.get("/guardian/liquidation-risk")
# async def get_liquidation_risk(user_id: str = "demo-user"):
#     """
#     Check liquidation risk for all open positions.
#     Calculates liquidation prices and distance to liquidation.
#     """
#     try:
#         result = guardian.check_liquidation_risk(user_id)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/guardian/leverage-check")
# async def check_leverage(user_id: str = "demo-user", risk_profile: str = "moderate"):
#     """
#     Check if user is over-leveraged based on risk profile.
    
#     Risk profiles: conservative (max 3x), moderate (max 5x), aggressive (max 10x)
#     """
#     try:
#         result = guardian.detect_over_leverage(user_id, risk_profile)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/guardian/funding-rates")
# async def monitor_funding(user_id: str = "demo-user"):
#     """
#     Monitor funding rates for open positions.
#     Alerts on high funding costs (>0.1% per 8 hours).
#     """
#     try:
#         result = guardian.monitor_funding_rates(user_id)
#         return result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


class SyncRequest(BaseModel):
    user_id: str
    exchange: str
    api_key: str
    api_secret: str

# @router.post("/sync/trigger")
# async def trigger_sync(request: SyncRequest, background_tasks: BackgroundTasks):
#     """
#     Manually trigger a trade history sync for a user.
    
#     Args:
#         request: Sync request with user credentials
    
#     Returns:
#         Acknowledgment that sync has been queued
#     """
#     try:
#         from workers.trade_sync import worker
        
#         # Add sync task to background
#         background_tasks.add_task(
#             worker.sync_user_trades,
#             request.user_id,
#             request.exchange,
#             request.api_key,
#             request.api_secret
#         )
        
#         return {
#             "status": "sync_queued",
#             "message": f"Trade sync started for {request.exchange}",
#             "user_id": request.user_id
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/trades/history")
# async def get_trade_history(
#     user_id: str = "demo-user",
#     symbol: str = None,
#     limit: int = 100
# ):
#     """
#     Get trade history from database (faster than direct exchange API).
    
#     Args:
#         user_id: User UUID
#         symbol: Optional symbol filter (e.g. 'BTC/USDT')
#         limit: Max number of trades to return
    
#     Returns:
#         List of trades from database
#     """
#     try:
#         from supabase import create_client
#         import os
        
#         supabase = create_client(
#             os.getenv('SUPABASE_URL', ''),
#             os.getenv('SUPABASE_SERVICE_KEY', '')
#         )
        
#         query = supabase.table('trade_history')\
#             .select('*')\
#             .eq('user_id', user_id)\
#             .order('timestamp', desc=True)\
#             .limit(limit)
        
#         if symbol:
#             query = query.eq('symbol', symbol)
        
#         result = query.execute()
        
#         return {
#             "trades": result.data if result.data else [],
#             "count": len(result.data) if result.data else 0
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

class ExchangeConnectionRequest(BaseModel):
    user_id: str = "demo-user"
    exchange: str
    api_key: str
    api_secret: str

# @router.post("/exchange/connect")
# async def connect_exchange(request: ExchangeConnectionRequest):
#     """
#     Connect a new exchange account.
#     Validates credentials and stores them securely.
#     """
#     try:
#         # 1. Validate credentials with exchange (Test connectivity)
#         import ccxt.async_support as ccxt
        
#         exchange_class = getattr(ccxt, request.exchange)
#         exchange = exchange_class({
#             'apiKey': request.api_key,
#             'secret': request.api_secret,
#             'enableRateLimit': True,
#         })
        
#         # Try to fetch balance to verify keys
#         try:
#             await exchange.fetch_balance()
#             await exchange.close()
#         except Exception as e:
#             await exchange.close()
#             raise HTTPException(status_code=400, detail=f"Invalid API Credentials: {str(e)}")
            
#         # 2. Store in database (Mock implementation if no DB connection)
#         try:
#             from supabase import create_client
#             import os
            
#             supabase = create_client(
#                 os.getenv('SUPABASE_URL', ''),
#                 os.getenv('SUPABASE_SERVICE_KEY', '')
#             )
            
#             # Check if connection already exists
#             existing = supabase.table('exchange_connections')\
#                 .select('id')\
#                 .eq('user_id', request.user_id)\
#                 .eq('exchange', request.exchange)\
#                 .execute()
                
#             if existing.data:
#                 # Update existing
#                 supabase.table('exchange_connections')\
#                     .update({
#                         'api_key': request.api_key, # In prod: Encrypt this!
#                         'api_secret': request.api_secret, # In prod: Encrypt this!
#                         'is_active': True,
#                         'updated_at': 'now()'
#                     })\
#                     .eq('id', existing.data[0]['id'])\
#                     .execute()
#             else:
#                 # Insert new
#                 supabase.table('exchange_connections').insert({
#                     'user_id': request.user_id,
#                     'exchange': request.exchange,
#                     'api_key': request.api_key, # In prod: Encrypt this!
#                     'api_secret': request.api_secret, # In prod: Encrypt this!
#                     'is_active': True
#                 }).execute()
                
#             return {
#                 "status": "success",
#                 "message": f"Connected to {request.exchange} successfully",
#                 "exchange": request.exchange
#             }
            
#         except Exception as db_error:
#             # Fallback for demo/dev without DB
#             print(f"DB Error (ignoring for demo): {db_error}")
#             return {
#                 "status": "success",
#                 "message": f"Connected to {request.exchange} (Demo Mode)",
#                 "exchange": request.exchange,
#                 "note": "Credentials validated but not stored (DB unavailable)"
#             }
            
#     except HTTPException as he:
#         raise he
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== EXCHANGE INTEGRATION ENDPOINTS ====================

from integrations.exchange_client import create_exchange_client

class ConnectExchangeRequest(BaseModel):
    user_id: str
    exchange: str  # 'binance', 'bybit', 'okx'
    api_key: str
    api_secret: str

# @router.post("/exchange/connect")
# async def connect_exchange(request: ConnectExchangeRequest):
#     """
#     Connect user's exchange account and validate credentials.
#     Step 1: Test connection
#     Step 2: Save encrypted credentials
#     Step 3: Trigger initial sync
#     """
#     try:
#         # Test connection
#         client = create_exchange_client(
#             request.exchange,
#             request.api_key,
#             request.api_secret
#         )
        
#         test_result = client.test_connection()
        
#         if not test_result['success']:
#             return {
#                 "success": False,
#                 "message": test_result['message'],
#                 "step": "validation_failed"
#             }
        
#         # Check permissions (must have 'read')
#         if 'read' not in test_result['permissions']:
#             return {
#                 "success": False,
#                 "message": "API key must have READ permission",
#                 "step": "insufficient_permissions"
#             }
        
#         # TODO: Encrypt and save credentials to database
#         # For now, just return success
        
#         return {
#             "success": True,
#             "message": "Exchange connected successfully",
#             "exchange": request.exchange,
#             "balance": test_result['balance'],
#             "permissions": test_result['permissions'],
#             "step": "connected"
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/exchange/sync-trades")
# async def sync_trades(user_id: str, exchange: str, api_key: str, api_secret: str, background_tasks: BackgroundTasks):
#     """
#     Sync trades from exchange to database.
#     Runs in background to avoid timeout.
#     """
#     try:
#         client = create_exchange_client(exchange, api_key, api_secret)
        
#         # Fetch trades from last 30 days
#         from datetime import datetime, timedelta
#         since = datetime.now() - timedelta(days=30)
        
#         trades = client.fetch_trades(since=since, limit=500)
        
#         if not trades:
#             return {
#                 "success": True,
#                 "message": "No new trades to sync",
#                 "trades_synced": 0
#             }
        
#         # Insert to database via REST API
#         from core.rest_client import get_supabase_rest_client
#         import requests
        
#         config = get_supabase_rest_client()
#         url = f"{config['url']}/rest/v1/trade_history"
        
#         # Add user_id to each trade
#         for trade in trades:
#             trade['user_id'] = user_id
        
#         # Insert in batches
#         batch_size = 50
#         total_inserted = 0
        
#         for i in range(0, len(trades), batch_size):
#             batch = trades[i:i+batch_size]
#             response = requests.post(url, headers=config['headers'], json=batch)
            
#             if response.status_code in [200, 201]:
#                 total_inserted += len(batch)
        
#         return {
#             "success": True,
#             "message": f"Synced {total_inserted} trades",
#             "trades_synced": total_inserted
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# # ==================== AUTHENTICATION ENDPOINTS ====================

from core.auth import create_token, get_current_user
import hashlib

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# @router.post("/auth/signup")
# async def signup(request: SignupRequest):
#     """
#     Register new user
#     Returns JWT token on success
#     """
#     try:
#         from core.rest_client import get_supabase_rest_client
#         import requests
#         import uuid
        
#         config = get_supabase_rest_client()
        
#         # Hash password (basic - use bcrypt in production)
#         password_hash = hashlib.sha256(request.password.encode()).hexdigest()
        
#         # Create user in database
#         user_id = str(uuid.uuid4())
#         user_data = {
#             'id': user_id,
#             'email': request.email,
#             'full_name': request.full_name or request.email.split('@')[0],
#             'role': 'trader',
#             'created_at': datetime.now().isoformat()
#         }
        
#         url = f"{config['url']}/rest/v1/users"
#         response = requests.post(url, headers=config['headers'], json=user_data)
        
#         if response.status_code not in [200, 201]:
#             return {"success": False, "message": "Email already exists"}
        
#         # Create JWT token
#         token = create_token(user_id, request.email)
        
#         return {
#             "success": True,
#             "message": "Account created successfully",
#             "token": token,
#             "user": {
#                 "id": user_id,
#                 "email": request.email,
#                 "full_name": user_data['full_name']
#             }
#         }
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/auth/login")
# async def login(request: LoginRequest):
#     ... (commented out)

@router.get("/test")
async def test():
    return {"message": "Router is working"}

# @router.get("/auth/me")
# async def get_me(user: dict = Depends(get_current_user)):
#     """
#     Get current user profile
#     Protected route - requires authentication
#     """
#     from core.rest_client import get_supabase_rest_client
#     import requests
    
#     config = get_supabase_rest_client()
#     url = f"{config['url']}/rest/v1/users?id=eq.{user['user_id']}"
#     response = requests.get(url, headers=config['headers'])
    
#     users = response.json()
#     if not users:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     return users[0]


# # ============== USER TIER & SUBSCRIPTION ==============

# @router.get("/user/tier")
# async def get_user_tier(user: dict = Depends(get_current_user)):
#     """
#     Get user's subscription tier and related info
    
#     Returns:
#         - tier: 'free', 'founders', or 'admin'
#         - slot_number: Founders Circle slot (1-100) if applicable
#         - joined_at: Timestamp when user joined tier
#         - features: Dict of available features for this tier
    
#     Used by frontend for feature gating and UI customization
#     """
#     from core.rest_client import get_supabase_rest_client
#     import requests
#     from datetime import datetime
    
#     try:
#         config = get_supabase_rest_client()
        
#         # Fetch user data
#         url = f"{config['url']}/rest/v1/users?id=eq.{user['user_id']}&select=*"
#         response = requests.get(url, headers=config['headers'])
        
#         if response.status_code != 200:
#             # Fallback to free tier if query fails
#             return {
#                 "tier": "free",
#                 "slot_number": None,
#                 "joined_at": None,
#                 "features": get_tier_features("free")
#             }
        
#         users = response.json()
#         if not users:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         user_data = users[0]
        
#         # Get tier (default to 'free' if column doesn't exist yet)
#         tier = user_data.get('subscription_tier', 'free')
        
#         # Get founders slot if applicable
#         slot_number = None
#         if tier == 'founders':
#             # Query founders_circle table for slot number
#             try:
#                 slot_url = f"{config['url']}/rest/v1/founders_circle?user_id=eq.{user['user_id']}&select=slot_number"
#                 slot_response = requests.get(slot_url, headers=config['headers'])
                
#                 if slot_response.status_code == 200:
#                     slots = slot_response.json()
#                     if slots:
#                         slot_number = slots[0].get('slot_number')
#             except:
#                 # Table might not exist yet, ignore
#                 pass
        
#         # Get joined_at timestamp
#         joined_at = user_data.get('joined_at') or user_data.get('created_at')
        
#         return {
#             "tier": tier,
#             "is_founders": tier == 'founders',
#             "is_admin": tier == 'admin',
#             "slot_number": slot_number,
#             "joined_at": joined_at,
#             "features": get_tier_features(tier)
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error fetching user tier: {str(e)}")
#         # Graceful fallback - return free tier
#         return {
#             "tier": "free",
#             "slot_number": None,
#             "joined_at": None,
#             "features": get_tier_features("free")
#         }


def get_tier_features(tier: str) -> dict:
    """
    Return feature flags for a given tier
    Used for frontend feature gating
    """
    features = {
        "free": {
            "wolf_pack_agents": False,
            "real_time_sync": False,
            "ai_auditor": False,
            "risk_guardian": False,
            "unlimited_exchanges": False,
            "lifetime_data": False,
            "referral_commission": 0,
            "api_rate_limit": 10,  # requests per minute
            "export_formats": ["csv"],
            "support_sla": "48h",
            "max_trade_history_days": 30
        },
        "founders": {
            "wolf_pack_agents": True,
            "real_time_sync": True,
            "ai_auditor": True,
            "risk_guardian": True,
            "unlimited_exchanges": True,
            "lifetime_data": True,
            "referral_commission": 20,  # 20% of referred user fees
            "api_rate_limit": 1000,
            "export_formats": ["csv", "pdf", "excel", "tax"],
            "support_sla": "2h",
            "max_trade_history_days": -1  # unlimited
        },
        "admin": {
            "wolf_pack_agents": True,
            "real_time_sync": True,
            "ai_auditor": True,
            "risk_guardian": True,
            "unlimited_exchanges": True,
            "lifetime_data": True,
            "referral_commission": 0,
            "api_rate_limit": 10000,
            "export_formats": ["csv", "pdf", "excel", "tax", "json"],
            "support_sla": "immediate",
            "max_trade_history_days": -1,
            "admin_panel": True,
            "system_analytics": True
        }
    }
    
    return features.get(tier, features["free"])
# ==================== REFERRAL & REBATE ENDPOINTS ====================

class VerifyReferralRequest(BaseModel):
    user_id: str = "demo-user" # Optional if authenticated, but good for public check
    exchange: str
    user_uid: str
    ip_address: Optional[str] = None

@router.post("/referral/verify")
async def verify_referral(request: VerifyReferralRequest):
    """
    Verify if a user's exchange UID is correctly linked to Apex's referral program.
    Used for the "Auto User Transfer" feature on the landing page.
    """
    try:
        # Call Auditor Agent's verification logic
        result = auditor.verify_subaccount_via_api(
            user_id=request.user_id,
            exchange=request.exchange,
            user_uid=request.user_uid,
            ip_address=request.ip_address
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AdminAutoRefRequest(BaseModel):
    exchange: str
    api_key: str
    api_secret: str
    target_user_id: Optional[str] = None # If known, otherwise just resolve UID

@router.post("/admin/auto-ref-update")
async def admin_auto_ref_update(request: AdminAutoRefRequest):
    """
    Admin Tool: Automatically resolve User UID from API Key and update referral status.
    """
    try:
        # 1. Resolve UID from API Key
        resolution = auditor.resolve_uid_from_api_key(
            request.exchange, 
            request.api_key, 
            request.api_secret
        )
        
        if not resolution['success']:
            return resolution
            
        uid = resolution['uid']
        
        # 2. If successful, we can verify this UID in the referral system
        # (Simulating the "Auto Update" part)
        verification = auditor.verify_subaccount_via_api(
            user_id=request.target_user_id or "admin-action",
            exchange=request.exchange,
            user_uid=uid
        )
        
        return {
            "resolution": resolution,
            "verification": verification,
            "message": f"Resolved UID {uid} and attempted verification."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
