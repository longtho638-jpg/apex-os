import { NextResponse } from 'next/server';

export async function GET() {
    // Mock data for Referral Stats
    return NextResponse.json({
        referral_link: "https://apex-os.io/ref/TRADER001",
        referral_code: "TRADER001",
        total_referrals: 24,
        total_commission: 1250.00,
        this_month_commission: 350.00,
        referrals: [
            {
                referee_id: "user_ref_01",
                signup_date: "2024-03-01T10:00:00Z",
                volume: 50000,
                commission: 50.00,
                status: "active"
            },
            {
                referee_id: "user_ref_02",
                signup_date: "2024-03-05T14:30:00Z",
                volume: 25000,
                commission: 25.00,
                status: "active"
            },
            {
                referee_id: "user_ref_03",
                signup_date: "2024-03-10T09:15:00Z",
                volume: 0,
                commission: 0.00,
                status: "inactive"
            }
        ]
    });
}
