import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Initialize Supabase Client with Admin rights (Service Role)
const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    // 1. Get data from Webhook
    const payload = await req.json()
    const record = payload.record // The inserted/updated record

    // Only process if status is 'pending'
    if (!record || record.verification_status !== 'pending') {
        return new Response(JSON.stringify({ message: 'Ignored: Not pending' }), {
            headers: { "Content-Type": "application/json" },
        })
    }

    console.log(`🔍 Processing verification for User: ${record.user_id}, Exchange: ${record.exchange}`)

    // 2. SIMULATION - Network Latency
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 3. MOCK LOGIC (Cheat Codes)
    let newStatus = 'verified'
    let metadata = { ...record.metadata, checked_at: new Date().toISOString() }

    const uid = record.user_uid || ""

    if (uid.startsWith('FAIL')) {
        newStatus = 'failed'
        metadata.error_reason = "UID does not exist on exchange"
    } else if (uid.startsWith('RELINK')) {
        newStatus = 'needs_relink'
        metadata.error_reason = "API Key expired"
    } else {
        newStatus = 'verified'
        metadata.tier = "VIP 1"
    }

    // 4. Update Database
    const { error } = await supabase
        .from('user_exchange_accounts')
        .update({
            verification_status: newStatus,
            verification_attempts: (record.verification_attempts || 0) + 1,
            last_verified_at: new Date(),
            metadata: metadata
        })
        .eq('id', record.id)

    if (error) {
        console.error("❌ Update failed:", error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    console.log(`✅ Updated status to: ${newStatus}`)

    return new Response(
        JSON.stringify({ message: `Processed account ${record.id} -> ${newStatus}` }),
        { headers: { "Content-Type": "application/json" } },
    )
})
