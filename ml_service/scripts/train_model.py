import sys
import os

sys.path.insert(0, os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
))

from services.training_service import TrainingService
from config import get_config

def main():
    print("=" * 50)
    print("🎓 CGPA Prediction Model Training")
    print("=" * 50)

    config = get_config()
    training_service = TrainingService(
        model_dir=config.MODEL_DIR
    )

    print("\n📊 Training with 1000 samples...")
    result = training_service \
        .train_with_synthetic_data(n_samples=1000)

    if result['success']:
        print("\n✅ TRAINING SUCCESSFUL!")
        print(f"Best Model: {result['bestModel']}")
        print(f"RMSE: {result['metrics']['rmse']}")
        print(f"R² Score: {result['metrics']['r2']}")
        print(f"Saved to: {result['modelPath']}")
    else:
        print(f"\n❌ Failed: {result['message']}")

if __name__ == '__main__':
    main()