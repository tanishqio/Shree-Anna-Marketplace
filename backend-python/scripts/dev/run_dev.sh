#!/usr/bin/env bash
# run_dev.sh - Development server startup script
# Usage: ./scripts/run_dev.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌾 Shree Anna Backend - Development Server${NC}"
echo "============================================="

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check for virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating one...${NC}"
    python -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${GREEN}🔧 Activating virtual environment...${NC}"
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install/upgrade dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file - please update with your values${NC}"
fi

# Create necessary directories
mkdir -p data uploads logs

# Initialize database
echo -e "${GREEN}🗄️  Initializing database...${NC}"
python -c "from app.db.init_db import init_database; init_database()"

# Export environment variables
export PYTHONPATH="${PROJECT_DIR}"
export USE_MOCK_SMS=true

echo ""
echo -e "${GREEN}🚀 Starting development server...${NC}"
echo -e "${YELLOW}   API Docs: http://localhost:8005/docs${NC}"
echo -e "${YELLOW}   ReDoc:    http://localhost:8005/redoc${NC}"
echo -e "${YELLOW}   Health:   http://localhost:8005/health${NC}"
echo ""

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8005
