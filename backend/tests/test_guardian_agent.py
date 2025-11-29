"""
Unit tests for The Guardian Agent - Risk Management
Tests liquidation price calculation, leverage detection, and funding rate monitoring.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.guardian import GuardianAgent


def test_liquidation_price_long():
    """Test liquidation price calculation for long positions"""
    print("\n🧪 Test 1: Liquidation Price - Long Position")
    
    guardian = GuardianAgent()
    
    # Long position: Entry $40,000, Leverage 5x
    position = {
        'entry_price': 40000,
        'leverage': 5,
        'side': 'long'
    }
    
    liq_price = guardian._calculate_liquidation_price(position)
    
    # Expected: 40000 * (1 - 1/5) = 40000 * 0.8 = 32,000
    expected = 32000
    
    print(f"   Entry Price: ${position['entry_price']}")
    print(f"   Leverage: {position['leverage']}x")
    print(f"   Liquidation Price: ${liq_price}")
    print(f"   Expected: ${expected}")
    
    assert abs(liq_price - expected) < 0.01, f"Expected {expected}, got {liq_price}"
    print("   ✅ PASS")


def test_liquidation_price_short():
    """Test liquidation price calculation for short positions"""
    print("\n🧪 Test 2: Liquidation Price - Short Position")
    
    guardian = GuardianAgent()
    
    # Short position: Entry $40,000, Leverage 5x
    position = {
        'entry_price': 40000,
        'leverage': 5,
        'side': 'short'
    }
    
    liq_price = guardian._calculate_liquidation_price(position)
    
    # Expected: 40000 * (1 + 1/5) = 40000 * 1.2 = 48,000
    expected = 48000
    
    print(f"   Entry Price: ${position['entry_price']}")
    print(f"   Leverage: {position['leverage']}x")
    print(f"   Liquidation Price: ${liq_price}")
    print(f"   Expected: ${expected}")
    
    assert abs(liq_price - expected) < 0.01, f"Expected {expected}, got {liq_price}"
    print("   ✅ PASS")


def test_high_leverage_liquidation():
    """Test liquidation with high leverage (10x)"""
    print("\n🧪 Test 3: High Leverage (10x) Liquidation")
    
    guardian = GuardianAgent()
    
    # Long position: Entry $40,000, Leverage 10x
    position = {
        'entry_price': 40000,
        'leverage': 10,
        'side': 'long'
    }
    
    liq_price = guardian._calculate_liquidation_price(position)
    
    # Expected: 40000 * (1 - 1/10) = 40000 * 0.9 = 36,000
    expected = 36000
    
    print(f"   Leverage: {position['leverage']}x (High Risk)")
    print(f"   Liquidation Price: ${liq_price}")
    print(f"   Expected: ${expected}")
    print(f"   Distance to liquidation: Only 10%!")
    
    assert abs(liq_price - expected) < 0.01, f"Expected {expected}, got {liq_price}"
    print("   ✅ PASS")


def test_risk_profiles():
    """Test different risk profile configurations"""
    print("\n🧪 Test 4: Risk Profile Configurations")
    
    guardian = GuardianAgent()
    
    profiles = guardian.risk_profiles
    
    print(f"   Conservative: Max {profiles['conservative']['max_leverage']}x leverage")
    print(f"   Moderate: Max {profiles['moderate']['max_leverage']}x leverage")
    print(f"   Aggressive: Max {profiles['aggressive']['max_leverage']}x leverage")
    
    assert profiles['conservative']['max_leverage'] < profiles['moderate']['max_leverage']
    assert profiles['moderate']['max_leverage'] < profiles['aggressive']['max_leverage']
    
    print("   ✅ PASS - Risk profiles properly configured")


def test_empty_positions():
    """Test behavior with no open positions"""
    print("\n🧪 Test 5: No Open Positions")
    
    guardian = GuardianAgent()
    
    # Test liquidation check with no positions
    liq_result = guardian.check_liquidation_risk("test-user")
    
    print(f"   Status: {liq_result['status']}")
    print(f"   Positions at Risk: {liq_result['positions_at_risk']}")
    
    assert liq_result['status'] == 'no_data'
    assert liq_result['positions_at_risk'] == 0
    
    # Test leverage check with no positions
    lev_result = guardian.detect_over_leverage("test-user")
    
    print(f"   Leverage Status: {lev_result['status']}")
    print(f"   Is Over-Leveraged: {lev_result['is_over_leveraged']}")
    
    assert lev_result['status'] == 'no_data'
    assert lev_result['is_over_leveraged'] == False
    
    # Test funding monitoring with no positions
    fund_result = guardian.monitor_funding_rates("test-user")
    
    print(f"   Funding Status: {fund_result['status']}")
    print(f"   Total Daily Funding: ${fund_result['total_daily_funding']}")
    
    assert fund_result['status'] == 'no_data'
    assert fund_result['total_daily_funding'] == 0.0
    
    print("   ✅ PASS")


def test_funding_recommendation():
    """Test funding rate recommendation logic"""
    print("\n🧪 Test 6: Funding Rate Recommendations")
    
    guardian = GuardianAgent()
    
    # High positive funding (expensive for shorts)
    rec1 = guardian._get_funding_recommendation('short', 0.0015)
    print(f"   High funding, Short position: {rec1}")
    assert "closing short" in rec1.lower()
    
    # High negative funding (expensive for longs)
    rec2 = guardian._get_funding_recommendation('long', -0.0015)
    print(f"   Negative funding, Long position: {rec2}")
    assert "closing long" in rec2.lower()
    
    # Normal funding
    rec3 = guardian._get_funding_recommendation('long', 0.0001)
    print(f"   Normal funding: {rec3}")
    assert "normal" in rec3.lower()
    
    print("   ✅ PASS")


def run_all_tests():
    """Run all Guardian Agent tests"""
    print("=" * 60)
    print("Guardian Agent Unit Tests")
    print("=" * 60)
    
    try:
        test_liquidation_price_long()
        test_liquidation_price_short()
        test_high_leverage_liquidation()
        test_risk_profiles()
        test_empty_positions()
        test_funding_recommendation()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n✨ Guardian Agent is production-ready!")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
