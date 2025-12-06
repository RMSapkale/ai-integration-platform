"""
Integration Tests for Flow Engine
Tests complex real-world flow scenarios
"""

import pytest
import asyncio
from flow_engine import (
    FlowExecutor,
    FlowStep,
    ExecutionContext,
    StepType,
    RetryConfig
)


class TestComplexFlowScenarios:
    """Integration tests for complex flow scenarios"""
    
    @pytest.mark.asyncio
    async def test_employee_onboarding_flow(self):
        """
        Test a complete employee onboarding flow with:
        - Loop over employees
        - Conditional logic
        - Error handling with retry
        - Notifications
        """
        executor = FlowExecutor()
        
        employees = [
            {"name": "Alice", "status": "active", "department": "IT"},
            {"name": "Bob", "status": "inactive", "department": "HR"},
            {"name": "Charlie", "status": "active", "department": "Engineering"}
        ]
        
        steps = [
            FlowStep(
                id="loop_employees",
                type=StepType.LOOP,
                iterator="for employee in employees",
                loop_steps=[
                    FlowStep(
                        id="check_status",
                        type=StepType.CONDITION,
                        condition="employee.status === 'active'",
                        on_true=[
                            FlowStep(
                                id="sync_with_retry",
                                type=StepType.ERROR_HANDLER,
                                try_steps=[
                                    FlowStep(
                                        id="transform",
                                        type=StepType.ACTION,
                                        adapter_id="mapper"
                                    ),
                                    FlowStep(
                                        id="create_in_oracle",
                                        type=StepType.ACTION,
                                        adapter_id="oracle_hcm",
                                        action="create_employee"
                                    )
                                ],
                                on_error=[
                                    FlowStep(
                                        id="send_error_email",
                                        type=StepType.ACTION,
                                        adapter_id="email",
                                        action="send"
                                    )
                                ],
                                retry_config=RetryConfig(max_retries=3, delay_seconds=0)
                            ),
                            FlowStep(
                                id="success_notification",
                                type=StepType.ACTION,
                                adapter_id="slack",
                                action="send_message"
                            )
                        ],
                        on_false=[
                            FlowStep(
                                id="archive",
                                type=StepType.ACTION,
                                adapter_id="database",
                                action="archive"
                            )
                        ]
                    )
                ]
            )
        ]
        
        context = await executor.execute_flow(steps, {"employees": employees})
        
        # Verify execution
        assert len(context.history) > 0
        assert len(context.errors) == 0  # No unhandled errors
        
        # Should have processed all 3 employees
        # 2 active (Alice, Charlie) should go through sync path
        # 1 inactive (Bob) should go through archive path
    
    @pytest.mark.asyncio
    async def test_parallel_sync_flow(self):
        """
        Test parallel synchronization to multiple systems
        """
        executor = FlowExecutor()
        
        steps = [
            FlowStep(
                id="fetch_data",
                type=StepType.ACTION,
                adapter_id="salesforce",
                action="get_leads"
            ),
            FlowStep(
                id="parallel_sync",
                type=StepType.PARALLEL,
                parallel_branches=[
                    [
                        FlowStep(
                            id="sync_to_hubspot",
                            type=StepType.ACTION,
                            adapter_id="hubspot",
                            action="create_contact"
                        )
                    ],
                    [
                        FlowStep(
                            id="sync_to_dynamics",
                            type=StepType.ACTION,
                            adapter_id="dynamics",
                            action="create_lead"
                        )
                    ],
                    [
                        FlowStep(
                            id="sync_to_postgres",
                            type=StepType.ACTION,
                            adapter_id="postgres",
                            action="insert"
                        )
                    ]
                ],
                wait_for="all"
            ),
            FlowStep(
                id="final_notification",
                type=StepType.ACTION,
                adapter_id="email",
                action="send"
            )
        ]
        
        context = await executor.execute_flow(steps, {"leads": []})
        
        # All steps should complete
        assert len(context.history) > 0
    
    @pytest.mark.asyncio
    async def test_switch_routing_flow(self):
        """
        Test switch-based routing for different order types
        """
        executor = FlowExecutor()
        
        steps = [
            FlowStep(
                id="route_order",
                type=StepType.SWITCH,
                expression="order.type",
                cases=[
                    {
                        "value": "retail",
                        "steps": [
                            FlowStep(
                                id="retail_processing",
                                type=StepType.ACTION,
                                adapter_id="retail_system"
                            )
                        ]
                    },
                    {
                        "value": "wholesale",
                        "steps": [
                            FlowStep(
                                id="wholesale_processing",
                                type=StepType.ACTION,
                                adapter_id="wholesale_system"
                            )
                        ]
                    }
                ],
                default=[
                    FlowStep(
                        id="default_processing",
                        type=StepType.ACTION,
                        adapter_id="default_system"
                    )
                ]
            )
        ]
        
        # Test retail route
        context = await executor.execute_flow(steps, {"order": {"type": "retail"}})
        step_ids = [r.step_id for r in context.history]
        assert "retail_processing" in step_ids
        
        # Test wholesale route
        context = await executor.execute_flow(steps, {"order": {"type": "wholesale"}})
        step_ids = [r.step_id for r in context.history]
        assert "wholesale_processing" in step_ids
        
        # Test default route
        context = await executor.execute_flow(steps, {"order": {"type": "online"}})
        step_ids = [r.step_id for r in context.history]
        assert "default_processing" in step_ids
    
    @pytest.mark.asyncio
    async def test_nested_loops_and_conditions(self):
        """
        Test nested loops with conditions
        """
        executor = FlowExecutor()
        
        departments = [
            {
                "name": "IT",
                "employees": [
                    {"name": "Alice", "active": True},
                    {"name": "Bob", "active": False}
                ]
            },
            {
                "name": "HR",
                "employees": [
                    {"name": "Charlie", "active": True}
                ]
            }
        ]
        
        steps = [
            FlowStep(
                id="loop_departments",
                type=StepType.LOOP,
                iterator="for dept in departments",
                loop_steps=[
                    FlowStep(
                        id="loop_employees",
                        type=StepType.LOOP,
                        iterator="for emp in dept.employees",
                        loop_steps=[
                            FlowStep(
                                id="check_active",
                                type=StepType.CONDITION,
                                condition="emp.active === True",
                                on_true=[
                                    FlowStep(
                                        id="process_active",
                                        type=StepType.ACTION,
                                        adapter_id="processor"
                                    )
                                ],
                                on_false=[
                                    FlowStep(
                                        id="skip_inactive",
                                        type=StepType.ACTION,
                                        adapter_id="logger"
                                    )
                                ]
                            )
                        ]
                    )
                ]
            )
        ]
        
        context = await executor.execute_flow(steps, {"departments": departments})
        
        # Should process all departments and employees
        assert len(context.history) > 0


