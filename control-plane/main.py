from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

from agent import IntentAgent
from fastapi.middleware.cors import CORSMiddleware
import document_parser

# Database and Admin API
from database import init_db
from admin_api import router as admin_router
from auth_api import router as auth_router

app = FastAPI(title="AI Integration Platform - Control Plane")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ Database initialized")

# Include routers
app.include_router(admin_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For POC, allow all. In prod, restrict to frontend URL.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = IntentAgent()

class IntegrationRequest(BaseModel):
    prompt: str
    current_flow: Optional[Dict[str, Any]] = None

import json
import redis

# Redis Connection
redis_client = redis.Redis(host='localhost', port=6379, db=0)

@app.post("/analyze")
async def analyze_intent(req: IntegrationRequest):
    """
    Analyze user intent and return either a flow or conversational response
    """
    result = agent.analyze(req.prompt, req.current_flow)
    
    # Check if it's a conversational response or a flow
    if result.get("type") == "conversation":
        return {
            "status": "conversation",
            "message": result["message"]
        }
    
    # It's a flow - process as before
    flow_data = result["flow"]
    job_id = str(uuid.uuid4())
    job = flow_data.copy()
    job["id"] = job_id
    
    # Dispatch to File (Mock Queue)
    try:
        with open("../runtime/jobs.json", "w") as f:
            json.dump(job, f)
        print(f"Dispatched job {job_id} to jobs.json")
    except Exception as e:
        print(f"Failed to dispatch job to file: {e}")
    
    return {"status": "success", "job": job}

# Document Upload and Flow Generation
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    current_flow: Optional[str] = None
):
    """
    Upload a business requirements document (DOCX or PDF) and generate a flow
    """
    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ['.docx', '.pdf']:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a .docx or .pdf file."
        )
    
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10MB limit."
        )
    
    # Save file temporarily
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
    
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Parse document
        extracted_text = document_parser.parse_document(file_path, file_extension)
        cleaned_text = document_parser.clean_text(extracted_text)
        
        # Generate flow from extracted text
        current_flow_dict = None
        if current_flow:
            try:
                current_flow_dict = json.loads(current_flow)
            except:
                pass
        
        # Create a prompt from the document
        prompt = f"""Business Requirements Document:

{cleaned_text}

Please analyze this business requirements document and create an integration flow."""
        
        # Use the agent to generate flow from document
        current_flow_dict = json.loads(current_flow) if current_flow else None
        result = agent.analyze(prompt, current_flow_dict)
        
        # Check if it's a conversational response
        if result.get("type") == "conversation":
            return {
                "status": "conversation",
                "message": result["message"],
                "extracted_text": extracted_text
            }
        
        # It's a flow
        flow_data = result["flow"]
        
        return {
            "status": "success",
            "flow": flow_data,
            "extracted_text": extracted_text
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )
    finally:
        # Clean up uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass

# Flow Execution Engine
from flow_engine import FlowExecutor, FlowStep, ExecutionContext
import asyncio

