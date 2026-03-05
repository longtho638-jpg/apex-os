import { createClient } from '@supabase/supabase-js';

import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Fallback (Hardcoded) nếu DB chưa cấu hình
const DEFAULT_RATES: Record<string, { maker: number; taker: number; apex_rebate: number }> = {
  Binance: { maker: 0.001, taker: 0.001, apex_rebate: 0.1 },
  OKX: { maker: 0.0008, taker: 0.001, apex_rebate: 0.4 },
  Bybit: { maker: 0.001, taker: 0.001, apex_rebate: 0.3 },
  'Gate.io': { maker: 0.002, taker: 0.002, apex_rebate: 0.4 },
  Bitget: { maker: 0.001, taker: 0.001, apex_rebate: 0.5 },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exchange, pair, volume } = body;

    // Init Supabase (Service Role để đọc config global)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 0. Lấy cấu hình phí thực tế từ DB (Source of Truth cho Viral Logic)
    const exchangeRates = { ...DEFAULT_RATES };

    const { data: dbConfigs, error: dbError } = await supabase
      .from('exchange_configs')
      .select('*')
      .eq('is_active', true);

    if (!dbError && dbConfigs && dbConfigs.length > 0) {
      // Override default rates with DB data
      dbConfigs.forEach((cfg: any) => {
        exchangeRates[cfg.exchange_name] = {
          maker: parseFloat(cfg.standard_maker_fee),
          taker: parseFloat(cfg.standard_taker_fee),
          apex_rebate: parseFloat(cfg.apex_partner_rate), // Đây là con số quan trọng nhất
        };
      });
    }

    // 1. Lấy giá Real-time từ Binance (làm chuẩn tham chiếu)
    // Pair format: BTC/USDT -> BTCUSDT
    const symbol = pair.replace('/', '');
    let currentPrice = 0;

    try {
      const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const priceData = await priceRes.json();
      currentPrice = parseFloat(priceData.price);
    } catch (e) {
      logger.error('Failed to fetch Binance price', e);
      currentPrice = 50000; // Fallback
    }

    // 2. Tính toán phí hiện tại (Current Costs) dựa trên config đã load
    const currentRates = exchangeRates[exchange] || exchangeRates.Binance;
    const currentMonthlyFee = volume * currentRates.taker;
    // Giả sử user hiện tại nhận 50% của Apex Rebate (Logic Viral sẽ nằm ở lớp khác, đây là ước tính)
    const currentRebate = currentMonthlyFee * (currentRates.apex_rebate * 0.5);

    // 3. Tìm sàn tốt nhất (Best Alternative)
    let _bestExchange = exchange;
    let maxSavings = 0;
    let bestMetric = { name: exchange, savings: 0, percent: 0, rebateRate: 0 };

    Object.entries(exchangeRates).forEach(([name, rates]) => {
      if (name === exchange) return;

      // Phí trên sàn mới
      const newFee = volume * rates.taker;
      // Rebate nhận được (Giả sử user chuyển sang Apex sẽ nhận full benefit của gói VIP)
      // Ở đây ta show tiềm năng tối đa: Apex nhận bao nhiêu, user có thể nhận lại phần lớn số đó
      const potentialUserShare = 0.8; // Apex trả lại 80% cho user (Viral Config)
      const newRebate = newFee * rates.apex_rebate * potentialUserShare;

      // Tổng chi phí ròng (Net Cost)
      const currentNet = currentMonthlyFee - currentRebate;
      const newNet = newFee - newRebate;

      const savings = currentNet - newNet;

      if (savings > maxSavings) {
        maxSavings = savings;
        _bestExchange = name;
        bestMetric = {
          name: name,
          savings: Math.round(savings),
          percent: Math.round((savings / currentNet) * 100),
          rebateRate: rates.apex_rebate * 100,
        };
      }
    });

    // Nếu không tìm thấy sàn nào tốt hơn
    if (maxSavings <= 0) {
      bestMetric = {
        name: exchange,
        savings: 0,
        percent: 0,
        rebateRate: (exchangeRates[exchange]?.apex_rebate || 0) * 100,
      };
    }

    return NextResponse.json({
      success: true,
      market_data: {
        price: currentPrice,
        timestamp: new Date().toISOString(),
      },
      analysis: bestMetric,
      source: dbConfigs && dbConfigs.length > 0 ? 'database' : 'default_fallback',
    });
  } catch (error) {
    logger.error('Analyze API Error:', error);
    return NextResponse.json({ success: false, message: 'Analysis failed' }, { status: 500 });
  }
}
