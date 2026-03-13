.PHONY: dev build test lint clean

# Development
dev:
	docker compose -f docker-compose.dev.yml up -d

dev-down:
	docker compose -f docker-compose.dev.yml down

# Production
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

# Backend
backend-install:
	cd backend && pip install -r requirements.txt

backend-run:
	cd backend && uvicorn app.main:app --reload

backend-migrate:
	cd backend && alembic upgrade head

backend-migration:
	cd backend && alembic revision --autogenerate -m "$(msg)"

# Frontend
frontend-install:
	cd frontend && npm install

frontend-run:
	cd frontend && npm run dev

# Testing
test:
	cd backend && pytest -v --cov=app
	cd frontend && npm test -- --run

test-backend:
	cd backend && pytest -v --cov=app

test-frontend:
	cd frontend && npm test -- --run

# Linting
lint:
	cd backend && ruff check app/
	cd frontend && npm run lint

lint-fix:
	cd backend && ruff check app/ --fix
	cd frontend && npm run lint -- --fix

# Clean
clean:
	docker compose down -v
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/.pytest_cache frontend/dist
