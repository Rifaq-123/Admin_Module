#!/usr/bin/env python3
"""
Standalone script to train the CGPA prediction model
Run: python scripts/train_model.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.training_service import TrainingService
from config import get_config

def main():
    print("=" * 60)
    print("🎓 CGPA Prediction Model Training")
    print("=" * 60)
    
    config = get_config()
    training_service = TrainingService(model_dir=config.MODEL_DIR)
    
    # Option 1: Train with synthetic data
    print("\n📊 Training with synthetic data (1000 samples)...")
    result = training_service.train_with_synthetic_data(n_samples=1000)
    
    if result['success']:
        print("\n" + "=" * 60)
        print("✅ TRAINING SUCCESSFUL!")
        print("=" * 60)
        print(f"📈 Best Model: {result['bestModel']}")
        print(f"📊 Metrics:")
        print(f"   - RMSE: {result['metrics']['rmse']}")
        print(f"   - MAE: {result['metrics']['mae']}")
        print(f"   - R² Score: {result['metrics']['r2']}")
        print(f"💾 Model saved to: {result['modelPath']}")
    else:
        print(f"\n❌ Training failed: {result['message']}")
    
    # Option 2: Train with database (if available)
    # if config.DATABASE_URL:
    #     print("\n📊 Training with database data...")
    #     result = training_service.train_with_database(config.DATABASE_URL)

if __name__ == '__main__':
    main()