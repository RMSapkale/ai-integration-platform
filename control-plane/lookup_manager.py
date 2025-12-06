"""
Lookup Manager
Manages lookup tables and reference data for flows
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
import json
import os
from datetime import datetime


class LookupTable(BaseModel):
    """Lookup table definition"""
    id: str
    name: str
    description: Optional[str] = None
    type: str = "key_value"  # "key_value", "multi_column", "hierarchical", "range"
    data: List[Dict[str, Any]] = []
    tags: List[str] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class LookupManager:
    """Manages lookup tables and performs lookups"""
    
    def __init__(self, storage_file: str = "lookups.json"):
        self.storage_file = storage_file
        self._cache = {}
        self._load_lookups()
    
    def _load_lookups(self):
        """Load lookup tables from storage"""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r') as f:
                    lookups = json.load(f)
                    for lookup in lookups:
                        self._cache[lookup['id']] = lookup
            except Exception as e:
                print(f"Error loading lookups: {e}")
    
    def _save_lookups(self):
        """Save lookup tables to storage"""
        try:
            lookups = list(self._cache.values())
            with open(self.storage_file, 'w') as f:
                json.dump(lookups, f, indent=2)
        except Exception as e:
            print(f"Error saving lookups: {e}")
            raise
    
    def create_lookup(self, lookup: LookupTable) -> LookupTable:
        """Create a new lookup table"""
        now = datetime.now().isoformat()
        lookup.created_at = now
        lookup.updated_at = now
        
        self._cache[lookup.id] = lookup.model_dump()
        self._save_lookups()
        
        return lookup
    
    def get_lookup_table(self, table_id: str) -> Optional[Dict[str, Any]]:
        """Get a lookup table by ID"""
        return self._cache.get(table_id)
    
    def list_lookups(self, tags: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """List all lookup tables, optionally filtered by tags"""
        lookups = list(self._cache.values())
        
        if tags:
            lookups = [
                lookup for lookup in lookups
                if any(tag in lookup.get('tags', []) for tag in tags)
            ]
        
        return lookups
    
    def update_lookup(self, table_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a lookup table"""
        if table_id not in self._cache:
            return None
        
        lookup = self._cache[table_id]
        lookup.update(updates)
        lookup['updated_at'] = datetime.now().isoformat()
        
        self._cache[table_id] = lookup
        self._save_lookups()
        
        return lookup
    
    def delete_lookup(self, table_id: str) -> bool:
        """Delete a lookup table"""
        if table_id in self._cache:
            del self._cache[table_id]
            self._save_lookups()
            return True
        return False
    
    # Lookup Operations
    
    def lookup(
        self,
        table_id: str,
        key: Any,
        default: Any = None,
        key_field: str = "key",
        value_field: str = "value"
    ) -> Any:
        """
        Perform a lookup in a table
        
        Args:
            table_id: ID of the lookup table
            key: Key to look up
            default: Default value if not found
            key_field: Field name for the key (default: "key")
            value_field: Field name for the value (default: "value")
        
        Returns:
            Looked up value or default
        """
        table = self.get_lookup_table(table_id)
        if not table:
            return default
        
        table_type = table.get('type', 'key_value')
        data = table.get('data', [])
        
        if table_type == 'key_value':
            # Simple key-value lookup
            for entry in data:
                if entry.get(key_field) == key:
                    return entry.get(value_field, default)
        
        elif table_type == 'multi_column':
            # Multi-column lookup - return entire row
            if isinstance(key, dict):
                # Match multiple fields
                for entry in data:
                    if all(entry.get(k) == v for k, v in key.items()):
                        return entry
            else:
                # Match single field
                for entry in data:
                    if entry.get(key_field) == key:
                        return entry
        
        elif table_type == 'range':
            # Range-based lookup
            if isinstance(key, (int, float)):
                for entry in data:
                    min_val = entry.get('min', float('-inf'))
                    max_val = entry.get('max', float('inf'))
                    if min_val <= key < max_val:
                        return entry.get(value_field, entry)
        
        return default
    
    def reverse_lookup(
        self,
        table_id: str,
        value: Any,
        key_field: str = "key",
        value_field: str = "value"
    ) -> Optional[Any]:
        """
        Perform a reverse lookup (find key by value)
        
        Args:
            table_id: ID of the lookup table
            value: Value to search for
            key_field: Field name for the key
            value_field: Field name for the value
        
        Returns:
            Key if found, None otherwise
        """
        table = self.get_lookup_table(table_id)
        if not table:
            return None
        
        data = table.get('data', [])
        
        for entry in data:
            if entry.get(value_field) == value:
                return entry.get(key_field)
        
        return None
    
    def bulk_lookup(
        self,
        table_id: str,
        keys: List[Any],
        default: Any = None,
        key_field: str = "key",
        value_field: str = "value"
    ) -> Dict[Any, Any]:
        """
        Perform bulk lookups
        
        Returns:
            Dictionary mapping keys to values
        """
        results = {}
        for key in keys:
            results[key] = self.lookup(table_id, key, default, key_field, value_field)
        return results
    
    def search_lookup(
        self,
        table_id: str,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Search lookup table with filters
        
        Args:
            table_id: ID of the lookup table
            filters: Dictionary of field:value pairs to filter by
        
        Returns:
            List of matching entries
        """
        table = self.get_lookup_table(table_id)
        if not table:
            return []
        
        data = table.get('data', [])
        results = []
        
        for entry in data:
            if all(entry.get(k) == v for k, v in filters.items()):
                results.append(entry)
        
        return results
    
    def import_csv(self, table_id: str, csv_content: str, has_header: bool = True):
        """
        Import lookup data from CSV
        
        Args:
            table_id: ID of the lookup table
            csv_content: CSV content as string
            has_header: Whether CSV has header row
        """
        import csv
        from io import StringIO
        
        reader = csv.reader(StringIO(csv_content))
        
        if has_header:
            headers = next(reader)
        else:
            # Assume key, value for simple tables
            headers = ['key', 'value']
        
        data = []
        for row in reader:
            if row:  # Skip empty rows
                entry = {headers[i]: row[i] for i in range(len(row))}
                data.append(entry)
        
        # Update lookup table data
        if table_id in self._cache:
            self._cache[table_id]['data'] = data
            self._cache[table_id]['updated_at'] = datetime.now().isoformat()
            self._save_lookups()
    
    def export_csv(self, table_id: str) -> Optional[str]:
        """
        Export lookup table to CSV
        
        Returns:
            CSV content as string
        """
        import csv
        from io import StringIO
        
        table = self.get_lookup_table(table_id)
        if not table:
            return None
        
        data = table.get('data', [])
        if not data:
            return ""
        
        output = StringIO()
        
        # Get all unique keys from all entries
        all_keys = set()
        for entry in data:
            all_keys.update(entry.keys())
        
        fieldnames = sorted(all_keys)
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
        
        return output.getvalue()
    
    def get_statistics(self, table_id: str) -> Optional[Dict[str, Any]]:
        """Get statistics about a lookup table"""
        table = self.get_lookup_table(table_id)
        if not table:
            return None
        
        data = table.get('data', [])
        
        return {
            'total_entries': len(data),
            'type': table.get('type'),
            'created_at': table.get('created_at'),
            'updated_at': table.get('updated_at'),
            'tags': table.get('tags', [])
        }


# Global instance
_lookup_manager = None

def get_lookup_manager() -> LookupManager:
    """Get global lookup manager instance"""
    global _lookup_manager
    if _lookup_manager is None:
        _lookup_manager = LookupManager()
    return _lookup_manager
