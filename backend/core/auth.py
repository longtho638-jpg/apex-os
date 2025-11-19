"""
Authentication middleware using Supabase JWT
Protects API endpoints and validates user tokens
"""

from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
import os
from datetime import datetime, timedelta


# JWT Configuration
JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

security = HTTPBearer()


def create_token(user_id: str, email: str) -> str:
    """
    Create JWT token for user
    
    Args:
        user_id: User UUID
        email: User email
    
    Returns:
        JWT token string
    """
    payload = {
        'sub': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    Verify JWT token from Authorization header
    
    Args:
        credentials: Bearer token from header
    
    Returns:
        Decoded token payload with user info
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if token expired
        exp = payload.get('exp')
        if exp and datetime.utcfromtimestamp(exp) < datetime.utcnow():
            raise HTTPException(status_code=401, detail='Token expired')
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Invalid token')
    except Exception as e:
        raise HTTPException(status_code=401, detail=f'Authentication failed: {str(e)}')


def get_current_user(token_payload: dict = Depends(verify_token)) -> dict:
    """
    Get current authenticated user from token
    
    Usage in routes:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(get_current_user)):
            user_id = user['sub']
            email = user['email']
    
    Args:
        token_payload: Decoded JWT payload
    
    Returns:
        User info dict with 'sub' (user_id) and 'email'
    """
    return {
        'user_id': token_payload['sub'],
        'email': token_payload['email']
    }


def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Security(security, auto_error=False)) -> Optional[dict]:
    """
    Optional authentication - doesn't raise error if no token
    Use for endpoints that work with or without auth
    
    Usage:
        @router.get("/public-or-private")
        async def flexible_route(user: Optional[dict] = Depends(optional_auth)):
            if user:
                # User is authenticated
                user_id = user['user_id']
            else:
                # User is anonymous
                pass
    """
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials)
    except:
        return None
