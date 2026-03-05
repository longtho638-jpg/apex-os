/**
 * Risk Metrics Calculator
 *
 * Core engine for calculating VaR, CVaR, Sharpe Ratio, and other risk metrics.
 */

import type { MonteCarloResult, ReturnsSeries, RiskConfig, RiskMetrics } from './types';

export class RiskMetricsCalculator {
  private config: RiskConfig;

  constructor(config?: Partial<RiskConfig>) {
    this.config = {
      varConfidence: 0.95,
      varMethod: 'historical',
      monteCarloSimulations: 10000,
      limits: {
        maxVaR: 0.02,
        maxDrawdown: 0.15,
        maxLeverage: 5,
        maxConcentration: 0.25,
        minSharpe: 0.5,
        maxPositionSize: 100000,
        maxPositions: 10,
      },
      defaultSizingMethod: 'kelly',
      kellyFraction: 0.5,
      riskFreeRate: 0.02,
      refreshIntervalMs: 60000,
      ...config,
    };
  }

  // ========================================================================
  // VALUE AT RISK (VAR)
  // ========================================================================

  /**
   * Calculate Historical VaR
   */
  calculateHistoricalVaR(returns: number[], confidence: number = 0.95): number {
    if (returns.length === 0) return 0;

    const sorted = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sorted.length);

