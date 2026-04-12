import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

from config import get_config
from services.prediction_service import (
    PredictionService
)
from services.training_service import TrainingService
from utils.validators import MarksValidator

app = Flask(__name__)
config = get_config()
CORS(app, origins=config.CORS_ORIGINS)

prediction_service = PredictionService(
    model_path=config.MODEL_PATH,
    scaler_path=config.SCALER_PATH
)
training_service = TrainingService(
    model_dir=config.MODEL_DIR
)

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "service": "CGPA Prediction Service",
        "version": config.API_VERSION,
        "status": "running"
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "modelLoaded": (
            prediction_service.is_model_loaded()
        ),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        valid, error = (
            MarksValidator.validate_marks_data(data)
        )
        if not valid:
            return jsonify({
                "success": False,
                "message": error
            }), 400

        result = prediction_service.predict(
            data['marks']
        )
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/train', methods=['POST'])
def train():
    try:
        data = request.get_json() or {}
        samples = data.get('samples', 1000)

        result = training_service \
            .train_with_synthetic_data(samples)

        if result.get('success'):
            prediction_service._load_model()

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    return jsonify(
        prediction_service.get_model_info()
    )

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Endpoint not found"
    }), 404
# At the very bottom of app.py, replace:

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 CGPA Prediction Service")
    print("=" * 50)

    if not prediction_service.is_model_loaded():
        print("⚠️ No model found. Training now...")
        result = training_service \
            .train_with_synthetic_data()
        if result['success']:
            prediction_service._load_model()
            print("✅ Model trained and loaded!")

    port = int(os.environ.get('PORT', 5000))
    print(f"Running on port {port}")
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False
    )