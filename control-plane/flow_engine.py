"""
Enhanced Flow Engine
Supports advanced control flow: conditionals, loops, error handling, parallel execution
"""

from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum
import asyncio
import time
import traceback
from datetime import datetime


class StepType(str, Enum):
    """Types of flow steps"""
    ACTION = "action"
    CONDITION = "condition"
    SWITCH = "switch"
    LOOP = "loop"
    PARALLEL = "parallel"
    ERROR_HANDLER = "error_handler"
    NOTIFICATION = "notification"


class RetryConfig(BaseModel):
    """Configuration for retry logic"""
    max_retries: int = 3
    delay_seconds: int = 5
    backoff_multiplier: float = 2.0
    max_delay_seconds: int = 60


class FlowStep(BaseModel):
    """Enhanced flow step supporting advanced control flow"""
    id: str = Field(default_factory=lambda: str(time.time()))
    type: StepType = StepType.ACTION
    name: Optional[str] = None
    
    # Action step fields
    adapter_id: Optional[str] = None
    action: Optional[str] = None
    config: Dict[str, Any] = {}
    
    # Conditional fields
    condition: Optional[str] = None  # Expression to evaluate
    on_true: Optional[List['FlowStep']] = None
    on_false: Optional[List['FlowStep']] = None
    
    # Switch fields
    expression: Optional[str] = None
    cases: Optional[List[Dict[str, Any]]] = None  # [{value: "x", steps: [...]}, ...]
    default: Optional[List['FlowStep']] = None
    
    # Loop fields
    iterator: Optional[str] = None  # "for item in items" or "while condition"
    loop_steps: Optional[List['FlowStep']] = None
    max_iterations: int = 1000  # Prevent infinite loops
    
    # Parallel fields
    parallel_branches: Optional[List[List['FlowStep']]] = None
    wait_for: str = "all"  # "all" or "any"
    
    # Error handling fields
    try_steps: Optional[List['FlowStep']] = None
    on_error: Optional[List['FlowStep']] = None
    retry_config: Optional[RetryConfig] = None


class StepResult(BaseModel):
    """Result of a step execution"""
    step_id: str
    step_type: StepType
    status: str  # "success", "error", "skipped"
    data: Optional[Any] = None
    error: Optional[str] = None
    execution_time_ms: float = 0
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class ExecutionContext:
    """Context for flow execution with variable management"""
    
    def __init__(self, initial_data: Dict[str, Any] = None):
        self.variables: Dict[str, Any] = initial_data or {}
        self.history: List[StepResult] = []
        self.errors: List[Dict[str, Any]] = []
        
    def set_variable(self, name: str, value: Any):
        """Set a variable in the context"""
        self.variables[name] = value
        
    def get_variable(self, name: str, default: Any = None) -> Any:
        """Get a variable from the context"""
        # Support nested access like "data.employee.name"
        parts = name.split('.')
        current = self.variables
        
        for part in parts:
            if isinstance(current, dict):
                current = current.get(part, default)
            else:
                return default
                
        return current
    
    def add_step_result(self, result: StepResult):
        """Add a step result to history"""
        self.history.append(result)
        
    def add_error(self, error: Dict[str, Any]):
        """Add an error to the error log"""
        self.errors.append(error)
        
    def get_last_result(self) -> Optional[StepResult]:
        """Get the last step result"""
        return self.history[-1] if self.history else None


class ConditionEvaluator:
    """Evaluates conditional expressions safely"""
    
    @staticmethod
    def evaluate(expression: str, context: ExecutionContext) -> bool:
        """
        Evaluate a conditional expression
        Supports: ==, !=, >, <, >=, <=, &&, ||, !, in, contains
        """
        if not expression:
            return False
            
        # Replace logical operators
        expr = expression.replace('&&', ' and ').replace('||', ' or ').replace('!', ' not ')
        
        # Build safe evaluation context
        eval_context = {
            'data': context.variables,
            'len': len,
            'str': str,
            'int': int,
            'float': float,
            'bool': bool,
        }
        
        # Add variables directly to context
        for key, value in context.variables.items():
            eval_context[key] = value
        
        try:
            # Use eval with restricted globals/locals
            # WARNING: In production, use a proper expression parser like py-expression-eval
            result = eval(expr, {"__builtins__": {}}, eval_context)
            return bool(result)
        except Exception as e:
            print(f"Error evaluating condition '{expression}': {e}")
            return False


