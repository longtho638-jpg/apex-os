import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Mock Data - "Fake it till you make it"
    const strategies = [
        {
            id: 'strat-1',
            name: 'Whale Hunter Alpha',
            author: 'CryptoWhale_99',
            authorTier: 'WHALE',
            roi: 145.2,
            winRate: 78,
            followers: 1205,
            price: 99,
            risk: 'High',
            description: 'Aggressive BTC/ETH scalping based on liquidation heatmaps.',
            tags: ['Scalping', 'BTC', 'High Risk']
        },
        {
            id: 'strat-2',
            name: 'Safe Yield Farmer',
            author: 'DeFi_Wizard',
            authorTier: 'ELITE',
            roi: 18.5,
            winRate: 92,
            followers: 5430,
            price: 0,
            risk: 'Low',
            description: 'Delta-neutral funding rate farming on Binance.',
            tags: ['Arbitrage', 'Low Risk', 'Free']
        },
        {
            id: 'strat-3',
            name: 'AI Trend Surfer',
            author: 'Apex_System_Bot',
            authorTier: 'SYSTEM',
            roi: 65.8,
            winRate: 64,
            followers: 890,
            price: 49,
            risk: 'Medium',
            description: 'Official ApexOS AI algorithm following 4H trends.',
            tags: ['AI', 'Trend', 'Automated']
        },
        {
            id: 'strat-4',
            name: 'Meme Coin Sniper',
            author: 'Degen_King',
            authorTier: 'TRADER',
            roi: 320.1,
            winRate: 40,
            followers: 230,
            price: 199,
            risk: 'Extreme',
            description: 'Early detection of meme coins on Solana chain.',
            tags: ['Memecoins', 'Solana', 'Extreme Risk']
        }
    ];

    return NextResponse.json({ success: true, data: strategies });
}
