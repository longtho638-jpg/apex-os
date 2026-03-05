/**
 * Position Sizing Engine
 *
 * Implements Kelly Criterion, Risk Parity, and other position sizing methods.
 */

import type { KellyParameters, PositionSizeRecommendation, RiskParityParameters } from './types';

export class PositionSizingEngine {
  /**
   * Calculate position size using Kelly Criterion
   */
  calculateKellySize(params: KellyParameters, capital: number, currentPrice: number): PositionSizeRecommendation {
    const { winRate, avgWin, avgLoss, maxFraction } = params;

    // Kelly formula: f = (p * b - q) / b
    // where: p = win rate, q = 1 - p, b = avg win / avg loss
    const q = 1 - winRate;
    const b = avgWin / avgLoss;

    let kellyFraction = (winRate * b - q) / b;

    // Apply safety factor (half-Kelly recommended)
    kellyFraction = kellyFraction * 0.5;

    // Cap at max fraction
    kellyFraction = Math.min(Math.max(kellyFraction, 0), maxFraction);

    const recommendedNotional = capital * kellyFraction;
    const recommendedSize = recommendedNotional / currentPrice;

    return {
      symbol: '',
      recommendedSize,
      recommendedNotional,
      leverage: 1,
      method: 'kelly',
      stopLoss: currentPrice * (1 - avgLoss / 100),
      takeProfit: currentPrice * (1 + avgWin / 100),
      riskAmount: capital * kellyFraction * (avgLoss / 100),
      riskPercent: kellyFraction * (avgLoss / 100),
      expectedReturn: winRate * avgWin - (1 - winRate) * avgLoss,
      winRate,
      riskRewardRatio: avgWin / avgLoss,
      confidence: this.calculateKellyConfidence(winRate, avgWin, avgLoss),
      reasoning: [
        `Kelly fraction: ${(kellyFraction * 100).toFixed(1)}%`,
        `Win rate: ${(winRate * 100).toFixed(1)}%`,
        `Risk/Reward: ${(avgWin / avgLoss).toFixed(2)}`,
        'Using half-Kelly for safety',
      ],
    };
  }

  /**
   * Calculate position size using Risk Parity
   */
  calculateRiskParitySize(
    params: RiskParityParameters,
    capital: number,
    currentPrices: Record<string, number>,
  ): Record<string, PositionSizeRecommendation> {
    const { assets, volatilities, targetRisk } = params;

    // Calculate inverse volatilities
    const invVolatilities = volatilities.map((v) => 1 / v);
    const sumInvVol = invVolatilities.reduce((a, b) => a + b, 0);

    // Calculate weights (proportional to inverse volatility)
    const weights = invVolatilities.map((invVol) => invVol / sumInvVol);

    // Create recommendations
    const recommendations: Record<string, PositionSizeRecommendation> = {};

    assets.forEach((asset, i) => {
      const weight = weights[i];
      const notional = capital * weight;
      const size = notional / currentPrices[asset];

      recommendations[asset] = {
        symbol: asset,
        recommendedSize: size,
        recommendedNotional: notional,
        leverage: 1,
        method: 'risk_parity',
        stopLoss: 0,
        takeProfit: 0,
        riskAmount: notional * volatilities[i],
        riskPercent: weight,
        expectedReturn: 0,
        winRate: 0.5,
        riskRewardRatio: 1,
        confidence: 0.7,
        reasoning: [
          `Risk parity weight: ${(weight * 100).toFixed(1)}%`,
          `Volatility: ${(volatilities[i] * 100).toFixed(1)}%`,
          'Equal risk contribution',
        ],
      };
    });

    return recommendations;
  }

  /**
   * Calculate fixed fractional position size
   */
  calculateFixedFractionalSize(
    riskPerTrade: number,
    stopLossPercent: number,
    capital: number,
    currentPrice: number,
  ): PositionSizeRecommendation {
    // Position size = (Risk per trade / Stop loss %) * Price
    const riskAmount = capital * riskPerTrade;
    const recommendedNotional = riskAmount / stopLossPercent;
    const recommendedSize = recommendedNotional / currentPrice;

    return {
      symbol: '',
      recommendedSize,
      recommendedNotional,
      leverage: 1,
      method: 'fixed_fractional',
      stopLoss: currentPrice * (1 - stopLossPercent),
      takeProfit: currentPrice * (1 + stopLossPercent * 2), // 2:1 R:R
      riskAmount,
      riskPercent: riskPerTrade,
      expectedReturn: 0,
      winRate: 0.5,
      riskRewardRatio: 2,
      confidence: 0.6,
      reasoning: [
        `Risk per trade: ${(riskPerTrade * 100).toFixed(1)}%`,
        `Stop loss: ${(stopLossPercent * 100).toFixed(1)}%`,
        'Fixed risk amount',
      ],
    };
  }

