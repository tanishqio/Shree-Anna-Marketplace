# Shree Anna Backend - Makefile
# Common commands for development

.PHONY: install run dev test lint format clean seed docs

# Python executable
PYTHON := python

# Install dependencies
install:
	pip install --upgrade pip
	pip install -r requirements.txt

# Run production server
run:
	uvicorn app.main:app --host 0.0.0.0 --port 8005

# Run development server with auto-reload
dev:
	uvicorn app.main:app --reload --port 8005

# Run tests
test:
	pytest -v

# Run tests with coverage
test-cov:
	pytest --cov=app --cov-report=html --cov-report=term

# Lint code
lint:
	flake8 app --max-line-length=100 --ignore=E501,W503
	mypy app --ignore-missing-imports

# Format code
format:
	black app --line-length=100
	isort app

# Clean cache files
clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	rm -rf htmlcov/
	rm -rf .coverage

# Seed database
seed:
	$(PYTHON) scripts/seed_data.py

# Generate OpenAPI docs
docs:
	$(PYTHON) -c "from app.main import app; import json; print(json.dumps(app.openapi(), indent=2))" > docs/openapi.json

# Create virtual environment
venv:
	python -m venv venv
	@echo "Activate with: source venv/bin/activate (Linux/Mac) or venv\Scripts\activate (Windows)"

# Database migrations (if using alembic)
migrate:
	alembic upgrade head

# Create new migration
migration:
	alembic revision --autogenerate -m "$(msg)"

# Help
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make run        - Run production server"
	@echo "  make dev        - Run development server"
	@echo "  make test       - Run tests"
	@echo "  make test-cov   - Run tests with coverage"
	@echo "  make lint       - Lint code"
	@echo "  make format     - Format code"
	@echo "  make clean      - Clean cache files"
	@echo "  make seed       - Seed database"
	@echo "  make venv       - Create virtual environment"
