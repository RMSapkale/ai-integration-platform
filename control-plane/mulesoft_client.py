import requests
from typing import List, Dict, Any, Optional

class MuleSoftClient:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self.base_url = "https://anypoint.mulesoft.com"
        self.access_token = None
        self.org_id = None
        self.env_id = None

    def login(self) -> bool:
        """
        Authenticates with Anypoint Platform and retrieves an access token.
        """
        try:
            url = f"{self.base_url}/accounts/login"
            payload = {
                "username": self.username,
                "password": self.password
            }
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            self.access_token = data.get("access_token")
            
            # After login, we need to find the Organization ID and Environment ID
            # For this POC, we'll fetch the user's profile to get the Org ID
            # and then list environments to pick the first one (usually 'Sandbox' or 'Production')
            self._fetch_context()
            
            return True
        except Exception as e:
            print(f"MuleSoft Login failed: {e}")
            return False

    def _fetch_context(self):
        """
        Fetches Organization ID and Environment ID.
        """
        if not self.access_token:
            return

        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Get Profile (Me) to find Organization
        try:
            me_res = requests.get(f"{self.base_url}/accounts/api/me", headers=headers)
            me_data = me_res.json()
            self.org_id = me_data["user"]["organization"]["id"]
        except:
            print("Failed to fetch Org ID")

        # Get Environments
        if self.org_id:
            try:
                env_res = requests.get(f"{self.base_url}/accounts/api/organizations/{self.org_id}/environments", headers=headers)
                envs = env_res.json().get("data", [])
                if envs:
                    # Prefer 'Sandbox' or 'Design', else take first
                    target_env = next((e for e in envs if e["type"] == "sandbox"), envs[0])
                    self.env_id = target_env["id"]
            except:
                print("Failed to fetch Env ID")

    def list_applications(self) -> List[Dict[str, Any]]:
        """
        Lists deployed CloudHub applications.
        """
        if not self.access_token or not self.org_id or not self.env_id:
            print("Missing context (Token, OrgID, or EnvID)")
            return []

        try:
            # CloudHub API v2
            url = f"{self.base_url}/cloudhub/api/v2/applications"
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "X-ANYPNT-ENV-ID": self.env_id,
                "X-ANYPNT-ORG-ID": self.org_id
            }
            
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Failed to list MuleSoft applications: {e}")
            return []
