#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed."
    exit 1
fi

# Use existing venv from Guardian setup
if [ ! -d "backend/venv" ]; then
    echo "❌ Virtual environment not found. Please run start-guardian.sh first to setup environment."
    exit 1
fi

source backend/venv/bin/activate

# Run the agent
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend
python3 -m backend.agents.auditor.main
