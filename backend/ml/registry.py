import torch
import os
import json
from datetime import datetime

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')

class ModelRegistry:
    def __init__(self):
        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR)

    def save_model(self, model, name: str, metadata: dict = {}):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.pth"
        path = os.path.join(MODEL_DIR, filename)
        
        torch.save({
            'model_state_dict': model.state_dict(),
            'metadata': metadata,
            'timestamp': timestamp
        }, path)
        
        # Update latest pointer
        self._update_latest(name, filename)
        print(f"✅ Model saved to {path}")
        return path

    def load_latest_model(self, model_class, name: str):
        latest_file = self._get_latest(name)
        if not latest_file:
            raise FileNotFoundError(f"No model found for {name}")
            
        path = os.path.join(MODEL_DIR, latest_file)
        checkpoint = torch.load(path)
        
        model = model_class(**checkpoint['metadata'].get('model_args', {}))
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()
        
        print(f"✅ Loaded model from {path}")
        return model

    def _update_latest(self, name: str, filename: str):
        pointer_file = os.path.join(MODEL_DIR, f"{name}_latest.txt")
        with open(pointer_file, 'w') as f:
            f.write(filename)

    def _get_latest(self, name: str):
        pointer_file = os.path.join(MODEL_DIR, f"{name}_latest.txt")
        if not os.path.exists(pointer_file):
            return None
        with open(pointer_file, 'r') as f:
            return f.read().strip()
