.PHONY: up down build logs restart \
       backend-test backend-test-all backend-lint \
       frontend-test frontend-test-watch frontend-typecheck frontend-build \
       e2e db-migrate db-revision db-shell \
       clean help

# ============================================================
# Docker Compose
# ============================================================

up: ## Start all services
	docker compose up -d

up-build: ## Start all services with rebuild
	docker compose up -d --build

down: ## Stop all services
	docker compose down

logs: ## Tail logs for all services
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

restart: ## Restart all services
	docker compose restart

ps: ## Show running services
	docker compose ps

# ============================================================
# Backend
# ============================================================

backend-test: ## Run backend unit tests (exclude integration)
	docker compose exec backend python -m pytest -m "not integration" -v

backend-test-all: ## Run all backend tests (including integration)
	docker compose exec backend python -m pytest -v

backend-test-cov: ## Run backend tests with coverage
	docker compose exec backend python -m pytest -m "not integration" --cov=app --cov-report=term-missing

backend-shell: ## Open a shell in the backend container
	docker compose exec backend bash

# ============================================================
# Frontend
# ============================================================

frontend-test: ## Run frontend tests
	docker compose exec frontend bun run test

frontend-test-watch: ## Run frontend tests in watch mode
	docker compose exec frontend bun run test:watch

frontend-typecheck: ## Run TypeScript type check
	docker compose exec frontend bun run typecheck

frontend-build: ## Run Next.js production build
	docker compose exec frontend bun run build

frontend-shell: ## Open a shell in the frontend container
	docker compose exec frontend sh

# ============================================================
# Database
# ============================================================

db-migrate: ## Run Alembic migrations
	docker compose exec backend alembic upgrade head

db-revision: ## Create a new Alembic migration (usage: make db-revision MSG="add foo")
	docker compose exec backend alembic revision --autogenerate -m "$(MSG)"

db-shell: ## Open psql shell
	docker compose exec db psql -U portfolio -d portfolio_db

# ============================================================
# E2E / CI
# ============================================================

e2e: ## Run E2E test script
	bash scripts/e2e-test.sh

ci: backend-test frontend-typecheck frontend-test frontend-build ## Run all CI checks locally

# ============================================================
# Cleanup
# ============================================================

clean: ## Stop services and remove volumes
	docker compose down -v

prune: ## Remove all stopped containers, unused images, and volumes
	docker system prune -f

# ============================================================
# Help
# ============================================================

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
