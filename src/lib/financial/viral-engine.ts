import { UNIFIED_TIERS, getTierById } from '@/config/unified-tiers';

interface TradeEvent {
    userId: string;
    tradeId: string;
    volume: number;      // e.g., 10000 USD
    feeAmount: number;   // e.g., 5 USD (Assuming 0.05%)
    symbol: string;
}

interface PayoutResult {
    beneficiaryId: string;
    type: 'SELF_REBATE' | 'COMMISSION_L1' | 'COMMISSION_L2' | 'COMMISSION_L3' | 'COMMISSION_L4' | 'APEX_REVENUE';
    amount: number;
    rate: number;
    sourceTradeId: string;
    description: string;
}

// Mock database lookup function (Replace with real DB call later)
// Returns: { tier: 'FREE' | 'PRO' | ... , uplineId: string | null }
async function getUserProfile(userId: string): Promise<{ tier: string; uplineId: string | null }> {
    // TODO: Implement real DB lookup
    return { tier: 'FREE', uplineId: null }; 
}

export class ViralEngine {
    
    /**
     * Calculate distribution for a single trade
     */
    async calculatePayouts(trade: TradeEvent): Promise<PayoutResult[]> {
        const payouts: PayoutResult[] = [];
        
        // 1. Get User Info
        const userProfile = await getUserProfile(trade.userId);
        const tier = getTierById(userProfile.tier) || UNIFIED_TIERS.FREE;

        // 2. Calculate Self-Rebate
        // Formula: TradeFee * ApexShare (40%) * UserSelfRebateRate
        // Simplified here: Assume 'feeAmount' is ALREADY the Apex Share for simplicity, 
        // OR we assume feeAmount is Exchange Fee and Apex gets 40%.
        // Let's assume: feeAmount = Total Exchange Fee.
        
        const APEX_SHARE_FROM_EXCHANGE = 0.40; // We get 40% from Binance/OKX
        const revenuePool = trade.feeAmount * APEX_SHARE_FROM_EXCHANGE; 

        const selfRebateAmount = revenuePool * (tier.selfRebateRate || 0);
        
        if (selfRebateAmount > 0) {
            payouts.push({
                beneficiaryId: trade.userId,
                type: 'SELF_REBATE',
                amount: selfRebateAmount,
                rate: tier.selfRebateRate || 0,
                sourceTradeId: trade.tradeId,
                description: `Self-rebate for trade ${trade.symbol}`
            });
        }

        // 3. Viral Commissions (L1 - L4)
        // Logic: Recursively check upline
        let currentMemberId = trade.userId;
        let currentLevel = 1;

        // Mock Upline Traversal (In real app, we loop DB queries)
        // For demo engine, we stop at Self-Rebate to ensure type safety without DB
        
        // 4. Calculate House Keep (Apex Revenue)
        const totalPayout = payouts.reduce((sum, p) => sum + p.amount, 0);
        const houseKeep = revenuePool - totalPayout;

        payouts.push({
            beneficiaryId: 'APEX_TREASURY',
            type: 'APEX_REVENUE',
            amount: houseKeep,
            rate: 0,
            sourceTradeId: trade.tradeId,
            description: 'Net revenue after rebates'
        });

        return payouts;
    }
}
