
import os
import sys
import json
from dotenv import load_dotenv

# Add control-plane to sys.path
sys.path.append(os.path.join(os.getcwd(), "control-plane"))

from agent import IntentAgent

def test_mapper_generation():
    print("Initializing Agent...")
    agent = IntentAgent()
    
    if agent.mock_mode:
        print("\n⚠️  Agent is in Mock Mode. Flow generation will use hardcoded mock.")
        # We want to see what the mock returns purely to confirm behavior
    else:
        print("\n✅ Agent is in LLM Mode. Testing actual generation.")

    query = "Load Workday Data to Oracle General Ledger"
    print(f"\nQuery: '{query}'")
    
    result = agent.analyze(query)
    
    if result["type"] == "flow":
        flow = result["flow"]
        print(f"\nGenerated Flow Name: {flow['name']}")
        print("Steps:")
        has_mapper = False
        for i, step in enumerate(flow["steps"]):
            print(f"  {i+1}. {step['adapter_id']} ({step['action']})")
            if step['adapter_id'] == 'mapper':
                has_mapper = True
                
        if has_mapper:
            print("\n✅ PASS: Mapper step found.")
        else:
            print("\n❌ FAIL: No mapper step found.")
    else:
        print(f"\nResult is not a flow: {result['type']}")

if __name__ == "__main__":
    test_mapper_generation()
