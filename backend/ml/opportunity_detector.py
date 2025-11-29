import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import shap
import os
from .features import FeatureEngineer

class OpportunityDetector:
    def __init__(self):
        self.model = None
        self.feature_engineer = FeatureEngineer()
        self.version = '1.0.0'
        self.model_dir = 'backend/ml/models'
        os.makedirs(self.model_dir, exist_ok=True)
    
    def train(self, df: pd.DataFrame):
        """Train model on historical data"""
        print(f"Starting training with {len(df)} records...")
        
        # Create features
        df = self.feature_engineer.create_features(df)
        
        if len(df) < 100:
            raise ValueError("Not enough data points after feature engineering")

        # Split data
        X = df[self.feature_engineer.feature_columns]
        y = df['target']
        
        # Time-based split is better for financial data, but random stratified is okay for MVP
        # Using stratified shuffle split
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.4, random_state=42, stratify=y
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
        )
        
        # Train XGBoost
        # Using binary classification
        # early_stopping_rounds is now constructor param in newer xgboost sklearn API or fit param depending on version.
        # In 2.1.4, it should be in constructor or passed to fit.
        # Let's put it in constructor for simplicity if supported, OR use callbacks.
        # Actually, sklearn API uses early_stopping_rounds in fit() but newer versions might have changed signature.
        # In 2.0+, it's often recommended to use callbacks or constructor.
        # Let's try removing from fit() and putting in constructor if supported, OR use callbacks.
        
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='logloss',
            objective='binary:logistic',
            early_stopping_rounds=10 # Moved to constructor for newer versions
        )
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        print(f"Model Performance:")
        print(f"  Accuracy:  {accuracy:.2%}")
        print(f"  Precision: {precision:.2%}")
        print(f"  Recall:    {recall:.2%}")
        print(f"  F1 Score:  {f1:.2%}")
        
        # Feature importance
        importance = self.feature_engineer.get_feature_importance(self.model)
        print("\nTop Features:")
        print(importance.head(5))
        
        # SHAP explainability (optional for training but good for checking)
        # explainer = shap.TreeExplainer(self.model)
        # shap_values = explainer.shap_values(X_test[:100])
        
        # Save model
        self.save_model()
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'feature_importance': importance.to_dict()
        }
    
    def predict(self, df: pd.DataFrame):
        """Predict opportunities on new data"""
        if self.model is None:
            self.load_model()
        
        # Process features
        # Note: create_features drops NaN rows (windowing).
        # If input df is small (e.g. just last 50 candles), we get 1 row prediction
        df_processed = self.feature_engineer.create_features(df)
        
        if df_processed.empty:
            return []

        X = df_processed[self.feature_engineer.feature_columns]
        
        probabilities = self.model.predict_proba(X)
        predictions = self.model.predict(X)
        
        results = []
        for i in range(len(predictions)):
            results.append({
                'timestamp': df_processed.index[i] if isinstance(df_processed.index, pd.DatetimeIndex) else i,
                'prediction': int(predictions[i]),
                'probability': float(probabilities[i][1]),  # Prob of class 1
                'features': X.iloc[i].to_dict()
            })
            
        return results
    
    def save_model(self):
        """Save model with versioning"""
        model_path = f'{self.model_dir}/opportunity_detector_v{self.version}.pkl'
        joblib.dump({
            'model': self.model,
            'feature_engineer': self.feature_engineer,
            'version': self.version
        }, model_path)
        print(f"Model saved: {model_path}")
    
    def load_model(self):
        """Load latest model"""
        model_path = f'{self.model_dir}/opportunity_detector_v{self.version}.pkl'
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
            
        data = joblib.load(model_path)
        self.model = data['model']
        self.feature_engineer = data['feature_engineer']
