#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed."
    exit 1
fi

# Create venv if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv backend/venv
    
    echo "⬇️  Installing dependencies..."
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt
else
    source backend/venv/bin/activate
fi

# Run the agent
# We run as a module to handle imports correctly
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend
python3 -m backend.agents.guardian.main
