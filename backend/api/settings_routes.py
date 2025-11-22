"""
Settings Routes - User Profile, API Keys, and Preferences Management
Includes Vault Service integration for secure API key storage
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import logging

from ..core.auth import get_current_user
from ..core.rest_client import supabase_client
from ..services.vault import encrypt_secret, decrypt_secret

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/user", tags=["settings"])

# ==================== Request/Response Models ====================

class UserProfile(BaseModel):
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str

class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)

class APIKeyMetadata(BaseModel):
    id: str
    exchange: str
    label: Optional[str] = None
    created_at: str
    last_used_at: Optional[str] = None

class CreateAPIKeyRequest(BaseModel):
    exchange: str = Field(..., min_length=1, max_length=50)
    api_key: str = Field(..., min_length=1)
    api_secret: str = Field(..., min_length=1)
    label: Optional[str] = Field(None, max_length=100)

class UserPreferences(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = False
    language: str = "en"
    theme: str = "dark"

class UpdatePreferencesRequest(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    language: Optional[str] = Field(None, pattern="^(en|vi)$")
    theme: Optional[str] = Field(None, pattern="^(dark|light)$")

# ==================== Profile Endpoints ====================

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(user = Depends(get_current_user)):
    """Get current user's profile information"""
    try:
        # Fetch user from Supabase auth
        response = supabase_client.table("users").select("*").eq("id", user["id"]).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = response.data[0]
        return UserProfile(
            email=user_data.get("email", ""),
            display_name=user_data.get("display_name"),
            avatar_url=user_data.get("avatar_url"),
            created_at=user_data.get("created_at", datetime.now().isoformat())
        )
    except Exception as e:
        logger.error(f"Failed to fetch user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    data: UpdateProfileRequest,
    user = Depends(get_current_user)
):
    """Update user profile (display_name, avatar_url)"""
    try:
        update_data = {}
        if data.display_name is not None:
            update_data["display_name"] = data.display_name
        if data.avatar_url is not None:
            update_data["avatar_url"] = data.avatar_url
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Update in database
        response = supabase_client.table("users")\
            .update(update_data)\
            .eq("id", user["id"])\
            .execute()
        
        # Return updated profile
        return await get_user_profile(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

# ==================== API Keys Endpoints ====================

@router.get("/api-keys", response_model=List[APIKeyMetadata])
async def get_api_keys(user = Depends(get_current_user)):
    """Get all API keys for current user (metadata only, not actual keys)"""
    try:
        response = supabase_client.table("api_keys")\
            .select("id, exchange, label, created_at, last_used_at")\
            .eq("user_id", user["id"])\
            .order("created_at", desc=True)\
            .execute()
        
        return [APIKeyMetadata(**key) for key in (response.data or [])]
    except Exception as e:
        logger.error(f"Failed to fetch API keys: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch API keys")

@router.post("/api-keys", response_model=dict)
async def create_api_key(
    data: CreateAPIKeyRequest,
    user = Depends(get_current_user)
):
    """Create new API key (encrypts using Vault Service)"""
    try:
        # Encrypt the API key and secret using Vault
        encrypted_key = encrypt_secret(data.api_key)
        encrypted_secret = encrypt_secret(data.api_secret)
        
        # Store in database
        response = supabase_client.table("api_keys").insert({
            "user_id": user["id"],
            "exchange": data.exchange,
            "encrypted_api_key": encrypted_key,
            "encrypted_api_secret": encrypted_secret,
            "label": data.label
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create API key")
        
        return {
            "success": True,
            "key_id": response.data[0]["id"],
            "message": "API key created and encrypted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create API key: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create API key: {str(e)}")

@router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: str, user = Depends(get_current_user)):
    """Delete an API key"""
    try:
        # Verify ownership
        check_response = supabase_client.table("api_keys")\
            .select("id")\
            .eq("id", key_id)\
            .eq("user_id", user["id"])\
            .execute()
        
        if not check_response.data:
            raise HTTPException(status_code=404, detail="API key not found")
        
        # Delete
        supabase_client.table("api_keys").delete().eq("id", key_id).execute()
        
        return {"success": True, "message": "API key deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete API key: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete API key")

# ==================== Preferences Endpoints ====================

@router.get("/preferences", response_model=UserPreferences)
async def get_preferences(user = Depends(get_current_user)):
    """Get user preferences"""
    try:
        response = supabase_client.table("user_preferences")\
            .select("*")\
            .eq("user_id", user["id"])\
            .execute()
        
        if response.data:
            prefs = response.data[0]
            return UserPreferences(
                email_notifications=prefs.get("email_notifications", True),
                push_notifications=prefs.get("push_notifications", False),
                language=prefs.get("language", "en"),
                theme=prefs.get("theme", "dark")
            )
        else:
            # Return defaults if no preferences exist
            return UserPreferences()
    except Exception as e:
        logger.error(f"Failed to fetch preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch preferences")

@router.put("/preferences", response_model=UserPreferences)
async def update_preferences(
    data: UpdatePreferencesRequest,
    user = Depends(get_current_user)
):
    """Update user preferences"""
    try:
        # Check if preferences exist
        check_response = supabase_client.table("user_preferences")\
            .select("user_id")\
            .eq("user_id", user["id"])\
            .execute()
        
        update_data = {}
        if data.email_notifications is not None:
            update_data["email_notifications"] = data.email_notifications
        if data.push_notifications is not None:
            update_data["push_notifications"] = data.push_notifications
        if data.language is not None:
            update_data["language"] = data.language
        if data.theme is not None:
            update_data["theme"] = data.theme
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        if check_response.data:
            # Update existing
            supabase_client.table("user_preferences")\
                .update(update_data)\
                .eq("user_id", user["id"])\
                .execute()
        else:
            # Insert new
            update_data["user_id"] = user["id"]
            supabase_client.table("user_preferences").insert(update_data).execute()
        
        # Return updated preferences
        return await get_preferences(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")
