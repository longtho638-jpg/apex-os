#!/bin/bash

# Load env vars
set -a
source .env.local
set +a

echo "🚀 Deploying Financial Core System..."

# Check connection string
if [ -z "$DATABASE_URL" ] && [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: DATABASE_URL or SUPABASE_DB_URL is not set."
  exit 1
fi

# Use available connection string
DB_URL=${DATABASE_URL:-$SUPABASE_DB_URL}

# Run psql
psql "$DB_URL" -f supabase/migrations/20251130_create_financial_core.sql

if [ $? -eq 0 ]; then
  echo "✅ Financial Core Deployed Successfully!"
else
  echo "❌ Deployment Failed."
  exit 1
fi
