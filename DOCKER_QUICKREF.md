# 🐳 Docker Quick Reference

## 🚀 Quick Start Commands

### Windows (PowerShell)
```powershell
# Start everything
.\docker-manage.ps1 up

# View logs
.\docker-manage.ps1 logs

# Stop everything
.\docker-manage.ps1 down
```

### Linux/Mac (Makefile)
```bash
# Start everything
make up

# View logs
make logs

# Stop everything
make down
```

### Direct Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📋 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js Dashboard |
| Backend API | http://localhost:8000 | FastAPI Control Plane |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Database | localhost:5432 | PostgreSQL |

## 🔧 Common Operations

### Build & Start
```bash
# Build all images
docker-compose build

# Start in background
docker-compose up -d

# Start with logs
docker-compose up
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f db
docker-compose logs -f control-plane
docker-compose logs -f dashboard

# Last 100 lines
docker-compose logs --tail=100
```

### Stop & Clean
```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers + volumes (deletes data!)
docker-compose down -v
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart db
docker-compose restart control-plane
docker-compose restart dashboard
```

## 🗄️ Database Operations

### Connect to Database
```bash
# Using docker exec
docker exec -it iwings_db psql -U postgres -d iwings

# Using local psql
psql -h localhost -p 5432 -U postgres -d iwings
```

### Backup & Restore
```bash
# Backup
docker exec iwings_db pg_dump -U postgres iwings > backup.sql

# Restore
docker exec -i iwings_db psql -U postgres iwings < backup.sql
```

### Database Credentials
- **Host**: localhost
- **Port**: 5432
- **Database**: iwings
- **Username**: postgres
- **Password**: postgres

## 🐛 Debugging

### Access Container Shell
```bash
docker exec -it iwings_db sh
docker exec -it iwings_backend sh
docker exec -it iwings_frontend sh
```

### Check Container Status
```bash
# List running containers
docker-compose ps

# Check health
docker ps

# Inspect specific container
docker inspect iwings_db
```

### View Resource Usage
```bash
docker stats
```

## 🔄 Development Workflow

### After Code Changes

**Backend:**
```bash
docker-compose restart control-plane
# or rebuild if dependencies changed
docker-compose up -d --build control-plane
```

**Frontend:**
```bash
docker-compose restart dashboard
# or rebuild if dependencies changed
docker-compose up -d --build dashboard
```

**Database Schema:**
```bash
# Add SQL to database/init-scripts/
docker-compose down -v
docker-compose up -d --build
```

## 🆘 Troubleshooting

### Port Already in Use
```powershell
# Windows - Find process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac - Find process
lsof -i :3000
kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild
docker-compose down
docker-compose up --build
```

### Database Connection Failed
```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Test connection
docker exec iwings_db pg_isready -U postgres
```

### Out of Disk Space
```bash
# Check usage
docker system df

# Clean up
docker system prune -a --volumes
```

## 🧹 Cleanup Commands

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything
docker system prune -a --volumes
```

## 📊 Health Checks

All services include automatic health checks:

- **Database**: Checks PostgreSQL readiness every 10s
- **Backend**: Checks `/health` endpoint every 30s
- **Frontend**: Checks Next.js health every 30s

View health status:
```bash
docker ps
```

## 🔐 Security Notes

- All containers run as **non-root users**
- Services isolated in **dedicated network**
- Database credentials in **environment variables**
- For production: Use **secrets management**

## 📝 Environment Variables

Create `.env` files in service directories:

**control-plane/.env:**
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/iwings
SECRET_KEY=your_secret_key
```

**dashboard/.env:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎯 Best Practices

✅ Always check logs when debugging
✅ Use health checks to ensure services are ready
✅ Backup database before major changes
✅ Use named volumes for data persistence
✅ Keep images updated regularly
✅ Monitor resource usage
✅ Use .dockerignore to optimize builds

## 📚 Additional Help

- Full guide: See `DOCKER_GUIDE.md`
- Docker docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

---

**Quick Help:**
```bash
# Windows
.\docker-manage.ps1 help

# Linux/Mac
make help
```
