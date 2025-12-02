import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'example-key'; // Use Service Role for aggregation
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // 1. Get User's Team ID
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('team_id, team_role')
        .eq('id', userId)
        .single();

    if (userError || !user?.team_id) {
        return NextResponse.json({
            in_pack: false,
            pack_id: null,
            member_count: 0,
            total_volume: 0,
            shared_rebates: 0,
            invite_link: "",
            members: []
        });
    }

    // 2. Get Team Details
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', user.team_id)
        .single();

    if (teamError) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // 3. Get Real Member Count
    const { count: memberCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', user.team_id);

    // 4. Get Team Members & Calculate Volume
    const { data: members } = await supabase
        .from('users')
        .select('id, created_at, team_role')
        .eq('team_id', user.team_id)
        .limit(20);

    // Fetch volume for these members
    const memberIds = members?.map(m => m.id) || [];
    const { data: volumes } = await supabase
        .from('transactions')
        .select('wallet_id, amount, wallets!inner(user_id)')
        .in('wallets.user_id', memberIds)
        .eq('type', 'TRADE');

    // Map volume to user
    const volumeMap = new Map();
    volumes?.forEach((v: any) => {
        const uid = v.wallets.user_id;
        const vol = Math.abs(v.amount);
        volumeMap.set(uid, (volumeMap.get(uid) || 0) + vol);
    });

    const formattedMembers = members?.map(m => ({
        user_id: m.id,
        role: m.team_role || 'member',
        contribution: volumeMap.get(m.id) || 0,
        joined_at: m.created_at
    })).sort((a, b) => b.contribution - a.contribution) || [];

    const totalVolume = Array.from(volumeMap.values()).reduce((a, b) => a + b, 0);

    return NextResponse.json({
        in_pack: true,
        pack_id: team.id,
        member_count: memberCount || members?.length || 0,
        total_volume: totalVolume,
        shared_rebates: totalVolume * 0.0001, // 1bps rebate
        invite_link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://apex.os'}/r/${team.invite_code || team.id}`,
        members: formattedMembers
    });
}
