
import sys
import os

# Add the current directory to sys.path so we can import agent
sys.path.append(os.getcwd())

from agent import IntentAgent

def test_intents():
    print("Initializing Agent...")
    agent = IntentAgent()
    print(f"Agent Mock Mode: {agent.mock_mode}")
    
    test_queries = [
        "Hello",
        "What can you do?",
        "Create a flow to sync Salesforce to Postgres",
        "Add error handling",
        "Sync HubSpot to Slack"
    ]
    
    print("\n--- Testing Classify Intent ---")
    for query in test_queries:
        intent = agent.classify_intent(query)
        print(f"Query: '{query}' -> Intent: {intent}")
        
    print("\n--- Testing Analyze (Full Flow) ---")
    # Test valid flow request
    query = "Sync Salesforce to Postgres"
    result = agent.analyze(query)
    print(f"Query: '{query}' -> Result Type: {result.get('type')}")

    # Test conversation
    query = "Hello"
    result = agent.analyze(query)
    print(f"Query: '{query}' -> Result Type: {result.get('type')}")

if __name__ == "__main__":
    test_intents()
