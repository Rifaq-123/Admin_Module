import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import (
    train_test_split, cross_val_score
)
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor
)
from sklearn.linear_model import Ridge
from sklearn.metrics import (
    mean_squared_error,
    r2_score,
    mean_absolute_error
)
from typing import Dict, Any, Tuple

class TrainingService:
    """
    Train model to predict NEXT semester CGPA
    from past semester CGPAs
    """
    
    def __init__(self, model_dir: str = 'models'):
        self.model_dir = model_dir
        self.model_path = os.path.join(
            model_dir, 'cgpa_predictor.pkl'
        )
        self.scaler_path = os.path.join(
            model_dir, 'scaler.pkl'
        )
        os.makedirs(model_dir, exist_ok=True)
    
    def train_with_synthetic_data(
        self, n_samples: int = 1000
    ) -> Dict[str, Any]:
        """Train with synthetic semester CGPA data"""
        
        print("📊 Generating synthetic CGPA data...")
        X, y = self._generate_synthetic_data(n_samples)
        return self._train_model(X, y)
    
    def _generate_synthetic_data(
        self, n_samples: int
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data.

        Logic:
        - For each student, generate 2-7 past semesters
        - Then the NEXT semester CGPA is the target
        
        Example:
          Past CGPAs: [9.0, 6.0]
          Target (next sem): 4.5  (declining trend)
        
        Features same as DataProcessor._build_feature_vector
        """
        np.random.seed(42)
        
        X = []
        y = []
        
        for _ in range(n_samples):
            # Random number of past semesters (2 to 7)
            # Min 2 so we can calculate trend
            n_sems = np.random.randint(2, 8)
            
            # Base CGPA for this student (4.0 - 9.5)
            base_cgpa = np.random.uniform(4.0, 9.5)
            
            # Random trend: improving, declining, stable
            trend_direction = np.random.choice(
                [-1, 0, 1],
                p=[0.25, 0.45, 0.30]
            )
            
            # Generate past semesters
            past_cgpas = []
            for sem in range(n_sems):
                cgpa = base_cgpa + (
                    sem * trend_direction * 0.3
                )
                # Add noise
                cgpa += np.random.normal(0, 0.4)
                # Clamp to valid CGPA range
                cgpa = max(0.0, min(10.0, cgpa))
                past_cgpas.append(cgpa)
            
            # ── Target: Next semester CGPA ────────────
            # Based on trend + noise + mean reversion
            avg = np.mean(past_cgpas)
            last = past_cgpas[-1]
            
            # Predict next with trend and reversion
            if len(past_cgpas) >= 2:
                recent_change = (
                    past_cgpas[-1] - past_cgpas[-2]
                )
            else:
                recent_change = 0.0
            
            # 60% recent trend + 40% average
            predicted_change = (
                recent_change * 0.6 + 
                (avg - last) * 0.4
            )
            
            next_cgpa = last + predicted_change
            next_cgpa += np.random.normal(0, 0.2)
            next_cgpa = max(0.0, min(10.0, next_cgpa))
            
            # ── Build Feature Vector ──────────────────
            # Same structure as DataProcessor
            sem_features = [0.0] * 8
            for i, cgpa in enumerate(past_cgpas):
                sem_features[i] = cgpa
            
            overall_avg = np.mean(past_cgpas)
            trend = self._calculate_trend(past_cgpas)
            consistency = np.std(past_cgpas)
            completed = len(past_cgpas)
            recent_ch = (
                past_cgpas[-1] - past_cgpas[-2]
                if len(past_cgpas) >= 2 else 0.0
            )
            weighted = (
                past_cgpas[-1] * 0.6 + overall_avg * 0.4
            )
            
            features = sem_features + [
                overall_avg,
                trend,
                consistency,
                completed,
                recent_ch,
                weighted
            ]
            
            X.append(features)
            y.append(next_cgpa)
        
        return np.array(X), np.array(y)
    
    def _calculate_trend(
        self, cgpas: list
    ) -> float:
        """Linear regression slope"""
        if len(cgpas) < 2:
            return 0.0
        
        x = np.arange(len(cgpas))
        y = np.array(cgpas)
        n = len(x)
        
        denom = n * np.sum(x ** 2) - np.sum(x) ** 2
        if abs(denom) < 1e-10:
            return 0.0
        
        slope = (
            n * np.sum(x * y) - np.sum(x) * np.sum(y)
        ) / denom
        
        return float(slope)
    
    def _train_model(
        self, X: np.ndarray, y: np.ndarray
    ) -> Dict[str, Any]:
        """Train and select best model"""
        
        print(f"📊 Data: X={X.shape}, y={y.shape}")
        
        X_train, X_test, y_train, y_test = (
            train_test_split(
                X, y,
                test_size=0.2,
                random_state=42
            )
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)
        
        models = {
            'RandomForest': RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            ),
            'GradientBoosting': GradientBoostingRegressor(
                n_estimators=100,
                max_depth=5,
                random_state=42
            ),
            'Ridge': Ridge(alpha=1.0)
        }
        
        best_model = None
        best_score = -float('inf')
        best_name = None
        results = {}
        
        for name, model in models.items():
            print(f"🔄 Training {name}...")
            model.fit(X_train_s, y_train)
            
            y_pred = model.predict(X_test_s)
            
            rmse = np.sqrt(
                mean_squared_error(y_test, y_pred)
            )
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            results[name] = {
                'rmse': round(rmse, 4),
                'mae': round(mae, 4),
                'r2': round(r2, 4)
            }
            
            print(
                f"   {name}: RMSE={rmse:.4f}, "
                f"R²={r2:.4f}"
            )
            
            if r2 > best_score:
                best_score = r2
                best_model = model
                best_name = name
        
        # Save model and scaler
        joblib.dump(best_model, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        
        print(f"\n✅ Best: {best_name} R²={best_score:.4f}")
        print(f"💾 Saved to {self.model_path}")
        
        return {
            "success": True,
            "message": "Model trained successfully",
            "bestModel": best_name,
            "metrics": results[best_name],
            "allResults": results,
            "trainingSize": len(X_train),
            "testSize": len(X_test),
            "modelPath": self.model_path
        }