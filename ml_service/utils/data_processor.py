import numpy as np
from typing import List, Dict, Any
from collections import defaultdict

class DataProcessor:
    """Process semester CGPA data for prediction"""
    
    MAX_SEMESTERS = 8
    
    @staticmethod
    def process_marks_for_prediction(
        marks: List[Dict[str, Any]]
    ) -> np.ndarray:
        """
        Convert marks data to semester CGPA list
        then build feature vector

        Input: List of marks with marksObtained, 
               totalMarks, semester
        Output: Feature vector for ML model
        
        Example Input:
        [
          {"marksObtained": 85, "totalMarks": 100, 
           "semester": 1},
          {"marksObtained": 60, "totalMarks": 100, 
           "semester": 2}
        ]
        """
        
        # ── Step 1: Group marks by semester ──────────
        semester_marks = defaultdict(list)
        
        for mark in marks:
            semester = int(mark.get('semester', 1))
            obtained = float(
                mark.get('marksObtained', 0)
            )
            total = float(
                mark.get('totalMarks', 100)
            )
            
            if total > 0:
                # Convert to percentage
                percentage = (obtained / total) * 100
                semester_marks[semester].append(
                    percentage
                )
        
        # ── Step 2: Calculate semester-wise CGPA ─────
        # Each semester average percentage → CGPA (0-10)
        semester_cgpas = {}
        for sem, scores in semester_marks.items():
            avg_percentage = np.mean(scores)
            # Convert percentage to CGPA scale
            cgpa = (avg_percentage / 100) * 10
            semester_cgpas[sem] = round(cgpa, 2)
        
        # ── Step 3: Build ordered CGPA list ──────────
        past_cgpas = [
            semester_cgpas[sem]
            for sem in sorted(semester_cgpas.keys())
        ]
        
        # ── Step 4: Extract features ──────────────────
        return DataProcessor._build_feature_vector(
            past_cgpas
        )
    
    @staticmethod
    def _build_feature_vector(
        past_cgpas: List[float]
    ) -> np.ndarray:
        """
        Build feature vector from past semester CGPAs
        
        Features:
        - sem1 to sem8 CGPA (0 if not available)
        - overall average CGPA
        - trend (slope of improvement/decline)
        - consistency (std deviation)
        - completed semesters count
        - recent change (last - second last)
        - weighted recent CGPA (60% last, 40% avg)
        """
        
        # Pad to MAX_SEMESTERS with 0
        sem_features = [0.0] * DataProcessor.MAX_SEMESTERS
        for i, cgpa in enumerate(past_cgpas):
            if i < DataProcessor.MAX_SEMESTERS:
                sem_features[i] = cgpa
        
        # Overall average of completed semesters
        if past_cgpas:
            overall_avg = np.mean(past_cgpas)
        else:
            overall_avg = 0.0
        
        # Trend: linear regression slope
        trend = DataProcessor._calculate_trend(
            past_cgpas
        )
        
        # Consistency: lower std = more consistent
        if len(past_cgpas) > 1:
            consistency = np.std(past_cgpas)
        else:
            consistency = 0.0
        
        # Completed semesters
        completed = len(past_cgpas)
        
        # Recent change (last sem - previous sem)
        if len(past_cgpas) >= 2:
            recent_change = (
                past_cgpas[-1] - past_cgpas[-2]
            )
        else:
            recent_change = 0.0
        
        # Weighted recent CGPA
        # 60% last semester + 40% overall average
        if past_cgpas:
            weighted_recent = (
                past_cgpas[-1] * 0.6 + 
                overall_avg * 0.4
            )
        else:
            weighted_recent = 0.0
        
        # Final feature vector
        features = sem_features + [
            overall_avg,       # Feature 9
            trend,             # Feature 10
            consistency,       # Feature 11
            completed,         # Feature 12
            recent_change,     # Feature 13
            weighted_recent    # Feature 14
        ]
        
        return np.array(features).reshape(1, -1)
    
    @staticmethod
    def _calculate_trend(
        cgpas: List[float]
    ) -> float:
        """
        Linear regression slope of CGPA over semesters
        Positive = improving, Negative = declining
        """
        if len(cgpas) < 2:
            return 0.0
        
        x = np.arange(len(cgpas))
        y = np.array(cgpas)
        
        n = len(x)
        denominator = (
            n * np.sum(x ** 2) - np.sum(x) ** 2
        )
        
        if abs(denominator) < 1e-10:
            return 0.0
        
        slope = (
            n * np.sum(x * y) - 
            np.sum(x) * np.sum(y)
        ) / denominator
        
        return float(slope)
    
    @staticmethod
    def calculate_confidence(
        marks: List[Dict[str, Any]]
    ) -> float:
        """
        Confidence based on number of semesters
        and consistency of past CGPAs
        """
        if not marks:
            return 0.0
        
        # Get unique semesters
        semesters = set(
            m.get('semester', 1) for m in marks
        )
        completed = len(semesters)
        total_entries = len(marks)
        
        # Factor 1: Semester count
        # Max confidence at 4+ semesters
        semester_factor = min(completed / 4.0, 1.0)
        
        # Factor 2: Data volume
        # Max confidence at 20+ mark entries
        data_factor = min(total_entries / 20.0, 1.0)
        
        # Factor 3: Consistency
        # Calculate per-semester CGPAs
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
        
        sem_cgpas = [
            np.mean(v) 
            for v in semester_marks.values()
        ]
        
        if len(sem_cgpas) > 1:
            std = np.std(sem_cgpas)
            # Lower std = more consistent = higher confidence
            consistency_factor = max(
                0, 1.0 - (std / 3.0)
            )
        else:
            consistency_factor = 0.3
        
        confidence = (
            semester_factor * 0.4 +
            data_factor * 0.3 +
            consistency_factor * 0.3
        ) * 100
        
        return round(
            max(10.0, min(95.0, confidence)), 2
        )
    
    @staticmethod
    def get_performance_insights(
        marks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate insights from semester CGPA data
        """
        if not marks:
            return {
                "status": "insufficient_data",
                "message": "Not enough data for analysis"
            }
        
        # Group by semester → calculate CGPA per sem
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
        
        # Semester-wise CGPA
        semester_cgpas = {
            sem: round(np.mean(scores), 2)
            for sem, scores in semester_marks.items()
        }
        
        # Overall CGPA
        all_cgpas = list(semester_cgpas.values())
        overall_cgpa = round(np.mean(all_cgpas), 2) \
            if all_cgpas else 0
        
        # Performance status
        if overall_cgpa >= 8.0:
            status = "excellent"
            message = (
                "Outstanding! You are on track "
                "for a great final CGPA."
            )
        elif overall_cgpa >= 6.5:
            status = "good"
            message = (
                "Good performance. "
                "Focus on improvement."
            )
        elif overall_cgpa >= 5.0:
            status = "average"
            message = (
                "Average performance. "
                "More effort needed."
            )
        else:
            status = "needs_improvement"
            message = (
                "Needs improvement. "
                "Seek academic help."
            )
        
        # Trend from semester CGPAs
        sorted_sems = sorted(semester_cgpas.keys())
        if len(sorted_sems) >= 2:
            recent = semester_cgpas[sorted_sems[-1]]
            previous = semester_cgpas[sorted_sems[-2]]
            diff = recent - previous
            
            if diff > 0.5:
                trend = "improving"
            elif diff < -0.5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        # Best and worst semester
        best_sem = max(
            semester_cgpas, 
            key=semester_cgpas.get
        ) if semester_cgpas else None
        
        worst_sem = min(
            semester_cgpas, 
            key=semester_cgpas.get
        ) if semester_cgpas else None
        
        return {
            "status": status,
            "message": message,
            "overallCGPA": overall_cgpa,
            "semesterCGPAs": semester_cgpas,
            "bestSemester": best_sem,
            "worstSemester": worst_sem,
            "trend": trend,
            "completedSemesters": len(semester_cgpas)
        }