import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Wolf Pack status
    return NextResponse.json({
        in_pack: true,
        pack_id: "pack_123",
        member_count: 128,
        total_volume: 4500000,
        shared_rebates: 1250.50,
        invite_link: "https://apex-os.io/join/WOLF123",
        members: [
            {
                user_id: "user_001",
                role: "alpha",
                contribution: 150000,
                joined_at: "2024-01-15T10:00:00Z"
            },
            {
                user_id: "user_002",
                role: "beta",
                contribution: 85000,
                joined_at: "2024-02-01T14:30:00Z"
            },
            {
                user_id: "user_003",
                role: "member",
                contribution: 45000,
                joined_at: "2024-03-10T09:15:00Z"
            },
            {
                user_id: "user_004",
                role: "member",
                contribution: 25000,
                joined_at: "2024-03-12T11:20:00Z"
            },
            {
                user_id: "user_005",
                role: "member",
                contribution: 15000,
                joined_at: "2024-03-15T16:45:00Z"
            }
        ]
    });
}
