#!/bin/bash

echo "🚀 Starting Security Migration Flow..."

# 1. Link to ApexOS (User might need to input DB password)
echo "🔗 Linking to Supabase Project (ApexOS)..."
npx supabase link --project-ref ryvpqbuftmlsynmajecx

if [ $? -ne 0 ]; then
    echo "❌ Failed to link. Please check your internet connection or password."
    exit 1
fi

# 2. Push Migrations
echo "fw Pushing DB Migrations (Adding hashed_secret column)..."
npx supabase db push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push migrations."
    exit 1
fi

# 3. Run Data Migration Script
echo "🔐 Running Key Hashing Script..."
npx tsx scripts/migrate_keys_to_hash.ts

echo "✅ All steps completed!"
