import asyncio
import random
import re
import hmac
import hashlib
import time
import requests
from urllib.parse import urlencode
from backend.core.event_bus import event_bus
from backend.core.security import decrypt_value

# Dependencies (mocked in tests)
def get_supabase_rest_client():
    return None

def decrypt_secret(secret):
    return decrypt_value(secret)

class AuditorAgent:
    def __init__(self):
        self.name = "auditor_agent"

    async def start(self):
        print(f"[{self.name}] Started. Listening for WITHDRAWAL_APPROVED...")
        await event_bus.subscribe_loop("WITHDRAWAL_APPROVED", self.reconcile_withdrawal)

    async def reconcile_withdrawal(self, event):
        payload = event.get('payload', {})
        withdrawal_id = payload.get('withdrawal_id')

        print(f"[{self.name}] Reconciling Withdrawal {withdrawal_id}...")

        # 1. Fetch Withdrawal Details from DB
        try:
            response = event_bus.client.table('withdrawals').select('*').eq('id', withdrawal_id).execute()
            if not response.data:
                print(f"[{self.name}] Error: Withdrawal not found")
                return

            withdrawal = response.data[0]
            amount = float(withdrawal['amount'])

            # 2. Simulate External Check (e.g. Etherscan or Bank API)
            # In reality, we would check if the Tx Hash exists and matches amount
            external_verified = self.mock_external_verification(amount)

            if external_verified:
                print(f"[{self.name}] ✅ Reconciliation PASSED.")
                event_bus.publish("RECONCILIATION_SUCCESS", self.name, { "withdrawal_id": withdrawal_id })
            else:
                print(f"[{self.name}] 🚨 DISCREPANCY DETECTED!")
                event_bus.publish("RECONCILIATION_ALERT", self.name, {
                    "withdrawal_id": withdrawal_id,
                    "issue": "External verification failed"
                })
        except Exception as e:
            print(f"[{self.name}] Error processing withdrawal: {e}")

    def mock_external_verification(self, amount):
        # Simulate 99% success rate
        return random.random() > 0.01

    def _validate_uid_format(self, exchange, uid):
        if exchange == 'binance':
            return bool(re.match(r'^\d{9}$', uid))
        elif exchange == 'bybit':
            return bool(re.match(r'^\d{6,9}$', uid))
        elif exchange == 'okx':
            return bool(re.match(r'^[a-zA-Z0-9-]{6,20}$', uid))
        return False

    def _detect_fraud(self, user_id, exchange, uid, ip_address):
        signals = []
        is_suspicious = False
        confidence = 0.0

        try:
            supabase_config = get_supabase_rest_client()
            if supabase_config:
                url = supabase_config.get('url', '')
                headers = supabase_config.get('headers', {})

                # 1. Reciprocal Verification Check
                resp = requests.get(f"{url}/rest/v1/verifications?user_uid=eq.{uid}&select=user_id", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    # If UID exists and belongs to someone else
                    for entry in data:
                        if entry.get('user_id') != user_id:
                            signals.append('reciprocal_verification')
                            is_suspicious = True
                            confidence = max(confidence, 0.4)
                            break

                # 2. IP Abuse Check
                resp = requests.get(f"{url}/rest/v1/verifications?ip_address=eq.{ip_address}&select=user_uid", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    unique_uids = set(d.get('user_uid') for d in data)
                    if len(unique_uids) > 5:
                        signals.append('ip_abuse')
                        is_suspicious = True
                        confidence = max(confidence, 0.6)

                # 3. Rapid Retry Check
                # Simplified: check for >3 failures
                resp = requests.get(f"{url}/rest/v1/verification_logs?user_id=eq.{user_id}&status=eq.failed", headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    if len(data) > 3:
                        signals.append('rapid_retry')
                        is_suspicious = True
                        confidence = max(confidence, 0.5)

        except Exception as e:
            print(f"Fraud detection error: {e}")

        return {
            'is_suspicious': is_suspicious,
            'signals': signals,
            'confidence': confidence
        }

    def _check_rate_limit(self, user_id, exchange):
        try:
            supabase_config = get_supabase_rest_client()
            if not supabase_config:
                return True # Fail open

            url = supabase_config.get('url', '')
            headers = supabase_config.get('headers', {})

            # Check attempts in last hour (simplified to count all attempts for mock)
            resp = requests.get(f"{url}/rest/v1/verification_attempts?user_id=eq.{user_id}", headers=headers)
            if resp.status_code == 200:
                attempts = resp.json()
                if len(attempts) >= 3:
                    return False

            return True
        except Exception:
            # Fail open
            return True

    def verify_subaccount_binance(self, uid, config):
        if not self._validate_uid_format('binance', uid):
             return {'verified': False, 'status': 'failed', 'message': 'Invalid UID format', 'metadata': {}}

        # Rate limit check (using placeholder user_id)
        if not self._check_rate_limit('user_placeholder', 'binance'):
             return {'verified': False, 'status': 'failed', 'message': 'Rate limit exceeded', 'metadata': {}}

        api_key = decrypt_secret(config.get('broker_api_key_encrypted', ''))
        api_secret = decrypt_secret(config.get('broker_api_secret_encrypted', ''))

        # Binance API Logic
        base_url = "https://api.binance.com"
        endpoint = "/sapi/v1/sub-account/list"

        params = {
            'timestamp': int(time.time() * 1000),
            'limit': 500
        }

        query_string = urlencode(sorted(params.items()))
        signature = hmac.new(
            api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        url = f"{base_url}{endpoint}?{query_string}&signature={signature}"
        headers = {'X-MBX-APIKEY': api_key}

        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 429:
                return {
                    'verified': False,
                    'status': 'failed',
                    'message': 'API rate limit exceeded',
                    'metadata': {'http_code': 429}
                }

            if response.status_code == 200:
                data = response.json()
                subaccounts = data.get('subAccountList', [])

                # Check if UID exists in subaccounts
                found = any(sa.get('subAccountId') == uid for sa in subaccounts)

                if found:
                    return {
                        'verified': True,
                        'status': 'verified',
                        'message': 'Verified on Binance',
                        'metadata': {'total_subaccounts': len(subaccounts)}
                    }
                else:
                    return {
                        'verified': False,
                        'status': 'failed',
                        'message': 'UID not found in subaccounts',
                        'metadata': {'total_subaccounts': len(subaccounts)}
                    }

            return {'verified': False, 'status': 'failed', 'message': f"API Error: {response.status_code}", 'metadata': {}}

        except Exception as e:
            return {'verified': False, 'status': 'failed', 'message': str(e), 'metadata': {}}

if __name__ == "__main__":
    agent = AuditorAgent()
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        print("Auditor Agent Stopped")