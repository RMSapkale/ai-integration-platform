# 🐳 Docker Configuration - AI Integration Platform

Complete Docker setup for running the AI Integration Platform with three containerized services: Database, Backend, and Frontend.

## 📦 What's Included

This Docker setup includes:

- ✅ **PostgreSQL Database** - Custom Dockerfile with initialization scripts
- ✅ **FastAPI Backend** - Multi-stage build with security best practices
- ✅ **Next.js Frontend** - Optimized production build
- ✅ **Docker Compose** - Complete orchestration with health checks
- ✅ **Management Scripts** - PowerShell and Makefile for easy operations
- ✅ **Documentation** - Comprehensive guides and quick references

## 🚀 Quick Start (3 Steps)

### 1. Prerequisites
Ensure you have installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac)
- Or Docker Engine + Docker Compose (Linux)

### 2. Start Services

**Windows (PowerShell):**
```powershell
.\docker-manage.ps1 up
```

**Linux/Mac:**
```bash
make up
```

**Or use Docker Compose directly:**
```bash
docker-compose up -d --build
```

### 3. Access Application

- 🎨 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs
- 🗄️ **Database**: localhost:5432

## 📁 File Structure

```
ai-integration-platform/
├── 📄 docker-compose.yml          # Main orchestration file
├── 📄 .env.example                # Environment variables template
├── 📄 docker-manage.ps1           # Windows management script
├── 📄 Makefile                    # Linux/Mac shortcuts
│
├── 📚 Documentation
│   ├── DOCKER_SETUP_SUMMARY.md   # Complete setup summary
│   ├── DOCKER_GUIDE.md           # Comprehensive guide
│   └── DOCKER_QUICKREF.md        # Quick reference
│
├── 🗄️ database/
│   ├── Dockerfile                # PostgreSQL custom image
│   ├── .dockerignore
│   └── init-scripts/
│       └── 01-init.sql           # Database initialization
│
├── 🔧 control-plane/
│   ├── Dockerfile                # FastAPI backend
│   ├── .dockerignore
│   └── requirements.txt
│
└── 🎨 dashboard/
    ├── Dockerfile                # Next.js frontend
    ├── .dockerignore
    └── package.json
```

## 🎯 Common Commands

### Windows PowerShell

```powershell
# Start all services
.\docker-manage.ps1 up

# View logs
.\docker-manage.ps1 logs

# Stop services
.\docker-manage.ps1 down

# Restart services
.\docker-manage.ps1 restart

# Backup database
.\docker-manage.ps1 db-backup

# See all commands
.\docker-manage.ps1 help
```

### Linux/Mac Makefile

```bash
# Start all services
make up

# View logs
make logs

# Stop services
make down

# Restart services
make restart

# Backup database
make db-backup

# See all commands
make help
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart a service
docker-compose restart control-plane

# Rebuild after changes
docker-compose up -d --build
```

## 🔧 Configuration

### Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   POSTGRES_PASSWORD=your_secure_password
   SECRET_KEY=your_secret_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### Database Initialization

Add SQL scripts to `database/init-scripts/`:
- Files are executed in alphabetical order
- Use naming like `01-init.sql`, `02-seed.sql`
- Scripts run automatically on first container start

## 🗄️ Database Operations

### Connect to Database
```bash
# Using Docker
docker exec -it iwings_db psql -U postgres -d iwings

# Using local psql client
psql -h localhost -p 5432 -U postgres -d iwings
```

### Backup Database
```bash
docker exec iwings_db pg_dump -U postgres iwings > backup.sql
```

### Restore Database
```bash
docker exec -i iwings_db psql -U postgres iwings < backup.sql
```

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│         Port: 3000                      │
│         Container: iwings_frontend      │
└──────────────┬──────────────────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────────────────┐
│         Backend (FastAPI)               │
│         Port: 8000                      │
│         Container: iwings_backend       │
└──────────────┬──────────────────────────┘
               │ SQL Queries
               ▼
┌─────────────────────────────────────────┐
│         Database (PostgreSQL)           │
│         Port: 5432                      │
│         Container: iwings_db            │
└─────────────────────────────────────────┘
```

## 🔐 Security Features

- ✅ **Non-root users** in all containers
- ✅ **Network isolation** via dedicated Docker network
- ✅ **Health checks** for all services
- ✅ **Multi-stage builds** to minimize attack surface
- ✅ **Environment variables** for sensitive data
- ✅ **.dockerignore** to exclude sensitive files

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs db
```

### Port already in use
```powershell
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database connection failed
```bash
# Check database health
docker-compose ps

# View database logs
docker-compose logs db

# Test connection
docker exec iwings_db pg_isready -U postgres
```

### Out of disk space
```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## 🧹 Cleanup

### Stop and remove containers
```bash
docker-compose down
```

### Remove containers and volumes (deletes data!)
```bash
docker-compose down -v
```

### Complete cleanup
```bash
# Windows
.\docker-manage.ps1 clean

# Linux/Mac
make clean
```

## 📚 Documentation

- **[DOCKER_SETUP_SUMMARY.md](DOCKER_SETUP_SUMMARY.md)** - Complete overview of the setup
- **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** - Comprehensive guide with all details
- **[DOCKER_QUICKREF.md](DOCKER_QUICKREF.md)** - Quick reference for common tasks

## 🔄 Development Workflow

1. **Make code changes** in your editor
2. **Rebuild the service**:
   ```bash
   docker-compose up -d --build control-plane
   ```
3. **View logs**:
   ```bash
   docker-compose logs -f control-plane
   ```
4. **Test** your changes
5. **Commit** when ready

## 🎯 Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Change default passwords
3. Use strong `SECRET_KEY`
4. Configure proper CORS settings
5. Set up SSL/TLS certificates
6. Use secrets management (e.g., Docker Secrets, AWS Secrets Manager)
7. Configure resource limits
8. Set up monitoring and logging
9. Implement backup strategy
10. Use container orchestration (e.g., Kubernetes, Docker Swarm)

## 🆘 Getting Help

1. **Check the logs first**: `docker-compose logs -f`
2. **Read the guides**: See `DOCKER_GUIDE.md` for detailed help
3. **Quick reference**: See `DOCKER_QUICKREF.md` for common commands
4. **Command help**:
   - Windows: `.\docker-manage.ps1 help`
   - Linux/Mac: `make help`

## 📝 Notes

- All containers run as **non-root users** for security
- Services communicate through a **dedicated network**
- Database data persists in a **named volume**
- Health checks ensure services are **ready before use**
- `.dockerignore` files optimize **build performance**

## ✨ Features

- 🚀 **Fast startup** with optimized builds
- 🔄 **Hot reload** support for development
- 🏥 **Health monitoring** for all services
- 📊 **Resource efficient** with multi-stage builds
- 🔐 **Secure** with best practices
- 📝 **Well documented** with multiple guides
- 🛠️ **Easy management** with scripts

## 🎉 You're All Set!

Your Docker environment is ready to use. Start the services and begin developing!

```bash
# Start everything
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

**Happy Coding! 🚀**
