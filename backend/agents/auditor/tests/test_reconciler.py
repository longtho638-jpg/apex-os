import sys
import os
# Add the 'backend' directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

import pytest
from unittest.mock import MagicMock
from decimal import Decimal
from datetime import datetime
from backend.agents.auditor.reconcile import Reconciler

@pytest.fixture
def mock_supabase_client():
    """Fixture to provide a mock Supabase client."""
    mock_client = MagicMock()
    mock_client.table.return_value = mock_client # Allow chaining .table().select() etc.
    mock_client.select.return_value = mock_client
    mock_client.eq.return_value = mock_client
    mock_client.in_.return_value = mock_client # For .in_() method
    mock_client.insert.return_value = mock_client
    mock_client.execute.return_value = MagicMock(data=None, error=None) # Default return
    return mock_client

@pytest.fixture
def reconciler(mock_supabase_client):
    """Fixture to provide a Reconciler instance with a mock Supabase client."""
    return Reconciler(mock_supabase_client)

def test_run_no_wallets(reconciler, mock_supabase_client):
    """Test run() when no wallets are found."""
    mock_supabase_client.table("wallets").select("*").execute.return_value = MagicMock(data=[], error=None)
    
    reconciler.run()
    
    # Assert that wallets were queried
    mock_supabase_client.table.assert_any_call("wallets")
    mock_supabase_client.select.assert_called()
    mock_supabase_client.execute.assert_called()
    
    # Assert that transaction table was NOT queried
    mock_supabase_client.table("transactions").select.assert_not_called()
    
    # Assert that a log entry was inserted for no wallets
    mock_supabase_client.table.assert_any_call("daily_reconciliation_logs")
    inserted_log_data = mock_supabase_client.table("daily_reconciliation_logs").insert.call_args[0][0]
    assert inserted_log_data['status'] == "NO_WALLETS"
    assert inserted_log_data['details'] == {"message": "No wallets found for reconciliation"}
    assert inserted_log_data['total_system_balance'] == 0.0
    assert inserted_log_data['discrepancy'] == 0.0

def test_run_wallets_no_transactions(reconciler, mock_supabase_client):
    """Test run() with wallets but no transactions."""
    mock_supabase_client.table("wallets").select("*").execute.return_value = MagicMock(
        data=[
            {'id': 'wallet_1', 'user_id': 'user_1', 'currency': 'BTC', 'balance': '1.0'}
        ], 
        error=None
    )
    mock_supabase_client.table("transactions").select("wallet_id, amount, type").in_('wallet_id', ['wallet_1']).execute.return_value = MagicMock(data=[], error=None)
    
    reconciler.run()
    
    mock_supabase_client.table("wallets").select.assert_called()
    mock_supabase_client.table("transactions").select.assert_called()
    
    # Expect a mismatch as wallet_balance is 1.0 but tx_sum is 0.0
    inserted_log_data = mock_supabase_client.table("daily_reconciliation_logs").insert.call_args[0][0]
    assert inserted_log_data['status'] == "MISMATCH"
    assert inserted_log_data['discrepancy'] == 1.0
    assert inserted_log_data['details']['mismatches'][0]['wallet_id'] == "wallet_1"
    assert inserted_log_data['details']['mismatches'][0]['diff'] == 1.0

    mock_supabase_client.table("security_alerts").insert.assert_called()

def test_run_wallets_with_matching_transactions(reconciler, mock_supabase_client):
    """Test run() with wallets and matching transactions."""
    mock_supabase_client.table("wallets").select("*").execute.return_value = MagicMock(
        data=[
            {'id': 'wallet_1', 'user_id': 'user_1', 'currency': 'BTC', 'balance': '1.5'},
            {'id': 'wallet_2', 'user_id': 'user_2', 'currency': 'ETH', 'balance': '2.0'}
        ], 
        error=None
    )
    mock_supabase_client.table("transactions").select("wallet_id, amount, type").in_('wallet_id', ['wallet_1', 'wallet_2']).execute.return_value = MagicMock(
        data=[
            {'wallet_id': 'wallet_1', 'amount': '1.0', 'type': 'DEPOSIT'},
            {'wallet_id': 'wallet_1', 'amount': '0.5', 'type': 'TRADE_PNL'},
            {'wallet_id': 'wallet_2', 'amount': '2.0', 'type': 'DEPOSIT'}
        ], 
        error=None
    )
    
    reconciler.run()
    
    mock_supabase_client.table("wallets").select.assert_called()
    mock_supabase_client.table("transactions").select.assert_called()
    
    inserted_log_data = mock_supabase_client.table("daily_reconciliation_logs").insert.call_args[0][0]
    assert inserted_log_data['status'] == "MATCH"
    assert inserted_log_data['discrepancy'] == 0.0
    assert inserted_log_data['total_system_balance'] == 3.5 # 1.5 + 2.0
    assert inserted_log_data['total_transaction_sum'] == 3.5 # (1.0 + 0.5) + 2.0
    mock_supabase_client.table("security_alerts").insert.assert_not_called()

