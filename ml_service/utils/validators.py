from typing import Dict, Any, Tuple

class MarksValidator:

    @staticmethod
    def validate_marks_data(
        data: Dict[str, Any]
    ) -> Tuple[bool, str]:
        if not data:
            return False, "Request body is empty"

        marks = data.get('marks')

        if marks is None:
            return False, "Missing 'marks' field"

        if not isinstance(marks, list):
            return False, "'marks' must be an array"

        if len(marks) == 0:
            return False, "'marks' array is empty"

        if len(marks) > 500:
            return False, "Too many marks (max 500)"

        for i, mark in enumerate(marks):
            valid, error = (
                MarksValidator._validate_single_mark(
                    mark, i
                )
            )
            if not valid:
                return False, error

        return True, ""

    @staticmethod
    def _validate_single_mark(
        mark: Dict[str, Any], index: int
    ) -> Tuple[bool, str]:
        required = [
            'marksObtained', 'totalMarks', 'semester'
        ]

        for field in required:
            if field not in mark:
                return False, (
                    f"Missing '{field}' "
                    f"in marks[{index}]"
                )

        obtained = mark.get('marksObtained')
        if not isinstance(obtained, (int, float)):
            return False, (
                f"'marksObtained' must be a number "
                f"in marks[{index}]"
            )
        if obtained < 0:
            return False, (
                f"'marksObtained' cannot be negative "
                f"in marks[{index}]"
            )

        total = mark.get('totalMarks')
        if not isinstance(total, (int, float)):
            return False, (
                f"'totalMarks' must be a number "
                f"in marks[{index}]"
            )
        if total <= 0:
            return False, (
                f"'totalMarks' must be > 0 "
                f"in marks[{index}]"
            )

        if obtained > total:
            return False, (
                f"'marksObtained' cannot exceed "
                f"'totalMarks' in marks[{index}]"
            )

        semester = mark.get('semester')
        if not isinstance(semester, int):
            return False, (
                f"'semester' must be integer "
                f"in marks[{index}]"
            )
        if semester < 1 or semester > 8:
            return False, (
                f"'semester' must be 1-8 "
                f"in marks[{index}]"
            )

        return True, ""