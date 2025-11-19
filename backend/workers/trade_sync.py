"""
Background Trade Sync Worker
Asynchronously fetches trade history from exchanges and stores in database.
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import ccxt.async_support as ccxt
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from supabase import create_client, Client
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load env vars from backend/.env
backend_dir = Path(__file__).parent.parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Slack Webhook URL for alerts
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

async def send_slack_alert(message: str):
    """Send alert to Slack"""
    if not SLACK_WEBHOOK_URL:
        return
        
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            await session.post(
                SLACK_WEBHOOK_URL,
                json={"text": f"🚨 *ApexOS Worker Alert*\n{message}"}
            )
    except Exception as e:
        logger.error(f"Failed to send Slack alert: {e}")

# Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL', ''),
    os.getenv('SUPABASE_SERVICE_KEY', '')
)

class TradeSyncWorker:
    """Background worker for syncing trade history"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.active_syncs: Dict[str, bool] = {}
        
    async def sync_user_trades(
        self, 
        user_id: str, 
        exchange_name: str,
        api_key: str,
        api_secret: str
    ) -> Dict:
        """
        Fetch and store trades for a specific user and exchange.
        
        Args:
            user_id: User UUID
            exchange_name: 'binance' or 'bybit'
            api_key: Exchange API key
            api_secret: Exchange API secret
            
        Returns:
            Sync job result with status and metrics
        """
        sync_key = f"{user_id}_{exchange_name}"
        
        # Prevent concurrent syncs for same user+exchange
        if self.active_syncs.get(sync_key):
            logger.warning(f"Sync already running for {sync_key}")
            return {"status": "skipped", "reason": "sync_in_progress"}
        
        self.active_syncs[sync_key] = True
        
        # Create sync job record
        job = self._create_sync_job(user_id, exchange_name)
        
        try:
            # Initialize exchange
            exchange = self._init_exchange(exchange_name, api_key, api_secret)
            
            # Get last sync timestamp
            last_sync_time = self._get_last_sync_timestamp(user_id, exchange_name)
            
            # Fetch trades
            logger.info(f"Fetching trades for {user_id} from {exchange_name} since {last_sync_time}")
            trades = await self._fetch_all_trades(exchange, last_sync_time)
            
            # Store trades in database
            stored_count = self._bulk_insert_trades(user_id, exchange_name, trades)
            
            # Update job status
            self._update_sync_job(job['id'], {
                'status': 'success',
                'trades_synced': stored_count,
                'completed_at': datetime.now().isoformat(),
                'last_trade_timestamp': trades[-1]['timestamp'] if trades else None
            })
            
            logger.info(f"Sync completed: {stored_count} trades stored for {user_id}")
            
            await exchange.close()
            
            return {
                "status": "success",
                "trades_synced": stored_count,
                "user_id": user_id,
                "exchange": exchange_name
            }
            
        except Exception as e:
            error_msg = f"Sync failed for {sync_key}: {str(e)}"
            logger.error(error_msg)
            await send_slack_alert(error_msg)
            
            # Update job with error
            self._update_sync_job(job['id'], {
                'status': 'failed',
                'error_message': str(e),
                'completed_at': datetime.now().isoformat()
            })
            
            return {
                "status": "failed",
                "error": str(e),
                "user_id": user_id,
                "exchange": exchange_name
            }
            
        finally:
            self.active_syncs[sync_key] = False
    
    def _init_exchange(self, exchange_name: str, api_key: str, api_secret: str):
        """Initialize CCXT exchange instance"""
        exchange_class = getattr(ccxt, exchange_name)
        
        return exchange_class({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,  # Respect rate limits
            'options': {
                'defaultType': 'future',  # For perpetual contracts
            }
        })
    
    async def _fetch_all_trades(
        self, 
        exchange, 
        since: Optional[datetime] = None
    ) -> List[Dict]:
        """
        Fetch all trades since a given timestamp.
        Handles pagination automatically.
        """
        all_trades = []
        since_ms = int(since.timestamp() * 1000) if since else None
        
        # Fetch in batches (CCXT limit is usually 1000 per request)
        while True:
            try:
                trades = await exchange.fetch_my_trades(
                    since=since_ms,
                    limit=1000
                )
                
                if not trades:
                    break
                
                all_trades.extend(trades)
                
                # Update since to last trade timestamp for next iteration
                since_ms = trades[-1]['timestamp']
                
                # If we got less than limit, we're done
                if len(trades) < 1000:
                    break
                
                # Rate limiting
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error fetching trades: {e}")
                break
        
        logger.info(f"Fetched {len(all_trades)} trades from exchange")
        return all_trades
    
    def _bulk_insert_trades(
        self, 
        user_id: str, 
        exchange_name: str, 
        trades: List[Dict]
    ) -> int:
        """
        Bulk insert trades into database with deduplication.
        
        Returns:
            Number of trades successfully inserted
        """
        if not trades:
            return 0
        
        # Transform CCXT trade format to our schema
        trade_records = []
        for trade in trades:
            trade_records.append({
                'user_id': user_id,
                'exchange': exchange_name,
                'symbol': trade['symbol'],
                'trade_id': trade['id'],
                'side': trade['side'],
                'price': float(trade['price']),
                'quantity': float(trade['amount']),
                'quote_quantity': float(trade['cost']),
                'fee': float(trade['fee']['cost']) if trade.get('fee') else 0,
                'fee_currency': trade['fee']['currency'] if trade.get('fee') else None,
                'timestamp': datetime.fromtimestamp(trade['timestamp'] / 1000).isoformat()
            })
        
        try:
            # Upsert (insert or ignore duplicates)
            result = supabase.table('trade_history').upsert(
                trade_records,
                on_conflict='user_id,exchange,trade_id'
            ).execute()
            
            return len(result.data) if result.data else 0
            
        except Exception as e:
            logger.error(f"Error inserting trades: {e}")
            return 0
    
    def _get_last_sync_timestamp(self, user_id: str, exchange: str) -> Optional[datetime]:
        """Get the timestamp of the most recent trade for this user+exchange"""
        try:
            result = supabase.table('trade_history')\
                .select('timestamp')\
                .eq('user_id', user_id)\
                .eq('exchange', exchange)\
                .order('timestamp', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data:
                return datetime.fromisoformat(result.data[0]['timestamp'])
            
            # If no trades, start from 30 days ago
            return datetime.now() - timedelta(days=30)
            
        except Exception as e:
            logger.error(f"Error getting last sync timestamp: {e}")
            return datetime.now() - timedelta(days=30)
    
    def _create_sync_job(self, user_id: str, exchange: str) -> Dict:
        """Create a new sync job record"""
        try:
            result = supabase.table('sync_jobs').insert({
                'user_id': user_id,
                'exchange': exchange,
                'status': 'running',
                'started_at': datetime.now().isoformat()
            }).execute()
            
            return result.data[0] if result.data else {}
            
        except Exception as e:
            logger.error(f"Error creating sync job: {e}")
            return {}
    
    def _update_sync_job(self, job_id: str, updates: Dict):
        """Update sync job status"""
        try:
            supabase.table('sync_jobs')\
                .update(updates)\
                .eq('id', job_id)\
                .execute()
        except Exception as e:
            logger.error(f"Error updating sync job: {e}")
    
    async def sync_all_active_users(self):
        """
        Sync trades for all users who have connected exchanges.
        Called by scheduler every 5 minutes.
        """
        try:
            # Get all users with exchange connections
            result = supabase.table('exchange_connections')\
                .select('user_id, exchange, api_key, api_secret')\
                .eq('is_active', True)\
                .execute()
            
            if not result.data:
                logger.info("No active exchange connections to sync")
                return
            
            # Create sync tasks for all users
            tasks = []
            for conn in result.data:
                task = self.sync_user_trades(
                    conn['user_id'],
                    conn['exchange'],
                    conn['api_key'],
                    conn['api_secret']
                )
                tasks.append(task)
            
            # Run all syncs concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            success_count = sum(1 for r in results if isinstance(r, dict) and r.get('status') == 'success')
            logger.info(f"Sync batch completed: {success_count}/{len(results)} successful")
            
        except Exception as e:
            logger.error(f"Error in sync_all_active_users: {e}")
    
    def start(self):
        """Start the background scheduler"""
        logger.info("Starting Trade Sync Worker...")
        
        # Schedule sync job every 5 minutes
        self.scheduler.add_job(
            self.sync_all_active_users,
            'interval',
            minutes=5,
            id='trade_sync',
            replace_existing=True
        )
        
        # Also run immediately on startup
        self.scheduler.add_job(
            self.sync_all_active_users,
            'date',
            run_date=datetime.now() + timedelta(seconds=5)
        )
        
        self.scheduler.start()
        logger.info("Trade Sync Worker started successfully")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("Trade Sync Worker stopped")


# Singleton instance
worker = TradeSyncWorker()

if __name__ == "__main__":
    worker.start()
    
    try:
        # Keep the script running
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        worker.stop()
