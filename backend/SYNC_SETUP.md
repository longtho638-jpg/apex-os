# Apex OS - Background Trade Sync System

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements-sync.txt
```

### 2. Set Environment Variables
```bash
export SUPABASE_URL="your-project-url"
export SUPABASE_SERVICE_KEY="your-service-key"
```

### 3. Run Database Migration
```bash
# Using Supabase CLI
supabase db push

# Or manually execute SQL
psql -h db.your-project.supabase.co -U postgres -f database/migrations/002_trade_sync_tables.sql
```

### 4. Start Background Worker
```bash
python workers/trade_sync.py
```

The worker will:
- Run immediately on startup
- Then sync every 5 minutes automatically
- Fetch trades from all active user exchanges
- Store in `trade_history` table

### 5. Test API Endpoints

**Get Zen Profile:**
```bash
curl http://localhost:8000/api/zen/profile?user_id=demo-user
```

**Get Sync Status:**
```bash
curl http://localhost:8000/api/sync/status?user_id=demo-user&exchange=binance
```

**Trigger Manual Sync:**
```bash
curl -X POST http://localhost:8000/api/sync/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo-user",
    "exchange": "binance",
    "api_key": "your-key",
    "api_secret": "your-secret"
  }'
```

**Get Trade History:**
```bash
curl "http://localhost:8000/api/trades/history?user_id=demo-user&limit=50"
```

## Architecture Flow

```
1. User connects exchange → Store API keys in database
2. Background worker runs every 5 min
3. Worker fetches trades via CCXT
4. Trades stored in trade_history table
5. Analysis engine calculates Trader DNA
6. Frontend fetches profile via /api/zen/profile
```

## Database Tables

- **trade_history**: All synced trades
- **sync_jobs**: Job tracking and status
- See `database/migrations/002_trade_sync_tables.sql` for full schema

## Files Created

- `backend/database/migrations/002_trade_sync_tables.sql` - Database schema
- `backend/workers/trade_sync.py` - Background sync worker
- `backend/analyzers/trader_dna.py` - Analysis engine
- `backend/api/routes.py` - API endpoints (updated)
- `backend/requirements-sync.txt` - Python dependencies

## Next Steps

1. Connect ZenWidget to real API (replace mock data)
2. Add UI for sync status indicator
3. Implement exchange connection flow
4. Add error handling and retry logic
5. Set up proper authentication
