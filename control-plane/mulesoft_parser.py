from typing import Dict, Any, List

class MuleSoftParser:
    def parse_app_metadata(self, app_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses MuleSoft application metadata and returns an Iwings Flow definition.
        """
        try:
            # app_data contains fields like 'domain', 'fullDomain', 'status', 'workers', 'properties'
            name = app_data.get("domain", "Unknown App")
            
            # Heuristic Logic for Source/Dest based on naming conventions
            # e.g., "sap-system-api" -> Source: HTTP, Dest: SAP
            # e.g., "salesforce-poller" -> Source: Salesforce, Dest: ?
            
            source_adapter = "http"
            dest_adapter = "http"
            
            name_lower = name.lower()
            
            if "sap" in name_lower:
                dest_adapter = "sap"
            elif "salesforce" in name_lower or "sfdc" in name_lower:
                if "poller" in name_lower or "listener" in name_lower:
                    source_adapter = "salesforce"
                else:
                    dest_adapter = "salesforce"
            elif "db" in name_lower or "database" in name_lower:
                dest_adapter = "postgres"
            elif "file" in name_lower or "ftp" in name_lower:
                dest_adapter = "sftp"
            elif "netsuite" in name_lower:
                dest_adapter = "netsuite"
                
            # Construct Iwings Flow
            return {
                "name": name,
                "trigger": {
                    "adapter_id": source_adapter,
                    "config": {"description": f"Imported from MuleSoft App: {name}"}
                },
                "steps": [
                    {
                        "adapter_id": dest_adapter,
                        "config": {"description": "Imported from MuleSoft"}
                    }
                ],
                "status": "Active" if app_data.get("status") == "STARTED" else "Inactive",
            }
            
        except Exception as e:
            print(f"Failed to parse MuleSoft app: {e}")
            return None