class LoopExecutor:
    """Executes loop steps"""
    
    @staticmethod
    async def execute_for_loop(
        iterator: str,
        loop_steps: List[FlowStep],
        context: ExecutionContext,
        executor: 'FlowExecutor',
        max_iterations: int = 1000
    ) -> List[StepResult]:
        """
        Execute a for loop
        Format: "for item in items" or "for employee in employees"
        """
        results = []
        
        # Parse iterator: "for item in items"
        parts = iterator.strip().split(' in ')
        if len(parts) != 2 or not parts[0].startswith('for '):
            raise ValueError(f"Invalid for loop syntax: {iterator}")
        
        item_var = parts[0].replace('for ', '').strip()
        collection_name = parts[1].strip()
        
        # Get collection from context
        collection = context.get_variable(collection_name, [])
        if not isinstance(collection, (list, tuple)):
            collection = [collection]
        
        # Limit iterations
        if len(collection) > max_iterations:
            raise ValueError(f"Loop exceeds max iterations ({max_iterations})")
        
        # Execute loop
        for index, item in enumerate(collection):
            # Set loop variables
            context.set_variable(item_var, item)
            context.set_variable(f'{item_var}_index', index)
            
            # Execute loop steps
            for step in loop_steps:
                result = await executor.execute_step(step, context)
                results.append(result)
                
                if result.status == "error":
                    # Stop loop on error (can be configured)
                    break
        
        return results
    
    @staticmethod
    async def execute_while_loop(
        condition: str,
        loop_steps: List[FlowStep],
        context: ExecutionContext,
        executor: 'FlowExecutor',
        max_iterations: int = 1000
    ) -> List[StepResult]:
        """
        Execute a while loop
        Format: "while condition"
        """
        results = []
        iterations = 0
        
        while ConditionEvaluator.evaluate(condition, context):
            iterations += 1
            if iterations > max_iterations:
                raise ValueError(f"While loop exceeded max iterations ({max_iterations})")
            
            # Execute loop steps
            for step in loop_steps:
                result = await executor.execute_step(step, context)
                results.append(result)
                
                if result.status == "error":
                    break
            
            # Re-evaluate condition
            if not ConditionEvaluator.evaluate(condition, context):
                break
        
        return results


class ErrorHandler:
    """Handles errors with retry logic"""
    
    @staticmethod
    async def execute_with_retry(
        steps: List[FlowStep],
        context: ExecutionContext,
        executor: 'FlowExecutor',
        retry_config: Optional[RetryConfig] = None
    ) -> List[StepResult]:
        """Execute steps with retry logic"""
        if not retry_config:
            retry_config = RetryConfig()
        
        results = []
        attempt = 0
        delay = retry_config.delay_seconds
        
        while attempt <= retry_config.max_retries:
            try:
                # Execute steps
                for step in steps:
                    result = await executor.execute_step(step, context)
                    results.append(result)
                    
                    if result.status == "error":
                        raise Exception(result.error)
                
                # Success - return results
                return results
                
            except Exception as e:
                attempt += 1
                
                if attempt > retry_config.max_retries:
                    # Max retries exceeded
                    error_result = StepResult(
                        step_id="retry_handler",
                        step_type=StepType.ERROR_HANDLER,
                        status="error",
                        error=f"Max retries ({retry_config.max_retries}) exceeded: {str(e)}"
                    )
                    results.append(error_result)
                    context.add_error({
                        "message": str(e),
                        "attempts": attempt,
                        "timestamp": datetime.now().isoformat()
                    })
                    return results
                
                # Wait before retry with exponential backoff
                await asyncio.sleep(min(delay, retry_config.max_delay_seconds))
                delay *= retry_config.backoff_multiplier
                
                print(f"Retry attempt {attempt}/{retry_config.max_retries} after error: {e}")
        
        return results


