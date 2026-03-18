import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from typing import Dict, Any, Tuple, Optional

class TrainingService:
    """Service for training CGPA prediction model"""
    
    def __init__(self, model_dir: str = 'models'):
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'cgpa_predictor.pkl')
        self.scaler_path = os.path.join(model_dir, 'scaler.pkl')
        
        # Ensure model directory exists
        os.makedirs(model_dir, exist_ok=True)
    
    def train_with_synthetic_data(self, n_samples: int = 1000) -> Dict[str, Any]:
        """
        Train model with synthetic data
        Useful when real data is not available
        """
        print("📊 Generating synthetic training data...")
        
        # Generate synthetic data
        X, y = self._generate_synthetic_data(n_samples)
        
        # Train model
        return self._train_model(X, y)
    
    def train_with_database(self, db_url: str) -> Dict[str, Any]:
        """
        Train model with data from database
        """
        print("📊 Fetching training data from database...")
        
        try:
            from sqlalchemy import create_engine, text
            
            engine = create_engine(db_url)
            
            # Fetch marks data
            query = """
            SELECT 
                s.id as student_id,
                m.semester,
                AVG(m.marks_obtained / m.total_marks * 100) as avg_percentage
            FROM marks m
            JOIN students s ON m.student_id = s.id
            GROUP BY s.id, m.semester
            ORDER BY s.id, m.semester
            """
            
            df = pd.read_sql(text(query), engine)
            
            if df.empty:
                return {
                    "success": False,
                    "message": "No training data found in database"
                }
            
            # Process data
            X, y = self._process_database_data(df)
            
            # Train model
            return self._train_model(X, y)
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Database training failed: {str(e)}"
            }
    
    def _generate_synthetic_data(self, n_samples: int) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data
        
        Features: [sem1_avg, sem2_avg, ..., sem8_avg, overall_avg, trend, consistency, completed_sems]
        Target: Final CGPA
        """
        np.random.seed(42)
        
        X = []
        y = []
        
        for _ in range(n_samples):
            # Random number of completed semesters (1-8)
            completed_sems = np.random.randint(1, 9)
            
            # Base performance level (30-95)
            base_performance = np.random.uniform(30, 95)
            
            # Generate semester scores with some variation
            semester_scores = []
            trend_direction = np.random.choice([-1, 0, 1], p=[0.2, 0.4, 0.4])
            
            for sem in range(1, 9):
                if sem <= completed_sems:
                    # Score with trend and random variation
                    score = base_performance + (sem - 1) * trend_direction * 2
                    score += np.random.normal(0, 5)
                    score = max(20, min(100, score))  # Clamp to valid range
                    semester_scores.append(score)
                else:
                    semester_scores.append(0)
            
            # Calculate additional features
            non_zero = [s for s in semester_scores if s > 0]
            overall_avg = np.mean(non_zero) if non_zero else 0
            trend = self._calculate_trend(non_zero)
            consistency = np.std(non_zero) if len(non_zero) > 1 else 0
            
            # Feature vector
            features = semester_scores + [overall_avg, trend, consistency, completed_sems]
            
            # Target CGPA (0-10 scale)
            cgpa = (overall_avg / 100) * 10
            # Add some noise
            cgpa += np.random.normal(0, 0.1)
            cgpa = max(0, min(10, cgpa))
            
            X.append(features)
            y.append(cgpa)
        
        return np.array(X), np.array(y)
    
    def _calculate_trend(self, scores: list) -> float:
        """Calculate trend from scores"""
        if len(scores) < 2:
            return 0.0
        
        x = np.arange(len(scores))
        y = np.array(scores)
        
        n = len(x)
        if n * np.sum(x ** 2) - np.sum(x) ** 2 == 0:
            return 0.0
            
        slope = (n * np.sum(x * y) - np.sum(x) * np.sum(y)) / \
                (n * np.sum(x ** 2) - np.sum(x) ** 2)
        
        return float(slope)
    
    def _process_database_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Process database data into features and targets"""
        
        # Pivot to get semester columns
        pivot_df = df.pivot(index='student_id', columns='semester', values='avg_percentage')
        pivot_df = pivot_df.fillna(0)
        
        # Ensure all 8 semesters exist
        for sem in range(1, 9):
            if sem not in pivot_df.columns:
                pivot_df[sem] = 0
        
        # Sort columns
        pivot_df = pivot_df[[1, 2, 3, 4, 5, 6, 7, 8]]
        
        X = []
        y = []
        
        for _, row in pivot_df.iterrows():
            semester_scores = row.values.tolist()
            
            non_zero = [s for s in semester_scores if s > 0]
            if not non_zero:
                continue
            
            overall_avg = np.mean(non_zero)
            trend = self._calculate_trend(non_zero)
            consistency = np.std(non_zero) if len(non_zero) > 1 else 0
            completed_sems = len(non_zero)
            
            features = semester_scores + [overall_avg, trend, consistency, completed_sems]
            cgpa = (overall_avg / 100) * 10
            
            X.append(features)
            y.append(cgpa)
        
        return np.array(X), np.array(y)
    
    def _train_model(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train and evaluate model"""
        
        print(f"📊 Training data shape: X={X.shape}, y={y.shape}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train multiple models and select best
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
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            results[name] = {
                'rmse': round(rmse, 4),
                'mae': round(mae, 4),
                'r2': round(r2, 4)
            }
            
            print(f"   {name}: RMSE={rmse:.4f}, MAE={mae:.4f}, R²={r2:.4f}")
            
            if r2 > best_score:
                best_score = r2
                best_model = model
                best_name = name
        
        print(f"\n✅ Best model: {best_name} with R²={best_score:.4f}")
        
        # Save best model and scaler
        joblib.dump(best_model, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        
        print(f"💾 Model saved to {self.model_path}")
        print(f"💾 Scaler saved to {self.scaler_path}")
        
        return {
            "success": True,
            "message": f"Model trained successfully",
            "bestModel": best_name,
            "metrics": results[best_name],
            "allResults": results,
            "trainingSize": len(X_train),
            "testSize": len(X_test),
            "modelPath": self.model_path
        }