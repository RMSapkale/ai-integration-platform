from typing import Dict, Any, List

class WorkatoParser:
    def parse_recipe(self, recipe_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses a Workato recipe JSON and returns an Iwings Flow definition.
        """
        try:
            name = recipe_data.get("name", "Unknown Recipe")
            # Workato JSON structure varies, but typically has 'trigger_application' and 'action_applications'
            # or we can infer from the 'code' block if available.
            
            # For this implementation, we'll use the available metadata fields
            trigger_app = recipe_data.get("trigger_application", "http")
            action_apps = recipe_data.get("action_applications", [])
            
            # Map Workato App Names to Iwings Adapters
            source_adapter = self._map_adapter(trigger_app)
            dest_adapter = "http" # Default
            if action_apps:
                dest_adapter = self._map_adapter(action_apps[0])
                
            # Construct Iwings Flow
            return {
                "name": name,
                "trigger": {
                    "adapter_id": source_adapter,
                    "config": {"description": f"Imported from Workato Recipe: {name}"}
                },
                "steps": [
                    {
                        "adapter_id": dest_adapter,
                        "config": {"description": "Imported from Workato"}
                    }
                ],
                "status": "Active" if recipe_data.get("running") else "Inactive",
            }
            
        except Exception as e:
            print(f"Failed to parse Workato recipe: {e}")
            return None

    def _map_adapter(self, workato_app_name: str) -> str:
        """
        Maps Workato application names to Iwings adapter IDs.
        """
        name = workato_app_name.lower()
        if "salesforce" in name: return "salesforce"
        if "slack" in name: return "slack"
        if "servicenow" in name: return "servicenow"
        if "jira" in name: return "jira"
        if "oracle" in name or "erp" in name: return "oracle-erp"
        if "netsuite" in name: return "netsuite"
        if "postgres" in name or "sql" in name: return "postgres"
        if "http" in name or "rest" in name: return "http"
        return "http" # Fallback
