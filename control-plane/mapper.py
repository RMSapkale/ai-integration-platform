import os
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

class FieldMapping(BaseModel):
    source_field: str = Field(description="Field name in the source schema")
    target_field: str = Field(description="Field name in the target schema")
    transformation: str = Field(description="Optional transformation logic (e.g., 'uppercase', 'split')")

class MappingSuggestion(BaseModel):
    mappings: list[FieldMapping] = Field(description="List of suggested field mappings")
    confidence: float = Field(description="Confidence score of the mapping (0.0 to 1.0)")

class MapperAgent:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("WARNING: OPENAI_API_KEY not found. Using Mock Mapper Agent.")
            self.mock_mode = True
        else:
            self.mock_mode = False
            self.llm = ChatOpenAI(model="gpt-4o", temperature=0)
            self.parser = PydanticOutputParser(pydantic_object=MappingSuggestion)
            
            self.prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert Data Engineer. Suggest a mapping between the provided Source Schema and Target Schema.\n\n{format_instructions}"),
                ("user", "Source Schema:\n{source_schema}\n\nTarget Schema:\n{target_schema}")
            ])

    def suggest_mapping(self, source_schema: str, target_schema: str) -> MappingSuggestion:
        if self.mock_mode:
            return MappingSuggestion(
                mappings=[FieldMapping(source_field="id", target_field="user_id", transformation="none")],
                confidence=0.9
            )

        chain = self.prompt | self.llm | self.parser
        try:
            return chain.invoke({
                "source_schema": source_schema,
                "target_schema": target_schema,
                "format_instructions": self.parser.get_format_instructions()
            })
        except Exception as e:
            print(f"Error suggesting mapping: {e}")
            return MappingSuggestion(mappings=[], confidence=0.0)
