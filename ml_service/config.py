import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv(
        'FLASK_DEBUG', 'False'
    ).lower() == 'true'
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    MODEL_DIR = os.getenv('MODEL_DIR', 'models')
    MODEL_PATH = os.path.join(
        MODEL_DIR, 'cgpa_predictor.pkl'
    )
    SCALER_PATH = os.path.join(
        MODEL_DIR, 'scaler.pkl'
    )
    DATABASE_URL = os.getenv('DATABASE_URL', None)
    API_VERSION = 'v1'
    MAX_SEMESTERS = 8

    # ✅ Production CORS
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:8081,https://student-management-backend-iftd.onrender.com'
    ).split(',')

    MIN_MARKS_FOR_PREDICTION = 1
    CONFIDENCE_THRESHOLD = 0.6

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

def get_config():
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        return ProductionConfig()
    return DevelopmentConfig()