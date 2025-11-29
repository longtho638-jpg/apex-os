import pytest
from unittest.mock import MagicMock, AsyncMock, patch
import sys
import os

# We need to set env vars BEFORE importing if the module logic uses them at top level, 
# but DataCollectionAgent uses them in __init__. 
# However, load_dotenv() is at top level.
# We will mock os.environ before importing the class just in case, or just set them.

os.environ['NEXT_PUBLIC_SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = 'test-key'

from data_collection_agent import DataCollectionAgent

@pytest.mark.asyncio
async def test_backfill_handles_duplicates():
    with patch('data_collection_agent.create_client') as mock_create_client, \
         patch('data_collection_agent.ccxt.binance') as mock_ccxt:
        
        # Setup mocks
        mock_supabase = MagicMock()
        mock_create_client.return_value = mock_supabase
        
        mock_exchange = MagicMock()
        mock_ccxt.return_value = mock_exchange
        mock_exchange.fetch_ohlcv = AsyncMock(return_value=[
            [1600000000000, 100, 110, 90, 105, 10]
        ])
        mock_exchange.parse_timeframe.return_value = 60
        
        agent = DataCollectionAgent()
        
        from datetime import datetime, timedelta, timezone
        start = datetime.now(timezone.utc) - timedelta(minutes=5)
        end = datetime.now(timezone.utc)
        
        await agent.fetch_and_store('BTC/USDT', '1m', start, end)
        
        # Check upsert called
        mock_supabase.table.return_value.upsert.assert_called()

@pytest.mark.asyncio
async def test_realtime_collection_graceful_failure():
    with patch('data_collection_agent.create_client') as mock_create_client, \
         patch('data_collection_agent.ccxt.binance') as mock_ccxt:
         
        mock_exchange = MagicMock()
        mock_ccxt.return_value = mock_exchange
        mock_exchange.fetch_ohlcv = AsyncMock(side_effect=Exception("API Error"))
        
        agent = DataCollectionAgent()
        
        from datetime import datetime, timezone
        await agent.fetch_and_store('BTC/USDT', '1m', datetime.now(timezone.utc), datetime.now(timezone.utc))
        
        # Should complete without raising exception
        assert True