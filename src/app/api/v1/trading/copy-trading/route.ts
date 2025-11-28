import { NextResponse } from 'next/server';
import { CopyTradingService } from '../../../../../../backend/services/copy-trading';

const copyService = new CopyTradingService();
let initialized = false;

async function ensureInitialized() {
    if (!initialized) {
        await copyService.initialize();
        initialized = true;
    }
}

// GET: List leaders or user's following
export async function GET(request: Request) {
    try {
        await ensureInitialized();

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const userId = searchParams.get('userId');

        if (action === 'leaders') {
            const leaders = await copyService.getLeaders(20);
            return NextResponse.json({ success: true, leaders });
        }

        if (action === 'following' && userId) {
            const following = await copyService.getUserFollowing(userId);
            return NextResponse.json({ success: true, following });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Register as leader or follow a leader
export async function POST(request: Request) {
    try {
        await ensureInitialized();

        const body = await request.json();
        const { action, userId, leaderId, displayName, description, copyRatio, maxAmount } = body;

        if (action === 'register_leader') {
            if (!userId || !displayName) {
                return NextResponse.json({ error: 'Missing userId or displayName' }, { status: 400 });
            }
            const id = await copyService.registerAsLeader(userId, displayName, description);
            return NextResponse.json({ success: true, leaderId: id });
        }

        if (action === 'follow') {
            if (!userId || !leaderId) {
                return NextResponse.json({ error: 'Missing userId or leaderId' }, { status: 400 });
            }
            await copyService.followLeader(userId, leaderId, copyRatio || 1.0, maxAmount);
            return NextResponse.json({ success: true, message: 'Now following leader' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Unfollow a leader
export async function DELETE(request: Request) {
    try {
        await ensureInitialized();

        const body = await request.json();
        const { userId, leaderId } = body;

        if (!userId || !leaderId) {
            return NextResponse.json({ error: 'Missing userId or leaderId' }, { status: 400 });
        }

        await copyService.unfollowLeader(userId, leaderId);
        return NextResponse.json({ success: true, message: 'Unfollowed leader' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
