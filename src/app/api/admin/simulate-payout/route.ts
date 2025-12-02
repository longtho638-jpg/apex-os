import { NextRequest, NextResponse } from 'next/server';
import { ViralEngine } from '@/lib/financial/viral-engine';
import { UNIFIED_TIERS, getTierById } from '@/config/unified-tiers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { volume = 10000, tierId = 'FREE' } = body;

        // Constants for Simulation
        const EXCHANGE_FEE_RATE = 0.0005; // 0.05% taker fee
        const APEX_SHARE = 0.40; // 40% from exchange
        
        const totalFee = volume * EXCHANGE_FEE_RATE;
        const revenuePool = totalFee * APEX_SHARE;

        const tier = getTierById(tierId) || UNIFIED_TIERS.FREE;

        // Simulation Result
        const result = {
            input: {
                volume: volume,
                fee_collected_by_exchange: totalFee,
                revenue_pool_for_apex: revenuePool,
                user_tier: tier.name
            },
            distribution: {
                self_rebate: {
                    rate: tier.selfRebateRate,
                    amount: revenuePool * (tier.selfRebateRate || 0)
                },
                viral_network: {
                    l1: { rate: tier.commissionRates.l1, amount: revenuePool * tier.commissionRates.l1 },
                    l2: { rate: tier.commissionRates.l2, amount: revenuePool * tier.commissionRates.l2 },
                    l3: { rate: tier.commissionRates.l3, amount: revenuePool * tier.commissionRates.l3 },
                    l4: { rate: tier.commissionRates.l4, amount: revenuePool * tier.commissionRates.l4 },
                }
            }
        };

        // Calculate Profit Margin
        const totalPayout = result.distribution.self_rebate.amount + 
                            result.distribution.viral_network.l1.amount + 
                            result.distribution.viral_network.l2.amount +
                            result.distribution.viral_network.l3.amount +
                            result.distribution.viral_network.l4.amount;
                            
        const apexNetProfit = revenuePool - totalPayout;

        return NextResponse.json({
            success: true,
            simulation: result,
            economics: {
                total_payout: totalPayout,
                apex_net_profit: apexNetProfit,
                payout_ratio: (totalPayout / revenuePool * 100).toFixed(1) + '%'
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
