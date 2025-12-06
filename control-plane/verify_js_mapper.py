
import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def test_js_mapper():
    print("Testing JavaScript Mapper Execution...")

    # 1. Create a JavaScript Mapper
    mapper_id = str(uuid.uuid4())
    mapper_payload = {
        "id": mapper_id,
        "name": "Test JS Mapper",
        "type": "javascript",
        "javascript_code": """
function transform(input) {
  return {
    fullName: input.firstName + " " + input.lastName,
    emailDomain: input.email.split("@")[1],
    timestamp: new Date().toISOString()
  };
}
"""
    }

    try:
        print("Creating mapper...")
        res = requests.post(f"{BASE_URL}/mappers", json=mapper_payload)
        if res.status_code != 200:
            print(f"Failed to create mapper: {res.text}")
            return
    except Exception as e:
        print(f"Error creating mapper: {e}")
        return

    # 2. Test the Mapper
    test_payload = {
        "sample_input": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@example.com"
        }
    }

    try:
        print("Testing mapper execution...")
        res = requests.post(f"{BASE_URL}/mappers/{mapper_id}/test", json=test_payload)
        
        if res.status_code == 200:
            data = res.json()
            output = data.get("output", {})
            print("Response:", json.dumps(output, indent=2))
            
            # Validation
            if output.get("fullName") == "John Doe" and output.get("emailDomain") == "example.com":
                print("✅ PASS: JavaScript executed correctly.")
            else:
                print("❌ FAIL: Output does not match expected values.")
        else:
             print(f"❌ FAIL: Test request failed with status {res.status_code}: {res.text}")

    except Exception as e:
        print(f"Error executing test: {e}")

if __name__ == "__main__":
    test_js_mapper()