@app.post("/flows/{flow_id}/execute")
async def execute_flow(flow_id: str, input_data: Dict[str, Any] = None):
    """
    Execute a flow with the enhanced flow engine
    Supports: conditionals, loops, error handling, parallel execution
    """
    # Load flow from storage
    if not os.path.exists(FLOWS_FILE):
        raise HTTPException(status_code=404, detail="Flow not found")
    
    try:
        with open(FLOWS_FILE, "r") as f:
            flows = json.load(f)
        
        target_flow = None
        for flow in flows:
            if flow["id"] == flow_id:
                target_flow = flow
                break
        
        if not target_flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        
        # Convert flow steps to FlowStep objects
        steps = []
        if "steps" in target_flow:
            for step_data in target_flow["steps"]:
                # Ensure step has a type field
                if "type" not in step_data:
                    step_data["type"] = "action"
                steps.append(FlowStep(**step_data))
        
        # Execute flow
        executor = FlowExecutor()
        context = await executor.execute_flow(steps, input_data or {})
        
        return {
            "status": "success",
            "flow_id": flow_id,
            "execution_results": {
                "history": [result.model_dump() for result in context.history],
                "variables": context.variables,
                "errors": context.errors
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow execution error: {str(e)}")

@app.post("/flows/test-execute")
async def test_execute_flow(flow_definition: Dict[str, Any], input_data: Dict[str, Any] = None):
    """
    Test execute a flow definition without saving it
    Useful for testing complex flows before creation
    """
    try:
        # Convert flow steps to FlowStep objects
        steps = []
        if "steps" in flow_definition:
            for step_data in flow_definition["steps"]:
                if "type" not in step_data:
                    step_data["type"] = "action"
                steps.append(FlowStep(**step_data))
        
        # Execute flow
        executor = FlowExecutor()
        context = await executor.execute_flow(steps, input_data or {})
        
        return {
            "status": "success",
            "execution_results": {
                "history": [result.model_dump() for result in context.history],
                "variables": context.variables,
                "errors": context.errors
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flow execution error: {str(e)}")

# Lookup Management
from lookup_manager import LookupManager, LookupTable, get_lookup_manager

lookup_manager = get_lookup_manager()

class LookupRequest(BaseModel):
    table_id: str
    key: Any
    default: Optional[Any] = None
    key_field: str = "key"
    value_field: str = "value"

class BulkLookupRequest(BaseModel):
    table_id: str
    keys: List[Any]
    default: Optional[Any] = None

class ImportCSVRequest(BaseModel):
    csv_content: str
    has_header: bool = True

@app.post("/lookups")
async def create_lookup(lookup: LookupTable):
    """Create a new lookup table"""
    try:
        created = lookup_manager.create_lookup(lookup)
        return {"status": "success", "lookup": created.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lookups")
async def list_lookups(tags: Optional[str] = None):
    """List all lookup tables, optionally filtered by tags"""
    tag_list = tags.split(',') if tags else None
    lookups = lookup_manager.list_lookups(tags=tag_list)
    return {"status": "success", "lookups": lookups}

@app.get("/lookups/{table_id}")
async def get_lookup(table_id: str):
    """Get a specific lookup table"""
    lookup = lookup_manager.get_lookup_table(table_id)
    if not lookup:
        raise HTTPException(status_code=404, detail="Lookup table not found")
    return {"status": "success", "lookup": lookup}

@app.put("/lookups/{table_id}")
async def update_lookup(table_id: str, updates: Dict[str, Any]):
    """Update a lookup table"""
    lookup = lookup_manager.update_lookup(table_id, updates)
    if not lookup:
        raise HTTPException(status_code=404, detail="Lookup table not found")
    return {"status": "success", "lookup": lookup}

@app.delete("/lookups/{table_id}")
async def delete_lookup(table_id: str):
    """Delete a lookup table"""
    success = lookup_manager.delete_lookup(table_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lookup table not found")
    return {"status": "success", "message": "Lookup table deleted"}

@app.post("/lookups/{table_id}/lookup")
async def perform_lookup(table_id: str, request: LookupRequest):
    """Perform a lookup operation"""
    result = lookup_manager.lookup(
        table_id=request.table_id,
        key=request.key,
        default=request.default,
        key_field=request.key_field,
        value_field=request.value_field
    )
    return {"status": "success", "result": result}

@app.post("/lookups/{table_id}/bulk-lookup")
async def perform_bulk_lookup(table_id: str, request: BulkLookupRequest):
    """Perform bulk lookup operations"""
    results = lookup_manager.bulk_lookup(
        table_id=request.table_id,
        keys=request.keys,
        default=request.default
    )
    return {"status": "success", "results": results}

@app.post("/lookups/{table_id}/import-csv")
async def import_csv(table_id: str, request: ImportCSVRequest):
    """Import CSV data into lookup table"""
    try:
        lookup_manager.import_csv(table_id, request.csv_content, request.has_header)
        return {"status": "success", "message": "CSV imported successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lookups/{table_id}/export-csv")
async def export_csv(table_id: str):
    """Export lookup table as CSV"""
    csv_content = lookup_manager.export_csv(table_id)
    if csv_content is None:
        raise HTTPException(status_code=404, detail="Lookup table not found")
    
    from fastapi.responses import Response
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table_id}.csv"}
    )

@app.get("/lookups/{table_id}/stats")
async def get_lookup_stats(table_id: str):
    """Get statistics about a lookup table"""
    stats = lookup_manager.get_statistics(table_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Lookup table not found")
    return {"status": "success", "statistics": stats}

# Intelligent Adapter Factory
from intelligent_adapter_factory import get_intelligent_factory

intelligent_factory = get_intelligent_factory()

class AutoGenerateAdapterRequest(BaseModel):
    system_name: str

@app.post("/adapters/auto-generate")
async def auto_generate_adapter(request: AutoGenerateAdapterRequest):
    """Automatically generate an adapter for a system"""
    try:
        adapter = intelligent_factory.auto_generate_adapter(request.system_name)
        if adapter:
            return {"status": "success", "adapter": adapter.model_dump()}
        else:
            raise HTTPException(status_code=500, detail="Failed to generate adapter")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/adapters/suggest-from-description")
async def suggest_adapter(description: str):
    """Analyze description and suggest/generate adapter"""
    try:
        adapter = intelligent_factory.suggest_adapter_from_description(description)
        if adapter:
            return {"status": "success", "adapter": adapter.model_dump()}
        else:
            return {"status": "no_match", "message": "No system detected in description"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/adapters/generated")
async def list_generated_adapters():
    """List all auto-generated adapters"""
    adapters = intelligent_factory.get_generated_adapters()
    return {"status": "success", "adapters": adapters}

# Flow Export
from flow_exporter import FlowExporter, get_flow_dependencies
from lookup_manager import get_lookup_manager
from fastapi.responses import FileResponse

flow_exporter = FlowExporter()

@app.post("/flows/{flow_id}/export")
async def export_flow(flow_id: str, include_connections: bool = True):
    """Export flow as deployable package"""
    try:
        # Get flow
        flow = None
        for f in flows:
            if f.get('id') == flow_id:
                flow = f
                break
        
        if not flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        
        # Get dependencies
        deps = get_flow_dependencies(flow)
        
        # Get connections for adapters in flow
        connections_list = []
        if include_connections:
            conn_response = await list_connections()
            all_connections = conn_response.get('connections', [])
            
            # Filter connections for adapters used in flow
            for conn in all_connections:
                if conn.get('adapter_id') in deps['adapters']:
                    connections_list.append(conn)
        
        # Get lookups
        lookup_mgr = get_lookup_manager()
        lookups_list = []
        for lookup_id in deps['lookups']:
            lookup = lookup_mgr.get_lookup_table(lookup_id)
            if lookup:
                lookups_list.append(lookup)
        
        # Get mappers (if you have a mapper manager)
        mappers_list = []
        # TODO: Implement mapper retrieval if needed
        
        # Export flow
        export_path = flow_exporter.export_flow(
            flow=flow,
            connections=connections_list,
            lookups=lookups_list,
            mappers=mappers_list
        )
        
        # Return ZIP file
        return FileResponse(
            export_path,
            media_type='application/zip',
            filename=os.path.basename(export_path)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Adapter Factory Endpoint
from adapter_factory import AdapterFactory
adapter_factory = AdapterFactory()

class AdapterRequest(BaseModel):
    spec_content: str

@app.post("/generate-adapter")
async def generate_adapter(req: AdapterRequest):
    adapter = adapter_factory.generate_from_spec(req.spec_content)
    return {"status": "success", "adapter": adapter.model_dump()}

# Mapper Endpoint
from mapper import MapperAgent
mapper_agent = MapperAgent()

class MappingRequest(BaseModel):
    source_schema: str
    target_schema: str

@app.post("/suggest-mapping")
async def suggest_mapping(req: MappingRequest):
    suggestion = mapper_agent.suggest_mapping(req.source_schema, req.target_schema)
    return {"status": "success", "suggestion": suggestion.model_dump()}

# Adapter Registry Endpoint
from registry import AdapterRegistry, CUSTOM_ADAPTERS_FILE
from adapter_schema import AdapterDefinition
registry = AdapterRegistry()

@app.get("/adapters")
async def list_adapters():
    return {"status": "success", "adapters": registry.get_all()}

@app.get("/health")
async def health():
    return {"status": "ok"}

# Connections Management
CONNECTIONS_FILE = "connections.json"

class ConnectionConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    adapter_id: str
    name: str
    config: Dict[str, Any]

@app.post("/connections")
async def create_connection(conn: ConnectionConfig):
    connections = []
    if os.path.exists(CONNECTIONS_FILE):
        try:
            with open(CONNECTIONS_FILE, "r") as f:
                connections = json.load(f)
        except:
            pass
    
    # Check if connection with same name exists
    for c in connections:
        if c["name"] == conn.name:
            # Update existing
            c["config"] = conn.config
            c["adapter_id"] = conn.adapter_id
            with open(CONNECTIONS_FILE, "w") as f:
                json.dump(connections, f)
            return {"status": "success", "connection": c}

    new_conn = conn.model_dump()
    connections.append(new_conn)
    
    with open(CONNECTIONS_FILE, "w") as f:
        json.dump(connections, f)
    
    return {"status": "success", "connection": new_conn}

@app.get("/connections")
async def list_connections():
    if not os.path.exists(CONNECTIONS_FILE):
        return {"status": "success", "connections": []}
    
    try:
        connections = []
        with open(CONNECTIONS_FILE, "r") as f:
            connections = json.load(f)
            
        # Calculate Usage
        flows = []
        if os.path.exists(FLOWS_FILE):
            with open(FLOWS_FILE, "r") as f:
                flows = json.load(f)
        
        # Map connection_id -> list of flow names
        usage_map = {}
        for flow in flows:
            # Check Trigger
            if "trigger" in flow and "connection_id" in flow["trigger"]:
                cid = flow["trigger"]["connection_id"]
                if cid not in usage_map: usage_map[cid] = []
                usage_map[cid].append({"id": flow["id"], "name": flow["name"], "type": "Trigger"})
            
            # Check Steps
            if "steps" in flow:
                for step in flow["steps"]:
                    if "connection_id" in step:
                        cid = step["connection_id"]
                        if cid not in usage_map: usage_map[cid] = []
                        usage_map[cid].append({"id": flow["id"], "name": flow["name"], "type": "Step"})
            
            # Fallback for old schema
            if "source_connection_id" in flow:
                cid = flow["source_connection_id"]
                if cid not in usage_map: usage_map[cid] = []
                usage_map[cid].append({"id": flow["id"], "name": flow["name"], "type": "Source"})
            if "destination_connection_id" in flow:
                cid = flow["destination_connection_id"]
                if cid not in usage_map: usage_map[cid] = []
                usage_map[cid].append({"id": flow["id"], "name": flow["name"], "type": "Destination"})

        # Enrich connections
        for conn in connections:
            conn["used_by"] = usage_map.get(conn["id"], [])
            conn["usage_count"] = len(conn["used_by"])

        return {"status": "success", "connections": connections}
    except Exception as e:
        print(f"Error listing connections: {e}")
        return {"status": "success", "connections": []}

class ConnectionUpdate(BaseModel):
    config: Dict[str, Any]
    name: Optional[str] = None

@app.put("/connections/{connection_id}")
async def update_connection(connection_id: str, update: ConnectionUpdate):
    if not os.path.exists(CONNECTIONS_FILE):
        raise HTTPException(status_code=404, detail="Connections file not found")
    
    try:
        updated_conn = None
        with open(CONNECTIONS_FILE, "r") as f:
            connections = json.load(f)
        
        for conn in connections:
            if conn["id"] == connection_id:
                conn["config"] = update.config
                if update.name:
                    conn["name"] = update.name
                updated_conn = conn
                break
        
        if not updated_conn:
            raise HTTPException(status_code=404, detail="Connection not found")
            
        with open(CONNECTIONS_FILE, "w") as f:
            json.dump(connections, f)
            
        return {"status": "success", "connection": updated_conn}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/connections/{connection_id}/test")
async def test_connection(connection_id: str):
    if not os.path.exists(CONNECTIONS_FILE):
        raise HTTPException(status_code=404, detail="Connections file not found")
    
    try:
        target_conn = None
        with open(CONNECTIONS_FILE, "r") as f:
            connections = json.load(f)
        
        for conn in connections:
            if conn["id"] == connection_id:
                target_conn = conn
                break
        
        if not target_conn:
            raise HTTPException(status_code=404, detail="Connection not found")
            
        # Mock Test Logic & Schema Discovery
        # In a real app, this would use the adapter to connect and fetch schema
        mock_schema = {
            "tables": ["users", "orders", "products"],
            "fields": {
                "users": ["id", "name", "email"],
                "orders": ["id", "user_id", "total", "status"],
                "products": ["id", "name", "price"]
            },
            "last_tested": str(datetime.datetime.now())
        }
        
        target_conn["schema"] = mock_schema
        
        with open(CONNECTIONS_FILE, "w") as f:
            json.dump(connections, f)
            
        return {"status": "success", "message": "Connection tested successfully", "schema": mock_schema}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/connections/{connection_id}")
async def delete_connection(connection_id: str):
    if not os.path.exists(CONNECTIONS_FILE):
        raise HTTPException(status_code=404, detail="Connections file not found")
    
    try:
        connections = []
        with open(CONNECTIONS_FILE, "r") as f:
            connections = json.load(f)
        
        new_connections = [c for c in connections if c["id"] != connection_id]
        
        if len(new_connections) == len(connections):
             raise HTTPException(status_code=404, detail="Connection not found")
            
        with open(CONNECTIONS_FILE, "w") as f:
            json.dump(new_connections, f)
            
        return {"status": "success", "message": "Connection deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Flows Management
FLOWS_FILE = "flows.json"

class FlowConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    trigger: Dict[str, Any]
    steps: List[Dict[str, Any]]
    status: str = "Inactive"

# ... (save_connection_from_flow and create_flow remain unchanged) ...

class FlowStatusUpdate(BaseModel):
    status: str

@app.patch("/flows/{flow_id}/status")
async def update_flow_status(flow_id: str, status_update: FlowStatusUpdate):
    if not os.path.exists(FLOWS_FILE):
        raise HTTPException(status_code=404, detail="Flows file not found")
    
    try:
        updated_flow = None
        with open(FLOWS_FILE, "r") as f:
            flows = json.load(f)
        
        for flow in flows:
            if flow["id"] == flow_id:
                flow["status"] = status_update.status
                updated_flow = flow
                break
        
        if not updated_flow:
            raise HTTPException(status_code=404, detail="Flow not found")
            
        with open(FLOWS_FILE, "w") as f:
            json.dump(flows, f)
            
        return {"status": "success", "flow": updated_flow}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def save_connection_from_flow(adapter_id: str, config: Dict[str, Any], name_prefix: str):
    if adapter_id == "mapper":
        return None
        
    connections = []
    if os.path.exists(CONNECTIONS_FILE):
        try:
            with open(CONNECTIONS_FILE, "r") as f:
                connections = json.load(f)
        except:
            pass
            
    # Check if similar connection exists (Match by Adapter ID + Config Content)
    # This prevents creating duplicate connections for the same credentials
    for c in connections:
        if c["adapter_id"] == adapter_id and c.get("config") == config:
            return c["id"]
            
    # Create new connection
    new_conn_id = str(uuid.uuid4())
    new_conn = {
        "id": new_conn_id,
        "adapter_id": adapter_id,
        "name": f"{name_prefix} Connection",
        "config": config
    }
    connections.append(new_conn)
    with open(CONNECTIONS_FILE, "w") as f:
        json.dump(connections, f)
    return new_conn_id

def save_mapper_from_flow(step: FlowStep, name_prefix: str):
    if step.adapter_id != "mapper":
        return None
        
    config = step.config or {}
    
    # Check if this mapper already has an ID (reused)
    if "mapper_id" in config:
        return config["mapper_id"]
        
    mappers = []
    if os.path.exists(MAPPERS_FILE):
        try:
            with open(MAPPERS_FILE, "r") as f:
                mappers = json.load(f)
        except:
            pass
            
    # Check for duplicate by name? Maybe complex. For now, always create new if inline.
    
    # Extract rules
    mapping_rules = []
    if "mapping_rules" in config:
        for rule in config["mapping_rules"]:
            mapping_rules.append({
                "source_field": rule.get("source", ""),
                "target_field": rule.get("target", ""),
                "transformation": rule.get("transform")
            })
            
    new_mapper_id = str(uuid.uuid4())
    mapper_name = f"{name_prefix} Mapper"
    
    new_mapper = {
        "id": new_mapper_id,
        "name": mapper_name,
        "description": f"Auto-generated mapper for flow",
        "type": "visual",
        "mapping_rules": mapping_rules,
        "created_at": datetime.datetime.now().isoformat(),
        "updated_at": datetime.datetime.now().isoformat()
    }
    
    mappers.append(new_mapper)
    with open(MAPPERS_FILE, "w") as f:
        json.dump(mappers, f, indent=2)
        
    return new_mapper_id

@app.post("/flows")
async def create_flow(flow: FlowConfig):
    # 1. Extract and Save Connections
    # Save Trigger Connection
    trigger_conn_id = save_connection_from_flow(
        flow.trigger['adapter_id'], 
        flow.trigger.get('config', {}), 
        f"{flow.name} Trigger"
    )
    
    # Save Step Connections AND Mappers
    step_conn_ids = []
    for i, step_dict in enumerate(flow.steps):
        # We need to treat step as an object or dict consistently. 
        # FlowConfig defines steps as List[Dict].
        
        # Save Connection
        step_conn_id = save_connection_from_flow(
            step_dict['adapter_id'], 
            step_dict.get('config', {}), 
            f"{flow.name} Step {i+1}"
        )
        step_conn_ids.append(step_conn_id)
        
        # Save Mapper
        if step_dict['adapter_id'] == 'mapper':
            # Create a localized FlowStep object just for the helper (or adjust helper)
            # Let's adjust helper to take dict to match connection helper
            # Inline helper logic here for safety
            
            config = step_dict.get('config', {})
            if "mapper_id" not in config:
                mappers = []
                if os.path.exists(MAPPERS_FILE):
                    try:
                        with open(MAPPERS_FILE, "r") as f:
                            mappers = json.load(f)
                    except:
                        pass
                
                mapping_rules = []
                if "mapping_rules" in config:
                    for rule in config["mapping_rules"]:
                        mapping_rules.append({
                            "source_field": rule.get("source", ""),
                            "target_field": rule.get("target", ""),
                            "transformation": rule.get("transform")
                        })
                
                new_mapper_id = str(uuid.uuid4())
                new_mapper = {
                    "id": new_mapper_id,
                    "name": f"{flow.name} Mapper {i+1}",
                    "description": "Auto-generated mapper",
                    "type": "visual",
                    "mapping_rules": mapping_rules,
                    "created_at": datetime.datetime.now().isoformat(),
                    "updated_at": datetime.datetime.now().isoformat()
                }
                
                mappers.append(new_mapper)
                with open(MAPPERS_FILE, "w") as f:
                    json.dump(mappers, f, indent=2)
                
                # Update the step config with the new ID
                step_dict['config']['mapper_id'] = new_mapper_id

    
    # 2. Save Flow with Connection IDs
    flows = []
    if os.path.exists(FLOWS_FILE):
        try:
            with open(FLOWS_FILE, "r") as f:
                flows = json.load(f)
        except:
            pass
            
    new_flow = flow.model_dump()
    new_flow["trigger_connection_id"] = trigger_conn_id
    new_flow["step_connection_ids"] = step_conn_ids
    # Note: flow.steps (the input arg) was modified in place above if it was a dict ref? 
    # Actually Pydantic model .steps is list of dicts. We updated step_dict via reference in enumerate loop.
    # But model_dump() creates a fresh copy. We need to explicitly copy back the modified steps or modify new_flow.
    new_flow["steps"] = flow.steps 
    
    flows.append(new_flow)
    
    with open(FLOWS_FILE, "w") as f:
        json.dump(flows, f)
        
    return {"status": "success", "flow": new_flow}

@app.get("/flows")
async def list_flows():
    if not os.path.exists(FLOWS_FILE):
        return {"status": "success", "flows": []}
    try:
        with open(FLOWS_FILE, "r") as f:
            flows = json.load(f)
        return {"status": "success", "flows": flows}
    except:
        return {"status": "success", "flows": []}

@app.get("/flows/{flow_id}")
async def get_flow(flow_id: str):
    if not os.path.exists(FLOWS_FILE):
        raise HTTPException(status_code=404, detail="Flow not found")
    
    try:
        with open(FLOWS_FILE, "r") as f:
            flows = json.load(f)
            for flow in flows:
                if flow["id"] == flow_id:
                    return {"status": "success", "flow": flow}
        raise HTTPException(status_code=404, detail="Flow not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/flows/{flow_id}")
async def delete_flow(flow_id: str):
    if not os.path.exists(FLOWS_FILE):
        raise HTTPException(status_code=404, detail="Flows file not found")
    
    try:
        flows = []
        with open(FLOWS_FILE, "r") as f:
            flows = json.load(f)
        
        new_flows = [f for f in flows if f["id"] != flow_id]
        
        if len(new_flows) == len(flows):
             raise HTTPException(status_code=404, detail="Flow not found")
            
        with open(FLOWS_FILE, "w") as f:
            json.dump(new_flows, f)
            
        return {"status": "success", "message": "Flow deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dynamic Adapter Registration
@app.post("/adapters")
async def register_adapter(adapter: AdapterDefinition):
    custom_adapters = []
    if os.path.exists(CUSTOM_ADAPTERS_FILE):
        try:
            with open(CUSTOM_ADAPTERS_FILE, "r") as f:
                custom_adapters = json.load(f)
        except:
            pass
            
    # Check if ID exists
    for a in custom_adapters:
        if a['id'] == adapter.id:
            return {"status": "error", "message": f"Adapter with ID {adapter.id} already exists"}
            
    custom_adapters.append(adapter.model_dump())
    
    with open(CUSTOM_ADAPTERS_FILE, "w") as f:
        json.dump(custom_adapters, f)
        
    return {"status": "success", "message": f"Adapter {adapter.name} registered successfully"}

# API Management
APIS_FILE = "apis.json"

class APIEndpoint(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    path: str
    method: str
    flow_id: str
    rate_limit: int = 60
    auth_type: str = "None"
    status: str = "Active"

@app.post("/apis")
async def create_api(api: APIEndpoint):
    apis = []
    if os.path.exists(APIS_FILE):
        try:
            with open(APIS_FILE, "r") as f:
                apis = json.load(f)
        except:
            pass
            
    # Check for duplicate path/method
    for a in apis:
        if a['path'] == api.path and a['method'] == api.method:
            return {"status": "error", "message": "API endpoint with this path and method already exists"}
            
    new_api = api.model_dump()
    apis.append(new_api)
    
    with open(APIS_FILE, "w") as f:
        json.dump(apis, f)
        
    return {"status": "success", "api": new_api}

@app.get("/apis")
async def list_apis():
    if not os.path.exists(APIS_FILE):
        return {"status": "success", "apis": []}
    try:
        with open(APIS_FILE, "r") as f:
            apis = json.load(f)
        return {"status": "success", "apis": apis}
    except:
        return {"status": "success", "apis": []}

# Migration Service
from migration_service import migration_service

class MigrationAnalysisRequest(BaseModel):
    platform_id: str
    credentials: Dict[str, str]

class MigrationExecuteRequest(BaseModel):
    platform_id: str
    credentials: Optional[Dict[str, str]] = None

@app.get("/migration/platforms")
async def list_migration_platforms():
    return {"status": "success", "platforms": migration_service.get_supported_platforms()}

@app.post("/migration/analyze")
async def analyze_migration(req: MigrationAnalysisRequest):
    try:
        stats = migration_service.analyze_platform(req.platform_id, req.credentials)
        return {"status": "success", "stats": stats.model_dump()}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Chat Persistence
CHAT_HISTORY_FILE = "chat_history.json"

class ChatMessage(BaseModel):
    role: str
    content: str
    flowData: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

@app.get("/chat/history")
async def get_chat_history():
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

@app.post("/chat/message")
async def save_chat_message(message: ChatMessage):
    history = []
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r") as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []
    
    # Add timestamp if not present
    if not message.timestamp:
        message.timestamp = datetime.datetime.now().isoformat()

    history.append(message.model_dump()) # Use model_dump() for Pydantic v2
    
    with open(CHAT_HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)
    
    return {"status": "success"}

@app.delete("/chat/history")
async def clear_chat_history():
    if os.path.exists(CHAT_HISTORY_FILE):
        os.remove(CHAT_HISTORY_FILE)
    return {"status": "cleared"}

class MigrationExecuteRequest(BaseModel):
    platform_id: str
    credentials: Optional[Dict[str, str]] = None

@app.post("/migration/execute")
async def execute_migration(request: MigrationExecuteRequest):
    try:
        result = migration_service.execute_migration(request.platform_id, request.credentials)
        
        # In a real scenario, we would save these to flows.json and connections.json here
        # For this mock, we'll just return the result and let the frontend display it
        # But to make it "real", let's actually save them!
        
        # Save Connections
        current_connections = []
        if os.path.exists(CONNECTIONS_FILE):
            with open(CONNECTIONS_FILE, "r") as f:
                current_connections = json.load(f)
        
        for conn_name in result["migrated_connections"]:
            # Check if exists
            if not any(c["name"] == conn_name for c in current_connections):
                current_connections.append({
                    "id": str(uuid.uuid4()),
                    "name": conn_name,
                    "adapter_id": "http", # Default to HTTP for mock
                    "config": {"base_url": "https://api.example.com"}
                })
        
        with open(CONNECTIONS_FILE, "w") as f:
            json.dump(current_connections, f)

        # Save Flows
        current_flows = []
        if os.path.exists(FLOWS_FILE):
            with open(FLOWS_FILE, "r") as f:
                current_flows = json.load(f)
                
        for flow in result["migrated_flows"]:
             # Check if exists
            if not any(f["name"] == flow["name"] for f in current_flows):
                current_flows.append({
                    "id": flow["id"],
                    "name": flow["name"],
                    "source": {"adapter_id": "http", "config": {}}, # Mock
                    "destination": {"adapter_id": "sftp", "config": {}}, # Mock
                    "status": "Active",
                    "source_connection_id": "mock-id",
                    "destination_connection_id": "mock-id"
                })
                
        with open(FLOWS_FILE, "w") as f:
            json.dump(current_flows, f)

        return {"status": "success", "result": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Mapper Management
MAPPERS_FILE = "mappers.json"

class MappingRule(BaseModel):
    source_field: str
    target_field: str
    transformation: Optional[str] = None
    condition: Optional[str] = None

class MapperDefinition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    type: str = "visual"  # "visual", "javascript", "xslt", "hybrid"
    
    # Visual Mapping
    mapping_rules: Optional[List[MappingRule]] = []
    
    # JavaScript
    javascript_code: Optional[str] = None
    
    # XSLT
    xslt_template: Optional[str] = None
    
    # Metadata
    source_schema: Optional[Dict[str, Any]] = None
    target_schema: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

@app.post("/mappers")
async def create_mapper(mapper: MapperDefinition):
    mappers = []
    if os.path.exists(MAPPERS_FILE):
        try:
            with open(MAPPERS_FILE, "r") as f:
                mappers = json.load(f)
        except:
            pass
    
    # Set timestamps
    now = datetime.datetime.now().isoformat()
    mapper.created_at = now
    mapper.updated_at = now
    
    new_mapper = mapper.model_dump()
    mappers.append(new_mapper)
    
    with open(MAPPERS_FILE, "w") as f:
        json.dump(mappers, f, indent=2)
    
    return {"status": "success", "mapper": new_mapper}

@app.get("/mappers")
async def list_mappers():
    if not os.path.exists(MAPPERS_FILE):
        return {"status": "success", "mappers": []}
    
    try:
        with open(MAPPERS_FILE, "r") as f:
            mappers = json.load(f)
        
        # Calculate usage for each mapper
        flows = []
        if os.path.exists(FLOWS_FILE):
            with open(FLOWS_FILE, "r") as f:
                flows = json.load(f)
        
        # Map mapper_id -> list of flow names
        usage_map = {}
        for flow in flows:
            if "steps" in flow:
                for step in flow["steps"]:
                    if step.get("adapter_id") == "mapper" and "mapper_id" in step.get("config", {}):
                        mapper_id = step["config"]["mapper_id"]
                        if mapper_id not in usage_map:
                            usage_map[mapper_id] = []
                        usage_map[mapper_id].append({"id": flow["id"], "name": flow["name"]})
        
        # Enrich mappers with usage info
        for mapper in mappers:
            mapper["used_by"] = usage_map.get(mapper["id"], [])
            mapper["usage_count"] = len(mapper["used_by"])
        
        return {"status": "success", "mappers": mappers}
    except Exception as e:
        print(f"Error listing mappers: {e}")
        return {"status": "success", "mappers": []}

@app.get("/mappers/{mapper_id}")
async def get_mapper(mapper_id: str):
    if not os.path.exists(MAPPERS_FILE):
        raise HTTPException(status_code=404, detail="Mapper not found")
    
    try:
        with open(MAPPERS_FILE, "r") as f:
            mappers = json.load(f)
        
        for mapper in mappers:
            if mapper["id"] == mapper_id:
                return {"status": "success", "mapper": mapper}
        
        raise HTTPException(status_code=404, detail="Mapper not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MapperUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    mapping_rules: Optional[List[MappingRule]] = None
    javascript_code: Optional[str] = None
    xslt_template: Optional[str] = None
    source_schema: Optional[Dict[str, Any]] = None
    target_schema: Optional[Dict[str, Any]] = None

@app.put("/mappers/{mapper_id}")
async def update_mapper(mapper_id: str, update: MapperUpdate):
    if not os.path.exists(MAPPERS_FILE):
        raise HTTPException(status_code=404, detail="Mappers file not found")
    
    try:
        with open(MAPPERS_FILE, "r") as f:
            mappers = json.load(f)
        
        updated_mapper = None
        for mapper in mappers:
            if mapper["id"] == mapper_id:
                # Update fields
                if update.name is not None:
                    mapper["name"] = update.name
                if update.description is not None:
                    mapper["description"] = update.description
                if update.type is not None:
                    mapper["type"] = update.type
                if update.mapping_rules is not None:
                    mapper["mapping_rules"] = [rule.model_dump() for rule in update.mapping_rules]
                if update.javascript_code is not None:
                    mapper["javascript_code"] = update.javascript_code
                if update.xslt_template is not None:
                    mapper["xslt_template"] = update.xslt_template
                if update.source_schema is not None:
                    mapper["source_schema"] = update.source_schema
                if update.target_schema is not None:
                    mapper["target_schema"] = update.target_schema
                
                mapper["updated_at"] = datetime.datetime.now().isoformat()
                updated_mapper = mapper
                break
        
        if not updated_mapper:
            raise HTTPException(status_code=404, detail="Mapper not found")
        
        with open(MAPPERS_FILE, "w") as f:
            json.dump(mappers, f, indent=2)
        
        return {"status": "success", "mapper": updated_mapper}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/mappers/{mapper_id}")
async def delete_mapper(mapper_id: str):
    if not os.path.exists(MAPPERS_FILE):
        raise HTTPException(status_code=404, detail="Mappers file not found")
    
    try:
        with open(MAPPERS_FILE, "r") as f:
            mappers = json.load(f)
        
        new_mappers = [m for m in mappers if m["id"] != mapper_id]
        
        if len(new_mappers) == len(mappers):
            raise HTTPException(status_code=404, detail="Mapper not found")
        
        with open(MAPPERS_FILE, "w") as f:
            json.dump(new_mappers, f, indent=2)
        
        return {"status": "success", "message": "Mapper deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MapperTestRequest(BaseModel):
    sample_input: Dict[str, Any]

@app.post("/mappers/{mapper_id}/test")
async def test_mapper(mapper_id: str, test_req: MapperTestRequest):
    if not os.path.exists(MAPPERS_FILE):
        raise HTTPException(status_code=404, detail="Mapper not found")
    
    try:
        with open(MAPPERS_FILE, "r") as f:
            mappers = json.load(f)
        
        target_mapper = None
        for mapper in mappers:
            if mapper["id"] == mapper_id:
                target_mapper = mapper
                break
        
        if not target_mapper:
            raise HTTPException(status_code=404, detail="Mapper not found")
        
        # Execute mapper using Engine
        from mapper_engine import MapperEngine
        engine = MapperEngine()
        
        # Prepare config
        # The mapper object from DB matches the config structure expected by engine (type, rules, code)
        result = engine.execute(target_mapper, test_req.sample_input)
        
        return {
            "status": "success",
            "input": test_req.sample_input,
            "output": result,
            "mapper_type": target_mapper["type"]
        }
    except Exception as e:
        # Return error as valid response for testing
        return {
            "status": "error", 
            "message": str(e)
        }
        # Or raise HTTPException depending on pref. 
        # The frontend expects 200 with error details or 500? 
        # Previous implementation raised 500. Let's keep it robust.
        # raise HTTPException(status_code=500, detail=str(e))
