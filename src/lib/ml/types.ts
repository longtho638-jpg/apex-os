/**
 * Machine Learning - Type Definitions
 *
 * Comprehensive interfaces for ML models, predictions, and training.
 */

// ============================================================================
// MODEL TYPES
// ============================================================================

export type MLModelType = 'dense_nn' | 'lstm' | 'ensemble' | 'random_forest';
export type PredictionClass = 'BUY' | 'SELL' | 'HOLD';

export interface MLModel {
  id: string;
  name: string;
  type: MLModelType;
  version: string;

  // Model metadata
  inputShape: number[]; // e.g., [34] for 34 features
  outputShape: number[]; // e.g., [3] for BUY/SELL/HOLD

  // Performance metrics
  accuracy: number; // Validation accuracy
  precision: number;
  recall: number;
  f1Score: number;

  // Training info
  trainedOn: number; // Timestamp
  epochs: number;
  sampleCount: number;

  // Model file
  modelPath?: string; // Path to saved model
  weightsPath?: string;
}

// ============================================================================
// PREDICTIONS
// ============================================================================

export interface MLPrediction {
  // Probabilities
  buyProbability: number; // 0-1
  sellProbability: number;
  holdProbability: number;

  // Prediction
  predictedClass: PredictionClass;
  confidence: number; // Max probability

  // Model info
  modelId: string;
  timestamp: number;

  // Features used
  features: number[];
  featureNames: string[];
}

export interface EnsemblePrediction extends MLPrediction {
  // Individual model predictions
  modelPredictions: MLPrediction[];

  // Ensemble metrics
  agreement: number; // % of models agreeing
  disagreement: number; // Maximum probability spread
  consensusStrength: number; // How strong is the consensus

  // Voting weights
  weights: number[];
}

// ============================================================================
// FEATURE PREPARATION
// ============================================================================

export interface FeatureVector {
  raw: number[]; // Raw feature values
  normalized: number[]; // Normalized features
  names: string[]; // Feature names
  timestamp: number;
}

export interface FeatureScaler {
  method: 'minmax' | 'standard' | 'robust';

  // Scaling parameters
  min?: number[];
  max?: number[];
  mean?: number[];
  std?: number[];
}

export interface SequenceData {
  sequences: number[][][]; // [samples, timesteps, features]
  labels: number[][]; // [samples, classes]
  timesteps: number;
  featureCount: number;
}

// ============================================================================
// TRAINING
// ============================================================================

export interface TrainingConfig {
  // Data split
  trainSplit: number; // e.g., 0.8 for 80% train
  validationSplit: number; // e.g., 0.2 for 20% validation

  // Hyperparameters
  epochs: number;
  batchSize: number;
  learningRate: number;

  // Regularization
  dropout?: number;
  l1?: number;
  l2?: number;

  // Early stopping
  patience?: number;
  minDelta?: number;

  // Callbacks
  callbacks?: string[];
}

export interface TrainingMetrics {
  epoch: number;

  // Loss
  trainLoss: number;
  validationLoss: number;

  // Accuracy
  trainAccuracy: number;
  validationAccuracy: number;

  // Time
  epochDurationMs: number;
  totalDurationMs: number;
}

export interface TrainingHistory {
  modelId: string;
  config: TrainingConfig;

  // Metrics per epoch
  epochs: TrainingMetrics[];

  // Final metrics
  finalAccuracy: number;
  finalLoss: number;
  bestEpoch: number;

  // Confusion matrix
  confusionMatrix?: number[][];

  // Training time
  startTime: number;
  endTime: number;
}

// ============================================================================
// FEATURE IMPORTANCE
// ============================================================================

export interface FeatureImportance {
  featureName: string;
  importance: number; // 0-1 normalized importance
  rank: number; // 1-based ranking

  // Statistical significance
  pValue?: number;
  confidence?: number;
}

export interface FeatureImportanceAnalysis {
  method: 'permutation' | 'shap' | 'gradient' | 'weights';
  features: FeatureImportance[];

  // Top features
  top5: FeatureImportance[];
  top10: FeatureImportance[];

  timestamp: number;
}

// ============================================================================
// MODEL EVALUATION
// ============================================================================

export interface ConfusionMatrix {
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;

  // Derived metrics
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
}

export interface ModelEvaluation {
  modelId: string;

  // Performance
  confusionMatrix: ConfusionMatrix;
  accuracy: number;
  loss: number;

  // Per-class metrics
  classMetrics: {
    className: PredictionClass;
    precision: number;
    recall: number;
    f1Score: number;
    support: number; // Number of samples
  }[];

  // ROC/AUC (if binary)
  rocAuc?: number;

  // Calibration
  calibrationError?: number; // Expected Calibration Error

  // Testing info
  testSamples: number;
  timestamp: number;
}

// ============================================================================
// BACKTESTING
// ============================================================================

export interface MLBacktestResult {
  modelId: string;

  // Period
  startDate: number;
  endDate: number;
  totalDays: number;

  // Trades
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;

  // Performance
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;

  // Vs baseline
  baselineReturn: number; // Buy & hold
  alpha: number; // Excess return

  // Prediction accuracy
  predictionAccuracy: number;
  avgConfidence: number;
}

// ============================================================================
// INFERENCE
// ============================================================================

export interface InferenceRequest {
  features: number[];
  featureNames?: string[];
  modelId?: string; // Use specific model, or default
  useEnsemble?: boolean;
}

export interface InferenceResponse {
  prediction: MLPrediction | EnsemblePrediction;

  // Performance
  inferenceTimeMs: number;

  // Feature importance for this prediction
  topFeatures?: FeatureImportance[];
}

// ============================================================================
// MODEL REGISTRY
// ============================================================================

export interface ModelRegistry {
  models: MLModel[];
  activeModelId: string;

  // Version control
  latestVersion: string;
  previousVersions: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface MLConfig {
  // Model selection
  defaultModel: MLModelType;
  useEnsemble: boolean;

  // Inference
  inferenceTimeout: number; // ms
  batchInference: boolean;

  // Features
  maxFeatures: number; // Feature selection
  featureSelectionMethod: 'correlation' | 'importance' | 'pca';

  // Performance
  useWebGL: boolean;
  cacheModels: boolean;

  // Retraining
  autoRetrain: boolean;
  retrainIntervalDays: number;
  minSamplesForRetrain: number;
}

// ============================================================================
// LIVE PREDICTION STREAM
// ============================================================================

export interface PredictionStream {
  symbol: string;
  predictions: MLPrediction[];

  // Rolling accuracy
  recentAccuracy: number; // Last 100 predictions

  // Prediction consistency
  flipCount: number; // How many times prediction changed
  strongestPrediction: PredictionClass;

  lastUpdate: number;
}