    return Math.abs(sorted[index] || 0);
  }

  /**
   * Calculate Parametric VaR (assumes normal distribution)
   */
  calculateParametricVaR(returns: number[], confidence: number = 0.95): number {
    if (returns.length === 0) return 0;

    const mean = this.calculateMean(returns);
    const stdDev = this.calculateStdDev(returns);
    const zScore = this.getZScore(confidence);

    return Math.abs(mean - zScore * stdDev);
  }

  /**
   * Calculate Monte Carlo VaR
   */
  calculateMonteCarloVaR(returns: number[], confidence: number = 0.95, simulations: number = 10000): number {
    if (returns.length === 0) return 0;

    const mean = this.calculateMean(returns);
    const stdDev = this.calculateStdDev(returns);

    // Generate simulated returns
    const simulatedReturns: number[] = [];
    for (let i = 0; i < simulations; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

      const simulatedReturn = mean + z * stdDev;
      simulatedReturns.push(simulatedReturn);
    }

    return this.calculateHistoricalVaR(simulatedReturns, confidence);
  }

  /**
   * Calculate Expected Shortfall (CVaR)
   */
  calculateExpectedShortfall(returns: number[], confidence: number = 0.95): number {
    if (returns.length === 0) return 0;

    const var95 = this.calculateHistoricalVaR(returns, confidence);
    const tailLosses = returns.filter((r) => r < -var95);

    if (tailLosses.length === 0) return var95;

    return Math.abs(this.calculateMean(tailLosses));
  }

  // ========================================================================
  // PERFORMANCE METRICS
  // ========================================================================

  /**
   * Calculate Sharpe Ratio (annualized)
   */
  calculateSharpeRatio(returns: number[], periodsPerYear: number = 252): number {
    if (returns.length === 0) return 0;

    const excessReturns = returns.map((r) => r - this.config.riskFreeRate / periodsPerYear);
    const meanReturn = this.calculateMean(excessReturns);
    const stdDev = this.calculateStdDev(excessReturns);

    if (stdDev === 0) return 0;

    return (meanReturn / stdDev) * Math.sqrt(periodsPerYear);
  }

  /**
   * Calculate Sortino Ratio (penalizes downside volatility only)
   */
  calculateSortinoRatio(returns: number[], periodsPerYear: number = 252): number {
    if (returns.length === 0) return 0;

    const excessReturns = returns.map((r) => r - this.config.riskFreeRate / periodsPerYear);
    const meanReturn = this.calculateMean(excessReturns);

    // Calculate downside deviation
    const downsideReturns = excessReturns.filter((r) => r < 0);
    if (downsideReturns.length === 0) return meanReturn > 0 ? 999 : 0;

    const downsideStdDev = this.calculateStdDev(downsideReturns);
    if (downsideStdDev === 0) return 0;

    return (meanReturn / downsideStdDev) * Math.sqrt(periodsPerYear);
  }

  /**
   * Calculate Calmar Ratio (return / max drawdown)
   */
  calculateCalmarRatio(cumulativeReturns: number[]): number {
    if (cumulativeReturns.length === 0) return 0;

    const totalReturn = cumulativeReturns[cumulativeReturns.length - 1] || 0;
    const maxDrawdown = this.calculateMaxDrawdown(cumulativeReturns);

    if (maxDrawdown === 0) return 0;

    return totalReturn / maxDrawdown;
  }

  // ========================================================================
  // DRAWDOWN ANALYSIS
  // ========================================================================

  /**
   * Calculate Maximum Drawdown
   */
  calculateMaxDrawdown(cumulativeReturns: number[]): number {
    if (cumulativeReturns.length === 0) return 0;

    let maxDrawdown = 0;
    let peak = cumulativeReturns[0];

    for (const value of cumulativeReturns) {
      if (value > peak) {
        peak = value;
      }

      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate Current Drawdown
   */
  calculateCurrentDrawdown(cumulativeReturns: number[]): number {
    if (cumulativeReturns.length === 0) return 0;

    const peak = Math.max(...cumulativeReturns);
    const current = cumulativeReturns[cumulativeReturns.length - 1];

    if (current >= peak) return 0;

    return (peak - current) / peak;
  }

  // ========================================================================
  // VOLATILITY
  // ========================================================================

  /**
   * Calculate Annualized Volatility
   */
  calculateVolatility(returns: number[], periodsPerYear: number = 252): number {
    const stdDev = this.calculateStdDev(returns);
    return stdDev * Math.sqrt(periodsPerYear);
  }

  /**
   * Calculate Downside Volatility
   */
  calculateDownsideVolatility(returns: number[], periodsPerYear: number = 252): number {
    const downsideReturns = returns.filter((r) => r < 0);
    if (downsideReturns.length === 0) return 0;

    const stdDev = this.calculateStdDev(downsideReturns);
    return stdDev * Math.sqrt(periodsPerYear);
  }

  // ========================================================================
  // COMPREHENSIVE RISK METRICS
  // ========================================================================

  /**
   * Calculate all risk metrics for a returns series
   */
  calculateRiskMetrics(returnsSeries: ReturnsSeries): RiskMetrics {
    const { returns, cumulativeReturns } = returnsSeries;

    // VaR calculations
    let var95: number, var99: number;
    switch (this.config.varMethod) {
      case 'parametric':
        var95 = this.calculateParametricVaR(returns, 0.95);
        var99 = this.calculateParametricVaR(returns, 0.99);
        break;
      case 'montecarlo':
        var95 = this.calculateMonteCarloVaR(returns, 0.95, this.config.monteCarloSimulations);
        var99 = this.calculateMonteCarloVaR(returns, 0.99, this.config.monteCarloSimulations);
        break;
      default:
        var95 = this.calculateHistoricalVaR(returns, 0.95);
        var99 = this.calculateHistoricalVaR(returns, 0.99);
    }

    return {
      var95,
      var99,
      varMethod: this.config.varMethod,
      cvar95: this.calculateExpectedShortfall(returns, 0.95),
      cvar99: this.calculateExpectedShortfall(returns, 0.99),
      sharpeRatio: this.calculateSharpeRatio(returns),
      sortinoRatio: this.calculateSortinoRatio(returns),
      calmarRatio: this.calculateCalmarRatio(cumulativeReturns),
      maxDrawdown: this.calculateMaxDrawdown(cumulativeReturns),
      currentDrawdown: this.calculateCurrentDrawdown(cumulativeReturns),
      drawdownDuration: this.calculateDrawdownDuration(cumulativeReturns),
      volatility: this.calculateVolatility(returns),
      downsideVolatility: this.calculateDownsideVolatility(returns),
      periodDays: returns.length,
      timestamp: Date.now(),
    };
  }

  // ========================================================================
  // MONTE CARLO SIMULATION
  // ========================================================================

  /**
   * Run Monte Carlo simulation for portfolio
   */
  runMonteCarloSimulation(
    expectedReturn: number,
    volatility: number,
    days: number = 252,
    simulations: number = 10000,
  ): MonteCarloResult {
    const returns: number[] = [];
    const samplePaths: number[][] = [];
    const numSamples = Math.min(100, simulations); // Save 100 sample paths

    for (let i = 0; i < simulations; i++) {
      let cumulativeReturn = 0;
      const path: number[] = [0];

      for (let day = 0; day < days; day++) {
        // Generate random return
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        const dailyReturn = expectedReturn / days + (volatility / Math.sqrt(days)) * z;
        cumulativeReturn += dailyReturn;

        if (i < numSamples) {
          path.push(cumulativeReturn);
        }
      }

      returns.push(cumulativeReturn);

      if (i < numSamples) {
        samplePaths.push(path);
      }
    }

    const sorted = [...returns].sort((a, b) => a - b);

    return {
      simulations,
      meanReturn: this.calculateMean(returns),
      medianReturn: sorted[Math.floor(simulations / 2)],
      stdDevReturn: this.calculateStdDev(returns),
      percentile5: sorted[Math.floor(simulations * 0.05)],
      percentile25: sorted[Math.floor(simulations * 0.25)],
      percentile50: sorted[Math.floor(simulations * 0.5)],
      percentile75: sorted[Math.floor(simulations * 0.75)],
      percentile95: sorted[Math.floor(simulations * 0.95)],
      probabilityOfLoss: returns.filter((r) => r < 0).length / simulations,
      var95: this.calculateHistoricalVaR(returns, 0.95),
      cvar95: this.calculateExpectedShortfall(returns, 0.95),
      samplePaths,
    };
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map((val) => (val - mean) ** 2);
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  private getZScore(confidence: number): number {
    // Z-scores for common confidence levels
    const zScores: Record<number, number> = {
      0.9: 1.282,
      0.95: 1.645,
      0.99: 2.326,
      0.995: 2.576,
      0.999: 3.09,
    };

    return zScores[confidence] || 1.645;
  }

  private calculateDrawdownDuration(cumulativeReturns: number[]): number {
    if (cumulativeReturns.length === 0) return 0;

    const peak = Math.max(...cumulativeReturns);
    const peakIndex = cumulativeReturns.lastIndexOf(peak);

    if (peakIndex === cumulativeReturns.length - 1) return 0;

    return cumulativeReturns.length - peakIndex - 1;
  }
}

// Export singleton instance
export const riskCalculator = new RiskMetricsCalculator();
