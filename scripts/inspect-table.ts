import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
    console.log("Inspecting 'agent_heartbeats' table...");

    // Try to select just the 'status' column to see if *that* works
    const { data: statusData, error: statusError } = await supabase
        .from('agent_heartbeats')
        .select('status')
        .limit(1);

    if (statusError) {
        console.error("❌ Error selecting 'status':", statusError);
    } else {
        console.log("✅ 'status' column exists.");
    }

    // Try to select 'agent_id' explicitly
    const { data: idData, error: idError } = await supabase
        .from('agent_heartbeats')
        .select('agent_id')
        .limit(1);

    if (idError) {
        console.error("❌ Error selecting 'agent_id':", idError);
    } else {
        console.log("✅ 'agent_id' column exists.");
    }

    // Try to select 'id' (maybe it was created with default id?)
    const { data: defaultIdData, error: defaultIdError } = await supabase
        .from('agent_heartbeats')
        .select('id')
        .limit(1);

    if (defaultIdError) {
        console.log("ℹ️ 'id' column does not exist (expected).");
    } else {
        console.error("⚠️ 'id' column EXISTS! The table might have been created incorrectly.");
    }
}

run();
