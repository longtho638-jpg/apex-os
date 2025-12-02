#!/usr/bin/env node
/**
 * Supabase Database Verification Script
 * Checks which tables exist and runs missing migrations
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ryvpqbuftmlsynmajecx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dnBxYnVmdG1sc3lubWFqZWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDk4NywiZXhwIjoyMDc5MTM2OTg3fQ.5KJAjOY3FUMHO2aAau5CFzrkso8eSrgpBUss3lnWGbA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EXPECTED_TABLES = [
    'positions',
    'orders',
    'market_data',
    'order_book',
    'trading_signals',
    'copy_leaders',
    'copy_settings',
    'copy_trade_history',
    'wallets',
    'transactions',
    'automation_rules',
    'audit_logs',
    'security_events',
    'security_alerts',
    'daily_reconciliation_logs',
    'agent_heartbeats'
];

async function checkTables() {
    console.log('🔍 Checking Supabase database tables...\n');

    const results = [];

    for (const table of EXPECTED_TABLES) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    console.log(`❌ ${table} - MISSING`);
                    results.push({ table, exists: false, error: error.message });
                } else {
                    console.log(`⚠️  ${table} - ERROR: ${error.message}`);
                    results.push({ table, exists: 'unknown', error: error.message });
                }
            } else {
                console.log(`✅ ${table} - EXISTS`);
                results.push({ table, exists: true });
            }
        } catch (err) {
            console.log(`❌ ${table} - ERROR: ${err.message}`);
            results.push({ table, exists: false, error: err.message });
        }
    }

    console.log('\n📊 SUMMARY:');
    const existing = results.filter(r => r.exists === true).length;
    const missing = results.filter(r => r.exists === false).length;
    const errors = results.filter(r => r.exists === 'unknown').length;

    console.log(`✅ Existing: ${existing}/${EXPECTED_TABLES.length}`);
    console.log(`❌ Missing: ${missing}/${EXPECTED_TABLES.length}`);
    console.log(`⚠️  Errors: ${errors}/${EXPECTED_TABLES.length}`);

    if (missing > 0) {
        console.log('\n🚨 CRITICAL: Missing tables detected!');
        console.log('Run migrations in /src/database/migrations/');
    }

    return results;
}

checkTables().catch(console.error);
