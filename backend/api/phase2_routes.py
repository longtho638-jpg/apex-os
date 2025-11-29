"""
Wolf Pack, Referral, and Payment API endpoints
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from core.database import db

router = APIRouter()

# ============== WOLF PACK ENDPOINTS ==============

@router.get("/wolf-pack/status")
async def get_wolf_pack_status(user_id: str):
    """
    Get Wolf Pack community status for a user.
    
    Returns pack membership info, collaboration metrics, and shared rebates.
    """
    try:
        # Query wolf_pack_members table
        result = db.query(
            "wolf_pack_members",
            filters={"user_id": user_id}
        )
        
        if not result or len(result) == 0:
            # User not in any pack
            return {
                "in_pack": False,
                "pack_id": None,
                "member_count": 0,
                "total_volume": 0,
                "shared_rebates": 0,
                "members": [],
                "invite_link": f"https://apexrebate.com/invite/{user_id}"
            }
        
        # User is in a pack
        pack_data = result[0]
        pack_id = pack_data["pack_id"]
        
        # Get all pack members
        all_members = db.query(
            "wolf_pack_members",
            filters={"pack_id": pack_id}
        )
        
        # Calculate pack metrics
        total_volume = sum(m.get("contribution", 0) for m in all_members)
        shared_rebates = total_volume * 0.0002  # 0.02% rebate rate
        
        return {
            "in_pack": True,
            "pack_id": pack_id,
            "member_count": len(all_members),
            "total_volume": total_volume,
            "shared_rebates": shared_rebates,
            "members": [
                {
                    "user_id": m["user_id"],
                    "role": m.get("role", "member"),
                    "contribution": m.get("contribution", 0),
                    "joined_at": m.get("joined_at", "")
                }
                for m in all_members
            ],
            "invite_link": f"https://apexrebate.com/invite/{pack_id}"
        }
        
    except Exception as e:
        # Return default data if database query fails
        return {
            "in_pack": False,
            "pack_id": None,
            "member_count": 0,
            "total_volume": 0,
            "shared_rebates": 0,
            "members": [],
            "invite_link": f"https://apexrebate.com/invite/{user_id}"
        }


# ============== REFERRAL ENDPOINTS ==============
# DEPRECATED: Use Next.js API /api/v1/referrals/stats instead.
# This Python implementation is kept for legacy support only.
# The Single Source of Truth is the 'referral_codes' table in Supabase.

@router.get("/referral/stats")
async def get_referral_stats(user_id: str):
    """
    Get referral program statistics for a user.
    
    Returns referral link, total referrals, and commission earned.
    """
    try:
        # Query user_referrals table
        referrals = db.query(
            "user_referrals",
            filters={"referrer_id": user_id}
        )
        
        # Calculate commission (10% of referee's trading fees)
        total_commission = 0
        referral_list = []
        
        for ref in referrals:
            referee_volume = ref.get("referee_volume", 0)
            commission = referee_volume * 0.001 * 0.1  # 10% of 0.1% fee
            total_commission += commission
            
            referral_list.append({
                "referee_id": ref.get("referee_id", ""),
                "signup_date": ref.get("created_at", ""),
                "volume": referee_volume,
                "commission": commission,
                "status": ref.get("status", "active")
            })
        
        # Generate unique referral code
        referral_code = user_id[:8].upper()
        
        return {
            "referral_link": f"https://apexrebate.com/signup?ref={referral_code}",
            "referral_code": referral_code,
            "total_referrals": len(referrals),
            "total_commission": total_commission,
            "this_month_commission": total_commission * 0.3,  # Mock: 30% this month
            "referrals": referral_list
        }
        
    except Exception as e:
        # Return default data
        referral_code = user_id[:8].upper() if user_id else "DEMO1234"
        return {
            "referral_link": f"https://apexrebate.com/signup?ref={referral_code}",
            "referral_code": referral_code,
            "total_referrals": 0,
            "total_commission": 0,
            "this_month_commission": 0,
            "referrals": []
        }


# ============== PAYMENT/BILLING ENDPOINTS ==============

@router.get("/billing/subscription")
async def get_subscription_info(user_id: str):
    """
    Get user subscription and billing information.
    
    Returns current plan, usage metrics, payment history.
    """
    try:
        # Get user tier from users table
        user_data = db.query(
            "users",
            filters={"id": user_id}
        )
        
        if not user_data or len(user_data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        tier = user_data[0].get("tier", "free")
        
        # Get payment history
        payments = db.query(
            "payment_history",
            filters={"user_id": user_id}
        )
        
        # Calculate usage metrics
        usage_data = {
            "api_calls": 1250,  # Mock data
            "api_limit": 5000 if tier == "free" else 50000,
            "storage_gb": 0.5,
            "storage_limit": 1 if tier == "free" else 100
        }
        
        # Plan details
        plan_tiers = {
            "free": {"name": "Free", "price": 0, "features": ["Basic features", "5K API calls/month"]},
            "founders": {"name": "Founders #2", "price": 0, "features": ["All features", "50K API calls/month", "Priority support"]},
            "premium": {"name": "Premium", "price": 29, "features": ["All features", "Unlimited API calls", "24/7 support"]}
        }
        
        current_plan = plan_tiers.get(tier, plan_tiers["free"])
        
        return {
            "current_tier": tier,
            "plan_name": current_plan["name"],
            "price": current_plan["price"],
            "billing_cycle": "monthly",
            "next_billing_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "features": current_plan["features"],
            "usage": usage_data,
            "payment_history": [
                {
                    "date": p.get("created_at", ""),
                    "amount": p.get("amount", 0),
                    "status": p.get("status", "completed"),
                    "description": p.get("description", "Monthly subscription")
                }
                for p in payments
            ]
        }
        
    except Exception as e:
        # Return default free tier data
        return {
            "current_tier": "free",
            "plan_name": "Free",
            "price": 0,
            "billing_cycle": "monthly",
            "next_billing_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "features": ["Basic features", "5K API calls/month"],
            "usage": {
                "api_calls": 0,
                "api_limit": 5000,
                "storage_gb": 0,
                "storage_limit": 1
            },
            "payment_history": []
        }
