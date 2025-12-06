import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from adapter_schema import AdapterDefinition, AdapterField, AdapterAction

class AdapterFactory:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("WARNING: OPENAI_API_KEY not found. Using Mock Adapter Factory.")
            self.mock_mode = True
        else:
            self.mock_mode = False
            self.llm = ChatOpenAI(model="gpt-4o", temperature=0)
            self.parser = PydanticOutputParser(pydantic_object=AdapterDefinition)
            
            self.prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert API Integrator. Analyze the provided OpenAPI/Swagger spec and extract a Mulesoft-style connector definition.\n\n"
                           "Identify the authentication method and create 'connection_fields' (e.g., api_key, username, password).\n"
                           "Identify key operations and create 'actions' with 'input_schema'.\n\n"
                           "{format_instructions}"),
                ("user", "{spec_content}")
            ])

    def generate_from_spec(self, spec_content: str) -> AdapterDefinition:
        if self.mock_mode:
            return AdapterDefinition(
                id="generated-adapter",
                name="Generated Adapter",
                description="Auto-generated from OpenAPI spec",
                icon="Cloud",
                category="Custom",
                connection_fields=[
                    AdapterField(name="api_key", label="API Key", type="password")
                ],
                actions=[
                    AdapterAction(
                        name="get_resource",
                        label="Get Resource",
                        description="Fetch a resource",
                        method="GET",
                        path="/resource/{id}"
                    )
                ]
            )

        chain = self.prompt | self.llm | self.parser
        try:
            return chain.invoke({
                "spec_content": spec_content[:15000], # Increased limit
                "format_instructions": self.parser.get_format_instructions()
            })
        except Exception as e:
            print(f"Error generating adapter: {e}")
            return AdapterDefinition(
                id="error-adapter",
                name="Error Adapter",
                description="Failed to generate",
                icon="AlertTriangle",
                category="Error",
                connection_fields=[],
                actions=[]
            )

