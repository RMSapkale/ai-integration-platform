# Docker Management Script for AI Integration Platform
# Usage: .\docker-manage.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "AI Integration Platform - Docker Management" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  .\docker-manage.ps1 build          - Build all Docker images"
    Write-Host "  .\docker-manage.ps1 up             - Start all services"
    Write-Host "  .\docker-manage.ps1 down           - Stop all services"
    Write-Host "  .\docker-manage.ps1 restart        - Restart all services"
    Write-Host "  .\docker-manage.ps1 logs           - View logs from all services"
    Write-Host "  .\docker-manage.ps1 logs-db        - View database logs"
    Write-Host "  .\docker-manage.ps1 logs-backend   - View backend logs"
    Write-Host "  .\docker-manage.ps1 logs-frontend  - View frontend logs"
    Write-Host "  .\docker-manage.ps1 clean          - Remove containers and volumes"
    Write-Host "  .\docker-manage.ps1 rebuild        - Clean rebuild of all services"
    Write-Host "  .\docker-manage.ps1 ps             - Show running containers"
    Write-Host "  .\docker-manage.ps1 shell-db       - Open shell in database container"
    Write-Host "  .\docker-manage.ps1 shell-backend  - Open shell in backend container"
    Write-Host "  .\docker-manage.ps1 shell-frontend - Open shell in frontend container"
    Write-Host "  .\docker-manage.ps1 db-connect     - Connect to PostgreSQL database"
    Write-Host "  .\docker-manage.ps1 db-backup      - Backup database"
    Write-Host "  .\docker-manage.ps1 health         - Check service health"
    Write-Host "  .\docker-manage.ps1 stats          - Show resource usage"
}

function Build-All {
    Write-Host "Building all Docker images..." -ForegroundColor Green
    docker-compose build
}

function Start-Services {
    Write-Host "Starting all services..." -ForegroundColor Green
    docker-compose up -d
    Write-Host ""
    Write-Host "Services started! Access them at:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Backend:  http://localhost:8000"
    Write-Host "  Database: localhost:5432"
}

function Stop-Services {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    docker-compose down
}

function Restart-Services {
    Write-Host "Restarting all services..." -ForegroundColor Yellow
    docker-compose restart
}

function Show-Logs {
    Write-Host "Showing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Show-LogsDB {
    Write-Host "Showing database logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f db
}

function Show-LogsBackend {
    Write-Host "Showing backend logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f control-plane
}

function Show-LogsFrontend {
    Write-Host "Showing frontend logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f dashboard
}

function Clean-All {
    Write-Host "Cleaning up containers and volumes..." -ForegroundColor Red
    $confirmation = Read-Host "This will delete all data. Are you sure? (yes/no)"
    if ($confirmation -eq "yes") {
        docker-compose down -v
        docker system prune -f
        Write-Host "Cleanup complete!" -ForegroundColor Green
    } else {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    }
}

function Rebuild-All {
    Write-Host "Rebuilding all services..." -ForegroundColor Yellow
    Clean-All
    Build-All
    Start-Services
}

function Show-Containers {
    Write-Host "Running containers:" -ForegroundColor Cyan
    docker-compose ps
}

function Shell-DB {
    Write-Host "Opening shell in database container..." -ForegroundColor Cyan
    docker exec -it iwings_db sh
}

function Shell-Backend {
    Write-Host "Opening shell in backend container..." -ForegroundColor Cyan
    docker exec -it iwings_backend sh
}

function Shell-Frontend {
    Write-Host "Opening shell in frontend container..." -ForegroundColor Cyan
    docker exec -it iwings_frontend sh
}

function Connect-Database {
    Write-Host "Connecting to PostgreSQL database..." -ForegroundColor Cyan
    docker exec -it iwings_db psql -U postgres -d iwings
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "backup_$timestamp.sql"
    Write-Host "Backing up database to $backupFile..." -ForegroundColor Cyan
    docker exec iwings_db pg_dump -U postgres iwings > $backupFile
    Write-Host "Database backed up successfully!" -ForegroundColor Green
}

function Check-Health {
    Write-Host "Checking service health..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Database:" -ForegroundColor Yellow
    docker inspect iwings_db --format='{{json .State.Health}}' 2>$null
    Write-Host ""
    Write-Host "Backend:" -ForegroundColor Yellow
    docker inspect iwings_backend --format='{{json .State.Health}}' 2>$null
    Write-Host ""
    Write-Host "Frontend:" -ForegroundColor Yellow
    docker inspect iwings_frontend --format='{{json .State.Health}}' 2>$null
}

function Show-Stats {
    Write-Host "Resource usage (Ctrl+C to exit):" -ForegroundColor Cyan
    docker stats iwings_db iwings_backend iwings_frontend
}

# Main command router
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "build" { Build-All }
    "up" { Start-Services }
    "down" { Stop-Services }
    "restart" { Restart-Services }
    "logs" { Show-Logs }
    "logs-db" { Show-LogsDB }
    "logs-backend" { Show-LogsBackend }
    "logs-frontend" { Show-LogsFrontend }
    "clean" { Clean-All }
    "rebuild" { Rebuild-All }
    "ps" { Show-Containers }
    "shell-db" { Shell-DB }
    "shell-backend" { Shell-Backend }
    "shell-frontend" { Shell-Frontend }
    "db-connect" { Connect-Database }
    "db-backup" { Backup-Database }
    "health" { Check-Health }
    "stats" { Show-Stats }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
