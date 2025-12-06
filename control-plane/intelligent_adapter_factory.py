"""
Intelligent Adapter Auto-Generation System
Automatically discovers, generates, and manages adapters for unknown systems
"""

import os
import json
import requests
from typing import Optional, Dict, Any, List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from adapter_schema import AdapterDefinition, AdapterField, AdapterAction
from pydantic import BaseModel


class SystemInfo(BaseModel):
    """Information about a system to integrate with"""
    name: str
    description: Optional[str] = None
    api_type: Optional[str] = None  # "REST", "SOAP", "GraphQL", etc.
    base_url: Optional[str] = None
    documentation_url: Optional[str] = None


class IntelligentAdapterFactory:
    """
    Intelligent adapter factory that can:
    1. Detect when an adapter is missing
    2. Search for API specifications online
    3. Generate adapters automatically
    4. Learn from usage patterns
    """
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("WARNING: OPENAI_API_KEY not found. Using Mock Mode.")
            self.mock_mode = True
        else:
            self.mock_mode = False
            self.llm = ChatOpenAI(model="gpt-4o", temperature=0)
            self.parser = PydanticOutputParser(pydantic_object=AdapterDefinition)
        
        self.generated_adapters_file = "generated_adapters.json"
        self._load_generated_adapters()
    
    def _load_generated_adapters(self):
        """Load previously generated adapters"""
        if os.path.exists(self.generated_adapters_file):
            try:
                with open(self.generated_adapters_file, 'r') as f:
                    self.generated_adapters = json.load(f)
            except:
                self.generated_adapters = {}
        else:
            self.generated_adapters = {}
    
    def _save_generated_adapter(self, adapter: AdapterDefinition):
        """Save a generated adapter for future use"""
        self.generated_adapters[adapter.id] = adapter.model_dump()
        with open(self.generated_adapters_file, 'w') as f:
            json.dump(self.generated_adapters, f, indent=2)
    
    def detect_system_from_description(self, description: str) -> Optional[SystemInfo]:
        """
        Analyze user description to detect what system they want to integrate with
        
        Args:
            description: User's natural language description
            
        Returns:
            SystemInfo if a system is detected, None otherwise
        """
        if self.mock_mode:
            # Mock detection
            if "stripe" in description.lower():
                return SystemInfo(
                    name="Stripe",
                    api_type="REST",
                    base_url="https://api.stripe.com",
                    documentation_url="https://stripe.com/docs/api"
                )
            return None
        
        # Use AI to detect system
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at identifying software systems and APIs from descriptions.
            Analyze the user's description and identify:
            1. The system/service name
            2. Type of API (REST, SOAP, GraphQL, etc.)
            3. Base URL if known
            4. Documentation URL if known
            
            If you can't identify a specific system, return null.
            
            Return as JSON:
            {{
                "name": "System Name",
                "api_type": "REST",
                "base_url": "https://api.example.com",
                "documentation_url": "https://example.com/docs"
            }}
            """),
            ("user", "{description}")
        ])
        
        try:
            chain = prompt | self.llm
            result = chain.invoke({"description": description})
            
            # Parse JSON response
            import re
            json_match = re.search(r'\{.*\}', result.content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return SystemInfo(**data)
        except Exception as e:
            print(f"Error detecting system: {e}")
        
        return None
    
    def search_for_api_spec(self, system_name: str) -> Optional[str]:
        """
        Search for OpenAPI/Swagger specification for a system
        
        Args:
            system_name: Name of the system
            
        Returns:
            OpenAPI spec as string, or None if not found
        """
        # Common locations to check for API specs
        common_patterns = [
            f"https://api.{system_name.lower()}.com/openapi.json",
            f"https://api.{system_name.lower()}.com/swagger.json",
            f"https://{system_name.lower()}.com/api/openapi.json",
            f"https://{system_name.lower()}.com/api/swagger.json",
        ]
        
        for url in common_patterns:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    return response.text
            except:
                continue
        
        # If not found, use AI to generate a basic spec
        return self._generate_basic_spec(system_name)
    
    def _generate_basic_spec(self, system_name: str) -> str:
        """
        Generate a basic OpenAPI spec using AI knowledge
        
        Args:
            system_name: Name of the system
            
        Returns:
            Generated OpenAPI spec
        """
        if self.mock_mode:
            return json.dumps({
                "openapi": "3.0.0",
                "info": {"title": f"{system_name} API", "version": "1.0.0"},
                "paths": {
                    "/resource": {
                        "get": {"summary": "Get resources"},
                        "post": {"summary": "Create resource"}
                    }
                }
            })
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert API architect. Generate a basic OpenAPI 3.0 specification 
            for the given system based on your knowledge of common APIs and best practices.
            
            Include:
            1. Authentication (API key, OAuth, etc.)
            2. Common CRUD operations
            3. Typical request/response schemas
            
            Return ONLY valid OpenAPI 3.0 JSON, no explanations."""),
            ("user", "Generate OpenAPI spec for: {system_name}")
        ])
        
        try:
            chain = prompt | self.llm
            result = chain.invoke({"system_name": system_name})
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', result.content, re.DOTALL)
            if json_match:
                return json_match.group()
        except Exception as e:
            print(f"Error generating spec: {e}")
        
        # Fallback to minimal spec
        return json.dumps({
            "openapi": "3.0.0",
            "info": {"title": f"{system_name} API", "version": "1.0.0"},
            "paths": {}
        })
    
    def generate_adapter_from_spec(self, spec_content: str, system_name: str) -> AdapterDefinition:
        """
        Generate adapter definition from OpenAPI spec
        
        Args:
            spec_content: OpenAPI specification
            system_name: Name of the system
            
        Returns:
            AdapterDefinition
        """
        if self.mock_mode:
            return AdapterDefinition(
                id=system_name.lower().replace(" ", "_"),
                name=system_name,
                description=f"Auto-generated adapter for {system_name}",
                icon="Cloud",
                category="Auto-Generated",
                connection_fields=[
                    AdapterField(name="api_key", label="API Key", type="password", required=True),
                    AdapterField(name="base_url", label="Base URL", type="text", required=True)
                ],
                actions=[
                    AdapterAction(
                        name="get_resource",
                        label="Get Resource",
                        description="Fetch a resource",
                        method="GET",
                        path="/resource"
                    ),
                    AdapterAction(
                        name="create_resource",
                        label="Create Resource",
                        description="Create a new resource",
                        method="POST",
                        path="/resource"
                    )
                ]
            )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert API integrator. Analyze the OpenAPI specification and create an adapter definition.
            
            Extract:
            1. Authentication method and create connection_fields
            2. Key operations and create actions with proper HTTP methods and paths
            3. Input/output schemas for each action
            
            Make the adapter practical and usable. Focus on the most important operations.
            
            {format_instructions}"""),
            ("user", "System: {system_name}\n\nOpenAPI Spec:\n{spec_content}")
        ])
        
        try:
            chain = prompt | self.llm | self.parser
            adapter = chain.invoke({
                "system_name": system_name,
                "spec_content": spec_content[:15000],
                "format_instructions": self.parser.get_format_instructions()
            })
            
            # Ensure ID is set
            if not adapter.id:
                adapter.id = system_name.lower().replace(" ", "_")
            
            return adapter
        except Exception as e:
            print(f"Error generating adapter: {e}")
            
            # Return fallback adapter
            return AdapterDefinition(
                id=system_name.lower().replace(" ", "_"),
                name=system_name,
                description=f"Auto-generated adapter for {system_name}",
                icon="Cloud",
                category="Auto-Generated",
                connection_fields=[
                    AdapterField(name="api_key", label="API Key", type="password", required=True)
                ],
                actions=[
                    AdapterAction(
                        name="api_call",
                        label="API Call",
                        description="Generic API call",
                        method="POST",
                        path="/api"
                    )
                ]
            )
    
    def auto_generate_adapter(self, system_name: str) -> Optional[AdapterDefinition]:
        """
        Automatically generate an adapter for a system
        
        This is the main entry point for auto-generation.
        
        Args:
            system_name: Name of the system to generate adapter for
            
        Returns:
            AdapterDefinition if successful, None otherwise
        """
        # Check if already generated
        adapter_id = system_name.lower().replace(" ", "_")
        if adapter_id in self.generated_adapters:
            print(f"Using cached adapter for {system_name}")
            return AdapterDefinition(**self.generated_adapters[adapter_id])
        
        print(f"Auto-generating adapter for {system_name}...")
        
        # Step 1: Search for API spec
        spec = self.search_for_api_spec(system_name)
        if not spec:
            print(f"Could not find API spec for {system_name}")
            return None
        
        # Step 2: Generate adapter from spec
        adapter = self.generate_adapter_from_spec(spec, system_name)
        
        # Step 3: Save for future use
        self._save_generated_adapter(adapter)
        
        print(f"Successfully generated adapter for {system_name}")
        return adapter
    
    def suggest_adapter_from_description(self, description: str) -> Optional[AdapterDefinition]:
        """
        Analyze user description and suggest/generate an adapter
        
        Args:
            description: User's natural language description
            
        Returns:
            AdapterDefinition if a system is detected and adapter generated
        """
        # Detect system from description
        system_info = self.detect_system_from_description(description)
        if not system_info:
            return None
        
        # Auto-generate adapter
        return self.auto_generate_adapter(system_info.name)
    
    def get_generated_adapters(self) -> List[Dict[str, Any]]:
        """Get list of all generated adapters"""
        return list(self.generated_adapters.values())
    
    def enhance_existing_adapter(self, adapter_id: str, usage_data: Dict[str, Any]) -> AdapterDefinition:
        """
        Enhance an existing adapter based on usage patterns
        
        Args:
            adapter_id: ID of the adapter to enhance
            usage_data: Data about how the adapter is being used
            
        Returns:
            Enhanced AdapterDefinition
        """
        # This would analyze usage patterns and suggest improvements
        # For now, return existing adapter
        if adapter_id in self.generated_adapters:
            return AdapterDefinition(**self.generated_adapters[adapter_id])
        return None


# Global instance
_intelligent_factory = None

def get_intelligent_factory() -> IntelligentAdapterFactory:
    """Get global intelligent adapter factory instance"""
    global _intelligent_factory
    if _intelligent_factory is None:
        _intelligent_factory = IntelligentAdapterFactory()
    return _intelligent_factory