class ParallelExecutor:
    """Executes parallel branches"""
    
    @staticmethod
    async def execute_parallel(
        branches: List[List[FlowStep]],
        context: ExecutionContext,
        executor: 'FlowExecutor',
        wait_for: str = "all"
    ) -> List[List[StepResult]]:
        """
        Execute branches in parallel
        wait_for: "all" (wait for all branches) or "any" (wait for first to complete)
        """
        async def execute_branch(branch: List[FlowStep]) -> List[StepResult]:
            results = []
            for step in branch:
                result = await executor.execute_step(step, context)
                results.append(result)
                if result.status == "error":
                    break
            return results
        
        # Create tasks for all branches
        tasks = [execute_branch(branch) for branch in branches]
        
        if wait_for == "any":
            # Wait for first to complete
            done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
            # Cancel pending tasks
            for task in pending:
                task.cancel()
            return [task.result() for task in done]
        else:
            # Wait for all to complete
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return results


class FlowExecutor:
    """Main flow execution engine"""
    
    def __init__(self):
        self.condition_evaluator = ConditionEvaluator()
        self.loop_executor = LoopExecutor()
        self.error_handler = ErrorHandler()
        self.parallel_executor = ParallelExecutor()
    
    async def execute_step(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute a single step based on its type"""
        start_time = time.time()
        
        try:
            if step.type == StepType.ACTION:
                return await self._execute_action(step, context)
            
            elif step.type == StepType.CONDITION:
                return await self._execute_condition(step, context)
            
            elif step.type == StepType.SWITCH:
                return await self._execute_switch(step, context)
            
            elif step.type == StepType.LOOP:
                return await self._execute_loop(step, context)
            
            elif step.type == StepType.PARALLEL:
                return await self._execute_parallel(step, context)
            
            elif step.type == StepType.ERROR_HANDLER:
                return await self._execute_error_handler(step, context)
            
            else:
                raise ValueError(f"Unknown step type: {step.type}")
                
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            error_result = StepResult(
                step_id=step.id,
                step_type=step.type,
                status="error",
                error=str(e),
                execution_time_ms=execution_time
            )
            context.add_step_result(error_result)
            return error_result
    
    async def _execute_action(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute an action step (adapter call)"""
        
        # Check for Mapper
        if step.adapter_id == "mapper":
            try:
                # Resolve input data for mapping
                # Strategy: 
                # 1. Use specific variable if configured (e.g. from previous step)
                # 2. Or default to using all variables in context
                # For now, let's use all variables to allow flexible mapping
                input_data = context.variables
                
                # Execute Mapping
                from mapper_engine import MapperEngine
                mapper_engine = MapperEngine()
                
                # Config might contain 'mapping_rules' etc directly (inline)
                # OR it might reference a 'mapper_id' which we would need to fetch.
                # However, FlowExecutor doesn't currently reference the DB (main.py does).
                # Ideally, the flow passed to executor should have the FULL config embedded 
                # or we make FlowExecutor db-aware.
                # For this task, we assume the config passed in `step.config` contains the necessary info (inline rules or code).
                # If the flow was created via `create_flow`, the full definition might be missing if we only saved ID.
                # But `execute_flow` in `main.py` loads the flow. 
                # Let's assume for now `main.py` will inject the mapper definition OR `step.config` has it.
                # (Self-correction: The current `create_flow` saves mapper config *to* `step.config` *and* the DB, 
                # so `step.config` should still have the rules/code).
                
                result_data = mapper_engine.execute(step.config, input_data)
                
                # Update context with mapped data? 
                # Usually we want to store it in a specific variable
                # For now, we store in step result which is added to context
                
                result = StepResult(
                    step_id=step.id,
                    step_type=StepType.ACTION,
                    status="success",
                    data=result_data
                )
                context.add_step_result(result)
                
                # Optionally merge into main variables if configured?
                # For now, let user access via step_id_result
                return result
                
            except Exception as e:
                # Log error
                return StepResult(
                    step_id=step.id,
                    step_type=StepType.ACTION,
                    status="error",
                    error=f"Mapper Error: {str(e)}"
                )

        # This would call the actual adapter
        # For now, return mock success
        result = StepResult(
            step_id=step.id,
            step_type=StepType.ACTION,
            status="success",
            data={"adapter": step.adapter_id, "action": step.action, "config": step.config}
        )
        context.add_step_result(result)
        return result
    
    async def _execute_condition(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute a conditional step"""
        condition_result = self.condition_evaluator.evaluate(step.condition, context)
        
        steps_to_execute = step.on_true if condition_result else step.on_false
        
        if steps_to_execute:
            for sub_step in steps_to_execute:
                await self.execute_step(sub_step, context)
        
        result = StepResult(
            step_id=step.id,
            step_type=StepType.CONDITION,
            status="success",
            data={"condition": step.condition, "result": condition_result}
        )
        context.add_step_result(result)
        return result
    
    async def _execute_switch(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute a switch step"""
        # Evaluate expression
        expr_value = context.get_variable(step.expression)
        
        matched = False
        for case in (step.cases or []):
            if case.get("value") == expr_value:
                matched = True
                for sub_step_dict in case.get("steps", []):
                    sub_step = FlowStep(**sub_step_dict)
                    await self.execute_step(sub_step, context)
                break
        
        if not matched and step.default:
            for sub_step in step.default:
                await self.execute_step(sub_step, context)
        
        result = StepResult(
            step_id=step.id,
            step_type=StepType.SWITCH,
            status="success",
            data={"expression": step.expression, "value": expr_value, "matched": matched}
        )
        context.add_step_result(result)
        return result
    
    async def _execute_loop(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute a loop step"""
        if step.iterator.startswith("for "):
            results = await self.loop_executor.execute_for_loop(
                step.iterator,
                step.loop_steps,
                context,
                self,
                step.max_iterations
            )
        elif step.iterator.startswith("while "):
            condition = step.iterator.replace("while ", "").strip()
            results = await self.loop_executor.execute_while_loop(
                condition,
                step.loop_steps,
                context,
                self,
                step.max_iterations
            )
        else:
            raise ValueError(f"Invalid loop syntax: {step.iterator}")
        
        result = StepResult(
            step_id=step.id,
            step_type=StepType.LOOP,
            status="success",
            data={"iterations": len(results)}
        )
        context.add_step_result(result)
        return result
    
    async def _execute_parallel(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute parallel branches"""
        results = await self.parallel_executor.execute_parallel(
            step.parallel_branches,
            context,
            self,
            step.wait_for
        )
        
        result = StepResult(
            step_id=step.id,
            step_type=StepType.PARALLEL,
            status="success",
            data={"branches": len(results)}
        )
        context.add_step_result(result)
        return result
    
    async def _execute_error_handler(self, step: FlowStep, context: ExecutionContext) -> StepResult:
        """Execute error handler with try/catch"""
        try:
            # Try to execute steps
            results = await self.error_handler.execute_with_retry(
                step.try_steps,
                context,
                self,
                step.retry_config
            )
            
            # Check if any step failed
            has_error = any(r.status == "error" for r in results)
            
            if has_error and step.on_error:
                # Execute error handler steps
                for error_step in step.on_error:
                    await self.execute_step(error_step, context)
            
            result = StepResult(
                step_id=step.id,
                step_type=StepType.ERROR_HANDLER,
                status="success" if not has_error else "error",
                data={"had_error": has_error, "results": len(results)}
            )
            context.add_step_result(result)
            return result
            
        except Exception as e:
            # Execute error handler
            if step.on_error:
                for error_step in step.on_error:
                    await self.execute_step(error_step, context)
            
            result = StepResult(
                step_id=step.id,
                step_type=StepType.ERROR_HANDLER,
                status="error",
                error=str(e)
            )
            context.add_step_result(result)
            return result
    
    async def execute_flow(self, steps: List[FlowStep], initial_data: Dict[str, Any] = None) -> ExecutionContext:
        """Execute a complete flow"""
        context = ExecutionContext(initial_data or {})
        
        for step in steps:
            result = await self.execute_step(step, context)
            
            # Store result in context
            context.set_variable(f'step_{step.id}_result', result.data)
        
        return context
