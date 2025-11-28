import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for User Profile
    return NextResponse.json({
        email: "demo@apex-os.io",
        display_name: "Demo Trader",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        created_at: "2024-01-01T00:00:00Z"
    });
}

export async function PUT(request: Request) {
    const data = await request.json();
    return NextResponse.json({
        email: "demo@apex-os.io",
        display_name: data.display_name || "Demo Trader",
        avatar_url: data.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        created_at: "2024-01-01T00:00:00Z"
    });
}