def test_run_wallets_with_mismatching_transactions(reconciler, mock_supabase_client):
    """Test run() with wallets and mismatching transactions."""
    mock_supabase_client.table("wallets").select("*").execute.return_value = MagicMock(
        data=[
            {'id': 'wallet_1', 'user_id': 'user_1', 'currency': 'BTC', 'balance': '1.0'}
        ], 
        error=None
    )
    mock_supabase_client.table("transactions").select("wallet_id, amount, type").in_('wallet_id', ['wallet_1']).execute.return_value = MagicMock(
        data=[
            {'wallet_id': 'wallet_1', 'amount': '0.5', 'type': 'DEPOSIT'}
        ], 
        error=None
    )
    
    reconciler.run()
    
    inserted_log_data = mock_supabase_client.table("daily_reconciliation_logs").insert.call_args[0][0]
    assert inserted_log_data['status'] == "MISMATCH"
    assert inserted_log_data['discrepancy'] == 0.5
    assert inserted_log_data['details']['mismatches'][0]['wallet_id'] == "wallet_1"
    assert inserted_log_data['details']['mismatches'][0]['diff'] == 0.5

    mock_supabase_client.table("security_alerts").insert.assert_called()

def test_run_transaction_type_logic(reconciler, mock_supabase_client):
    """Test run() with various transaction types affecting sum."""
    mock_supabase_client.table("wallets").select("*").execute.return_value = MagicMock(
        data=[
            {'id': 'wallet_1', 'user_id': 'user_1', 'currency': 'BTC', 'balance': '0.5'} # Expected final balance
        ], 
        error=None
    )
    mock_supabase_client.table("transactions").select("wallet_id, amount, type").in_('wallet_id', ['wallet_1']).execute.return_value = MagicMock(
        data=[
            {'wallet_id': 'wallet_1', 'amount': '1.0', 'type': 'DEPOSIT'},
            {'wallet_id': 'wallet_1', 'amount': '0.3', 'type': 'FEE'}, # Should subtract
            {'wallet_id': 'wallet_1', 'amount': '0.2', 'type': 'WITHDRAWAL'} # Should subtract
        ], 
        error=None
    )
    
    reconciler.run()
    
    # Initial DEPOSIT (1.0) - FEE (0.3) - WITHDRAWAL (0.2) = 0.5
    inserted_log_data = mock_supabase_client.table("daily_reconciliation_logs").insert.call_args[0][0]
    assert inserted_log_data['status'] == "MATCH"
    assert inserted_log_data['discrepancy'] == 0.0
    assert inserted_log_data['total_transaction_sum'] == 0.5
    mock_supabase_client.table("security_alerts").insert.assert_not_called()

def test_run_supabase_transactions_fetch_error(reconciler, mock_supabase_client):
    """Test run() handles errors during transactions fetch."""
    mock_supabase_client.table("wallets").select("*").execute.return_value = MagicMock(
        data=[
            {'id': 'wallet_1', 'user_id': 'user_1', 'currency': 'BTC', 'balance': '1.0'}
        ], 
        error=None
    )
    mock_supabase_client.table("transactions").select("wallet_id, amount, type").in_('wallet_id', ['wallet_1']).execute.return_value = MagicMock(
        data=None, # Simulate error or no data
        error=MagicMock(message="Supabase transactions fetch error")
    )
    
    with pytest.raises(Exception): # Expect the exception to be re-raised
        reconciler.run()
    
    mock_supabase_client.table("daily_reconciliation_logs").insert.assert_not_called()
    mock_supabase_client.table("security_alerts").insert.assert_not_called()
