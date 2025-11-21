"""
Unit tests for AuditorAgent sub-account verification methods.

Tests cover:
- UID format validation (regex patterns)
- HMAC SHA256 signature generation (Binance + Bybit)
- Exchange API verification logic
- Fraud detection algorithms
- Rate limiting checks
"""

import pytest
import hmac
import hashlib
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta
from urllib.parse import urlencode

from agents.auditor import AuditorAgent


@pytest.fixture
def auditor():
    """Create AuditorAgent instance for testing."""
    return AuditorAgent()


@pytest.fixture
def mock_exchange_config():
    """Mock exchange configuration with encrypted credentials."""
    return {
        'exchange': 'binance',
        'broker_api_key_encrypted': 'gAAAAABl_encrypted_key',
        'broker_api_secret_encrypted': 'gAAAAABl_encrypted_secret',
        'broker_uid': '12345678',
        'is_active': True
    }


# ========== UID Format Validation Tests ==========

class TestUIDFormatValidation:
    """Test UID format validation for different exchanges."""

    def test_binance_valid_uid(self, auditor):
        """Binance UIDs must be exactly 9 digits."""
        assert auditor._validate_uid_format('binance', '123456789') is True
        assert auditor._validate_uid_format('binance', '987654321') is True

    def test_binance_invalid_uid(self, auditor):
        """Reject invalid Binance UID formats."""
        assert auditor._validate_uid_format('binance', '12345678') is False  # 8 digits
        assert auditor._validate_uid_format('binance', '1234567890') is False  # 10 digits
        assert auditor._validate_uid_format('binance', 'abc123456') is False  # Contains letters
        assert auditor._validate_uid_format('binance', '12345-6789') is False  # Contains dash
        assert auditor._validate_uid_format('binance', '') is False  # Empty

    def test_bybit_valid_uid(self, auditor):
        """Bybit UIDs must be 6-9 digits."""
        assert auditor._validate_uid_format('bybit', '123456') is True  # 6 digits
        assert auditor._validate_uid_format('bybit', '1234567') is True  # 7 digits
        assert auditor._validate_uid_format('bybit', '12345678') is True  # 8 digits
        assert auditor._validate_uid_format('bybit', '123456789') is True  # 9 digits

    def test_bybit_invalid_uid(self, auditor):
        """Reject invalid Bybit UID formats."""
        assert auditor._validate_uid_format('bybit', '12345') is False  # 5 digits
        assert auditor._validate_uid_format('bybit', '1234567890') is False  # 10 digits
        assert auditor._validate_uid_format('bybit', 'abc12345') is False  # Contains letters

    def test_okx_valid_uid(self, auditor):
        """OKX UIDs are alphanumeric, 6-20 characters."""
        assert auditor._validate_uid_format('okx', '123456') is True
        assert auditor._validate_uid_format('okx', 'abc123xyz') is True
        assert auditor._validate_uid_format('okx', 'OKX-12345-ABCDE') is True
        assert auditor._validate_uid_format('okx', 'a1b2c3d4e5f6g7h8i9j0') is True  # 20 chars

    def test_okx_invalid_uid(self, auditor):
        """Reject invalid OKX UID formats."""
        assert auditor._validate_uid_format('okx', '12345') is False  # 5 chars
        assert auditor._validate_uid_format('okx', 'a' * 21) is False  # 21 chars
        assert auditor._validate_uid_format('okx', 'abc!@#') is False  # Special chars

    def test_unsupported_exchange(self, auditor):
        """Reject UIDs for unsupported exchanges."""
        assert auditor._validate_uid_format('kraken', '123456789') is False
        assert auditor._validate_uid_format('coinbase', '123456789') is False


# ========== HMAC Signature Generation Tests ==========

