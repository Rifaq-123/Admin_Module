import numpy as np
from typing import List, Dict, Any
from collections import defaultdict

class DataProcessor:
    """Process and transform marks data for ML model"""
    
    MAX_SEMESTERS = 8
    
    @staticmethod
    def process_marks_for_prediction(marks: List[Dict[str, Any]]) -> np.ndarray:
        """
        Convert marks data to feature vector for prediction
        
        Input: List of marks with marksObtained, totalMarks, semester
        Output: Feature vector [sem1_avg, sem2_avg, ..., sem8_avg, overall_avg, trend]
        """
        
        # Group marks by semester
        semester_marks = defaultdict(list)
        
        for mark in marks:
            semester = mark.get('semester', 1)
            marks_obtained = float(mark.get('marksObtained', 0))
            total_marks = float(mark.get('totalMarks', 100))
            
            if total_marks > 0:
                percentage = (marks_obtained / total_marks) * 100
                semester_marks[semester].append(percentage)
        
        # Calculate semester-wise averages
        semester_averages = []
        for sem in range(1, DataProcessor.MAX_SEMESTERS + 1):
            if sem in semester_marks and semester_marks[sem]:
                avg = np.mean(semester_marks[sem])
            else:
                avg = 0.0  # No data for this semester
            semester_averages.append(avg)
        
        # Calculate additional features
        non_zero_semesters = [avg for avg in semester_averages if avg > 0]
        
        # Overall average (only from completed semesters)
        overall_avg = np.mean(non_zero_semesters) if non_zero_semesters else 0.0
        
        # Trend (improvement/decline over semesters)
        trend = DataProcessor._calculate_trend(non_zero_semesters)
        
        # Consistency (standard deviation - lower is better)
        consistency = np.std(non_zero_semesters) if len(non_zero_semesters) > 1 else 0.0
        
        # Number of completed semesters
        completed_semesters = len(non_zero_semesters)
        
        # Feature vector: [8 semester averages + overall + trend + consistency + completed]
        features = semester_averages + [overall_avg, trend, consistency, completed_semesters]
        
        return np.array(features).reshape(1, -1)
    
    @staticmethod
    def _calculate_trend(semester_averages: List[float]) -> float:
        """
        Calculate trend (positive = improving, negative = declining)
        Uses linear regression slope
        """
        if len(semester_averages) < 2:
            return 0.0
        
        x = np.arange(len(semester_averages))
        y = np.array(semester_averages)
        
        # Simple linear regression
        n = len(x)
        slope = (n * np.sum(x * y) - np.sum(x) * np.sum(y)) / \
                (n * np.sum(x ** 2) - np.sum(x) ** 2)
        
        return float(slope)
    
    @staticmethod
    def calculate_confidence(marks: List[Dict[str, Any]]) -> float:
        """
        Calculate prediction confidence based on data quality
        """
        if not marks:
            return 0.0
        
        # Count unique semesters with data
        semesters = set()
        for mark in marks:
            semesters.add(mark.get('semester', 1))
        
        completed_semesters = len(semesters)
        total_marks = len(marks)
        
        # Confidence factors
        semester_factor = min(completed_semesters / 4, 1.0)  # Max at 4+ semesters
        data_factor = min(total_marks / 20, 1.0)  # Max at 20+ marks entries
        
        # Combined confidence (weighted average)
        confidence = (semester_factor * 0.6 + data_factor * 0.4) * 100
        
        return round(confidence, 2)
    
    @staticmethod
    def get_performance_insights(marks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate insights from marks data
        """
        if not marks:
            return {
                "status": "insufficient_data",
                "message": "Not enough data for analysis"
            }
        
        # Group by semester
        semester_marks = defaultdict(list)
        for mark in marks:
            semester = mark.get('semester', 1)
            marks_obtained = float(mark.get('marksObtained', 0))
            total_marks = float(mark.get('totalMarks', 100))
            percentage = (marks_obtained / total_marks) * 100 if total_marks > 0 else 0
            semester_marks[semester].append(percentage)
        
        # Calculate statistics
        semester_averages = {
            sem: round(np.mean(scores), 2) 
            for sem, scores in semester_marks.items()
        }
        
        all_percentages = []
        for scores in semester_marks.values():
            all_percentages.extend(scores)
        
        overall_avg = round(np.mean(all_percentages), 2) if all_percentages else 0
        
        # Determine performance status
        if overall_avg >= 75:
            status = "excellent"
            message = "Outstanding performance! Keep up the great work."
        elif overall_avg >= 60:
            status = "good"
            message = "Good performance. Focus on improving weaker subjects."
        elif overall_avg >= 50:
            status = "average"
            message = "Average performance. More effort needed in studies."
        else:
            status = "needs_improvement"
            message = "Needs significant improvement. Consider seeking help."
        
        # Find best and worst semesters
        best_semester = max(semester_averages, key=semester_averages.get) if semester_averages else None
        worst_semester = min(semester_averages, key=semester_averages.get) if semester_averages else None
        
        # Trend analysis
        sorted_semesters = sorted(semester_averages.keys())
        if len(sorted_semesters) >= 2:
            recent = semester_averages[sorted_semesters[-1]]
            previous = semester_averages[sorted_semesters[-2]]
            if recent > previous + 5:
                trend = "improving"
            elif recent < previous - 5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "status": status,
            "message": message,
            "overallAverage": overall_avg,
            "semesterAverages": semester_averages,
            "bestSemester": best_semester,
            "worstSemester": worst_semester,
            "trend": trend,
            "totalSubjects": len(marks),
            "completedSemesters": len(semester_averages)
        }