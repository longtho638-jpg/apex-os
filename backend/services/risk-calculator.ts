import { CONFIG } from '../config';

interface Position {
    symbol: string;
    side: 'LONG' | 'SHORT';
    entry_price: number;
    quantity: number;
    leverage: number;
}

interface RiskMetrics {
    totalExposure: number;
    maxLeverage: number;
    liquidationRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    marginUsed: number;
    marginAvailable: number;
}

export class RiskCalculator {
    calculateRisk(positions: Position[], accountBalance: number): RiskMetrics {
        const totalExposure = positions.reduce((sum, pos) => {
            return sum + (Number(pos.entry_price) * Number(pos.quantity) * Number(pos.leverage));
        }, 0);

        const maxLeverage = positions.length > 0
            ? Math.max(...positions.map(p => Number(p.leverage)))
            : 0;

        const exposurePercent = accountBalance > 0 ? (totalExposure / accountBalance) * 100 : 0;

        let risk: RiskMetrics['liquidationRisk'] = 'LOW';
        if (exposurePercent > CONFIG.RISK.LIQUIDATION_THRESHOLDS.CRITICAL) risk = 'CRITICAL';
        else if (exposurePercent > CONFIG.RISK.LIQUIDATION_THRESHOLDS.HIGH) risk = 'HIGH';
        else if (exposurePercent > CONFIG.RISK.LIQUIDATION_THRESHOLDS.MEDIUM) risk = 'MEDIUM';

        const marginUsed = totalExposure * CONFIG.RISK.MARGIN_REQUIREMENT;

        return {
            totalExposure,
            maxLeverage,
            liquidationRisk: risk,
            marginUsed,
            marginAvailable: accountBalance - marginUsed
        };
    }

    canOpenPosition(newPosition: Position, currentPositions: Position[], accountBalance: number): { allowed: boolean; reason?: string } {
        // 1. Check Max Leverage
        if (newPosition.leverage > CONFIG.RISK.MAX_LEVERAGE) {
            return { allowed: false, reason: `Exceeds max leverage of ${CONFIG.RISK.MAX_LEVERAGE}x` };
        }

        // 2. Check Margin Availability
        const testPositions = [...currentPositions, newPosition];
        const risk = this.calculateRisk(testPositions, accountBalance);

        if (risk.marginAvailable < 0) {
            return { allowed: false, reason: 'Insufficient margin' };
        }

        // 3. Check Exposure Limit
        const exposurePercent = (risk.totalExposure / accountBalance) * 100;
        if (exposurePercent > CONFIG.RISK.MAX_EXPOSURE_PERCENT) {
            return { allowed: false, reason: `Exceeds max exposure limit of ${CONFIG.RISK.MAX_EXPOSURE_PERCENT}%` };
        }

        return { allowed: true };
    }
}
