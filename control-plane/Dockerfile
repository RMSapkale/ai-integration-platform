# Control Plane - Backend API
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
# Create a temporary requirements file if it doesn't exist to prevent build failure
# This is a fallback measure; ideally requirements.txt should exist
RUN if [ ! -f requirements.txt ]; then echo "fastapi==0.104.1\nuvicorn==0.24.0\npydantic==2.5.0\nrequests==2.31.0" > requirements.txt; fi
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
