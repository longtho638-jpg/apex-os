/**
 * Risk Management - Type Definitions
 * 
 * Comprehensive interfaces for risk metrics, position sizing, and portfolio management.
 */

// ============================================================================
// RISK METRICS
// ============================================================================

export interface RiskMetrics {
    // Value at Risk
    var95: number;              // 95% VaR (daily)
    var99: number;              // 99% VaR (daily)
    varMethod: 'historical' | 'parametric' | 'montecarlo';

    // Expected Shortfall (CVaR)
    cvar95: number;             // Expected loss beyond VaR
    cvar99: number;

    // Performance Metrics
    sharpeRatio: number;        // Risk-adjusted return
    sortinoRatio: number;       // Downside risk-adjusted return
    calmarRatio: number;        // Return / Max Drawdown

    // Drawdown
    maxDrawdown: number;        // Maximum peak-to-trough decline
    currentDrawdown: number;    // Current drawdown from peak
    drawdownDuration: number;   // Days in current drawdown

    // Volatility
    volatility: number;         // Annualized volatility
    downsideVolatility: number; // Volatility of negative returns

    // Time period
    periodDays: number;
    timestamp: number;
}

export interface PortfolioRisk {
    totalValue: number;
    allocatedCapital: number;
    availableCapital: number;

    // Position-level risk
    positions: PositionRisk[];

    // Portfolio-level metrics
    portfolioVaR: number;
    portfolioSharpe: number;
    concentration: number;      // Max % in single position
    leverage: number;           // Total notional / capital

    // Risk limits
    limits: RiskLimits;
    violations: RiskViolation[];
}

export interface PositionRisk {
    symbol: string;
    size: number;               // Position size in base currency
    notional: number;           // Size * Price
    pnl: number;                // Unrealized P&L
    pnlPercent: number;         // P&L as % of position

    // Risk metrics
    var95: number;              // Position VaR
    beta: number;               // Correlation to portfolio
    contribution: number;       // Risk contribution to portfolio

    // Sizing
    weight: number;             // % of portfolio
    targetWeight: number;       // Optimal weight
    rebalanceAmount: number;    // Amount to buy/sell for rebalance
}

export interface RiskLimits {
    maxVaR: number;             // Maximum portfolio VaR (e.g., 0.02 = 2%)
    maxDrawdown: number;        // Maximum acceptable drawdown
    maxLeverage: number;        // Maximum leverage multiplier
    maxConcentration: number;   // Max % in single position
    minSharpe: number;          // Minimum required Sharpe ratio

    // Position limits
    maxPositionSize: number;    // Max size per position (USD)
    maxPositions: number;       // Max number of positions
}

export interface RiskViolation {
    type: 'VAR_BREACH' | 'DRAWDOWN_LIMIT' | 'LEVERAGE_LIMIT' | 'CONCENTRATION_RISK';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    value: number;
    limit: number;
    timestamp: number;
    action: 'MONITOR' | 'REDUCE_POSITIONS' | 'CLOSE_ALL' | 'HALT_TRADING';
}

// ============================================================================
// POSITION SIZING
// ============================================================================

export interface PositionSizeRecommendation {
    symbol: string;
    recommendedSize: number;    // In base currency
    recommendedNotional: number; // Size * Price
    leverage: number;

    // Sizing method
    method: 'kelly' | 'risk_parity' | 'fixed_fractional' | 'volatility_adjusted';

    // Risk parameters
    stopLoss: number;           // Stop loss price
    takeProfit: number;         // Take profit price
    riskAmount: number;         // Max $ risk on this trade
    riskPercent: number;        // Max % risk of portfolio

    // Expected metrics
    expectedReturn: number;     // Expected return %
    winRate: number;            // Probability of profit
    riskRewardRatio: number;    // Reward / Risk

    // Confidence
    confidence: number;         // 0-1 confidence in this sizing
    reasoning: string[];
}

export interface KellyParameters {
    winRate: number;            // Probability of winning (0-1)
    avgWin: number;             // Average win size
    avgLoss: number;            // Average loss size
    maxFraction: number;        // Max Kelly fraction (safety factor)
}

export interface RiskParityParameters {
    assets: string[];
    volatilities: number[];     // Historical volatility for each asset
    targetRisk: number;         // Target portfolio risk
}

// ============================================================================
// PORTFOLIO OPTIMIZATION
// ============================================================================

export interface OptimalPortfolio {
    weights: Record<string, number>;    // Asset -> weight
    expectedReturn: number;             // Expected portfolio return
    expectedRisk: number;               // Expected portfolio volatility
    sharpeRatio: number;

    // Optimization method
    method: 'mean_variance' | 'risk_parity' | 'max_sharpe' | 'min_variance';

    // Constraints used
    constraints: {
        minWeight: number;              // Min weight per asset
        maxWeight: number;              // Max weight per asset
        targetReturn?: number;          // Target return (if specified)
        targetRisk?: number;            // Target risk (if specified)
    };

    // Diversification
    diversificationRatio: number;       // Measure of diversification
    effectiveAssets: number;            // Effective number of assets
}

// ============================================================================
// MONTE CARLO SIMULATION
// ============================================================================

export interface MonteCarloResult {
    simulations: number;

    // Return distribution
    meanReturn: number;
    medianReturn: number;
    stdDevReturn: number;

    // Percentiles
    percentile5: number;        // 5th percentile (worst case)
    percentile25: number;
    percentile50: number;
    percentile75: number;
    percentile95: number;       // 95th percentile (best case)

    // Risk metrics
    probabilityOfLoss: number;  // Probability of negative return
    var95: number;
    cvar95: number;

    // Paths
    samplePaths: number[][];    // Sample simulation paths for visualization
}

// ============================================================================
// HISTORICAL RETURNS
// ============================================================================

export interface ReturnsSeries {
    symbol: string;
    returns: number[];          // Daily returns
    cumulativeReturns: number[]; // Cumulative returns
    timestamps: number[];

    // Statistics
    mean: number;
    median: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;

    // Performance
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
}

// ============================================================================
// CORRELATION & COVARIANCE
// ============================================================================

export interface CorrelationMatrix {
    assets: string[];
    matrix: number[][];         // Correlation coefficients
    timestamp: number;
}

export interface CovarianceMatrix {
    assets: string[];
    matrix: number[][];         // Covariance values
    timestamp: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface RiskConfig {
    // VaR parameters
    varConfidence: number;      // Default: 0.95
    varMethod: 'historical' | 'parametric' | 'montecarlo';
    monteCarloSimulations: number;

    // Portfolio limits
    limits: RiskLimits;

    // Position sizing
    defaultSizingMethod: 'kelly' | 'risk_parity' | 'fixed_fractional';
    kellyFraction: number;      // Half-Kelly = 0.5

    // Risk-free rate
    riskFreeRate: number;       // Annual rate for Sharpe calculations

    // Update frequency
    refreshIntervalMs: number;
}
