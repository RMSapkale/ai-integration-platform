import json
import os
from adapter_schema import AdapterDefinition, AdapterField, AdapterAction

CUSTOM_ADAPTERS_FILE = "custom_adapters.json"

STANDARD_ADAPTERS = [
    # --- Generic ---
    AdapterDefinition(
        id="http", name="HTTP / REST", description="Connect to any REST API", icon="Globe", category="Generic",
        connection_fields=[
            AdapterField(name="base_url", label="Base URL", type="string"),
            AdapterField(name="auth_type", label="Auth Type", type="select", options=["None", "Basic", "Bearer", "ApiKey", "OAuth2"]),
            # Basic
            AdapterField(name="username", label="Username", type="string", required=False),
            AdapterField(name="password", label="Password", type="password", required=False),
            # Bearer
            AdapterField(name="token", label="Bearer Token", type="password", required=False),
            # ApiKey
            AdapterField(name="api_key_key", label="Key Name", type="string", required=False),
            AdapterField(name="api_key_value", label="Key Value", type="password", required=False),
            AdapterField(name="api_key_location", label="Key Location", type="select", options=["Header", "Query"], required=False),
            # OAuth2
            AdapterField(name="client_id", label="Client ID", type="string", required=False),
            AdapterField(name="client_secret", label="Client Secret", type="password", required=False),
            AdapterField(name="auth_url", label="Authorization URL", type="string", required=False),
            AdapterField(name="token_url", label="Token URL", type="string", required=False),
            AdapterField(name="scopes", label="Scopes (comma separated)", type="string", required=False),
            AdapterField(name="grant_type", label="Grant Type", type="select", options=["authorization_code", "client_credentials"], required=False),
        ],
        actions=[
            AdapterAction(name="get", label="GET Request", description="Fetch data", method="GET", path="/{path}"),
            AdapterAction(name="post", label="POST Request", description="Send data", method="POST", path="/{path}")
        ]
    ),
    AdapterDefinition(
        id="sftp", name="SFTP / FTP", description="Secure File Transfer", icon="Folder", category="Generic",
        connection_fields=[
            AdapterField(name="host", label="Host", type="string"),
            AdapterField(name="port", label="Port", type="number", default=22),
            AdapterField(name="username", label="Username", type="string"),
            AdapterField(name="password", label="Password", type="password")
        ],
        actions=[
            AdapterAction(name="read_file", label="Read File", description="Read file content", method="GET", path="/{path}"),
            AdapterAction(name="write_file", label="Write File", description="Write content to file", method="POST", path="/{path}")
        ]
    ),
    
    # --- CRM ---
    AdapterDefinition(
        id="salesforce", name="Salesforce", description="World's #1 CRM", icon="Cloud", category="CRM",
        connection_fields=[
            AdapterField(name="instance_url", label="Instance URL", type="string"),
            AdapterField(name="client_id", label="Client ID", type="string"),
            AdapterField(name="client_secret", label="Client Secret", type="password")
        ],
        actions=[
            AdapterAction(name="create_lead", label="Create Lead", description="Create a new Lead", method="POST", path="/sobjects/Lead"),
            AdapterAction(name="get_account", label="Get Account", description="Retrieve Account", method="GET", path="/sobjects/Account/{id}")
        ]
    ),
    AdapterDefinition(
        id="hubspot", name="HubSpot", description="CRM & Marketing", icon="Cloud", category="CRM",
        connection_fields=[AdapterField(name="access_token", label="Access Token", type="password")],
        actions=[AdapterAction(name="create_contact", label="Create Contact", description="Add new contact", method="POST", path="/crm/v3/objects/contacts")]
    ),
    AdapterDefinition(
        id="dynamics", name="Microsoft Dynamics 365", description="ERP & CRM", icon="Cloud", category="CRM",
        connection_fields=[AdapterField(name="org_url", label="Org URL", type="string"), AdapterField(name="token", label="Token", type="password")],
        actions=[AdapterAction(name="create_record", label="Create Record", description="Create entity record", method="POST", path="/api/data/v9.0/{entity}")]
    ),

    # --- ERP & Database ---
    AdapterDefinition(
        id="oracle_db", name="Oracle Database", description="Enterprise RDBMS", icon="Database", category="Database",
        connection_fields=[
            AdapterField(name="host", label="Host", type="string"),
            AdapterField(name="port", label="Port", type="number", default=1521),
            AdapterField(name="service_name", label="Service Name", type="string"),
            AdapterField(name="user", label="Username", type="string"),
            AdapterField(name="password", label="Password", type="password")
        ],
        actions=[AdapterAction(name="execute_query", label="Execute Query", description="Run SQL query", method="POST", path="/query")]
    ),
    AdapterDefinition(
        id="sap_s4hana", name="SAP S/4HANA", description="Intelligent ERP", icon="Database", category="ERP",
        connection_fields=[AdapterField(name="api_url", label="API URL", type="string"), AdapterField(name="api_key", label="API Key", type="password")],
        actions=[AdapterAction(name="get_business_partner", label="Get Business Partner", description="Fetch BP details", method="GET", path="/A_BusinessPartner/{id}")]
    ),
    AdapterDefinition(
        id="netsuite", name="NetSuite", description="Cloud ERP", icon="Database", category="ERP",
        connection_fields=[AdapterField(name="account_id", label="Account ID", type="string"), AdapterField(name="token_id", label="Token ID", type="password")],
        actions=[AdapterAction(name="search", label="Search Record", description="Search records", method="GET", path="/record/v1/{recordType}")]
    ),
    AdapterDefinition(
        id="postgres", name="PostgreSQL", description="Open Source SQL", icon="Database", category="Database",
        connection_fields=[AdapterField(name="connection_string", label="Connection String", type="password")],
        actions=[AdapterAction(name="query", label="Run Query", description="Execute SQL", method="POST", path="/")]
    ),

    # --- ITSM & Support ---
    AdapterDefinition(
        id="servicenow", name="ServiceNow", description="IT Service Management", icon="MessageSquare", category="ITSM",
        connection_fields=[AdapterField(name="instance", label="Instance", type="string"), AdapterField(name="user", label="User", type="string"), AdapterField(name="pass", label="Password", type="password")],
        actions=[AdapterAction(name="create_incident", label="Create Incident", description="Report issue", method="POST", path="/now/table/incident")]
    ),
    AdapterDefinition(
        id="jira", name="Jira", description="Issue Tracking", icon="MessageSquare", category="ITSM",
        connection_fields=[AdapterField(name="domain", label="Domain", type="string"), AdapterField(name="api_token", label="API Token", type="password")],
        actions=[AdapterAction(name="create_issue", label="Create Issue", description="New ticket", method="POST", path="/rest/api/3/issue")]
    ),
    AdapterDefinition(
        id="zendesk", name="Zendesk", description="Customer Support", icon="MessageSquare", category="ITSM",
        connection_fields=[AdapterField(name="subdomain", label="Subdomain", type="string"), AdapterField(name="token", label="Token", type="password")],
        actions=[AdapterAction(name="create_ticket", label="Create Ticket", description="New support ticket", method="POST", path="/api/v2/tickets")]
    ),

    # --- Oracle Integration Cloud (OIC) ---
    AdapterDefinition(
        id="oracle_erp_cloud", name="Oracle ERP Cloud", description="Financials, Procurement, Project Portfolio", icon="Database", category="OIC",
        connection_fields=[
            AdapterField(name="host", label="Host URL", type="string"),
            AdapterField(name="username", label="Username", type="string"),
            AdapterField(name="password", label="Password", type="password")
        ],
        actions=[
            AdapterAction(name="create_invoice", label="Create Invoice", description="Create AP Invoice", method="POST", path="/fscmRestApi/resources/11.13.18.05/invoices"),
            AdapterAction(name="get_purchase_order", label="Get Purchase Order", description="Retrieve PO details", method="GET", path="/fscmRestApi/resources/11.13.18.05/purchaseOrders/{id}")
        ]
    ),
    AdapterDefinition(
        id="oracle_hcm_cloud", name="Oracle HCM Cloud", description="Human Capital Management", icon="User", category="OIC",
        connection_fields=[
            AdapterField(name="host", label="Host URL", type="string"),
            AdapterField(name="username", label="Username", type="string"),
            AdapterField(name="password", label="Password", type="password")
        ],
        actions=[
            AdapterAction(name="create_employee", label="Create Employee", description="Hire an employee", method="POST", path="/hcmRestApi/resources/11.13.18.05/workers"),
            AdapterAction(name="get_employee", label="Get Employee", description="Retrieve worker profile", method="GET", path="/hcmRestApi/resources/11.13.18.05/workers/{id}")
        ]
    ),
    AdapterDefinition(
        id="oracle_cx_sales", name="Oracle CX Sales", description="Customer Experience & Sales", icon="Cloud", category="OIC",
        connection_fields=[
            AdapterField(name="host", label="Host URL", type="string"),
            AdapterField(name="username", label="Username", type="string"),
            AdapterField(name="password", label="Password", type="password")
        ],
        actions=[
            AdapterAction(name="create_opportunity", label="Create Opportunity", description="New sales opportunity", method="POST", path="/crmRestApi/resources/11.13.18.05/opportunities"),
            AdapterAction(name="get_account", label="Get Account", description="Retrieve account info", method="GET", path="/crmRestApi/resources/11.13.18.05/accounts/{id}")
        ]
    ),
    AdapterDefinition(
        id="workday", name="Workday", description="Human Capital Management \u0026 Financial Management", icon="User", category="HCM",
        connection_fields=[
            AdapterField(name="tenant_url", label="Tenant URL", type="string", description="e.g., https://wd2-impl-services1.workday.com"),
            AdapterField(name="username", label="Username", type="string", description="Integration System User"),
            AdapterField(name="password", label="Password", type="password"),
            AdapterField(name="tenant_name", label="Tenant Name", type="string", description="e.g., company_dpt1")
        ],
        actions=[
            AdapterAction(name="get_workers", label="Get Workers", description="Retrieve employee data", method="GET", path="/ccx/service/{tenant}/Human_Resources/{version}/workers"),
            AdapterAction(name="hire_employee", label="Hire Employee", description="Create new hire", method="POST", path="/ccx/service/{tenant}/Human_Resources/{version}/Hire_Employee"),
            AdapterAction(name="get_organizations", label="Get Organizations", description="Retrieve org structure", method="GET", path="/ccx/service/{tenant}/Human_Resources/{version}/organizations"),
            AdapterAction(name="update_worker", label="Update Worker", description="Update employee information", method="PUT", path="/ccx/service/{tenant}/Human_Resources/{version}/workers/{id}")
        ]
    ),


    # --- Communication & Social ---
    AdapterDefinition(
        id="slack", name="Slack", description="Team Communication", icon="MessageSquare", category="Communication",
        connection_fields=[AdapterField(name="bot_token", label="Bot Token", type="password")],
        actions=[AdapterAction(name="send_message", label="Send Message", description="Post to channel", method="POST", path="/chat.postMessage")]
    ),
    AdapterDefinition(
        id="teams", name="Microsoft Teams", description="Collaboration", icon="MessageSquare", category="Communication",
        connection_fields=[AdapterField(name="webhook_url", label="Webhook URL", type="password")],
        actions=[AdapterAction(name="send_card", label="Send Card", description="Post adaptive card", method="POST", path="/")]
    ),
    AdapterDefinition(
        id="twilio", name="Twilio", description="SMS & Voice", icon="MessageSquare", category="Communication",
        connection_fields=[AdapterField(name="account_sid", label="Account SID", type="string"), AdapterField(name="auth_token", label="Auth Token", type="password")],
        actions=[AdapterAction(name="send_sms", label="Send SMS", description="Send text message", method="POST", path="/Messages.json")]
    ),

    # --- Other ---
    AdapterDefinition(
        id="aws_s3", name="AWS S3", description="Object Storage", icon="Cloud", category="Cloud",
        connection_fields=[AdapterField(name="access_key", label="Access Key", type="string"), AdapterField(name="secret_key", label="Secret Key", type="password")],
        actions=[AdapterAction(name="put_object", label="Upload File", description="Upload to bucket", method="PUT", path="/{bucket}/{key}")]
    ),
    AdapterDefinition(
        id="stripe", name="Stripe", description="Payments", icon="Globe", category="Finance",
        connection_fields=[AdapterField(name="secret_key", label="Secret Key", type="password")],
        actions=[AdapterAction(name="create_charge", label="Create Charge", description="Charge card", method="POST", path="/charges")]
    ),

    # --- Internal ---
    AdapterDefinition(
        id="internal_flow", name="Internal Flow", description="Trigger another integration flow", icon="Layers", category="Internal",
        connection_fields=[
            AdapterField(name="target_flow_id", label="Target Flow ID", type="string", description="The ID of the flow to trigger")
        ],
        actions=[
            AdapterAction(name="trigger", label="Trigger Flow", description="Trigger the target flow", method="POST", path="/flows/{target_flow_id}/trigger")
        ]
    ),

    # --- Scheduling ---
    AdapterDefinition(
        id="schedule", name="Scheduler", description="Trigger flows on a schedule", icon="Clock", category="Scheduling",
        connection_fields=[
            AdapterField(name="cron_expression", label="Cron Expression", type="string", description="e.g., '0 9 * * *' for daily at 9am"),
            AdapterField(name="timezone", label="Timezone", type="string", default="UTC", description="e.g., 'America/New_York'")
        ],
        actions=[
            AdapterAction(name="trigger", label="Trigger", description="Scheduled trigger", method="POST", path="/trigger")
        ]
    ),
    
    # --- Transformation ---
    AdapterDefinition(
        id="mapper", name="Data Mapper", description="Transform data between steps", icon="GitMerge", category="Transformation",
        connection_fields=[],
        actions=[
            AdapterAction(name="map", label="Map Data", description="Apply mapping rules", method="POST", path="/map")
        ]
    ),

    # --- Notifications ---
    AdapterDefinition(
        id="email", name="Email", description="Send email notifications", icon="Mail", category="Notification",
        connection_fields=[
            AdapterField(name="smtp_host", label="SMTP Host", type="string", description="e.g., smtp.gmail.com"),
            AdapterField(name="smtp_port", label="SMTP Port", type="number", description="e.g., 587"),
            AdapterField(name="username", label="Username", type="string"),
            AdapterField(name="password", label="Password", type="password"),
            AdapterField(name="from_email", label="From Email", type="string")
        ],
        actions=[
            AdapterAction(name="send", label="Send Email", description="Send an email", method="POST", path="/send")
        ]
    ),
    AdapterDefinition(
        id="webhook", name="Webhook", description="Send HTTP webhooks", icon="Webhook", category="Notification",
        connection_fields=[
            AdapterField(name="url", label="Webhook URL", type="string"),
            AdapterField(name="method", label="HTTP Method", type="string", description="GET, POST, PUT, DELETE"),
            AdapterField(name="headers", label="Headers (JSON)", type="string", description="Optional custom headers")
        ],
        actions=[
            AdapterAction(name="post", label="POST Webhook", description="Send POST request", method="POST", path="/"),
            AdapterAction(name="get", label="GET Webhook", description="Send GET request", method="GET", path="/")
        ]
    ),
]

class AdapterRegistry:
    def _load_custom_adapters(self):
        if not os.path.exists(CUSTOM_ADAPTERS_FILE):
            return []
        try:
            with open(CUSTOM_ADAPTERS_FILE, "r") as f:
                data = json.load(f)
                return [AdapterDefinition(**item) for item in data]
        except Exception as e:
            print(f"Error loading custom adapters: {e}")
            return []

    def get_all(self):
        custom = self._load_custom_adapters()
        # Convert standard adapters to dicts, then merge
        all_adapters = [adapter.model_dump() for adapter in STANDARD_ADAPTERS]
        all_adapters.extend([adapter.model_dump() for adapter in custom])
        return all_adapters

    def get_by_id(self, adapter_id: str):
        # Check standard first
        for adapter in STANDARD_ADAPTERS:
            if adapter.id == adapter_id:
                return adapter.model_dump()
        
        # Check custom
        custom = self._load_custom_adapters()
        for adapter in custom:
            if adapter.id == adapter_id:
                return adapter.model_dump()
                
        return None

def get_standard_adapters():
    """
    Return the list of standard adapters (as dictionaries)
    Used by other modules that need to check against standard adapters
    """
    return [adapter.model_dump() for adapter in STANDARD_ADAPTERS]
