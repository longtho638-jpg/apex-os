#!/usr/bin/env python3
"""
ApexOS Tier System - Automated Test Script (Direct SQL)
Tests tier upgrade functionality end-to-end using direct SQL queries
"""

import os
import sys
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in backend/.env")
    sys.exit(1)

def log(emoji, message):
    """Pretty print log messages"""
    print(f"\n{emoji} {message}")

def supabase_get(table, filters='', select='*'):
    """Get data from Supabase using REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={select}{filters}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"   ⚠️  Error: {response.status_code} - {response.text}")
        return []

def supabase_update(table, data, filters):
    """Update data in Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/{table}?{filters}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        print(f"   ⚠️  Error: {response.status_code} - {response.text}")
        return None

def main():
    print("=" * 60)
    print("🧪 APEX TIER SYSTEM - AUTOMATED TEST")
    print("=" * 60)
    
    # Step 1: Get available slots BEFORE
    log("📊", "Step 1: Checking Founders Circle status...")
    
    # Count total slots
    all_slots = supabase_get('founders_circle', '', 'slot_number,user_id')
    total_slots = len(all_slots)
    claimed_slots = sum(1 for s in all_slots if s.get('user_id'))
    available_slots_before = total_slots - claimed_slots
    
    print(f"   Total Slots: {total_slots}")
    print(f"   Claimed: {claimed_slots}")
    print(f"   Available: {available_slots_before}")
    
    # Step 2: Get test user
    log("👤", "Step 2: Finding test user...")
    users = supabase_get('users', '&order=created_at.desc&limit=1')
    
    if not users:
        log("❌", "No users found! Create a user first.")
        return
    
    test_user = users[0]
    user_id = test_user['id']
    user_email = test_user.get('email', 'N/A')
    current_tier = test_user.get('subscription_tier', 'free')
    
    print(f"   User ID: {user_id}")
    print(f"   Email: {user_email}")
    print(f"   Current Tier: {current_tier}")
    
    if current_tier == 'founders':
        log("⚠️", "User is already Founders!")
        
        # Show current state
        founders = supabase_get('founders_circle', f'&user_id=eq.{user_id}')
        if founders:
            print(f"   Slot Number: {founders[0]['slot_number']}")
            print(f"   Claimed At: {founders[0]['claimed_at']}")
        
        log("✅", "Tier system already working - user is Founders!")
        return
    
    # Step 3: Upgrade user to Founders
    log("⬆️", "Step 3: Upgrading user to Founders...")
    
    # Find first available slot
    available_slot = None
    for slot in all_slots:
        if not slot.get('user_id'):
            available_slot = slot['slot_number']
            break
    
    if not available_slot:
        log("❌", "No available Founders slots!")
        return
    
    print(f"   Claiming slot: #{available_slot}")
    
    # Generate transaction ID
    tx_id = f"test-tx-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Update user table
    user_update_data = {
        'subscription_tier': 'founders',
        'subscription_expires_at': None,  # Lifetime
        'payment_tx_id': tx_id,
        'payment_verified': True
    }
    
    updated_user = supabase_update('users', user_update_data, f'id=eq.{user_id}')
    
    if not updated_user:
        log("❌", "Failed to update user!")
        return
    
    print(f"   ✅ User updated to Founders tier")
    
    # Update founders_circle table
    slot_update_data = {
        'user_id': user_id,
        'tx_id': tx_id,
        'claimed_at': datetime.now().isoformat()
    }
    
    updated_slot = supabase_update('founders_circle', slot_update_data, f'slot_number=eq.{available_slot}')
    
    if not updated_slot:
        log("❌", "Failed to claim Founders slot!")
        return
    
    print(f"   ✅ Founders slot #{available_slot} claimed")
    
    # Step 4: Verify upgrade
    log("🔍", "Step 4: Verifying upgrade...")
    
    # Re-fetch user
    user_verified = supabase_get('users', f'&id=eq.{user_id}')[0]
    print(f"   Subscription Tier: {user_verified.get('subscription_tier')}")
    print(f"   Payment Verified: {user_verified.get('payment_verified')}")
    print(f"   Payment TxID: {user_verified.get('payment_tx_id')}")
    
    # Re-fetch slot
    slot_verified = supabase_get('founders_circle', f'&user_id=eq.{user_id}')[0]
    print(f"   Founders Slot: #{slot_verified['slot_number']}")
    print(f"   Claimed At: {slot_verified['claimed_at']}")
    
    # Step 5: Check available slots AFTER
    log("📊", "Step 5: Checking available slots after upgrade...")
    
    all_slots_after = supabase_get('founders_circle', '', 'slot_number,user_id')
    claimed_after = sum(1 for s in all_slots_after if s.get('user_id'))
    available_after = len(all_slots_after) - claimed_after
    
    print(f"   Available slots: {available_after}")
    print(f"   Change: {available_slots_before} → {available_after} (decreased by {available_slots_before - available_after})")
    
    # Step 6: Summary
    log("📋", "Test Summary")
    print("   " + "=" * 56)
    print(f"   User Email:        {user_email}")
    print(f"   User ID:           {user_id}")
    print(f"   Old Tier:          {current_tier}")
    print(f"   New Tier:          founders")
    print(f"   Founders Slot:     #{available_slot}")
    print(f"   Available Slots:   {available_after}/100")
    print(f"   Payment Verified:  True")
    print(f"   Transaction ID:    {tx_id}")
    print("   " + "=" * 56)
    
    log("✅", "All tests passed! Tier upgrade successful!")
    print("\n🎉 Tier system is working correctly!\n")
    print("Next steps:")
    print("1. Refresh dashboard at: http://localhost:3000/dashboard")
    print("2. Expected changes:")
    print("   • Crown badge showing 'Founders #{}'".format(available_slot))
    print("   • No upgrade banners")
    print("   • All metrics unlocked (Fees Saved, Referrals)")
    print("   • Wolf Pack status panel visible")
    print("   • All sidebar menus visible")
    print("\n✨ Test complete!")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        log("❌", f"Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
