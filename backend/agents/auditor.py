"""
The Auditor Agent
Governance agent responsible for fee reconciliation, rebate calculation, and tax reporting.
Enhanced with sub-account verification capabilities for Apex Smart-Switch system.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
import requests
import numpy as np
import os
import hmac
import hashlib
import re
import logging
from urllib.parse import urlencode, quote

from core.rest_client import query_table, get_supabase_rest_client
from services.vault import decrypt_secret

# Configure logger
logger = logging.getLogger(__name__)


class AuditorAgent:
    """
    The Auditor: Governance agent for fee transparency and rebate calculations
    
    Responsibilities:
    - Fee reconciliation (compare expected vs actual fees)
    - Rebate calculation (commission splits)
    - Tax report generation
    """
    
    def __init__(self):
        # Standard maker/taker fee rates by exchange
        # TODO: Fetch from exchange_configs table
        self.fee_rates = {
            'binance': {'maker': 0.001, 'taker': 0.001},  # 0.1%
            'bybit': {'maker': 0.0001, 'taker': 0.0006},   # 0.01% / 0.06%
            'okx': {'maker': 0.0008, 'taker': 0.001},      # 0.08% / 0.1%
        }
        
        # Commission split configuration
        # Apex keeps 10-20%, returns 80-90% to user
        self.commission_retention_rate = 0.15  # 15% retention
    
    def reconcile_fees(self, user_id: str, days: int = 30) -> Dict:
        """
        Compare expected fees vs actual fees charged by exchange.
        """
        trades = self._fetch_user_trades(user_id, days)
        
        if not trades:
            return self._empty_reconciliation()
        
        total_expected = 0.0
        total_actual = 0.0
        flagged_trades = []
        
        for trade in trades:
            expected_fee = self._calculate_expected_fee(trade)
            actual_fee = float(trade.get('fee', 0))
            
            total_expected += expected_fee
            total_actual += actual_fee
            
            # Flag if discrepancy > 5%
            if expected_fee > 0 and abs(actual_fee - expected_fee) / expected_fee > 0.05:
                flagged_trades.append({
                    'trade_id': trade.get('id'),
                    'symbol': trade.get('symbol'),
                    'expected_fee': round(expected_fee, 4),
                    'actual_fee': round(actual_fee, 4),
                    'discrepancy': round(actual_fee - expected_fee, 4),
                    'timestamp': trade.get('timestamp')
                })
        
        discrepancy = total_actual - total_expected
        discrepancy_percent = (discrepancy / total_expected * 100) if total_expected > 0 else 0
        
        return {
            'total_expected_fees': round(total_expected, 2),
            'total_actual_fees': round(total_actual, 2),
            'discrepancy': round(discrepancy, 2),
            'discrepancy_percent': round(discrepancy_percent, 2),
            'flagged_trades_count': len(flagged_trades),
            'flagged_trades': flagged_trades[:10],  # Limit to 10 for brevity
            'status': 'alert' if abs(discrepancy_percent) > 5 else 'normal'
        }
    
    def calculate_rebates(self, user_id: str, days: int = 30) -> Dict:
        """
        Calculate user's rebate based on commission splits.
        """
        trades = self._fetch_user_trades(user_id, days)
        
        if not trades:
            return self._empty_rebate()
        
        total_fees_paid = sum(float(t.get('fee', 0)) for t in trades)
        
        # Assumption: Exchange gives Apex 20% commission on fees
        exchange_commission_rate = 0.20
        estimated_commission = total_fees_paid * exchange_commission_rate
        
        # Apex keeps 15%, returns 85% to user
        user_rebate = estimated_commission * (1 - self.commission_retention_rate)
        apex_profit = estimated_commission * self.commission_retention_rate
        
        # Store rebate in database
        self._store_rebate(user_id, user_rebate, days)
        
        return {
            'total_fees_paid': round(total_fees_paid, 2),
            'estimated_commission': round(estimated_commission, 2),
            'user_rebate': round(user_rebate, 2),
            'apex_profit': round(apex_profit, 2),
            'rebate_percentage': round((user_rebate / total_fees_paid) * 100, 2) if total_fees_paid > 0 else 0,
            'period_days': days
        }
    
    # ========== Private Helper Methods ==========
    
    def _calculate_expected_fee(self, trade: Dict) -> float:
        """Calculate expected fee based on standard rates"""
        exchange = trade.get('exchange', 'binance').lower()
        side_type = trade.get('maker_or_taker', 'taker')  # Default to taker
        
        fee_rate = self.fee_rates.get(exchange, {}).get(side_type, 0.001)
        quantity = float(trade.get('quantity', 0)) # Use quantity * price for value? Usually fee is on notional
        price = float(trade.get('price', 0))
        notional = quantity * price
        
        return notional * fee_rate
    
    def _fetch_user_trades(self, user_id: str, days: int) -> List[Dict]:
        """Fetch trades for specified period"""
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            # Use query_table from rest_client
            # Note: query_table supports simple eq filters. For >= we need to handle it manually or extend query_table
            # Or just use raw requests here for range query
            
            config = get_supabase_rest_client()
            url = f"{config['url']}/rest/v1/trade_history?user_id=eq.{user_id}&timestamp=gte.{since_date}&order=timestamp.asc&limit=1000"
            
            response = requests.get(url, headers=config['headers'])
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            print(f"Error fetching trades: {e}")
            return []
    
    def predict_slippage(self, volatility: float, spread: float) -> float:
        """
        Mock ML prediction for slippage based on volatility and spread.
        In a real scenario, this would use a LightGBM model.
        """
        # Simple heuristic: Higher volatility & spread = higher slippage
        base_slippage = 0.0001  # 1 bp base
        vol_factor = volatility * 0.1
        spread_factor = spread * 0.5
        
        predicted_slippage = base_slippage + vol_factor + spread_factor
        
        # Random noise to simulate ML uncertainty
        noise = np.random.normal(0, 0.00005)
        return max(0, predicted_slippage + noise)

    def calculate_net_rebate(self, symbol: str, amount: float, side: str) -> dict:
        """
        Calculate potential net rebate (Rebate - Slippage) for a trade.
        """
        # 1. Fetch live price (Mocked for now, normally from CCXT)
        # In real implementation, use self.collector.get_price(symbol)
        current_price = 98000.0 if 'BTC' in symbol else 3500.0
        
        # 2. Mock market conditions
        volatility = np.random.uniform(0.005, 0.03)  # 0.5% to 3%
        spread = np.random.uniform(0.0001, 0.001)    # 1bp to 10bps
        
        # 3. Predict Slippage
        predicted_slippage_rate = self.predict_slippage(volatility, spread)
        predicted_slippage_cost = amount * current_price * predicted_slippage_rate
        
        # 4. Calculate Gross Rebate (Assuming Maker)
        # Standard VIP 0 Maker Fee: 0.02%, Rebate (if affiliate): ~20% of fee
        # This is a simplification.
        maker_fee_rate = 0.0002
        gross_fee = amount * current_price * maker_fee_rate
        estimated_rebate = gross_fee * 0.20  # 20% kickback
        
        # 5. Net Profit
        net_profit = estimated_rebate - predicted_slippage_cost
        
        return {
            "symbol": symbol,
            "side": side,
            "amount": amount,
            "price": current_price,
            "market_conditions": {
                "volatility": f"{volatility:.2%}",
                "spread": f"{spread:.4f}"
            },
            "breakdown": {
                "gross_fee": round(gross_fee, 4),
                "estimated_rebate": round(estimated_rebate, 4),
                "predicted_slippage": round(predicted_slippage_cost, 4),
                "net_profit": round(net_profit, 4)
            },
            "recommendation": "LIMIT_ORDER" if net_profit > 0 else "WAIT_FOR_STABILITY",
            "risk_warning": volatility > 0.02
        }
    
    def _store_rebate(self, user_id: str, rebate_amount: float, period_days: int):
        """Store rebate record in database"""
        try:
            config = get_supabase_rest_client()
            url = f"{config['url']}/rest/v1/rebate_history"
            
            payload = {
                'user_id': user_id,
                'rebate_amount': rebate_amount,
                'period_days': period_days,
                'calculated_at': datetime.now().isoformat(),
                'status': 'pending'
            }
            
            requests.post(url, headers=config['headers'], json=payload)
        except Exception as e:
            print(f"Error storing rebate: {e}")
    
    def _empty_reconciliation(self) -> Dict:
        return {
            'total_expected_fees': 0.0,
            'total_actual_fees': 0.0,
            'discrepancy': 0.0,
            'discrepancy_percent': 0.0,
            'flagged_trades_count': 0,
            'flagged_trades': [],
            'status': 'no_data'
        }
    
    def _empty_rebate(self) -> Dict:
        return {
            'total_fees_paid': 0.0,
            'estimated_commission': 0.0,
            'user_rebate': 0.0,
            'apex_profit': 0.0,
            'rebate_percentage': 0.0,
            'period_days': 0
        }

    # ========== Sub-Account Verification Methods (Apex Smart-Switch) ==========

    def verify_subaccount_via_api(self, user_id: str, exchange: str, user_uid: str, ip_address: str = None) -> Dict:
        """
        Main entry point for sub-account verification.
        Delegates to exchange-specific methods.

        Args:
            user_id: UUID of user requesting verification
            exchange: 'binance' | 'bybit' | 'okx'
            user_uid: User-submitted UID (exchange-specific format)
            ip_address: User's IP (for fraud detection)

        Returns:
            {
                'verified': bool,
                'status': 'verified' | 'failed' | 'manual_review',
                'message': str,
                'metadata': dict
            }
        """
        # 1. Validate UID format (exchange-specific)
        if not self._validate_uid_format(exchange, user_uid):
            return {
                'verified': False,
                'status': 'failed',
                'message': f'Invalid UID format for {exchange}',
                'metadata': {'error': 'invalid_format'}
            }

        # 2. Check rate limiting (3 attempts/hour)
        if not self._check_rate_limit(user_id, exchange):
            return {
                'verified': False,
                'status': 'failed',
                'message': 'Rate limit exceeded. Try again in 1 hour.',
                'metadata': {'error': 'rate_limit_exceeded'}
            }

        # 3. Fetch Apex broker credentials
        config = self._get_exchange_config(exchange)
        if not config:
            return {
                'verified': False,
                'status': 'manual_review',
                'message': 'Exchange API configuration not found. Contact support.',
                'metadata': {'error': 'missing_config'}
            }

        # 4. Call exchange-specific verification
        try:
            if exchange == 'binance':
                result = self.verify_subaccount_binance(user_uid, config)
            elif exchange == 'bybit':
                result = self.verify_subaccount_bybit(user_uid, config)
            elif exchange == 'okx':
                result = self.verify_subaccount_okx(user_uid, config)
            else:
                result = {'verified': False, 'message': 'Unsupported exchange'}

            # 5. Fraud detection (check reciprocal verification)
            if result.get('verified'):
                fraud_signals = self._detect_fraud(user_id, exchange, user_uid, ip_address)
                if fraud_signals['is_suspicious']:
                    result['status'] = 'manual_review'
                    result['verified'] = False
                    result['message'] = 'Verification flagged for manual review'
                    result['metadata']['fraud_signals'] = fraud_signals

            return result

        except Exception as e:
            logger.error("Verification error", extra={
                'exchange': exchange,
                'user_id': user_id,
                'error': str(e),
                'error_type': type(e).__name__
            })
            return {
                'verified': False,
                'status': 'failed',
                'message': f'Verification failed: {str(e)}',
                'metadata': {'error': str(e)}
            }

    def verify_subaccount_binance(self, user_uid: str, config: Dict) -> Dict:
        """
        Verify user UID against Binance Broker API.

        API: GET /sapi/v1/broker/subAccount
        Docs: https://binance-docs.github.io/apidocs/spot/en/#query-sub-account-list-broker

        Args:
            user_uid: 9-digit Binance sub-account UID
            config: {'broker_api_key_encrypted': str, 'broker_api_secret_encrypted': str, 'broker_uid': str}

        Returns:
            {'verified': bool, 'status': str, 'message': str, 'metadata': dict}
        """
        base_url = 'https://api.binance.com'
        endpoint = '/sapi/v1/broker/subAccount'
        timestamp = int(time.time() * 1000)

        # Decrypt credentials
        api_key = decrypt_secret(config['broker_api_key_encrypted'])
        api_secret = decrypt_secret(config['broker_api_secret_encrypted'])

        # Build query parameters (fetch all sub-accounts, paginate if needed)
        params = {
            'timestamp': timestamp,
            'limit': 500  # Max per request
        }

        # Generate HMAC SHA256 signature
        query_string = urlencode(sorted(params.items()))
        signature = hmac.new(
            api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        params['signature'] = signature

        # Request headers
        headers = {
            'X-MBX-APIKEY': api_key
        }

        try:
            response = requests.get(
                f"{base_url}{endpoint}",
                params=params,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()

                # Check if user_uid exists in subAccountList
                sub_accounts = data.get('subAccountList', [])
                is_verified = any(
                    str(account.get('subAccountId')) == str(user_uid)
                    for account in sub_accounts
                )

                if is_verified:
                    return {
                        'verified': True,
                        'status': 'verified',
                        'message': 'Binance sub-account verified successfully',
                        'metadata': {
                            'total_subaccounts': len(sub_accounts),
                            'verification_time': datetime.now().isoformat()
                        }
                    }
                else:
                    return {
                        'verified': False,
                        'status': 'failed',
                        'message': 'UID not found in Binance broker sub-accounts',
                        'metadata': {
                            'total_subaccounts': len(sub_accounts),
                            'error': 'uid_not_found'
                        }
                    }

            elif response.status_code == 429:
                return {
                    'verified': False,
                    'status': 'failed',
                    'message': 'Binance API rate limit exceeded. Retry in 1 minute.',
                    'metadata': {'error': 'api_rate_limit', 'http_code': 429}
                }

            else:
                error_data = response.json()
                return {
                    'verified': False,
                    'status': 'failed',
                    'message': f"Binance API error: {error_data.get('msg', 'Unknown error')}",
                    'metadata': {
                        'error': 'api_error',
                        'http_code': response.status_code,
                        'response': error_data
                    }
                }

        except requests.RequestException as e:
            return {
                'verified': False,
                'status': 'failed',
                'message': f'Network error: {str(e)}',
                'metadata': {'error': 'network_error'}
            }

    def verify_subaccount_bybit(self, user_uid: str, config: Dict) -> Dict:
        """
        Verify user UID against Bybit Affiliate API.

        API: GET /v5/affiliate/aff-user-list
        Docs: https://bybit-exchange.github.io/docs/v5/affiliate/aff-user-list

        Args:
            user_uid: 6-9 digit Bybit UID
            config: {'broker_api_key_encrypted': str, 'broker_api_secret_encrypted': str, 'broker_uid': str}

        Returns:
            {'verified': bool, 'status': str, 'message': str, 'metadata': dict}
        """
        base_url = 'https://api.bybit.com'
        endpoint = '/v5/affiliate/aff-user-list'
        timestamp = str(int(time.time() * 1000))
        recv_window = '5000'

        # Decrypt credentials
        api_key = decrypt_secret(config['broker_api_key_encrypted'])
        api_secret = decrypt_secret(config['broker_api_secret_encrypted'])

        # Build query parameters (cursor pagination)
        params = {
            'limit': '50'  # Check first 50 referrals (can paginate if needed)
        }
        query_string = urlencode(sorted(params.items()))

        # Generate HMAC SHA256 signature
        # Bybit signature format: timestamp + api_key + recv_window + query_string
        sign_payload = f"{timestamp}{api_key}{recv_window}{query_string}"
        signature = hmac.new(
            api_secret.encode('utf-8'),
            sign_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # Request headers
        headers = {
            'X-BAPI-API-KEY': api_key,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-SIGN': signature,
            'X-BAPI-RECV-WINDOW': recv_window
        }

        try:
            response = requests.get(
                f"{base_url}{endpoint}",
                params=params,
                headers=headers,
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                result = data.get('result', {})

                # Check if user_uid exists in referee list
                referee_list = result.get('list', [])
                is_verified = any(
                    str(referee.get('uid')) == str(user_uid)
                    for referee in referee_list
                )

                if is_verified:
                    return {
                        'verified': True,
                        'status': 'verified',
                        'message': 'Bybit affiliate sub-account verified successfully',
                        'metadata': {
                            'total_referees': len(referee_list),
                            'verification_time': datetime.now().isoformat()
                        }
                    }
                else:
                    # Check if pagination needed (nextCursor exists)
                    next_cursor = result.get('nextCursor')
                    if next_cursor:
                        # TODO: Implement pagination for large referee lists
                        return {
                            'verified': False,
                            'status': 'manual_review',
                            'message': 'UID not found in first 50 referees. Manual verification required.',
                            'metadata': {'error': 'pagination_needed', 'next_cursor': next_cursor}
                        }
                    else:
                        return {
                            'verified': False,
                            'status': 'failed',
                            'message': 'UID not found in Bybit affiliate referrals',
                            'metadata': {'error': 'uid_not_found'}
                        }

            else:
                error_data = response.json()
                return {
                    'verified': False,
                    'status': 'failed',
                    'message': f"Bybit API error: {error_data.get('retMsg', 'Unknown error')}",
                    'metadata': {
                        'error': 'api_error',
                        'http_code': response.status_code,
                        'response': error_data
                    }
                }

        except requests.RequestException as e:
            return {
                'verified': False,
                'status': 'failed',
                'message': f'Network error: {str(e)}',
                'metadata': {'error': 'network_error'}
            }

    def verify_subaccount_okx(self, user_uid: str, config: Dict) -> Dict:
        """
        Verify user UID against OKX Broker API.

        API: GET /api/v5/broker/dma/subaccount-info
        Docs: https://www.okx.com/docs-v5/en/#broker-api-get-subaccount-info

        NOTE: OKX requires IP whitelist - may need manual verification fallback

        Args:
            user_uid: OKX sub-account UID (format varies)
            config: {'broker_api_key_encrypted': str, 'broker_api_secret_encrypted': str, 'passphrase': str, 'broker_uid': str}

        Returns:
            {'verified': bool, 'status': str, 'message': str, 'metadata': dict}
        """
        # OKX broker API requires IP whitelisting - recommend manual verification
        # If implementing automated verification, follow OKX signature process

        return {
            'verified': False,
            'status': 'manual_review',
            'message': 'OKX verification requires IP whitelist. Please contact support for manual verification.',
            'metadata': {
                'error': 'ip_whitelist_required',
                'exchange': 'okx'
            }
        }

    def _validate_uid_format(self, exchange: str, user_uid: str) -> bool:
        """
        Validate UID format using exchange-specific regex patterns.

        Per research:
        - Binance: 9-digit numeric UID
        - Bybit: 6-9 digit numeric UID
        - OKX: Alphanumeric (varies)
        """
        patterns = {
            'binance': r'^\d{9}$',  # Exactly 9 digits
            'bybit': r'^\d{6,9}$',  # 6-9 digits
            'okx': r'^[\w-]{6,20}$'  # Alphanumeric, 6-20 chars
        }

        pattern = patterns.get(exchange)
        if not pattern:
            return False

        return bool(re.match(pattern, str(user_uid).strip()))

    def _check_rate_limit(self, user_id: str, exchange: str) -> bool:
        """
        Check if user has exceeded rate limit (3 attempts/hour).

        Uses verification_audit_log to count recent attempts.
        """
        one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()

        try:
            config = get_supabase_rest_client()
            url = f"{config['url']}/rest/v1/verification_audit_log?user_id=eq.{quote(str(user_id))}&exchange=eq.{quote(str(exchange))}&action=eq.verify_attempt&created_at=gte.{quote(one_hour_ago)}&select=count"

            response = requests.get(url, headers=config['headers'])
            response.raise_for_status()

            data = response.json()
            attempt_count = len(data) if isinstance(data, list) else 0

            return attempt_count < 3  # Allow 3 attempts per hour

        except Exception as e:
            logger.warning("Rate limit check failed, failing open", extra={
                'user_id': user_id,
                'exchange': exchange,
                'error': str(e)
            })
            return True  # Allow attempt on error (fail open)

    def _get_exchange_config(self, exchange: str) -> Optional[Dict]:
        """
        Fetch Apex broker credentials for given exchange.

        Returns config with encrypted API keys (decrypt before use).
        """
        try:
            config = get_supabase_rest_client()
            url = f"{config['url']}/rest/v1/exchange_configs?exchange=eq.{quote(str(exchange))}&is_active=eq.true&select=*&limit=1"

            response = requests.get(url, headers=config['headers'])
            response.raise_for_status()

            data = response.json()
            return data[0] if data else None

        except Exception as e:
            logger.error("Failed to fetch exchange config", extra={
                'exchange': exchange,
                'error': str(e)
            })
            return None

    def _detect_fraud(self, user_id: str, exchange: str, user_uid: str, ip_address: str) -> Dict:
        """
        Multi-layered fraud detection.

        Checks:
        1. Reciprocal verification: Has this UID been claimed by another user?
        2. IP abuse: Has this IP made multiple claims today?
        3. Rapid retry pattern: Multiple failed attempts in short time

        Returns:
            {'is_suspicious': bool, 'signals': list, 'confidence': float}
        """
        signals = []

        # 1. Check reciprocal verification
        try:
            config = get_supabase_rest_client()
            url = f"{config['url']}/rest/v1/user_exchange_accounts?user_uid=eq.{quote(str(user_uid))}&exchange=eq.{quote(str(exchange))}&user_id=neq.{quote(str(user_id))}&verification_status=eq.verified&select=user_id"

            response = requests.get(url, headers=config['headers'])
            if response.status_code == 200:
                data = response.json()
                if data:
                    signals.append('reciprocal_verification')  # UID already verified by another user
        except Exception as e:
            logger.warning("Fraud detection check failed (reciprocal)", extra={
                'user_id': user_id,
                'user_uid': user_uid,
                'exchange': exchange,
                'error': str(e)
            })

        # 2. Check IP abuse (>5 different UIDs from same IP today)
        if ip_address:
            try:
                today_start = datetime.now().replace(hour=0, minute=0, second=0).isoformat()
                url = f"{config['url']}/rest/v1/verification_audit_log?ip_address=eq.{quote(str(ip_address))}&created_at=gte.{quote(today_start)}&select=user_uid"

                response = requests.get(url, headers=config['headers'])
                if response.status_code == 200:
                    data = response.json()
                    unique_uids = set(log.get('user_uid') for log in data)
                    if len(unique_uids) > 5:
                        signals.append('ip_abuse')
            except Exception as e:
                logger.warning("Fraud detection check failed (IP abuse)", extra={
                    'user_id': user_id,
                    'ip_address': ip_address,
                    'error': str(e)
                })

        # 3. Check rapid retry pattern (>3 failed attempts in last 10 minutes)
        try:
            ten_min_ago = (datetime.now() - timedelta(minutes=10)).isoformat()
            url = f"{config['url']}/rest/v1/verification_audit_log?user_id=eq.{quote(str(user_id))}&action=eq.verify_failed&created_at=gte.{quote(ten_min_ago)}&select=count"

            response = requests.get(url, headers=config['headers'])
            if response.status_code == 200:
                data = response.json()
                if len(data) > 3:
                    signals.append('rapid_retry')
        except Exception as e:
            logger.warning("Fraud detection check failed (rapid retry)", extra={
                'user_id': user_id,
                'exchange': exchange,
                'error': str(e)
            })

        # Calculate confidence score (0-1)
        confidence = min(len(signals) * 0.4, 1.0)  # Each signal = 40% confidence

        return {
            'is_suspicious': len(signals) > 0,
            'signals': signals,
            'confidence': confidence
        }

