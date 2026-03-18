from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

from config import get_config
from services.prediction_service import PredictionService
from services.training_service import TrainingService
from utils.validators import MarksValidator

# Initialize Flask app
app = Flask(__name__)
config = get_config()

# Configure CORS
CORS(app, origins=config.CORS_ORIGINS)

# Initialize services
prediction_service = PredictionService(
    model_path=config.MODEL_PATH,
    scaler_path=config.SCALER_PATH
)
training_service = TrainingService(model_dir=config.MODEL_DIR)


# ===============================
# 🏥 Health Check Endpoints
# ===============================

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "service": "CGPA Prediction ML Service",
        "version": config.API_VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "predict": "/predict (POST)",
            "train": "/train (POST)",
            "model_info": "/model/info"
        }
    })


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "modelLoaded": prediction_service.is_model_loaded(),
        "timestamp": datetime.now().isoformat(),
        "version": config.API_VERSION
    })


# ===============================
# 🎯 Prediction Endpoints
# ===============================

@app.route('/predict', methods=['POST'])
def predict_cgpa():
    """
    Predict CGPA based on marks data
    
    Request Body:
    {
        "marks": [
            {"marksObtained": 85, "totalMarks": 100, "semester": 1, "subject": "Math"},
            {"marksObtained": 78, "totalMarks": 100, "semester": 1, "subject": "Physics"},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, error_message = MarksValidator.validate_marks_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": error_message
            }), 400
        
        marks = data.get('marks', [])
        
        # Make prediction
        result = prediction_service.predict(marks)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500


@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction for multiple students
    
    Request Body:
    {
        "students": [
            {"studentId": 1, "marks": [...]},
            {"studentId": 2, "marks": [...]}
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'students' not in data:
            return jsonify({
                "success": False,
                "message": "Missing 'students' field"
            }), 400
        
        students = data.get('students', [])
        results = []
        
        for student_data in students:
            student_id = student_data.get('studentId')
            marks = student_data.get('marks', [])
            
            if marks:
                prediction = prediction_service.predict(marks)
                prediction['studentId'] = student_id
            else:
                prediction = {
                    "studentId": student_id,
                    "success": False,
                    "message": "No marks data"
                }
            
            results.append(prediction)
        
        return jsonify({
            "success": True,
            "predictions": results,
            "totalProcessed": len(results)
        })
        
    except Exception as e:
        print(f"❌ Batch prediction error: {e}")
        return jsonify({
            "success": False,
            "message": f"Internal server error: {str(e)}"
        }), 500


# ===============================
# 📚 Training Endpoints
# ===============================

@app.route('/train', methods=['POST'])
def train_model():
    """
    Train or retrain the model
    
    Request Body (optional):
    {
        "dataSource": "synthetic" | "database",
        "samples": 1000  (for synthetic data)
    }
    """
    try:
        data = request.get_json() or {}
        
        data_source = data.get('dataSource', 'synthetic')
        
        if data_source == 'database' and config.DATABASE_URL:
            result = training_service.train_with_database(config.DATABASE_URL)
        else:
            samples = data.get('samples', 1000)
            result = training_service.train_with_synthetic_data(n_samples=samples)
        
        # Reload model after training
        if result.get('success'):
            prediction_service._load_model()
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Training error: {e}")
        return jsonify({
            "success": False,
            "message": f"Training failed: {str(e)}"
        }), 500


# ===============================
# 📊 Model Info Endpoints
# ===============================

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        "success": True,
        "model": prediction_service.get_model_info(),
        "config": {
            "maxSemesters": config.MAX_SEMESTERS,
            "minMarksForPrediction": config.MIN_MARKS_FOR_PREDICTION
        }
    })


# ===============================
# 📈 Analysis Endpoints
# ===============================

@app.route('/analyze', methods=['POST'])
def analyze_performance():
    """
    Analyze student performance without prediction
    
    Request Body:
    {
        "marks": [...]
    }
    """
    try:
        data = request.get_json()
        
        is_valid, error_message = MarksValidator.validate_marks_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "message": error_message
            }), 400
        
        marks = data.get('marks', [])
        
        from utils.data_processor import DataProcessor
        insights = DataProcessor.get_performance_insights(marks)
        
        return jsonify({
            "success": True,
            "analysis": insights
        })
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return jsonify({
            "success": False,
            "message": f"Analysis failed: {str(e)}"
        }), 500


# ===============================
# ❌ Error Handlers
# ===============================

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        "success": False,
        "message": "Bad request",
        "error": str(error)
    }), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Endpoint not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


# ===============================
# 🚀 Application Entry Point
# ===============================

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 CGPA Prediction ML Service")
    print("=" * 50)
    print(f"📍 Host: {config.HOST}")
    print(f"📍 Port: {config.PORT}")
    print(f"📍 Debug: {config.DEBUG}")
    print(f"📍 Model Loaded: {prediction_service.is_model_loaded()}")
    print("=" * 50)
    
    # Train model if not exists
    if not prediction_service.is_model_loaded():
        print("⚠️ Model not found. Training with synthetic data...")
        result = training_service.train_with_synthetic_data()
        if result['success']:
            prediction_service._load_model()
            print("✅ Model trained and loaded successfully!")
        else:
            print(f"❌ Training failed: {result['message']}")
    
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )