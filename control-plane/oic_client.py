import requests
import base64
from typing import List, Dict, Any, Optional

class OICClient:
    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip('/')
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.session.auth = (username, password)
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json"
        })

    def test_connection(self) -> bool:
        """
        Tests the connection to OIC by calling a lightweight endpoint.
        """
        try:
            # Using the integrations endpoint as a test
            response = self.session.get(f"{self.base_url}/ic/api/integration/v1/integrations", params={"limit": 1})
            return response.status_code == 200
        except Exception as e:
            print(f"Connection test failed: {e}")
            return False

    def list_integrations(self) -> List[Dict[str, Any]]:
        """
        Fetches the list of integrations from OIC.
        """
        try:
            integrations = []
            has_more = True
            offset = 0
            limit = 100
            
            while has_more:
                response = self.session.get(
                    f"{self.base_url}/ic/api/integration/v1/integrations", 
                    params={"offset": offset, "limit": limit}
                )
                response.raise_for_status()
                data = response.json()
                
                items = data.get("items", [])
                integrations.extend(items)
                
                has_more = data.get("hasMore", False)
                offset += limit
                
                # Safety break for POC
                if offset > 500:
                    break
                    
            return integrations
        except Exception as e:
            print(f"Failed to list integrations: {e}")
            raise

    def get_integration_archive(self, integration_id: str, version: str) -> Optional[bytes]:
        """
        Downloads the .iar archive for a specific integration.
        """
        try:
            # Endpoint structure: /ic/api/integration/v1/integrations/{id}/{version}/archive
            url = f"{self.base_url}/ic/api/integration/v1/integrations/{integration_id}/{version}/archive"
            response = self.session.get(url, stream=True)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"Failed to download archive for {integration_id}: {e}")
            return None
