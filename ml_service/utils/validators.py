from typing import List, Dict, Any, Tuple

class MarksValidator:
    """Validate incoming marks data"""
    
    @staticmethod
    def validate_marks_data(data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate marks data structure
        Returns: (is_valid, error_message)
        """
        if not data:
            return False, "Request body is empty"
        
        marks = data.get('marks')
        
        if marks is None:
            return False, "Missing 'marks' field in request"
        
        if not isinstance(marks, list):
            return False, "'marks' must be an array"
        
        if len(marks) == 0:
            return False, "'marks' array is empty"
        
        # Validate each mark entry
        for i, mark in enumerate(marks):
            is_valid, error = MarksValidator._validate_single_mark(mark, i)
            if not is_valid:
                return False, error
        
        return True, ""
    
    @staticmethod
    def _validate_single_mark(mark: Dict[str, Any], index: int) -> Tuple[bool, str]:
        """Validate a single mark entry"""
        
        required_fields = ['marksObtained', 'totalMarks', 'semester']
        
        for field in required_fields:
            if field not in mark:
                return False, f"Missing '{field}' in marks[{index}]"
        
        # Validate marksObtained
        marks_obtained = mark.get('marksObtained')
        if not isinstance(marks_obtained, (int, float)):
            return False, f"'marksObtained' must be a number in marks[{index}]"
        if marks_obtained < 0:
            return False, f"'marksObtained' cannot be negative in marks[{index}]"
        
        # Validate totalMarks
        total_marks = mark.get('totalMarks')
        if not isinstance(total_marks, (int, float)):
            return False, f"'totalMarks' must be a number in marks[{index}]"
        if total_marks <= 0:
            return False, f"'totalMarks' must be greater than 0 in marks[{index}]"
        
        # Validate marks don't exceed total
        if marks_obtained > total_marks:
            return False, f"'marksObtained' cannot exceed 'totalMarks' in marks[{index}]"
        
        # Validate semester
        semester = mark.get('semester')
        if not isinstance(semester, int):
            return False, f"'semester' must be an integer in marks[{index}]"
        if semester < 1 or semester > 8:
            return False, f"'semester' must be between 1 and 8 in marks[{index}]"
        
        return True, ""