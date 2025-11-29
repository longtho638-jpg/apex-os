#!/bin/bash
set -e

echo "=========================================="
echo "🚀 APEX TIER SYSTEM - AUTO DEPLOY & TEST"
echo "=========================================="
echo ""

# Load environment
source backend/.env

# Step 1: Deploy migration to Supabase
echo "📦 Step 1: Deploying migration to Supabase..."
echo ""
echo "Please open Supabase SQL Editor and run the migration:"
echo "👉 https://supabase.com/dashboard/project/ryvpqbuftmlsynmajecx/sql"
echo ""
echo "Migration file: backend/database/tier_migration.sql"
echo ""
read -p "Press ENTER after you've run the migration in Supabase..."

# Step 2: Run automated test
echo ""
echo "🧪 Step 2: Running automated tier upgrade test..."
echo ""

python3 backend/scripts/test_tier_upgrade.py

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT & TEST COMPLETE"
echo "=========================================="
