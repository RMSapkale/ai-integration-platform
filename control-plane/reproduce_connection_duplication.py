
import requests
import json
import uuid

BASE_URL = "http://135.235.194.170:8000"

def test_connection_deduplication():
    print("Testing Connection Deduplication...")
    
    # Common connection config
    adapter_id = "salesforce"
    config = {
        "client_id": "test-client-id",
        "client_secret": "test-client-secret",
        "instance_url": "https://test.salesforce.com"
    }
    
    # Flow 1
    flow1 = {
        "name": "Flow A",
        "trigger": {
            "adapter_id": adapter_id,
            "action": "webhook",
            "config": config  # Implies usage of this connection
        },
        "steps": []
    }
    
    # Flow 2 (Different name, same connection config)
    flow2 = {
        "name": "Flow B",
        "trigger": {
            "adapter_id": adapter_id,
            "action": "webhook",
            "config": config # Should use SAME connection
        },
        "steps": []
    }

    try:
        # Create Flow 1
        print("Creating Flow A...")
        res1 = requests.post(f"{BASE_URL}/flows", json=flow1)
        if res1.status_code != 200:
             print(f"Error creating Flow A: {res1.text}")
             return
        conn_id_1 = res1.json()["flow"]["trigger_connection_id"]
        print(f"Flow A Trigger Connection ID: {conn_id_1}")
        
        # Create Flow 2
        print("Creating Flow B...")
        res2 = requests.post(f"{BASE_URL}/flows", json=flow2)
        if res2.status_code != 200:
             print(f"Error creating Flow B: {res2.text}")
             return
        conn_id_2 = res2.json()["flow"]["trigger_connection_id"]
        print(f"Flow B Trigger Connection ID: {conn_id_2}")
        
        # Compare
        if conn_id_1 == conn_id_2:
             print("✅ PASS: Connection ID reused.")
        else:
             print("❌ FAIL: Duplicate connection created (IDs differ).")
             
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_connection_deduplication()
