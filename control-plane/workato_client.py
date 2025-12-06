import requests
from typing import List, Dict, Any, Optional

class WorkatoClient:
    def __init__(self, email: str, api_token: str):
        self.email = email
        self.api_token = api_token
        self.base_url = "https://www.workato.com/api"

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.api_token}",
            "x-user-email": self.email
        }

    def test_connection(self) -> bool:
        """
        Verifies connection to Workato API.
        """
        try:
            # Try to fetch a simple list of recipes (limit 1) to verify auth
            url = f"{self.base_url}/recipes?limit=1"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Workato connection failed: {e}")
            return False

    def list_recipes(self) -> List[Dict[str, Any]]:
        """
        Lists active recipes from Workato.
        """
        try:
            url = f"{self.base_url}/recipes"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            data = response.json()
            # Workato returns { "items": [...] }
            return data.get("items", [])
        except Exception as e:
            print(f"Failed to list Workato recipes: {e}")
            return []

    def get_recipe_details(self, recipe_id: int) -> Dict[str, Any]:
        """
        Fetches full details of a recipe including steps.
        """
        try:
            url = f"{self.base_url}/recipes/{recipe_id}"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Failed to get recipe details: {e}")
            return {}