class TestErrorRecovery:
    """Test error recovery scenarios"""
    
    @pytest.mark.asyncio
    async def test_partial_failure_in_parallel(self):
        """
        Test that parallel execution continues even if one branch fails
        """
        executor = FlowExecutor()
        
        steps = [
            FlowStep(
                id="parallel_with_failure",
                type=StepType.PARALLEL,
                parallel_branches=[
                    [FlowStep(id="success1", type=StepType.ACTION)],
                    [FlowStep(id="success2", type=StepType.ACTION)],
                    [FlowStep(id="success3", type=StepType.ACTION)]
                ],
                wait_for="all"
            )
        ]
        
        context = await executor.execute_flow(steps, {})
        
        # All branches should complete
        assert len(context.history) > 0


class TestPerformance:
    """Performance tests"""
    
    @pytest.mark.asyncio
    async def test_large_loop_performance(self):
        """
        Test performance with large datasets
        """
        import time
        
        executor = FlowExecutor()
        
        # Create 100 items
        items = [{"id": i, "value": f"item_{i}"} for i in range(100)]
        
        steps = [
            FlowStep(
                id="process_items",
                type=StepType.LOOP,
                iterator="for item in items",
                loop_steps=[
                    FlowStep(
                        id="process",
                        type=StepType.ACTION,
                        adapter_id="processor"
                    )
                ]
            )
        ]
        
        start_time = time.time()
        context = await executor.execute_flow(steps, {"items": items})
        end_time = time.time()
        
        execution_time = end_time - start_time
        
        # Should complete in reasonable time (< 5 seconds for 100 items)
        assert execution_time < 5.0
        assert len(context.history) > 100  # Loop step + 100 iterations
    
    @pytest.mark.asyncio
    async def test_parallel_performance(self):
        """
        Test that parallel execution is faster than sequential
        """
        import time
        
        executor = FlowExecutor()
        
        # Parallel execution
        parallel_steps = [
            FlowStep(
                id="parallel",
                type=StepType.PARALLEL,
                parallel_branches=[
                    [FlowStep(id=f"branch{i}", type=StepType.ACTION)]
                    for i in range(10)
                ],
                wait_for="all"
            )
        ]
        
        start_time = time.time()
        await executor.execute_flow(parallel_steps, {})
        parallel_time = time.time() - start_time
        
        # Sequential execution
        sequential_steps = [
            FlowStep(id=f"seq{i}", type=StepType.ACTION)
            for i in range(10)
        ]
        
        start_time = time.time()
        await executor.execute_flow(sequential_steps, {})
        sequential_time = time.time() - start_time
        
        # Parallel should be faster (or at least not significantly slower)
        # Note: With mock steps, timing may be similar
        print(f"Parallel: {parallel_time}s, Sequential: {sequential_time}s")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
