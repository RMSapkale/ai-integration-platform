# Flow Runtime Environment

Lightweight, read-only runtime for executing exported flows in customer VMs.

## Quick Start

### 1. Export Flow from Platform

In the platform UI:
```
1. Navigate to your flow
2. Click "Export Flow"
3. Download the ZIP package
```

Or via API:
```bash
curl -X POST http://135.235.194.170:8000/flows/{flow-id}/export \
  -o flow-export.zip
```

### 2. Deploy to Runtime

```bash
# Extract package
unzip flow-export.zip -d flows/

# Build Docker image
docker build -t flow-runtime .

# Run runtime
docker-compose up -d
```

### 3. Monitor Execution

```bash
# View logs
docker logs -f flow-runtime

# Check status
docker exec flow-runtime python -c "from flow_runtime import FlowRuntime; r = FlowRuntime('/flows/flow.json', '/flows/encryption.key'); print(r.get_status())"
```

## Deployment Options

### Option 1: Docker (Recommended)

**Single Flow:**
```bash
docker run -d \
  -v $(pwd)/flows:/flows:ro \
  -v $(pwd)/logs:/logs \
  --name flow-runtime \
  flow-runtime:latest
```

**Multi-Flow with API:**
```bash
docker-compose up -d flow-runtime-api
```

### Option 2: Standalone Python

```bash
# Install dependencies
pip install -r requirements.txt

# Run runtime
python flow_runtime.py flows/flow.json flows/encryption.key
```

### Option 3: Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flow-runtime
spec:
  replicas: 1
  selector:
    matchLabels:
      app: flow-runtime
  template:
    metadata:
      labels:
        app: flow-runtime
    spec:
      containers:
      - name: runtime
        image: flow-runtime:latest
        volumeMounts:
        - name: flows
          mountPath: /flows
          readOnly: true
        - name: logs
          mountPath: /logs
      volumes:
      - name: flows
        configMap:
          name: flow-config
      - name: logs
        emptyDir: {}
```

## Configuration

Edit `runtime-config.json`:

```json
{
  "execution_mode": "scheduled",
  "schedule": "0 22 * * *",
  "max_retries": 3,
  "timeout_seconds": 300,
  "log_level": "INFO",
  "enable_monitoring": true
}
```

## Security

### Connection Encryption

Connections are encrypted with AES-256. The `encryption.key` file is required for decryption.

**IMPORTANT**: 
- Keep `encryption.key` secure
- Never commit to version control
- Use environment variables or secret managers in production

### Read-Only Mode

The runtime enforces read-only operations:
- ✅ Execute flows
- ✅ View logs
- ✅ Check status
- ❌ Modify flows
- ❌ Update connections
- ❌ Delete flows

## Monitoring

### Logs

Execution logs are stored in `/logs`:
- `executions.log` - Main execution log
- `exec-{timestamp}.json` - Individual execution details

### Metrics

Optional: Send metrics to control plane:
```bash
export CONTROL_PLANE_URL=https://platform.example.com
export RUNTIME_TOKEN=your-token
```

## Troubleshooting

### Flow not executing

```bash
# Check flow file
cat flows/flow.json

# Verify encryption key
ls -la flows/encryption.key

# Check logs
docker logs flow-runtime
```

### Connection errors

```bash
# Test connection decryption
python -c "from flow_runtime import FlowRuntime; r = FlowRuntime('/flows/flow.json', '/flows/encryption.key'); print(r.connections)"
```

### Resource limits

Adjust in `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
```

## Support

For issues or questions:
- Documentation: https://docs.yourplatform.com
- Support: support@yourplatform.com
- GitHub: https://github.com/yourorg/flow-runtime

## License

See LICENSE file for details.
