"""
Flow Runtime Executor
Read-only runtime for executing exported flows
"""

import json
import os
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from cryptography.fernet import Fernet
import base64
from flow_engine import FlowExecutor, FlowStep, ExecutionContext


class FlowRuntime:
    """
    Read-only runtime for executing flows
    
    This runtime can ONLY execute flows, not modify them.
    """
    
    def __init__(self, flow_path: str, encryption_key_path: str):
        """
        Initialize runtime
        
        Args:
            flow_path: Path to flow.json
            encryption_key_path: Path to encryption.key
        """
        self.flow_path = flow_path
        self.flow_dir = os.path.dirname(flow_path)
        
        # Load encryption key
        with open(encryption_key_path, 'rb') as f:
            self.encryption_key = f.read()
        self.cipher = Fernet(self.encryption_key)
        
        # Load flow
        self.flow = self._load_flow()
        self.connections = self._load_connections()
        self.lookups = self._load_lookups()
        self.mappers = self._load_mappers()
        self.runtime_config = self._load_runtime_config()
        
        # Initialize executor
        self.executor = FlowExecutor()
        
        # Execution state
        self.executions = []
        self.read_only = True  # Enforce read-only mode
    
    def _load_flow(self) -> Dict[str, Any]:
        """Load flow definition"""
        with open(self.flow_path, 'r') as f:
            return json.load(f)
    
    def _load_connections(self) -> Dict[str, Any]:
        """Load and decrypt connections"""
        conn_path = os.path.join(self.flow_dir, 'connections.json')
        if not os.path.exists(conn_path):
            return {}
        
        with open(conn_path, 'r') as f:
            encrypted_connections = json.load(f)
        
        # Decrypt connections
        decrypted = {}
        for conn in encrypted_connections:
            conn_id = conn.get('id')
            if conn.get('encrypted') and 'credentials' in conn:
                # Decrypt credentials
                encrypted_creds = base64.b64decode(conn['credentials'])
                decrypted_creds = self.cipher.decrypt(encrypted_creds)
                conn['credentials'] = json.loads(decrypted_creds.decode())
                conn['encrypted'] = False
            
            decrypted[conn_id] = conn
        
        return decrypted
    
    def _load_lookups(self) -> Dict[str, Any]:
        """Load lookup tables"""
        lookup_path = os.path.join(self.flow_dir, 'lookups.json')
        if not os.path.exists(lookup_path):
            return {}
        
        with open(lookup_path, 'r') as f:
            lookups = json.load(f)
        
        return {lookup['id']: lookup for lookup in lookups}
    
    def _load_mappers(self) -> Dict[str, Any]:
        """Load mapper definitions"""
        mapper_path = os.path.join(self.flow_dir, 'mappers.json')
        if not os.path.exists(mapper_path):
            return {}
        
        with open(mapper_path, 'r') as f:
            mappers = json.load(f)
        
        return {mapper['id']: mapper for mapper in mappers}
    
    def _load_runtime_config(self) -> Dict[str, Any]:
        """Load runtime configuration"""
        config_path = os.path.join(self.flow_dir, 'runtime-config.json')
        if not os.path.exists(config_path):
            return {
                'execution_mode': 'api',
                'max_retries': 3,
                'timeout_seconds': 300,
                'log_level': 'INFO'
            }
        
        with open(config_path, 'r') as f:
            return json.load(f)
    
    async def execute(self, trigger_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute the flow
        
        Args:
            trigger_data: Data from trigger event
            
        Returns:
            Execution result
        """
        execution_id = f"exec-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        execution_record = {
            'id': execution_id,
            'flow_id': self.flow.get('id'),
            'flow_name': self.flow.get('name'),
            'started_at': datetime.now().isoformat(),
            'status': 'running',
            'trigger_data': trigger_data
        }
        
        self.executions.append(execution_record)
        
        try:
            # Convert flow to FlowStep format
            steps = self._convert_to_flow_steps(self.flow)
            
            # Execute flow
            context = await self.executor.execute_flow(
                steps=steps,
                initial_data=trigger_data or {}
            )
            
            # Record success
            execution_record['status'] = 'success'
            execution_record['completed_at'] = datetime.now().isoformat()
            execution_record['result'] = {
                'variables': context.variables,
                'steps_executed': len(context.history),
                'errors': context.errors
            }
            
            self._log_execution(execution_record)
            
            return execution_record
        
        except Exception as e:
            # Record failure
            execution_record['status'] = 'failed'
            execution_record['completed_at'] = datetime.now().isoformat()
            execution_record['error'] = str(e)
            
            self._log_execution(execution_record)
            
            raise
    
    def _convert_to_flow_steps(self, flow: Dict[str, Any]) -> list:
        """Convert flow definition to FlowStep objects"""
        steps = []
        
        # Add trigger as first step if not schedule
        trigger = flow.get('trigger', {})
        if trigger.get('adapter_id') != 'schedule':
            steps.append(FlowStep(
                id='trigger',
                type='action',
                adapter_id=trigger.get('adapter_id'),
                action=trigger.get('action'),
                config=trigger.get('config', {})
            ))
        
        # Add flow steps
        for step in flow.get('steps', []):
            steps.append(FlowStep(
                id=step.get('id', f"step-{len(steps)}"),
                type=step.get('type', 'action'),
                adapter_id=step.get('adapter_id'),
                action=step.get('action'),
                config=step.get('config', {})
            ))
        
        return steps
    
    def _log_execution(self, execution: Dict[str, Any]):
        """Log execution to file"""
        log_dir = os.path.join(self.flow_dir, 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        log_file = os.path.join(log_dir, f"{execution['id']}.json")
        with open(log_file, 'w') as f:
            json.dump(execution, f, indent=2)
        
        # Also append to main log
        main_log = os.path.join(log_dir, 'executions.log')
        with open(main_log, 'a') as f:
            f.write(f"{execution['started_at']} | {execution['status']} | {execution['flow_name']}\n")
    
    def get_status(self) -> Dict[str, Any]:
        """Get runtime status"""
        return {
            'flow_id': self.flow.get('id'),
            'flow_name': self.flow.get('name'),
            'read_only': self.read_only,
            'total_executions': len(self.executions),
            'last_execution': self.executions[-1] if self.executions else None,
            'runtime_config': self.runtime_config
        }
    
    def get_logs(self, limit: int = 100) -> list:
        """Get execution logs"""
        return self.executions[-limit:]
    
    # Modification methods are disabled
    def modify_flow(self, *args, **kwargs):
        """Disabled in runtime mode"""
        raise PermissionError("Flow modification is not allowed in runtime mode")
    
    def update_connections(self, *args, **kwargs):
        """Disabled in runtime mode"""
        raise PermissionError("Connection modification is not allowed in runtime mode")
    
    def delete_flow(self, *args, **kwargs):
        """Disabled in runtime mode"""
        raise PermissionError("Flow deletion is not allowed in runtime mode")


# CLI for runtime
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python flow_runtime.py <flow.json> <encryption.key>")
        sys.exit(1)
    
    flow_path = sys.argv[1]
    key_path = sys.argv[2]
    
    runtime = FlowRuntime(flow_path, key_path)
    
    print(f"✅ Loaded flow: {runtime.flow.get('name')}")
    print(f"📊 Status: {runtime.get_status()}")
    
    # Execute flow
    print("\n🚀 Executing flow...")
    result = asyncio.run(runtime.execute())
    
    print(f"\n✅ Execution complete!")
    print(f"Status: {result['status']}")
    print(f"Duration: {result.get('completed_at')} - {result.get('started_at')}")
