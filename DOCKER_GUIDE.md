# Docker Setup Guide

This project uses Docker and Docker Compose to containerize three main components:
1. **Database** - PostgreSQL 15
2. **Backend** - FastAPI Control Plane
3. **Frontend** - Next.js Dashboard

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v3.8 or higher
- At least 4GB of available RAM
- Ports 3000, 8000, and 5432 available

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │
│   (FastAPI)     │
│   Port: 8000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│  (PostgreSQL)   │
│   Port: 5432    │
└─────────────────┘
```

## 📁 Project Structure

```
ai-integration-platform/
├── database/
│   ├── Dockerfile              # PostgreSQL custom image
│   └── init-scripts/
│       └── 01-init.sql         # Database initialization
├── control-plane/
│   ├── Dockerfile              # Backend API image
│   ├── requirements.txt        # Python dependencies
│   └── main.py                 # FastAPI application
├── dashboard/
│   ├── Dockerfile              # Frontend image
│   ├── package.json            # Node dependencies
│   └── src/                    # Next.js source code
└── docker-compose.yml          # Orchestration configuration
```

## 🚀 Quick Start

### 1. Build and Start All Services

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 2. Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

### 3. Stop All Services

```bash
# Stop containers (preserves data)
docker-compose stop

# Stop and remove containers (preserves volumes)
docker-compose down

# Stop, remove containers AND volumes (deletes all data)
docker-compose down -v
```

## 🔧 Individual Service Management

### Build Individual Services

```bash
# Build only the database
docker-compose build db

# Build only the backend
docker-compose build control-plane

# Build only the frontend
docker-compose build dashboard
```

### Start Individual Services

```bash
# Start only the database
docker-compose up db

# Start backend (will auto-start database due to dependency)
docker-compose up control-plane

# Start frontend (will auto-start backend and database)
docker-compose up dashboard
```

### View Logs

```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs db
docker-compose logs control-plane
docker-compose logs dashboard

# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

## 🔍 Health Checks

All services include health checks:

```bash
# Check container health status
docker ps

# Inspect specific service health
docker inspect iwings_db | grep -A 10 Health
docker inspect iwings_backend | grep -A 10 Health
docker inspect iwings_frontend | grep -A 10 Health
```

## 🗄️ Database Management

### Connect to PostgreSQL

```bash
# Using docker exec
docker exec -it iwings_db psql -U postgres -d iwings

# Using psql client (if installed locally)
psql -h localhost -p 5432 -U postgres -d iwings
```

### Database Credentials

- **Host**: localhost (or `db` from within containers)
- **Port**: 5432
- **Database**: iwings
- **Username**: postgres
- **Password**: postgres

### Backup Database

```bash
# Create backup
docker exec iwings_db pg_dump -U postgres iwings > backup.sql

# Restore backup
docker exec -i iwings_db psql -U postgres iwings < backup.sql
```

### View Database Logs

```bash
docker-compose logs db
```

## 🐛 Debugging

### Access Container Shell

```bash
# Database container
docker exec -it iwings_db sh

# Backend container
docker exec -it iwings_backend sh

# Frontend container
docker exec -it iwings_frontend sh
```

### Restart Individual Service

```bash
docker-compose restart db
docker-compose restart control-plane
docker-compose restart dashboard
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker-compose up -d --build control-plane

# Rebuild all services
docker-compose up -d --build
```

## 🔐 Security Features

### Non-Root Users
All containers run as non-root users for enhanced security:
- Frontend: `nextjs` user (UID 1001)
- Backend: `appuser` user
- Database: `postgres` user

### Network Isolation
Services communicate through a dedicated Docker network (`iwings_network`), isolated from the host network.

## 📊 Resource Management

### View Resource Usage

```bash
# View container stats
docker stats

# View specific container
docker stats iwings_db iwings_backend iwings_frontend
```

### Set Resource Limits (Optional)

Add to `docker-compose.yml` under each service:

```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

## 🧪 Development vs Production

### Development Mode

```bash
# Use volume mounts for hot-reloading
docker-compose up
```

### Production Mode

```bash
# Build optimized images
docker-compose -f docker-compose.yml build --no-cache

# Run without volume mounts
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 Update Dependencies

### Backend (Python)

1. Update `control-plane/requirements.txt`
2. Rebuild: `docker-compose build control-plane`
3. Restart: `docker-compose up -d control-plane`

### Frontend (Node.js)

1. Update `dashboard/package.json`
2. Rebuild: `docker-compose build dashboard`
3. Restart: `docker-compose up -d dashboard`

## 🧹 Cleanup

### Remove Unused Resources

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (CAUTION!)
docker system prune -a --volumes
```

### Complete Reset

```bash
# Stop and remove everything
docker-compose down -v

# Remove all project images
docker rmi $(docker images 'ai-integration-platform*' -q)

# Rebuild from scratch
docker-compose up --build
```

## 🐳 Docker Compose Commands Reference

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start all services |
| `docker-compose up -d` | Start in detached mode |
| `docker-compose down` | Stop and remove containers |
| `docker-compose ps` | List running containers |
| `docker-compose logs` | View logs |
| `docker-compose exec <service> <command>` | Execute command in container |
| `docker-compose build` | Build/rebuild services |
| `docker-compose restart` | Restart services |
| `docker-compose stop` | Stop services |
| `docker-compose start` | Start stopped services |

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill process (Windows)
taskkill /PID <PID> /F

# Or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker ps -a

# Remove and rebuild
docker-compose down
docker-compose up --build
```

### Database Connection Issues

```bash
# Verify database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Test connection
docker exec -it iwings_db psql -U postgres -d iwings -c "SELECT 1;"
```

### Out of Disk Space

```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

## 📝 Environment Variables

Create `.env` files in each service directory:

### `database/.env`
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=iwings
```

### `control-plane/.env`
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/iwings
SECRET_KEY=your_secret_key
DEBUG=False
```

### `dashboard/.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=production
```

## 🎯 Best Practices

1. **Always use health checks** - Ensures services are ready before dependent services start
2. **Use named volumes** - Persist data across container restarts
3. **Implement multi-stage builds** - Reduces final image size
4. **Run as non-root** - Enhances security
5. **Use .dockerignore** - Speeds up builds by excluding unnecessary files
6. **Tag your images** - Makes version management easier
7. **Monitor logs** - Regularly check for errors and warnings

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Need Help?** Check the logs first: `docker-compose logs -f`
