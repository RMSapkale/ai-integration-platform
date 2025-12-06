# Makefile for AI Integration Platform Docker Management
# Usage: make [target]

.PHONY: help build up down restart logs clean test

# Default target
help:
	@echo "AI Integration Platform - Docker Management"
	@echo ""
	@echo "Available targets:"
	@echo "  make build          - Build all Docker images"
	@echo "  make up             - Start all services"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-db        - View database logs"
	@echo "  make logs-backend   - View backend logs"
	@echo "  make logs-frontend  - View frontend logs"
	@echo "  make clean          - Remove containers and volumes"
	@echo "  make rebuild        - Clean rebuild of all services"
	@echo "  make ps             - Show running containers"
	@echo "  make shell-db       - Open shell in database container"
	@echo "  make shell-backend  - Open shell in backend container"
	@echo "  make shell-frontend - Open shell in frontend container"
	@echo "  make db-backup      - Backup database"
	@echo "  make db-restore     - Restore database from backup"
	@echo "  make test           - Run tests"

# Build all images
build:
	docker-compose build

# Build specific services
build-db:
	docker-compose build db

build-backend:
	docker-compose build control-plane

build-frontend:
	docker-compose build dashboard

# Start services
up:
	docker-compose up -d

# Start services with logs
up-logs:
	docker-compose up

# Stop services
down:
	docker-compose down

# Restart services
restart:
	docker-compose restart

restart-db:
	docker-compose restart db

restart-backend:
	docker-compose restart control-plane

restart-frontend:
	docker-compose restart dashboard

# View logs
logs:
	docker-compose logs -f

logs-db:
	docker-compose logs -f db

logs-backend:
	docker-compose logs -f control-plane

logs-frontend:
	docker-compose logs -f dashboard

# Show running containers
ps:
	docker-compose ps

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Rebuild everything
rebuild: clean build up

# Shell access
shell-db:
	docker exec -it iwings_db sh

shell-backend:
	docker exec -it iwings_backend sh

shell-frontend:
	docker exec -it iwings_frontend sh

# Database operations
db-connect:
	docker exec -it iwings_db psql -U postgres -d iwings

db-backup:
	docker exec iwings_db pg_dump -U postgres iwings > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up to backup_$$(date +%Y%m%d_%H%M%S).sql"

db-restore:
	@read -p "Enter backup file path: " backup_file; \
	docker exec -i iwings_db psql -U postgres iwings < $$backup_file

# Development helpers
dev:
	docker-compose up

dev-backend:
	docker-compose up db control-plane

dev-frontend:
	docker-compose up dashboard

# Health checks
health:
	@echo "Checking service health..."
	@docker inspect iwings_db | grep -A 5 '"Health"' || echo "DB: No health info"
	@docker inspect iwings_backend | grep -A 5 '"Health"' || echo "Backend: No health info"
	@docker inspect iwings_frontend | grep -A 5 '"Health"' || echo "Frontend: No health info"

# Resource monitoring
stats:
	docker stats iwings_db iwings_backend iwings_frontend

# Run tests (customize based on your test setup)
test:
	@echo "Running tests..."
	docker-compose exec control-plane pytest
	docker-compose exec dashboard npm test
