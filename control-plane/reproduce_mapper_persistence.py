
import requests
import json
import os

BASE_URL = "http://135.235.194.170:8000"

def test_mapper_persistence():
    print("Testing Mapper Persistence...")
    
    # Define a flow with a mapper step
    flow_payload = {
        "name": "Persistence Test Flow",
        "trigger": {
            "adapter_id": "schedule",
            "action": "cron",
            "config": {"cron_expression": "0 0 * * *"}
        },
        "steps": [
            {
                "adapter_id": "mapper",
                "action": "map",
                "config": {
                    "mapping_rules": [
                        {"source": "firstName", "target": "GivenName"},
                        {"source": "lastName", "target": "FamilyName"}
                    ]
                }
            },
            {
                "adapter_id": "slack",
                "action": "send_message",
                "config": {"message": "Hello"}
            }
        ]
    }
    
    # 1. Get current mappers count
    try:
        res = requests.get(f"{BASE_URL}/mappers")
        initial_mappers = res.json().get("mappers", [])
        initial_count = len(initial_mappers)
        print(f"Initial mappers count: {initial_count}")
    except Exception as e:
        print(f"Error fetching mappers: {e}")
        return

    # 2. Create the flow
    try:
        print("Creating flow...")
        res = requests.post(f"{BASE_URL}/flows", json=flow_payload)
        if res.status_code != 200:
            print(f"Failed to create flow: {res.text}")
            return
        
        flow_data = res.json()["flow"]
        print(f"Flow created: {flow_data['id']}")
        
        # Check if the mapper step now has a mapper_id
        mapper_step = flow_data["steps"][0]
        if "mapper_id" in mapper_step["config"]:
             print(f"✅ Flow step updated with mapper_id: {mapper_step['config']['mapper_id']}")
        else:
             print("❌ Flow step MISSING mapper_id")
             
    except Exception as e:
        print(f"Error creating flow: {e}")
        return

    # 3. Verify new mapper exists
    try:
        res = requests.get(f"{BASE_URL}/mappers")
        final_mappers = res.json().get("mappers", [])
        final_count = len(final_mappers)
        print(f"Final mappers count: {final_count}")
        
        if final_count > initial_count:
            print("✅ PASS: New mapper entity created.")
            # Verify details of the new mapper
            new_mapper = final_mappers[-1]
            print(f"New Mapper Name: {new_mapper['name']}")
            print(f"New Mapper Rules: {new_mapper['mapping_rules']}")
        else:
            print("❌ FAIL: No new mapper entity created.")
            
    except Exception as e:
         print(f"Error validating mappers: {e}")

if __name__ == "__main__":
    test_mapper_persistence()
