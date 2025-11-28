import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    const { batch_size = 50 } = await req.json().catch(() => ({}))

    console.log(`⏰ Re-verify Scheduler started. Batch size: ${batch_size}`)

    // 1. Find accounts verified > 24h ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: accounts, error } = await supabase
        .from('user_exchange_accounts')
        .select('id, user_uid, exchange, metadata')
        .eq('verification_status', 'verified')
        .lt('last_verified_at', cutoff)
        .limit(batch_size)

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!accounts || accounts.length === 0) {
        return new Response(JSON.stringify({ message: 'No accounts to re-verify' }), {
            headers: { "Content-Type": "application/json" },
        })
    }

    console.log(`🔍 Found ${accounts.length} accounts to check.`)

    // 2. Process batch
    const results = []
    for (const acc of accounts) {
        // MOCK CHECK LOGIC
        // Randomly flag some as needing relink for demo purposes
        const isStillValid = Math.random() > 0.1 // 90% chance valid

        let updateData = {}
        if (isStillValid) {
            updateData = { last_verified_at: new Date() }
        } else {
            updateData = {
                verification_status: 'needs_relink',
                metadata: { ...acc.metadata, error_reason: 'Periodic check failed', checked_at: new Date().toISOString() }
            }
        }

        const { error: updateError } = await supabase
            .from('user_exchange_accounts')
            .update(updateData)
            .eq('id', acc.id)

        results.push({ id: acc.id, valid: isStillValid, error: updateError })
    }

    return new Response(
        JSON.stringify({
            message: `Processed ${accounts.length} accounts`,
            results: results
        }),
        { headers: { "Content-Type": "application/json" } },
    )
})
