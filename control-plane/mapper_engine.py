
import json
import subprocess
import os
import tempfile
from typing import Dict, Any, List, Optional

class MapperEngine:
    """
    Executes data transformations using various strategies (Visual, JavaScript, XSLT)
    """

    def execute(self, mapper_config: Dict[str, Any], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the mapper based on its configuration
        """
        mapper_type = mapper_config.get("type", "visual")
        
        if mapper_type == "visual":
            return self.execute_visual_mapping(mapper_config.get("mapping_rules", []), input_data)
        elif mapper_type == "javascript":
            return self.execute_javascript(mapper_config.get("javascript_code", ""), input_data)
        elif mapper_type == "xslt":
            return self.execute_xslt(mapper_config.get("xslt_template", ""), input_data)
        else:
            raise ValueError(f"Unknown mapper type: {mapper_type}")

    def execute_visual_mapping(self, rules: List[Dict[str, Any]], input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute visual mapping rules
        """
        result = {}
        for rule in rules:
            source_field = rule.get("source_field")
            target_field = rule.get("target_field")
            transformation = rule.get("transformation")

            # 1. Get value (support dot notation for nested fields e.g. "user.address.dity")
            value = self._get_nested_value(input_data, source_field)

            # 2. Apply transformation
            if transformation:
                value = self._apply_transformation(value, transformation)

            # 3. Set value (support dot notation for target)
            self._set_nested_value(result, target_field, value)
            
        return result

    def execute_javascript(self, code: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute JavaScript code using Node.js subprocess
        """
        if not code or not code.strip():
            return {}

        # 1. Prepare constraints / harness
        # We expect code to contain `function transform(input) { ... }`
        # We append code to call it and log result
        
        harness = f"""
        {code}

        try {{
            const input = JSON.parse(process.argv[2]);
            let result = {{}};
            
            if (typeof transform === 'function') {{
                result = transform(input);
            }} else {{
                console.error("Error: 'transform' function not defined in user code.");
                process.exit(1);
            }}
            
            console.log(JSON.stringify(result));
        }} catch (e) {{
            console.error(e.message);
            process.exit(1);
        }}
        """

        # 2. Write to temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(harness)
            temp_js_path = f.name

        try:
            # 3. specific node execution
            # Pass input data as JSON string argument
            input_json = json.dumps(input_data)
            
            process = subprocess.run(
                ['node', temp_js_path, input_json],
                capture_output=True,
                text=True,
                timeout=5  # 5 second timeout
            )

            if process.returncode != 0:
                raise Exception(f"JavaScript Execution Error: {process.stderr}")

            # 4. Parse output
            output_json = process.stdout.strip()
            if not output_json:
                return {} # Return empty dict if no output but no error?
                
            return json.loads(output_json)

        except subprocess.TimeoutExpired:
            raise Exception("JavaScript execution timed out.")
        except json.JSONDecodeError:
            raise Exception(f"Invalid JSON output from JavaScript: {process.stdout}")
        finally:
            # Cleanup
            if os.path.exists(temp_js_path):
                os.remove(temp_js_path)

    def execute_xslt(self, template: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock XSLT execution (requires external libs usually)
        """
        return {
            "error": "XSLT execution not supported in this environment (requires lxml)",
            "original_input": input_data
        }

    def _get_nested_value(self, data: Dict[str, Any], path: str) -> Any:
        if not path:
            return None
        parts = path.split('.')
        current = data
        for part in parts:
            if isinstance(current, dict):
                current = current.get(part)
            else:
                return None
        return current

    def _set_nested_value(self, data: Dict[str, Any], path: str, value: Any):
        if not path:
            return
        parts = path.split('.')
        current = data
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
            if not isinstance(current, dict):
                 # Path conflict (e.g. attempting to set prop on non-object)
                 return 
        current[parts[-1]] = value

    def _apply_transformation(self, value: Any, transform: str) -> Any:
        if not value:
            return value
        
        t_lower = transform.lower()
        if t_lower == "touppercase" or t_lower == "upper":
            return str(value).upper()
        elif t_lower == "tolowercase" or t_lower == "lower":
            return str(value).lower()
        elif t_lower == "tostring":
            return str(value)
        elif t_lower == "tointeger" or t_lower == "int":
            try: return int(value)
            except: return value
        elif t_lower == "tofloat":
            try: return float(value)
            except: return value
        elif t_lower == "trim":
            return str(value).strip()
            
        return value
