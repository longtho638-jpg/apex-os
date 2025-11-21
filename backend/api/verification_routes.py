"""
User API Routes for Sub-Account Verification
Rate limited: 3 attempts/hour per user

Endpoints:
- POST /api/v1/verify-subaccount - Submit UID for verification
- GET /api/v1/verification-status - Get user's verification status
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from core.auth import get_current_user  # Existing user auth
from agents.auditor import AuditorAgent
from core.rest_client import get_supabase_rest_client
import requests

router = APIRouter()

# Initialize AuditorAgent
auditor = AuditorAgent()

# ========== Pydantic Models ==========

class SubAccountVerificationRequest(BaseModel):
    exchange: str = Field(..., pattern='^(binance|bybit|okx)$')
    user_uid: str = Field(..., min_length=6, max_length=20)

# ========== Endpoints ==========

@router.post("/verify-subaccount")
async def verify_subaccount(
    verification_request: SubAccountVerificationRequest,
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """
    Submit sub-account UID for verification.
    Rate limited: 3 attempts/hour.

    Example:
    POST /api/v1/verify-subaccount
    {
        "exchange": "binance",
        "user_uid": "123456789"
    }

    Response:
    {
        "verified": true,
        "status": "verified",
        "message": "Binance sub-account verified successfully"
    }
    """
    user_id = current_user['id']
    exchange = verification_request.exchange
    user_uid = verification_request.user_uid.strip()
    ip_address = request.client.host if request else None

    try:
        # Check if already verified
        supabase_config = get_supabase_rest_client()
        existing_url = f"{supabase_config['url']}/rest/v1/user_exchange_accounts?user_id=eq.{user_id}&exchange=eq.{exchange}&select=*"
        existing_response = requests.get(existing_url, headers=supabase_config['headers'])

        if existing_response.status_code == 200:
            existing_data = existing_response.json()
            if existing_data:
                existing_account = existing_data[0]
                if existing_account.get('verification_status') == 'verified':
                    return {
                        'verified': True,
                        'status': 'verified',
                        'message': f'Already verified for {exchange}',
                        'verified_at': existing_account.get('verified_at')
                    }

        # Log verification attempt
        audit_payload = {
            'user_id': user_id,
            'exchange': exchange,
            'user_uid': user_uid,
            'action': 'verify_attempt',
            'ip_address': ip_address,
            'user_agent': request.headers.get('user-agent') if request else None
        }
        audit_url = f"{supabase_config['url']}/rest/v1/verification_audit_log"
        requests.post(audit_url, headers=supabase_config['headers'], json=audit_payload)

        # Call AuditorAgent verification
        result = auditor.verify_subaccount_via_api(user_id, exchange, user_uid, ip_address)

        # Upsert user_exchange_accounts table
        account_payload = {
            'user_id': user_id,
            'exchange': exchange,
            'user_uid': user_uid,
            'verification_status': result['status'],
            'verification_method': 'api',
            'verification_metadata': result.get('metadata', {}),
            'verified_at': datetime.now().isoformat() if result['verified'] else None,
            'failed_reason': result.get('message') if not result['verified'] else None,
            'retry_count': existing_data[0].get('retry_count', 0) + 1 if existing_data else 1,
            'updated_at': datetime.now().isoformat()
        }

        # Use upsert (INSERT or UPDATE on conflict)
        upsert_url = f"{supabase_config['url']}/rest/v1/user_exchange_accounts?on_conflict=user_id,exchange"
        requests.post(upsert_url, headers={**supabase_config['headers'], 'Prefer': 'resolution=merge-duplicates'}, json=account_payload)

        # Log verification result
        result_action = 'verify_success' if result['verified'] else 'verify_failed'
        if result['status'] == 'manual_review':
            result_action = 'fraud_detected'

        result_audit_payload = {
            'user_id': user_id,
            'exchange': exchange,
            'user_uid': user_uid,
            'action': result_action,
            'verification_result': result,
            'ip_address': ip_address
        }
        requests.post(audit_url, headers=supabase_config['headers'], json=result_audit_payload)

        # Trigger GuardianAgent alert if fraud detected
        if result['status'] == 'manual_review' and result.get('metadata', {}).get('fraud_signals'):
            alert_payload = {
                'user_id': user_id,
                'level': 'warning',
                'message': f'Verification flagged for manual review: {exchange} UID {user_uid}',
                'metadata': result.get('metadata')
            }
            alert_url = f"{supabase_config['url']}/rest/v1/guardian_alerts"
            requests.post(alert_url, headers=supabase_config['headers'], json=alert_payload)

        return {
            'verified': result['verified'],
            'status': result['status'],
            'message': result['message'],
            'metadata': result.get('metadata', {})
        }

    except Exception as e:
        print(f"Verification endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@router.get("/verification-status")
async def get_verification_status(
    exchange: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's verification status for all exchanges or specific exchange.

    Example:
    GET /api/v1/verification-status?exchange=binance

    Response:
    {
        "verifications": [
            {
                "exchange": "binance",
                "user_uid": "123456789",
                "verification_status": "verified",
                "verified_at": "2025-11-21T10:00:00Z"
            }
        ]
    }
    """
    user_id = current_user['id']

    try:
        supabase_config = get_supabase_rest_client()

        # Build query
        if exchange:
            url = f"{supabase_config['url']}/rest/v1/user_exchange_accounts?user_id=eq.{user_id}&exchange=eq.{exchange}&select=*"
        else:
            url = f"{supabase_config['url']}/rest/v1/user_exchange_accounts?user_id=eq.{user_id}&select=*"

        response = requests.get(url, headers=supabase_config['headers'])
        response.raise_for_status()

        verifications = response.json()

        # Mask sensitive fields
        for v in verifications:
            v.pop('verification_metadata', None)  # Remove internal metadata

        return {
            'verifications': verifications,
            'total': len(verifications)
        }

    except Exception as e:
        print(f"Error fetching verification status: {e}")
        raise HTTPException(status_code=500, detail=str(e))
