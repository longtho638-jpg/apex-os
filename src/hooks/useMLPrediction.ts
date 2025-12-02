/**
 * React Hook for ML Predictions
 * 
 * Provides real-time ML predictions based on quantitative features.
 */

import { useState, useEffect, useRef } from 'react';
import { mlPredictor } from '@/lib/ml/SimplePredictor';
import type { MLPrediction, FeatureImportance } from '@/lib/ml/types';
import type { TechnicalFeatures } from '@/lib/quant/types';

interface UseMLPredictionOptions {
    features: TechnicalFeatures | null;
    currentPrice: number;
    enabled?: boolean;
}

export function useMLPrediction({
    features,
    currentPrice,
    enabled = true
}: UseMLPredictionOptions) {
    const [state, setState] = useState({
        prediction: null as any,
        featureImportance: [] as any[],
        loading: true,
        error: null as Error | null
    });

    // Use ref to track if we've already predicted for these features
    const lastFeaturesRef = useRef<string>('');

    useEffect(() => {
        if (!enabled || !features) {
            setState(prev => ({ ...prev, loading: false, error: !features ? new Error('No features provided') : null }));
            return;
        }

        // Create a hash of features to detect actual changes
        const featuresHash = JSON.stringify(features);

        // Skip if features haven't actually changed
        if (featuresHash === lastFeaturesRef.current) {
            return;
        }

        lastFeaturesRef.current = featuresHash;

        const predict = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                // Get prediction
                const prediction = await mlPredictor.predict(features, currentPrice);
                const featureImportance = mlPredictor.getTopFeatures(5, features);

                setState({
                    prediction,
                    featureImportance,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('[useMLPrediction] Error:', error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error : new Error('Prediction failed')
                }));
            }
        };

        predict();
    }, [enabled, currentPrice, features]); // Added features to dependency array to ensure re-run if features object reference changes, even if content is same. The useRef check handles content.

    return state;
}
