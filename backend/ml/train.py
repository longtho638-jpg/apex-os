import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
from ..ml.data_processor import DataProcessor
from ..ml.registry import ModelRegistry
from ..ml.models.lstm import PricePredictorLSTM

def generate_synthetic_data(n_samples=1000):
    """Generate synthetic OHLCV data for training demo"""
    t = np.linspace(0, 100, n_samples)
    price = np.sin(t) * 10 + 100 + np.random.normal(0, 1, n_samples)
    
    df = pd.DataFrame({
        'timestamp': range(n_samples),
        'open': price,
        'high': price + 1,
        'low': price - 1,
        'close': price + np.random.normal(0, 0.5, n_samples),
        'volume': np.random.randint(100, 1000, n_samples)
    })
    return df

def train():
    print("🚀 Starting Model Training...")
    
    # 1. Prepare Data
    df = generate_synthetic_data(2000)
    processor = DataProcessor(sequence_length=60)
    X, y = processor.prepare_data(df)
    
    # Convert to Tensors
    X_tensor = torch.from_numpy(X).float()
    y_tensor = torch.from_numpy(y).float().unsqueeze(1)
    
    # 2. Initialize Model
    model = PricePredictorLSTM(input_size=5, hidden_size=64, num_layers=2)
    criterion = nn.BCELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # 3. Training Loop
    epochs = 10
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        
        outputs = model(X_tensor)
        loss = criterion(outputs, y_tensor)
        
        loss.backward()
        optimizer.step()
        
        if (epoch+1) % 1 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')
            
    # 4. Save Model
    registry = ModelRegistry()
    registry.save_model(model, "lstm_v1", metadata={
        'model_args': {'input_size': 5, 'hidden_size': 64, 'num_layers': 2},
        'final_loss': loss.item()
    })
    print("✨ Training Complete!")

if __name__ == "__main__":
    train()
