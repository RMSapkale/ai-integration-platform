# Flow Runtime - Lightweight execution environment
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install runtime dependencies only
RUN pip install --no-cache-dir \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    pydantic==2.5.0 \
    requests==2.31.0 \
    cryptography==41.0.7 \
    python-multipart==0.0.6

# Copy only runtime files (no UI, no modification tools)
COPY flow_engine.py /app/
COPY flow_runtime.py /app/
COPY adapters/ /app/adapters/

# Create directories for flows and logs
RUN mkdir -p /flows /logs

# Environment variables
ENV FLOW_FILE=/flows/flow.json
ENV ENCRYPTION_KEY_FILE=/flows/encryption.key
ENV LOG_DIR=/logs
ENV PYTHONUNBUFFERED=1

# Expose port for API mode
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Run runtime
CMD ["python", "flow_runtime.py", "/flows/flow.json", "/flows/encryption.key"]
