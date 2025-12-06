from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class AdapterField(BaseModel):
    name: str = Field(description="Internal field name")
    label: str = Field(description="User-facing label")
    type: str = Field(description="Field type: string, password, number, boolean, select")
    required: bool = Field(default=True)
    options: Optional[List[str]] = Field(default=None, description="Options for select type")
    default: Optional[Any] = Field(default=None)

class AdapterAction(BaseModel):
    name: str = Field(description="Internal action name")
    label: str = Field(description="User-facing label")
    description: str = Field(description="What this action does")
    method: str = Field(description="HTTP Method: GET, POST, PUT, DELETE")
    path: str = Field(description="API Path, can include variables like {id}")
    input_schema: Dict[str, Any] = Field(default_factory=dict, description="JSON Schema for input body/params")

class AdapterDefinition(BaseModel):
    id: str = Field(description="Unique identifier (e.g., salesforce)")
    name: str = Field(description="Display name")
    description: str = Field(description="Short description")
    icon: str = Field(description="Icon name (Lucide)")
    category: str = Field(description="Category: CRM, ERP, Database, etc.")
    
    connection_fields: List[AdapterField] = Field(description="Fields required to authenticate/connect")
    actions: List[AdapterAction] = Field(description="List of available operations")
