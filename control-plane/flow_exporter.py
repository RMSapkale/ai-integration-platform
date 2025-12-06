"""
Flow Export Utility
Exports flows as deployable packages for runtime environments
"""

import json
import os
import zipfile
from typing import Dict, Any, List, Optional
from datetime import datetime
from cryptography.fernet import Fernet
import base64


class FlowExporter:
    """Export flows as deployable packages"""
    
    def __init__(self, encryption_key: Optional[str] = None):
        """
        Initialize exporter
        
        Args:
            encryption_key: Key for encrypting connections (generates if not provided)
        """
        if encryption_key:
            self.encryption_key = encryption_key.encode()
        else:
            self.encryption_key = Fernet.generate_key()
        
        self.cipher = Fernet(self.encryption_key)
    
    def export_flow(
        self,
        flow: Dict[str, Any],
        connections: List[Dict[str, Any]],
        lookups: List[Dict[str, Any]] = None,
        mappers: List[Dict[str, Any]] = None,
        output_dir: str = "exports"
    ) -> str:
        """
        Export flow as deployable package
        
        Args:
            flow: Flow definition
            connections: Connection configurations
            lookups: Lookup tables used by flow
            mappers: Mapper definitions
            output_dir: Directory to save export
            
        Returns:
            Path to exported ZIP file
        """
        flow_id = flow.get('id', 'unknown')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        export_name = f"flow-{flow_id}-{timestamp}"
        export_path = os.path.join(output_dir, export_name)
        
        # Create export directory
        os.makedirs(export_path, exist_ok=True)
        
        # 1. Save flow definition
        flow_data = {
            **flow,
            'exported_at': datetime.now().isoformat(),
            'export_version': '1.0.0'
        }
        with open(os.path.join(export_path, 'flow.json'), 'w') as f:
            json.dump(flow_data, f, indent=2)
        
        # 2. Encrypt and save connections
        encrypted_connections = self._encrypt_connections(connections)
        with open(os.path.join(export_path, 'connections.json'), 'w') as f:
            json.dump(encrypted_connections, f, indent=2)
        
        # 3. Save lookups
        if lookups:
            with open(os.path.join(export_path, 'lookups.json'), 'w') as f:
                json.dump(lookups, f, indent=2)
        
        # 4. Save mappers
        if mappers:
            with open(os.path.join(export_path, 'mappers.json'), 'w') as f:
                json.dump(mappers, f, indent=2)
        
        # 5. Create runtime config
        runtime_config = self._generate_runtime_config(flow)
        with open(os.path.join(export_path, 'runtime-config.json'), 'w') as f:
            json.dump(runtime_config, f, indent=2)
        
        # 6. Generate README
        readme = self._generate_readme(flow, runtime_config)
        with open(os.path.join(export_path, 'README.md'), 'w') as f:
            f.write(readme)
        
        # 7. Save encryption key
        with open(os.path.join(export_path, 'encryption.key'), 'wb') as f:
            f.write(self.encryption_key)
        
        # 8. Create ZIP package
        zip_path = f"{export_path}.zip"
        self._create_zip(export_path, zip_path)
        
        # Clean up temporary directory
        import shutil
        shutil.rmtree(export_path)
        
        return zip_path
    
    def _encrypt_connections(self, connections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Encrypt sensitive connection data"""
        encrypted = []
        
        for conn in connections:
            encrypted_conn = conn.copy()
            
            # Encrypt credentials
            if 'credentials' in conn:
                creds_json = json.dumps(conn['credentials'])
                encrypted_creds = self.cipher.encrypt(creds_json.encode())
                encrypted_conn['credentials'] = base64.b64encode(encrypted_creds).decode()
                encrypted_conn['encrypted'] = True
            
            encrypted.append(encrypted_conn)
        
        return encrypted
    
    def _generate_runtime_config(self, flow: Dict[str, Any]) -> Dict[str, Any]:
        """Generate runtime configuration"""
        return {
            'execution_mode': 'scheduled' if flow.get('trigger', {}).get('adapter_id') == 'schedule' else 'api',
            'schedule': flow.get('trigger', {}).get('config', {}).get('cron_expression'),
            'max_retries': 3,
            'timeout_seconds': 300,
            'log_level': 'INFO',
            'enable_monitoring': True
        }
    
    def _generate_readme(self, flow: Dict[str, Any], runtime_config: Dict[str, Any]) -> str:
        """Generate deployment README"""
        return f"""# Flow Deployment: {flow.get('name', 'Unnamed Flow')}

## Overview
- **Flow ID**: {flow.get('id')}
- **Exported**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **Execution Mode**: {runtime_config.get('execution_mode')}

## Deployment Instructions

### Option 1: Docker (Recommended)

```bash
# 1. Extract package
unzip flow-{flow.get('id')}-*.zip

# 2. Run with Docker
docker run -d \\
  -v $(pwd):/flows \\
  -e ENCRYPTION_KEY_FILE=/flows/encryption.key \\
  --name flow-runtime \\
  flow-runtime:latest

# 3. Check logs
docker logs -f flow-runtime
```

### Option 2: Python Runtime

```bash
# 1. Install runtime
pip install flow-runtime

# 2. Deploy flow
flow-runtime deploy flow.json --encryption-key encryption.key

# 3. Start runtime
flow-runtime start
```

## Configuration

Edit `runtime-config.json` to customize:
- Execution schedule
- Retry settings
- Logging level
- Monitoring options

## Connections

Connection credentials are encrypted. The runtime will decrypt them using `encryption.key`.

**IMPORTANT**: Keep `encryption.key` secure and never commit to version control!

## Monitoring

View execution logs:
```bash
# Docker
docker logs flow-runtime

# Python
flow-runtime logs
```

## Support

For issues or questions, contact support@yourplatform.com
"""
    
    def _create_zip(self, source_dir: str, output_path: str):
        """Create ZIP archive"""
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, source_dir)
                    zipf.write(file_path, arcname)


def get_flow_dependencies(flow: Dict[str, Any]) -> Dict[str, List[str]]:
    """Extract dependencies from flow"""
    adapters = set()
    lookups = set()
    mappers = set()
    
    # Get adapters from trigger
    if flow.get('trigger', {}).get('adapter_id'):
        adapters.add(flow['trigger']['adapter_id'])
    
    # Get adapters from steps
    for step in flow.get('steps', []):
        if step.get('adapter_id'):
            adapters.add(step['adapter_id'])
        
        # Check for lookups in step config
        if 'lookup_table_id' in step.get('config', {}):
            lookups.add(step['config']['lookup_table_id'])
        
        # Check for mappers
        if step.get('adapter_id') == 'mapper':
            mapper_id = step.get('config', {}).get('mapper_id')
            if mapper_id:
                mappers.add(mapper_id)
    
    return {
        'adapters': list(adapters),
        'lookups': list(lookups),
        'mappers': list(mappers)
    }