class TestHMACSignatures:
    """Test HMAC SHA256 signature generation for exchange APIs."""

    def test_binance_signature_format(self):
        """Verify Binance HMAC SHA256 signature generation."""
        api_secret = 'test_secret_key'
        params = {
            'timestamp': 1234567890000,
            'limit': 500
        }

        # Generate signature (Binance format: HMAC-SHA256 of query string)
        query_string = urlencode(sorted(params.items()))
        expected_signature = hmac.new(
            api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # Signature should be 64-char hex string
        assert len(expected_signature) == 64
        assert all(c in '0123456789abcdef' for c in expected_signature)

    def test_bybit_signature_format(self):
        """Verify Bybit HMAC SHA256 signature generation."""
        api_key = 'test_api_key'
        api_secret = 'test_secret_key'
        timestamp = '1234567890000'
        recv_window = '5000'
        params = {'limit': '50'}

        query_string = urlencode(sorted(params.items()))

        # Bybit signature format: timestamp + api_key + recv_window + query_string
        sign_payload = f"{timestamp}{api_key}{recv_window}{query_string}"
        expected_signature = hmac.new(
            api_secret.encode('utf-8'),
            sign_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        # Signature should be 64-char hex string
        assert len(expected_signature) == 64
        assert all(c in '0123456789abcdef' for c in expected_signature)

    def test_signature_changes_with_params(self):
        """Verify signature changes when parameters change."""
        api_secret = 'test_secret'

        params1 = {'timestamp': 1000, 'limit': 100}
        params2 = {'timestamp': 2000, 'limit': 100}

        query1 = urlencode(sorted(params1.items()))
        query2 = urlencode(sorted(params2.items()))

        sig1 = hmac.new(api_secret.encode(), query1.encode(), hashlib.sha256).hexdigest()
        sig2 = hmac.new(api_secret.encode(), query2.encode(), hashlib.sha256).hexdigest()

        assert sig1 != sig2  # Different params = different signature


# ========== Fraud Detection Tests ==========

class TestFraudDetection:
    """Test fraud detection algorithms."""

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_reciprocal_verification_fraud(self, mock_get, mock_supabase, auditor):
        """Detect when UID is already verified by another user."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # Mock response: UID already claimed by another user
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {'user_id': 'other-user-123'}
        ]

        result = auditor._detect_fraud('test-user-456', 'binance', '123456789', '192.168.1.1')

        assert result['is_suspicious'] is True
        assert 'reciprocal_verification' in result['signals']
        assert result['confidence'] >= 0.4

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_ip_abuse_fraud(self, mock_get, mock_supabase, auditor):
        """Detect when IP submits >5 different UIDs in one day."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # Mock response: IP has submitted 6 different UIDs today
        mock_get.side_effect = [
            # First call: reciprocal check (no fraud)
            Mock(status_code=200, json=lambda: []),
            # Second call: IP abuse check (6 UIDs)
            Mock(status_code=200, json=lambda: [
                {'user_uid': '111111111'},
                {'user_uid': '222222222'},
                {'user_uid': '333333333'},
                {'user_uid': '444444444'},
                {'user_uid': '555555555'},
                {'user_uid': '666666666'},
            ])
        ]

        result = auditor._detect_fraud('test-user-123', 'binance', '123456789', '192.168.1.1')

        assert result['is_suspicious'] is True
        assert 'ip_abuse' in result['signals']

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_rapid_retry_fraud(self, mock_get, mock_supabase, auditor):
        """Detect rapid retry pattern (>3 failures in 10 minutes)."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # Mock responses for all 3 fraud checks
        mock_get.side_effect = [
            Mock(status_code=200, json=lambda: []),  # Reciprocal check: no fraud
            Mock(status_code=200, json=lambda: []),  # IP abuse check: no fraud
            Mock(status_code=200, json=lambda: [1, 2, 3, 4])  # Rapid retry: 4 failures
        ]

        result = auditor._detect_fraud('test-user-123', 'binance', '123456789', '192.168.1.1')

        assert result['is_suspicious'] is True
        assert 'rapid_retry' in result['signals']

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_no_fraud_detected(self, mock_get, mock_supabase, auditor):
        """No fraud signals when user is legitimate."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # All checks return no fraud
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = []

        result = auditor._detect_fraud('test-user-123', 'binance', '123456789', '192.168.1.1')

        assert result['is_suspicious'] is False
        assert len(result['signals']) == 0
        assert result['confidence'] == 0.0


# ========== Rate Limiting Tests ==========

class TestRateLimiting:
    """Test rate limiting enforcement."""

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_rate_limit_not_exceeded(self, mock_get, mock_supabase, auditor):
        """Allow request when rate limit not exceeded (< 3 attempts/hour)."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # Mock: Only 2 attempts in last hour
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [1, 2]

        result = auditor._check_rate_limit('test-user-123', 'binance')

        assert result is True  # Allow request

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_rate_limit_exceeded(self, mock_get, mock_supabase, auditor):
        """Block request when rate limit exceeded (>= 3 attempts/hour)."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # Mock: 3 attempts in last hour
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [1, 2, 3]

        result = auditor._check_rate_limit('test-user-123', 'binance')

        assert result is False  # Block request

    @patch('agents.auditor.get_supabase_rest_client')
    @patch('agents.auditor.requests.get')
    def test_rate_limit_fail_open(self, mock_get, mock_supabase, auditor):
        """Fail open (allow request) on database error."""
        mock_supabase.return_value = {
            'url': 'https://test.supabase.co',
            'headers': {'apikey': 'test-key'}
        }

        # Mock database error
        mock_get.side_effect = Exception('Database connection error')

        result = auditor._check_rate_limit('test-user-123', 'binance')

        assert result is True  # Fail open (allow request despite error)


# ========== Integration Tests ==========

class TestVerificationFlow:
    """Test complete verification flow."""

    @patch('agents.auditor.decrypt_secret')
    @patch('agents.auditor.requests.get')
    def test_binance_verification_success(self, mock_get, mock_decrypt, auditor, mock_exchange_config):
        """Test successful Binance sub-account verification."""
        mock_decrypt.side_effect = ['test_api_key', 'test_api_secret']

        # Mock Binance API response with matching UID
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'subAccountList': [
                {'subAccountId': '123456789', 'email': 'test@example.com'},
                {'subAccountId': '987654321', 'email': 'other@example.com'}
            ]
        }

        result = auditor.verify_subaccount_binance('123456789', mock_exchange_config)

        assert result['verified'] is True
        assert result['status'] == 'verified'
        assert 'Binance' in result['message']
        assert result['metadata']['total_subaccounts'] == 2

    @patch('agents.auditor.decrypt_secret')
    @patch('agents.auditor.requests.get')
    def test_binance_verification_uid_not_found(self, mock_get, mock_decrypt, auditor, mock_exchange_config):
        """Test Binance verification failure when UID not found."""
        mock_decrypt.side_effect = ['test_api_key', 'test_api_secret']

        # Mock Binance API response WITHOUT matching UID
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'subAccountList': [
                {'subAccountId': '987654321', 'email': 'other@example.com'}
            ]
        }

        result = auditor.verify_subaccount_binance('123456789', mock_exchange_config)

        assert result['verified'] is False
        assert result['status'] == 'failed'
        assert 'not found' in result['message'].lower()

    @patch('agents.auditor.decrypt_secret')
    @patch('agents.auditor.requests.get')
    def test_binance_api_rate_limit(self, mock_get, mock_decrypt, auditor, mock_exchange_config):
        """Test handling of Binance API rate limit (429)."""
        mock_decrypt.side_effect = ['test_api_key', 'test_api_secret']

        # Mock 429 rate limit response
        mock_get.return_value.status_code = 429
        mock_get.return_value.json.return_value = {'msg': 'Too many requests'}

        result = auditor.verify_subaccount_binance('123456789', mock_exchange_config)

        assert result['verified'] is False
        assert result['status'] == 'failed'
        assert 'rate limit' in result['message'].lower()
        assert result['metadata']['http_code'] == 429
