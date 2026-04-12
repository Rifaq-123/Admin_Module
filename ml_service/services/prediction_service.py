import os
import numpy as np
import joblib
from typing import Dict, Any, List
from utils.data_processor import DataProcessor
from collections import defaultdict

class PredictionService:
    """
    Predicts NEXT semester CGPA from past marks data
    """
    
    def __init__(
        self, model_path: str, scaler_path: str
    ):
        self.model = None
        self.scaler = None
        self.model_path = model_path
        self.scaler_path = scaler_path
        self._load_model()
    
    def _load_model(self):
        """Load trained model and scaler"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(
                    self.model_path
                )
                print(f"✅ Model loaded")
            else:
                print(f"⚠️ Model not found")
                self.model = None
            
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(
                    self.scaler_path
                )
                print(f"✅ Scaler loaded")
            else:
                self.scaler = None
                
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
            self.scaler = None
    
    def predict(
        self, marks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Predict next semester CGPA from marks data

        Input marks example:
        [
          {"marksObtained": 90, "totalMarks": 100,
           "semester": 1},
          {"marksObtained": 60, "totalMarks": 100,
           "semester": 2}
        ]

        This means:
          Sem 1 CGPA = 9.0
          Sem 2 CGPA = 6.0
          Predicted Sem 3 CGPA = ?
        """
        try:
            # Get past CGPAs from marks
            past_cgpas = self._extract_semester_cgpas(
                marks
            )
            
            if not past_cgpas:
                return {
                    "success": False,
                    "message": "No valid marks data",
                    "predictedCGPA": None,
                    "confidence": 0
                }
            
            # Build feature vector
            features = (
                DataProcessor
                .process_marks_for_prediction(marks)
            )
            
            # Scale and predict
            if self.scaler is not None:
                features = self.scaler.transform(
                    features
                )
            
            if self.model is not None:
                predicted = float(
                    self.model.predict(features)[0]
                )
                model_used = "ml_model"
            else:
                # Fallback prediction
                predicted = self._fallback_prediction(
                    past_cgpas
                )
                model_used = "fallback"
            
            # Clamp to valid range
            predicted = max(0.0, min(10.0, predicted))
            
            # Confidence
            confidence = DataProcessor \
                .calculate_confidence(marks)
            
            # Insights
            insights = DataProcessor \
                .get_performance_insights(marks)
            
            # Prediction range
            std = np.std(past_cgpas) \
                if len(past_cgpas) > 1 else 0.5
            margin = max(std, 0.3)
            
            return {
                "success": True,
                "predictedCGPA": round(predicted, 2),
                "confidence": confidence,
                "range": {
                    "low": round(
                        max(0, predicted - margin), 2
                    ),
                    "high": round(
                        min(10, predicted + margin), 2
                    )
                },
                "pastSemesterCGPAs": past_cgpas,
                "predictingForSemester": (
                    len(past_cgpas) + 1
                ),
                "insights": insights,
                "modelUsed": model_used,
                "dataPoints": len(marks)
            }
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return {
                "success": False,
                "message": f"Prediction failed: {str(e)}",
                "predictedCGPA": None,
                "confidence": 0
            }
    
    def _extract_semester_cgpas(
        self, marks: List[Dict[str, Any]]
    ) -> List[float]:
        """
        Extract ordered semester CGPAs from marks
        
        Sem 1: avg(marks) → CGPA
        Sem 2: avg(marks) → CGPA
        ...
        """
        semester_marks = defaultdict(list)
        
        for mark in marks:
            sem = int(mark.get('semester', 1))
            obtained = float(
                mark.get('marksObtained', 0)
            )
            total = float(
                mark.get('totalMarks', 100)
            )
            if total > 0:
                semester_marks[sem].append(
                    (obtained / total) * 10
                )
        
        # Return in semester order
        return [
            round(np.mean(semester_marks[sem]), 2)
            for sem in sorted(semester_marks.keys())
        ]
    
    def _fallback_prediction(
        self, past_cgpas: List[float]
    ) -> float:
        """
        Predict next CGPA using weighted trend formula
        when ML model is not available

        Formula:
        1. recent_change = last - second_last
        2. avg_change = mean of all changes
        3. predicted_change = 
               recent_change * 0.6 + avg_change * 0.4
        4. predicted = last + predicted_change
        5. Apply mean reversion (20% pull to average)
        """
        if not past_cgpas:
            return 0.0
        
        if len(past_cgpas) == 1:
            return past_cgpas[0]
        
        # Changes between semesters
        changes = [
            past_cgpas[i] - past_cgpas[i - 1]
            for i in range(1, len(past_cgpas))
        ]
        
        avg_change = float(np.mean(changes))
        recent_change = changes[-1]
        
        # Weighted change
        predicted_change = (
            recent_change * 0.6 + avg_change * 0.4
        )
        
        last = past_cgpas[-1]
        mean = float(np.mean(past_cgpas))
        
        # Predict next
        predicted = last + predicted_change
        
        # Mean reversion (20%)
        predicted = predicted + (mean - predicted) * 0.2
        
        return max(0.0, min(10.0, predicted))
    
    def is_model_loaded(self) -> bool:
        return self.model is not None
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "modelLoaded": self.model is not None,
            "scalerLoaded": self.scaler is not None,
            "modelPath": self.model_path,
            "modelType": (
                type(self.model).__name__
                if self.model else None
            )
        }