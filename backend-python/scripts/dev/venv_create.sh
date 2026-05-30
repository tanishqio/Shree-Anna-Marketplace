#!/bin/bash
# Shree Anna Backend - Virtual Environment Setup Script

set -e

echo "🌾 Setting up Shree Anna Python Backend..."

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Python version: $PYTHON_VERSION"

if [[ $(echo "$PYTHON_VERSION < 3.11" | bc -l) -eq 1 ]]; then
    echo "⚠️  Python 3.11+ is recommended. Current: $PYTHON_VERSION"
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "📦 Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads/images uploads/audio uploads/documents uploads/temp
mkdir -p data
mkdir -p logs

# Copy .env if not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To activate the environment:"
echo "  source venv/bin/activate"
echo ""
echo "To run the server:"
echo "  uvicorn app.main:app --reload --port 8005"
echo ""
echo "To run tests:"
echo "  pytest"
echo ""
echo "API docs will be available at:"
echo "  http://localhost:8005/docs"
