"""
Performance Benchmarks for Flow Engine
Measures execution time and resource usage
"""

import asyncio
import time
import json
from flow_engine import FlowExecutor, FlowStep, StepType, RetryConfig


async def benchmark_simple_flow():
    """Benchmark simple linear flow"""
    print("\n=== Simple Linear Flow Benchmark ===")
    
    executor = FlowExecutor()
    steps = [
        FlowStep(id=f"step{i}", type=StepType.ACTION, adapter_id="test")
        for i in range(10)
    ]
    
    iterations = 100
    start_time = time.time()
    
    for _ in range(iterations):
        await executor.execute_flow(steps, {})
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / iterations
    
    print(f"Total time: {total_time:.3f}s")
    print(f"Average time per flow: {avg_time*1000:.2f}ms")
    print(f"Throughput: {iterations/total_time:.2f} flows/second")


async def benchmark_conditional_flow():
    """Benchmark conditional flow"""
    print("\n=== Conditional Flow Benchmark ===")
    
    executor = FlowExecutor()
    steps = [
        FlowStep(
            id="condition",
            type=StepType.CONDITION,
            condition="value > 50",
            on_true=[
                FlowStep(id="true1", type=StepType.ACTION),
                FlowStep(id="true2", type=StepType.ACTION)
            ],
            on_false=[
                FlowStep(id="false1", type=StepType.ACTION),
                FlowStep(id="false2", type=StepType.ACTION)
            ]
        )
    ]
    
    iterations = 100
    start_time = time.time()
    
    for i in range(iterations):
        await executor.execute_flow(steps, {"value": i})
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"Total time: {total_time:.3f}s")
    print(f"Average time per flow: {(total_time/iterations)*1000:.2f}ms")


async def benchmark_loop_flow():
    """Benchmark loop performance with varying sizes"""
    print("\n=== Loop Flow Benchmark ===")
    
    executor = FlowExecutor()
    
    for loop_size in [10, 50, 100, 500]:
        steps = [
            FlowStep(
                id="loop",
                type=StepType.LOOP,
                iterator="for item in items",
                loop_steps=[
                    FlowStep(id="process", type=StepType.ACTION)
                ]
            )
        ]
        
        items = list(range(loop_size))
        
        start_time = time.time()
        await executor.execute_flow(steps, {"items": items})
        end_time = time.time()
        
        execution_time = end_time - start_time
        time_per_item = (execution_time / loop_size) * 1000
        
        print(f"Loop size {loop_size}: {execution_time:.3f}s ({time_per_item:.2f}ms per item)")


async def benchmark_parallel_flow():
    """Benchmark parallel execution"""
    print("\n=== Parallel Flow Benchmark ===")
    
    executor = FlowExecutor()
    
    for num_branches in [2, 5, 10, 20]:
        steps = [
            FlowStep(
                id="parallel",
                type=StepType.PARALLEL,
                parallel_branches=[
                    [FlowStep(id=f"branch{i}", type=StepType.ACTION)]
                    for i in range(num_branches)
                ],
                wait_for="all"
            )
        ]
        
        start_time = time.time()
        await executor.execute_flow(steps, {})
        end_time = time.time()
        
        execution_time = end_time - start_time
        
        print(f"{num_branches} parallel branches: {execution_time:.3f}s")


async def benchmark_error_handler():
    """Benchmark error handler with retries"""
    print("\n=== Error Handler Benchmark ===")
    
    executor = FlowExecutor()
    
    for max_retries in [1, 3, 5]:
        steps = [
            FlowStep(
                id="error_handler",
                type=StepType.ERROR_HANDLER,
                try_steps=[
                    FlowStep(id="risky", type=StepType.ACTION)
                ],
                on_error=[
                    FlowStep(id="notify", type=StepType.ACTION)
                ],
                retry_config=RetryConfig(max_retries=max_retries, delay_seconds=0)
            )
        ]
        
        start_time = time.time()
        await executor.execute_flow(steps, {})
        end_time = time.time()
        
        execution_time = end_time - start_time
        
        print(f"Max retries {max_retries}: {execution_time:.3f}s")


async def benchmark_complex_flow():
    """Benchmark complex real-world flow"""
    print("\n=== Complex Flow Benchmark ===")
    
    executor = FlowExecutor()
    
    # Simulate employee onboarding flow
    employees = [
        {"name": f"Employee{i}", "status": "active" if i % 2 == 0 else "inactive"}
        for i in range(50)
    ]
    
    steps = [
        FlowStep(
            id="loop",
            type=StepType.LOOP,
            iterator="for employee in employees",
            loop_steps=[
                FlowStep(
                    id="condition",
                    type=StepType.CONDITION,
                    condition="employee.status === 'active'",
                    on_true=[
                        FlowStep(
                            id="error_handler",
                            type=StepType.ERROR_HANDLER,
                            try_steps=[
                                FlowStep(id="transform", type=StepType.ACTION),
                                FlowStep(id="sync", type=StepType.ACTION)
                            ],
                            on_error=[
                                FlowStep(id="notify", type=StepType.ACTION)
                            ],
                            retry_config=RetryConfig(max_retries=2, delay_seconds=0)
                        )
                    ],
                    on_false=[
                        FlowStep(id="archive", type=StepType.ACTION)
                    ]
                )
            ]
        )
    ]
    
    start_time = time.time()
    context = await executor.execute_flow(steps, {"employees": employees})
    end_time = time.time()
    
    execution_time = end_time - start_time
    
    print(f"50 employees processed: {execution_time:.3f}s")
    print(f"Steps executed: {len(context.history)}")
    print(f"Time per employee: {(execution_time/50)*1000:.2f}ms")


async def benchmark_memory_usage():
    """Benchmark memory usage"""
    print("\n=== Memory Usage Benchmark ===")
    
    import tracemalloc
    
    tracemalloc.start()
    
    executor = FlowExecutor()
    
    # Create large flow
    items = list(range(1000))
    steps = [
        FlowStep(
            id="loop",
            type=StepType.LOOP,
            iterator="for item in items",
            loop_steps=[
                FlowStep(id="process", type=StepType.ACTION)
            ]
        )
    ]
    
    snapshot1 = tracemalloc.take_snapshot()
    
    context = await executor.execute_flow(steps, {"items": items})
    
    snapshot2 = tracemalloc.take_snapshot()
    
    top_stats = snapshot2.compare_to(snapshot1, 'lineno')
    
    total_memory = sum(stat.size_diff for stat in top_stats)
    
    print(f"Memory used: {total_memory / 1024 / 1024:.2f} MB")
    print(f"Steps executed: {len(context.history)}")
    
    tracemalloc.stop()


async def run_all_benchmarks():
    """Run all benchmarks"""
    print("=" * 60)
    print("FLOW ENGINE PERFORMANCE BENCHMARKS")
    print("=" * 60)
    
    await benchmark_simple_flow()
    await benchmark_conditional_flow()
    await benchmark_loop_flow()
    await benchmark_parallel_flow()
    await benchmark_error_handler()
    await benchmark_complex_flow()
    await benchmark_memory_usage()
    
    print("\n" + "=" * 60)
    print("BENCHMARKS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_benchmarks())
