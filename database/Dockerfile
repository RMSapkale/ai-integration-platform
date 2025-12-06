# ============================================
# Database Dockerfile - PostgreSQL
# ============================================

FROM postgres:15-alpine

# Set labels for metadata
LABEL maintainer="your-email@example.com"
LABEL description="PostgreSQL database for AI Integration Platform"

# Install additional tools
RUN apk add --no-cache \
    postgresql-contrib \
    curl

# Create directory for initialization scripts
RUN mkdir -p /docker-entrypoint-initdb.d

# Copy initialization scripts (if any)
# These scripts will run automatically when the container starts for the first time
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Set default environment variables (can be overridden in docker-compose)
ENV POSTGRES_DB=iwings
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Expose PostgreSQL port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} || exit 1

# Use the default PostgreSQL entrypoint
# This will handle database initialization and startup
