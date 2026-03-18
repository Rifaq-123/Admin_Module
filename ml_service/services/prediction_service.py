import os
import numpy as np
import joblib
from typing import Dict, Any, List, Optional
from utils.data_processor import DataProcessor

class PredictionService:
    """Service for CGPA predictions"""
    
    def __init__(self, model_path: str, scaler_path: str):
        self.model = None
        self.scaler = None
        self.model_path = model_path
        self.scaler_path = scaler_path
        self._load_model()
    
    def _load_model(self):
        """Load trained model and scaler"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"✅ Model loaded from {self.model_path}")
            else:
                print(f"⚠️ Model not found at {self.model_path}")
                self.model = None
            
            if os.path.exists(self.scaler_path):
                self.scaler = joblib.load(self.scaler_path)
                print(f"✅ Scaler loaded from {self.scaler_path}")
            else:
                print(f"⚠️ Scaler not found at {self.scaler_path}")
                self.scaler = None
                
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            self.model = None
            self.scaler = None
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.model is not None
    
    def predict(self, marks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict CGPA based on marks data
        """
        try:
            # Process marks into features
            features = DataProcessor.process_marks_for_prediction(marks)
            
            # Scale features if scaler is available
            if self.scaler is not None:
                features = self.scaler.transform(features)
            
            # Make prediction
            if self.model is not None:
                predicted_cgpa = self.model.predict(features)[0]
            else:
                # Fallback: Simple calculation if model not available
                predicted_cgpa = self._fallback_prediction(marks)
            
            # Ensure CGPA is within valid range (0-10)
            predicted_cgpa = max(0, min(10, predicted_cgpa))
            
            # Calculate confidence
            confidence = DataProcessor.calculate_confidence(marks)
            
            # Get insights
            insights = DataProcessor.get_performance_insights(marks)
            
            return {
                "success": True,
                "predictedCGPA": round(float(predicted_cgpa), 2),
                "confidence": confidence,
                "insights": insights,
                "modelUsed": "ml_model" if self.model is not None else "fallback",
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
    
    def _fallback_prediction(self, marks: List[Dict[str, Any]]) -> float:
        """
        Simple fallback prediction when model is not available
        Uses weighted average based on semester progression
        """
        if not marks:
            return 0.0
        
        # Calculate weighted average (recent semesters weighted more)
        semester_scores = {}
        for mark in marks:
            semester = mark.get('semester', 1)
            marks_obtained = float(mark.get('marksObtained', 0))
            total_marks = float(mark.get('totalMarks', 100))
            
            if total_marks > 0:
                percentage = (marks_obtained / total_marks) * 100
                if semester not in semester_scores:
                    semester_scores[semester] = []
                semester_scores[semester].append(percentage)
        
        if not semester_scores:
            return 0.0
        
        # Calculate semester averages with weights
        weighted_sum = 0
        weight_total = 0
        
        for semester, scores in semester_scores.items():
            avg = np.mean(scores)
            weight = semester  # Later semesters have higher weight
            weighted_sum += avg * weight
            weight_total += weight
        
        weighted_avg = weighted_sum / weight_total if weight_total > 0 else 0
        
        # Convert percentage to CGPA (assuming 10-point scale)
        cgpa = (weighted_avg / 100) * 10
        
        return cgpa
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "modelLoaded": self.model is not None,
            "scalerLoaded": self.scaler is not None,
            "modelPath": self.model_path,
            "modelType": type(self.model).__name__ if self.model else None
        }