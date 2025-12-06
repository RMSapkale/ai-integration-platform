import os
import json
from typing import Dict, Optional, Any, List
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# Define the output structure (The DSL)
class StepConfig(BaseModel):
    adapter_id: str = Field(description="ID of the adapter (e.g., 'http', 'salesforce', 'postgres')")
    action: str = Field(description="Action to perform (e.g., 'get', 'create_lead')")
    config: Dict[str, Any] = Field(default_factory=dict, description="Configuration parameters for the connection and action")

class IntegrationFlow(BaseModel):
    name: str = Field(description="A descriptive name for the integration flow")
    trigger: StepConfig = Field(description="The starting point of the flow (e.g., Schedule, Webhook, API Trigger)")
    steps: List[StepConfig] = Field(description="The sequence of actions to perform after the trigger")

# Initialize the Agent
class IntentAgent:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("WARNING: OPENAI_API_KEY not found. Using Mock Agent.")
            self.mock_mode = True
        else:
            self.mock_mode = False
            self.llm = ChatOpenAI(model="gpt-4o", temperature=0)
            self.parser = PydanticOutputParser(pydantic_object=IntegrationFlow)
            
            self.prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert Integration Architect. Convert the user's natural language request into a structured integration flow configuration.
                
                The flow consists of a **Trigger** and a sequence of **Steps**.
                
                You have access to the following adapters:
                - Generic: http, sftp
                - CRM: salesforce, hubspot, dynamics, oracle_cx_sales
                - Database/ERP: postgres, oracle_db, sap_s4hana, netsuite, oracle_erp_cloud, oracle_hcm_cloud
                - HCM: workday, oracle_hcm_cloud
                - ITSM: servicenow, jira, zendesk
                - Communication: slack, teams, twilio
                - Cloud/Finance: aws_s3, stripe
                - Notifications: email, webhook
                - Internal: internal_flow (Use this to trigger another existing flow. Config requires 'target_flow_id')
                - Scheduling: schedule (Use this for time-based triggers. Config requires 'cron_expression' and 'timezone')
                - Transformation: mapper (Use this for data transformation. Config requires 'mapping_rules')

                **IMPORTANT: FLOW MODIFICATION BEHAVIOR**
                
                **DEFAULT BEHAVIOR:**
                - If a current_flow exists in the context, ALWAYS MODIFY IT (unless user explicitly asks for a "new" flow)
                - The user's request should be treated as an enhancement/modification to the existing flow
                - Keep the same flow name, ID, and overall structure
                - ONLY modify the parts the user mentions
                - **CRITICAL**: You MUST output a complete, valid JSON flow structure (not a description!)
                
                **When to MODIFY existing flow (DEFAULT):**
                - User says: "add error handling"
                - User says: "add notification"
                - User says: "make it run daily"
                - User says: "add mapping"
                - User says: "change the trigger"
                - User says: "sync to another system too"
                - User says: "add retry logic"
                - ANY request that doesn't explicitly say "new" or "create new"
                
                **When to CREATE NEW flow (ONLY IF):**
                - User explicitly says: "create a new flow", "new integration", "start fresh"
                - OR no current_flow exists in the context
                
                **How to modify (IMPORTANT):**
                1. Take the existing flow from current_flow_context
                2. Keep the same "name" field
                3. Keep the existing "trigger" (unless user asks to change it)
                4. Modify the "steps" array based on user's request:
                   - If "add error handling": Wrap ALL existing steps in an error_handler step
                   - If "add notification": Append email/slack step to the end
                   - If "add mapping": Insert mapper step between source and destination
                   - If "make it run daily": Change trigger to schedule adapter
                5. Return the COMPLETE modified flow as valid JSON
                6. DO NOT return a description or explanation - return the actual flow JSON!
                
                **EXAMPLE of modification:**
                Current flow: {{"name": "Sync A to B", "trigger": {{"adapter_id": "salesforce"}}, "steps": [{{"adapter_id": "postgres"}}]}}
                User says: "add error handling"
                You return: {{"name": "Sync A to B", "trigger": {{"adapter_id": "salesforce"}}, "steps": [{{"adapter_id": "error_handler", "action": "try_catch", "config": {{"try_steps": [{{"adapter_id": "postgres"}}], "on_error": [{{"adapter_id": "email"}}], "retry_config": {{"max_retries": 3}}}}}}]}}
                
                **WRONG - DO NOT DO THIS:**
                "The current flow uses the following adapters: salesforce, postgres. I will add error handling."
                 **ADVANCED FLOW FEATURES:**
                
                You can now create sophisticated flows with:
                
                1. **CONDITIONAL LOGIC (if/else)**:
                   Use when: Different actions based on data conditions
                   Example: "If employee status is active, sync to Oracle, else archive"
                   Step format:
                   {{
                     "adapter_id": "condition",
                     "action": "evaluate",
                     "config": {{
                       "condition": "data.status === 'active'",
                       "on_true": [{{steps for true case}}],
                       "on_false": [{{steps for false case}}]
                     }}
                   }}
                
                2. **SWITCH STATEMENTS**:
                   Use when: Multiple branches based on a value
                   Example: "Route orders based on type: retail, wholesale, or online"
                   Step format:
                   {{
                     "adapter_id": "switch",
                     "action": "route",
                     "config": {{
                       "expression": "order.type",
                       "cases": [
                         {{"value": "retail", "steps": [...]}},
                         {{"value": "wholesale", "steps": [...]}}
                       ],
                       "default": [{{default steps}}]
                     }}
                   }}
                
                3. **LOOPS (for/while)**:
                   Use when: Processing arrays or repeating until condition
                   Example: "For each employee in the list, create in Oracle"
                   Step format:
                   {{
                     "adapter_id": "loop",
                     "action": "iterate",
                     "config": {{
                       "iterator": "for employee in employees",
                       "loop_steps": [{{steps to repeat}}]
                     }}
                   }}
                
                4. **ERROR HANDLING**:
                   Use when: Need retry logic or error notifications
                   Example: "Try API call, retry 3 times, email admin on failure"
                   Step format:
                   {{
                     "adapter_id": "error_handler",
                     "action": "try_catch",
                     "config": {{
                       "try_steps": [{{steps to try}}],
                       "on_error": [{{steps on error}}],
                       "retry_config": {{"max_retries": 3, "delay_seconds": 5}}
                     }}
                   }}
                
                5. **PARALLEL EXECUTION**:
                   Use when: Multiple independent operations
                   Example: "Sync to Salesforce, HubSpot, and Dynamics simultaneously"
                   Step format:
                   {{
                     "adapter_id": "parallel",
                     "action": "execute",
                     "config": {{
                       "parallel_branches": [
                         [{{branch 1 steps}}],
                         [{{branch 2 steps}}]
                       ],
                       "wait_for": "all"
                     }}
                   }}
                
                6. **NOTIFICATIONS**:
                   Use email or webhook adapters for alerts
                   Example: "Send email notification on success or failure"

                **Rules:**
                1. If the user asks to "schedule" an existing flow or run it at a specific time, use the 'schedule' adapter as the **Trigger**. The original source becomes the first step.
                2. If the user asks to "sync", "transfer", or "move" data between systems, **ALWAYS** include a 'mapper' step between the extraction (Source) and loading (Destination) steps.
                3. If user mentions "if", "when", "based on", or "depending on" → use conditional or switch steps
                4. If user mentions "for each", "all items", "every" → use loop steps
                5. If user mentions "retry", "on error", "if fails", "add error handling" → use error_handler steps
                6. If user mentions "simultaneously", "parallel", "at the same time" → use parallel steps
                7. If user mentions "notify", "alert", "email" → add notification steps
                8. **ALWAYS** wrap risky API calls in error handlers with retry logic
                9. **ALWAYS** add success/failure notifications for important flows
                   - Example: "Sync Salesforce to Postgres" -> Trigger: Salesforce, Step 1: Mapper, Step 2: Postgres.
                3. If the user asks to sync A to B and then to C, A is Trigger, B is Step 1, C is Step 2.
                4. Always try to infer configuration parameters (e.g., URLs, table names, cron expressions) from the prompt.
                
                {current_flow_context}
                
                {format_instructions}"""),
                ("user", "{query}")
            ])
            
            # Intent classification prompt
            self.intent_prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an intent classifier for an integration platform. Determine if the user's message is:

1. **FLOW_REQUEST**: User wants to create, modify, or discuss an integration flow
   Examples: 
   - "Sync Salesforce to Postgres"
   - "Create a flow to send emails when orders are placed"
   - "I need to integrate HubSpot with our database"
   - "Schedule a daily sync from Oracle to S3"
   - "Add error handling"
   - "Make it run daily"

2. **GENERAL_QUESTION**: User is asking general questions, greeting, or having casual conversation
   Examples:
   - "Hello"
   - "What can you do?"
   - "How does this work?"
   - "What integrations do you support?"
   - "Tell me about your features"

Respond with ONLY one word: either "FLOW_REQUEST" or "GENERAL_QUESTION"."""),
                ("user", "{query}")
            ])
            
            # New flow detection prompt
            self.new_flow_prompt = ChatPromptTemplate.from_messages([
                ("system", """Determine if the user wants to create a NEW flow or MODIFY the existing one.

**Respond "NEW" if user explicitly says:**
- "create a new flow"
- "new integration"
- "start fresh"
- "create another flow"
- "build a new flow"

**Respond "MODIFY" for everything else:**
- "add error handling"
- "add notification"
- "make it run daily"
- "sync to another system"
- "change the trigger"
- Any other modification request

Respond with ONLY one word: either "NEW" or "MODIFY"."""),
                ("user", "{query}")
            ])


    def classify_intent(self, query: str) -> str:
        """
        Classify user intent as FLOW_REQUEST or GENERAL_QUESTION
        """
        if self.mock_mode:
            # In mock mode, check for conversation keywords
            query_lower = query.lower()
            conversation_keywords = ["hello", "hi", "hey", "greetings", "help", "what", "how", "tell me"]
            if any(keyword in query_lower for keyword in conversation_keywords):
                return "GENERAL_QUESTION"
            return "FLOW_REQUEST"
        
        try:
            chain = self.intent_prompt | self.llm
            response = chain.invoke({"query": query})
            intent = response.content.strip().upper()
            
            if intent in ["FLOW_REQUEST", "GENERAL_QUESTION"]:
                return intent
            else:
                # Default to general question if unclear
                return "GENERAL_QUESTION"
        except Exception as e:
            print(f"Error classifying intent: {e}")
            # Default to general question on error
            return "GENERAL_QUESTION"

    def wants_new_flow(self, query: str, current_flow: Optional[Dict[str, Any]]) -> bool:
        """
        Determine if user wants a new flow or to modify existing one
        """
        # If no current flow exists, it's always a new flow
        if not current_flow:
            return True
        
        # If in mock mode, check for explicit "new" keywords
        if self.mock_mode:
            query_lower = query.lower()
            return any(keyword in query_lower for keyword in ["new flow", "new integration", "create new", "start fresh", "another flow"])
        
        try:
            chain = self.new_flow_prompt | self.llm
            response = chain.invoke({"query": query})
            intent = response.content.strip().upper()
            return intent == "NEW"
        except Exception as e:
            print(f"Error detecting new flow intent: {e}")
            # Default to modify if there's an error and current_flow exists
            return False

    def analyze(self, query: str, current_flow: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze user query and return appropriate response
        Returns either a flow or a conversational response
        """
        # First classify the intent
        intent = self.classify_intent(query)
        
        if intent == "GENERAL_QUESTION":
            # Return a helpful conversational response
            return {
                "type": "conversation",
                "message": self._generate_helpful_response(query)
            }
        
        # Check if user wants a new flow or to modify existing
        if current_flow and not self.wants_new_flow(query, current_flow):
            # User wants to modify existing flow
            print(f"🔄 Modifying existing flow: {current_flow.get('name', 'Unnamed')}")
        else:
            # User wants a new flow or no current flow exists
            if current_flow:
                print(f"🆕 Creating new flow (user requested)")
                current_flow = None  # Don't pass context for new flow
            else:
                print(f"🆕 Creating new flow (no existing flow)")
        
        # If it's a flow request, proceed with flow generation
        # First, check if query mentions unknown systems and auto-generate adapters
        self._auto_generate_missing_adapters(query)
        
        if self.mock_mode:
            return {"type": "flow", "flow": self._generate_mock_flow(query).model_dump()}
        
        current_flow_context = ""
        if current_flow:
            current_flow_context = f"Current flow context: {json.dumps(current_flow, indent=2)}"

        chain = self.prompt | self.llm | self.parser
        try:
            flow = chain.invoke({
                "query": query,
                "current_flow_context": current_flow_context,
                "format_instructions": self.parser.get_format_instructions()
            })
            return {"type": "flow", "flow": flow.model_dump()}
        except Exception as e:
            print(f"Error analyzing intent: {e}")
            # Fallback mock for POC if API fails
            flow = IntegrationFlow(
                name="Fallback Flow",
                trigger=StepConfig(
                    adapter_id="http",
                    action="get",
                    config={"url": "http://fallback.example.com/data"}
                ),
                steps=[
                    StepConfig(
                        adapter_id="email",
                        action="send",
                        config={"to": "admin@example.com", "subject": "Fallback Flow Triggered"}
                    )
                ]
            )
            return {"type": "flow", "flow": flow.model_dump()}

    def _generate_mock_flow(self, query: str) -> IntegrationFlow:
        """
        Generate a realistic mock flow based on the query keywords
        """
        query_lower = query.lower()
        
        # Detect systems
        systems = {
            "salesforce": "salesforce",
            "hubspot": "hubspot",
            "postgres": "postgres",
            "oracle": "oracle_db", 
            "oracle db": "oracle_db",
            "oracle general ledger": "oracle_erp_cloud",
            "oracle gl": "oracle_erp_cloud",
            "workday": "workday",
            "slack": "slack",
            "email": "email",
            "teams": "teams",
            "s3": "aws_s3",
            "schedule": "schedule"
        }
        
        found_systems = []
        for key, adapter_id in systems.items():
            if key in query_lower:
                found_systems.append(adapter_id)
        
        # Default fallback if no systems found
        if not found_systems:
            found_systems = ["salesforce", "postgres"]
            
        # Determine Trigger and Target
        trigger_id = found_systems[0]
        target_id = found_systems[1] if len(found_systems) > 1 else "email"
        
        # Special case: Schedule
        if "schedule" in query_lower or "daily" in query_lower or "cron" in query_lower:
            trigger_id = "schedule"
            if len(found_systems) > 0 and found_systems[0] != "schedule":
                 # If we have a system, it becomes the first step, not the trigger
                 pass

        steps = []
        
        # If trigger is real system (not schedule), we usually need a mapper before target
        if trigger_id != "schedule" and target_id not in ["slack", "email", "teams"]:
             steps.append(StepConfig(
                adapter_id="mapper",
                action="map",
                config={"mapping_rules": [{"source": "name", "target": "full_name"}]}
            ))
            
        # Add the target step
        steps.append(StepConfig(
            adapter_id=target_id,
            action="create_record" if target_id in ["salesforce", "hubspot", "workday"] else "insert",
            config={"example_config": "true"}
        ))
        
        return IntegrationFlow(
            name=f"Mock Flow: {trigger_id.capitalize()} to {target_id.capitalize()}",
            trigger=StepConfig(
                adapter_id=trigger_id,
                action="trigger",
                config={}
            ),
            steps=steps
        )
    
    def _generate_helpful_response(self, query: str) -> str:
        """
        Generate a helpful conversational response for general questions
        """
        import re
        query_lower = query.lower()
        
        # Use regex for whole word matching to avoid substring issues (e.g. "hi" in "which")
        def has_word(text, words):
            for word in words:
                if re.search(r'\b' + re.escape(word) + r'\b', text):
                    return True
            return False
            
        if has_word(query_lower, ["hello", "hi", "hey", "greetings"]):
            return """Hello! 👋 I'm your AI Integration Assistant. I help you create automated workflows between different systems.

**What I can do:**
- Create integration flows between 30+ systems (Salesforce, Oracle, SAP, HubSpot, etc.)
- Set up scheduled syncs and real-time data transfers
- Build complex workflows with conditions, loops, and error handling
- Generate custom adapters for any system

**To get started, try saying:**
- "Sync Salesforce leads to Postgres daily"
- "Create a flow to send Slack notifications when orders are placed"
- "Integrate Oracle HCM with Workday"

What would you like to integrate today?"""
        
        elif any(word in query_lower for word in ["what can you do", "capabilities", "features", "help"]):
            return """I'm an AI-powered integration platform that can help you:

**🔗 Connect Systems:**
- CRM: Salesforce, HubSpot, Dynamics, Oracle CX
- ERP: SAP S/4HANA, Oracle ERP Cloud, NetSuite
- HCM: Workday, Oracle HCM Cloud
- Databases: Postgres, Oracle DB
- ITSM: ServiceNow, Jira, Zendesk
- And 20+ more systems!

**⚡ Build Flows:**
- Scheduled syncs (daily, hourly, custom cron)
- Real-time webhooks and triggers
- Data transformations and mapping
- Conditional logic and branching
- Error handling and retries
- Parallel execution

**🤖 Smart Features:**
- Natural language flow creation
- Auto-generate adapters for any system
- Visual flow builder
- Test and debug tools

Just describe what you want to integrate, and I'll create the flow for you!"""
        
        elif "integrate" in query_lower or "support" in query_lower:
            return """We support 30+ enterprise systems including:

**CRM:** Salesforce, HubSpot, Microsoft Dynamics, Oracle CX Sales
**ERP:** SAP S/4HANA, Oracle ERP Cloud, NetSuite
**HCM:** Workday, Oracle HCM Cloud
**Databases:** PostgreSQL, Oracle Database
**ITSM:** ServiceNow, Jira, Zendesk
**Communication:** Slack, Microsoft Teams, Twilio
**Cloud Storage:** AWS S3
**And more:** HTTP APIs, SFTP, Email, Webhooks

Plus, I can auto-generate custom adapters for any system you need!

What systems would you like to connect?"""
        
        else:
            return """I'm here to help you create integration flows! 

To create a flow, just describe what you want to integrate. For example:
- "Sync Salesforce contacts to HubSpot daily"
- "Send Slack notification when new orders arrive in Shopify"
- "Transfer employee data from Workday to Oracle HCM"

What would you like to integrate?"""


    def _auto_generate_missing_adapters(self, query: str):
        """
        Detect if query mentions systems without adapters and auto-generate them
        """
        try:
            from intelligent_adapter_factory import get_intelligent_factory
            from registry import get_standard_adapters
            
            factory = get_intelligent_factory()
            existing_adapters = {adapter['id'].lower() for adapter in get_standard_adapters()}
            
            # Detect system from query
            system_info = factory.detect_system_from_description(query)
            
            if system_info:
                adapter_id = system_info.name.lower().replace(" ", "_")
                
                # Check if adapter doesn't exist
                if adapter_id not in existing_adapters:
                    print(f"🤖 Detected unknown system: {system_info.name}")
                    print(f"🔧 Auto-generating adapter...")
                    
                    # Generate adapter
                    adapter = factory.auto_generate_adapter(system_info.name)
                    
                    if adapter:
                        print(f"✅ Successfully generated adapter for {system_info.name}")
                    else:
                        print(f"❌ Failed to generate adapter for {system_info.name}")
        
        except Exception as e:
            print(f"Error in auto-generation: {e}")