  /**
   * Calculate volatility-adjusted position size
   */
  calculateVolatilityAdjustedSize(
    targetVolatility: number,
    assetVolatility: number,
    capital: number,
    currentPrice: number,
  ): PositionSizeRecommendation {
    // Size = (Target volatility / Asset volatility) * Capital / Price
    const volatilityRatio = targetVolatility / assetVolatility;
    const recommendedNotional = capital * volatilityRatio;
    const recommendedSize = recommendedNotional / currentPrice;

    return {
      symbol: '',
      recommendedSize,
      recommendedNotional,
      leverage: 1,
      method: 'volatility_adjusted',
      stopLoss: 0,
      takeProfit: 0,
      riskAmount: recommendedNotional * assetVolatility,
      riskPercent: volatilityRatio,
      expectedReturn: 0,
      winRate: 0.5,
      riskRewardRatio: 1,
      confidence: 0.7,
      reasoning: [
        `Target volatility: ${(targetVolatility * 100).toFixed(1)}%`,
        `Asset volatility: ${(assetVolatility * 100).toFixed(1)}%`,
        'Volatility-normalized exposure',
      ],
    };
  }

  /**
   * Optimize position size with multiple constraints
   */
  optimizePositionSize(
    _signal: 'BUY' | 'SELL',
    signalConfidence: number,
    currentPrice: number,
    stopLoss: number,
    takeProfit: number,
    capital: number,
    maxRiskPercent: number = 0.02,
  ): PositionSizeRecommendation {
    // Calculate risk and reward
    const stopLossDistance = Math.abs(currentPrice - stopLoss) / currentPrice;
    const takeProfitDistance = Math.abs(takeProfit - currentPrice) / currentPrice;
    const riskRewardRatio = takeProfitDistance / stopLossDistance;

    // Adjust size based on confidence and R:R
    const baseRiskPercent = maxRiskPercent * signalConfidence;
    const rRadjustment = Math.min(riskRewardRatio / 2, 1.5); // Cap at 1.5x
    const adjustedRiskPercent = baseRiskPercent * rRadjustment;

    // Calculate position size
    const riskAmount = capital * adjustedRiskPercent;
    const recommendedNotional = riskAmount / stopLossDistance;
    const recommendedSize = recommendedNotional / currentPrice;

    // Estimate win rate from confidence
    const estimatedWinRate = 0.4 + signalConfidence * 0.2; // 40%-60% range

    return {
      symbol: '',
      recommendedSize,
      recommendedNotional,
      leverage: 1,
      method: 'fixed_fractional',
      stopLoss,
      takeProfit,
      riskAmount,
      riskPercent: adjustedRiskPercent,
      expectedReturn: (estimatedWinRate * takeProfitDistance - (1 - estimatedWinRate) * stopLossDistance) * 100,
      winRate: estimatedWinRate,
      riskRewardRatio,
      confidence: signalConfidence,
      reasoning: [
        `Signal confidence: ${(signalConfidence * 100).toFixed(0)}%`,
        `R:R ratio: ${riskRewardRatio.toFixed(2)}:1`,
        `Adjusted risk: ${(adjustedRiskPercent * 100).toFixed(2)}%`,
        `Est. win rate: ${(estimatedWinRate * 100).toFixed(0)}%`,
      ],
    };
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private calculateKellyConfidence(winRate: number, avgWin: number, avgLoss: number): number {
    // Higher confidence when:
    // 1. Win rate is significantly different from 50%
    // 2. R:R ratio is favorable
    // 3. Edge is clear

    const winRateEdge = Math.abs(winRate - 0.5);
    const riskRewardEdge = avgWin / avgLoss;
    const expectedValue = winRate * avgWin - (1 - winRate) * avgLoss;

    let confidence = 0.5;

    // Win rate contribution (max 0.3)
    confidence += Math.min(winRateEdge * 0.6, 0.3);

    // R:R contribution (max 0.2)
    if (riskRewardEdge > 1.5) {
      confidence += Math.min((riskRewardEdge - 1) * 0.1, 0.2);
    }

    // Expected value contribution (max 0.2)
    if (expectedValue > 0) {
      confidence += Math.min(expectedValue * 0.02, 0.2);
    }

    return Math.min(confidence, 0.95);
  }
}

// Export singleton instance
export const positionSizer = new PositionSizingEngine();
