"""
Unit tests for PnL Calculator with mock data (no database required).
Tests FIFO logic, fee deduction, and statistics accuracy.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from engines.pnl_calculator import PnLCalculator, Position


def create_mock_trade(symbol, side, quantity, price, fee=None, timestamp=None):
    """Helper to create mock trade"""
    if fee is None:
        fee = quantity * price * 0.001  # 0.1% fee
    
    if timestamp is None:
        timestamp = datetime.now().isoformat()
    
    return {
        'symbol': symbol,
        'side': side,
        'quantity': quantity,
        'price': price,
        'fee': fee,
        'quote_quantity': quantity * price,
        'timestamp': timestamp
    }


def test_simple_buy_sell():
    """Test basic buy then sell scenario"""
    print("\n🧪 Test 1: Simple Buy-Sell")
    
    calc = PnLCalculator()
    
    # Buy 1 BTC at $40,000
    buy_trade = create_mock_trade('BTC/USDT', 'buy', 1.0, 40000, fee=40)
    calc._process_trade(buy_trade)
    
    # Sell 1 BTC at $45,000
    sell_trade = create_mock_trade('BTC/USDT', 'sell', 1.0, 45000, fee=45)
    calc._process_trade(sell_trade)
    
    # Expected: PnL = (45000 - 40000) - 40 - 45 = 4915
    print(f"   Realized PnL: ${calc.realized_pnl}")
    print(f"   Total Fees: ${calc.total_fees}")
    print(f"   Expected: $4915")
    
    assert abs(calc.realized_pnl - 4915) < 0.01, f"Expected 4915, got {calc.realized_pnl}"
    print("   ✅ PASS")


def test_fifo_multiple_buys():
    """Test FIFO with multiple buy orders"""
    print("\n🧪 Test 2: FIFO - Multiple Buys, One Sell")
    
    calc = PnLCalculator()
    
    # Buy 0.5 BTC at $40,000
    calc._process_trade(create_mock_trade('BTC/USDT', 'buy', 0.5, 40000, fee=20))
    
    # Buy 0.5 BTC at $42,000
    calc._process_trade(create_mock_trade('BTC/USDT', 'buy', 0.5, 42000, fee=21))
    
    # Sell 1 BTC at $45,000 (should close BOTH positions via FIFO)
    calc._process_trade(create_mock_trade('BTC/USDT', 'sell', 1.0, 45000, fee=45))
    
    # Expected:
    # First 0.5 BTC: (45000 - 40000) * 0.5 - 20 - 22.5 = 2457.5
    # Second 0.5 BTC: (45000 - 42000) * 0.5 - 21 - 22.5 = 1456.5
    # Total: 3914
    
    print(f"   Realized PnL: ${calc.realized_pnl}")
    print(f"   Closed Trades: {len(calc.closed_trades)}")
    print(f"   Expected: ~$3914")
    
    assert len(calc.closed_trades) == 2, "Should have 2 closed trades"
    assert abs(calc.realized_pnl - 3914) < 1, f"Expected ~3914, got {calc.realized_pnl}"
    print("   ✅ PASS")


def test_partial_close():
    """Test partial position close"""
    print("\n🧪 Test 3: Partial Close")
    
    calc = PnLCalculator()
    
    # Buy 1 BTC at $40,000
    calc._process_trade(create_mock_trade('BTC/USDT', 'buy', 1.0, 40000, fee=40))
    
    # Sell 0.5 BTC at $45,000 (partial close)
    calc._process_trade(create_mock_trade('BTC/USDT', 'sell', 0.5, 45000, fee=22.5))
    
    # Expected: (45000 - 40000) * 0.5 - 20 - 22.5 = 2457.5
    print(f"   Realized PnL: ${calc.realized_pnl}")
    print(f"   Open Positions: {len(calc.positions['BTC/USDT'])}")
    print(f"   Expected PnL: ~$2457.5")
    
    assert len(calc.positions['BTC/USDT']) == 1, "Should have 1 open position remaining"
    assert calc.positions['BTC/USDT'][0].quantity == 0.5, "Remaining qty should be 0.5"
    assert abs(calc.realized_pnl - 2457.5) < 1, f"Expected ~2457.5, got {calc.realized_pnl}"
    print("   ✅ PASS")


def test_losing_trade():
    """Test losing trade"""
    print("\n🧪 Test 4: Losing Trade")
    
    calc = PnLCalculator()
    
    # Buy 1 BTC at $45,000
    calc._process_trade(create_mock_trade('BTC/USDT', 'buy', 1.0, 45000, fee=45))
    
    # Sell 1 BTC at $40,000 (loss)
    calc._process_trade(create_mock_trade('BTC/USDT', 'sell', 1.0, 40000, fee=40))
    
    # Expected: (40000 - 45000) - 45 - 40 = -5085
    print(f"   Realized PnL: ${calc.realized_pnl}")
    print(f"   Expected: -$5085")
    
    assert calc.realized_pnl < 0, "Should be negative PnL"
    assert abs(calc.realized_pnl - (-5085)) < 0.01, f"Expected -5085, got {calc.realized_pnl}"
    print("   ✅ PASS")


def test_multiple_symbols():
    """Test tracking multiple symbols independently"""
    print("\n🧪 Test 5: Multiple Symbols")
    
    calc = PnLCalculator()
    
    # BTC trade
    calc._process_trade(create_mock_trade('BTC/USDT', 'buy', 1.0, 40000, fee=40))
    calc._process_trade(create_mock_trade('BTC/USDT', 'sell', 1.0, 45000, fee=45))
    
    # ETH trade
    calc._process_trade(create_mock_trade('ETH/USDT', 'buy', 10.0, 2500, fee=25))
    calc._process_trade(create_mock_trade('ETH/USDT', 'sell', 10.0, 2600, fee=26))
    
    # BTC PnL: 4915, ETH PnL: 949
    print(f"   Total Realized PnL: ${calc.realized_pnl}")
    print(f"   Expected: ~$5864")
    
    assert abs(calc.realized_pnl - 5864) < 1, f"Expected ~5864, got {calc.realized_pnl}"
    print("   ✅ PASS")


def test_statistics():
    """Test win rate and statistics calculation"""
    print("\n🧪 Test 6: Statistics")
    
    calc = PnLCalculator()
    
    # Winning trade
    calc._process_trade(create_mock_trade('BTC/USDT', 'buy', 1.0, 40000, fee=40))
    calc._process_trade(create_mock_trade('BTC/USDT', 'sell', 1.0, 45000, fee=45))
    
    # Losing trade
    calc._process_trade(create_mock_trade('ETH/USDT', 'buy', 10.0, 2500, fee=25))
    calc._process_trade(create_mock_trade('ETH/USDT', 'sell', 10.0, 2400, fee=24))
    
    stats = calc._calculate_statistics()
    
    print(f"   Total Trades: {stats['total_trades']}")
    print(f"   Winning Trades: {stats['winning_trades']}")
    print(f"   Losing Trades: {stats['losing_trades']}")
    print(f"   Win Rate: {stats['win_rate']}%")
    
    assert stats['total_trades'] == 2, "Should have 2 closed trades"
    assert stats['winning_trades'] == 1, "Should have 1 winning trade"
    assert stats['losing_trades'] == 1, "Should have 1 losing trade"
    assert stats['win_rate'] == 50.0, "Win rate should be 50%"
    print("   ✅ PASS")


def run_all_tests():
    """Run all unit tests"""
    print("=" * 60)
    print("PnL Calculator Unit Tests")
    print("=" * 60)
    
    try:
        test_simple_buy_sell()
        test_fifo_multiple_buys()
        test_partial_close()
        test_losing_trade()
        test_multiple_symbols()
        test_statistics()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n✨ PnL Calculator is production-ready!")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
