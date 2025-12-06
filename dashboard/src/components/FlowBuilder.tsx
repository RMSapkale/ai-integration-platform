"use client"

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Connection,
    useNodesState,
    useEdgesState,
    MarkerType,
    NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Play,
    GitBranch,
    Repeat,
    AlertTriangle,
    Zap,
    Database,
    Mail,
    Code
} from 'lucide-react';

// Custom Node Components
const ActionNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[150px]">
            <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <div className="font-bold text-sm">{data.label}</div>
            </div>
            {data.adapter && (
                <div className="text-xs text-gray-500 mt-1">{data.adapter}</div>
            )}
        </div>
    );
};

const ConditionNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md bg-amber-50 border-2 border-amber-500 min-w-[150px]"
            style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
            <div className="flex items-center gap-2 justify-center">
                <GitBranch className="h-4 w-4 text-amber-600" />
                <div className="font-bold text-sm">{data.label}</div>
            </div>
        </div>
    );
};

const LoopNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-lg bg-purple-50 border-2 border-purple-500 min-w-[150px]">
            <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-purple-600" />
                <div className="font-bold text-sm">{data.label}</div>
            </div>
            {data.iterator && (
                <div className="text-xs text-gray-500 mt-1">{data.iterator}</div>
            )}
        </div>
    );
};

const ErrorHandlerNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-red-50 border-2 border-red-500 min-w-[150px]">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="font-bold text-sm">{data.label}</div>
            </div>
            {data.retries && (
                <div className="text-xs text-gray-500 mt-1">Retries: {data.retries}</div>
            )}
        </div>
    );
};

const ParallelNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-green-50 border-2 border-green-500 min-w-[150px]">
            <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <div className="font-bold text-sm">{data.label}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Parallel Execution</div>
        </div>
    );
};

const NotificationNode = ({ data }: any) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-cyan-50 border-2 border-cyan-500 min-w-[150px]">
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-600" />
                <div className="font-bold text-sm">{data.label}</div>
            </div>
            {data.type && (
                <div className="text-xs text-gray-500 mt-1">{data.type}</div>
            )}
        </div>
    );
};

const nodeTypes: NodeTypes = {
    action: ActionNode,
    condition: ConditionNode,
    loop: LoopNode,
    errorHandler: ErrorHandlerNode,
    parallel: ParallelNode,
    notification: NotificationNode,
};

// Initial example flow (keep this as fallback or empty if preferred, but for now we'll keep it as default if no flow provided)
const defaultNodes: Node[] = [
    {
        id: '1',
        type: 'action',
        position: { x: 250, y: 50 },
        data: { label: 'Trigger', adapter: 'Workday' },
    },
    // ... (rest of default nodes can be removed or kept as fallback)
];

const defaultEdges: Edge[] = [];

export function FlowBuilder({ initialFlow }: { initialFlow?: any }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]); // Start empty
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Initialize from prop
    useEffect(() => {
        if (initialFlow) {
            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            let xPos = 250;
            let yPos = 50;
            const yGap = 100;

            // Helper to add node
            const add = (id: string, type: string, data: any) => {
                newNodes.push({
                    id,
                    type,
                    position: { x: xPos, y: yPos },
                    data
                });
                yPos += yGap;
            };

            // 1. Trigger
            if (initialFlow.trigger) {
                add('trigger', 'action', {
                    label: `Trigger: ${initialFlow.trigger.adapter_id}`,
                    adapter: initialFlow.trigger.adapter_id
                });
            }

            // 2. Steps
            let prevId = 'trigger';
            if (initialFlow.steps && Array.isArray(initialFlow.steps)) {
                initialFlow.steps.forEach((step: any, index: number) => {
                    const id = `step-${index}`;

                    // Map step types
                    let type = 'action';
                    let data: any = {
                        label: step.action || 'Action',
                        adapter: step.adapter_id,
                        config: step.config
                    };

                    if (step.adapter_id === 'condition' || step.adapter_id === 'switch') {
                        type = 'condition';
                        data = { label: 'Condition' };
                    } else if (step.adapter_id === 'loop') {
                        type = 'loop';
                        data = { label: 'Loop', iterator: step.config?.iterator || 'items' };
                    } else if (step.adapter_id === 'error_handler') {
                        type = 'errorHandler';
                        data = { label: 'Error Handler', retries: step.config?.retry_config?.max_retries || 3 };
                    } else if (['email', 'slack', 'teams', 'webhook'].includes(step.adapter_id)) {
                        type = 'notification';
                        data = { label: 'Notification', type: step.adapter_id };
                    } else if (step.adapter_id === 'mapper') {
                        type = 'action'; // Re-use action node for now, but label it clearly
                        data = {
                            label: 'Data Mapper',
                            adapter: 'Transformation',
                            mapperId: step.config?.mapper_id
                        };
                    } else if (step.adapter_id === 'parallel') {
                        type = 'parallel';
                        data = { label: 'Parallel' };
                    }

                    add(id, type, data);

                    // Add edge
                    newEdges.push({
                        id: `e-${prevId}-${id}`,
                        source: prevId,
                        target: id,
                        animated: true
                    });
                    prevId = id;
                });
            }

            setNodes(newNodes);
            setEdges(newEdges);
        } else {
            // Load default example if no flow provided
            setNodes(defaultNodes);
            setEdges(defaultEdges);
        }
    }, [initialFlow, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const addNode = (type: string) => {
        const newNode: Node = {
            id: `${nodes.length + 1}`,
            type,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                ...(type === 'action' && { adapter: 'Select Adapter' }),
                ...(type === 'loop' && { iterator: 'for item in items' }),
                ...(type === 'errorHandler' && { retries: 3 }),
                ...(type === 'notification' && { type: 'Email' }),
            },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const exportFlow = () => {
        const flowDefinition = {
            nodes: nodes.map(node => ({
                id: node.id,
                type: node.type,
                data: node.data,
            })),
            edges: edges.map(edge => ({
                source: edge.source,
                target: edge.target,
                label: edge.label,
            })),
        };
        console.log('Flow Definition:', flowDefinition);
        // Here you would send this to the backend
        alert('Flow exported to console. Check browser console for JSON.');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar - Node Palette */}
            <div className="w-64 bg-white border-r border-slate-200 p-4 overflow-y-auto">
                <h3 className="font-bold text-lg mb-4">Flow Components</h3>

                <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-600 mb-2">Basic</div>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addNode('action')}
                    >
                        <Database className="mr-2 h-4 w-4" />
                        Action Step
                    </Button>

                    <div className="text-sm font-medium text-slate-600 mb-2 mt-4">Control Flow</div>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addNode('condition')}
                    >
                        <GitBranch className="mr-2 h-4 w-4" />
                        Condition
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addNode('loop')}
                    >
                        <Repeat className="mr-2 h-4 w-4" />
                        Loop
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addNode('parallel')}
                    >
                        <Zap className="mr-2 h-4 w-4" />
                        Parallel
                    </Button>

                    <div className="text-sm font-medium text-slate-600 mb-2 mt-4">Advanced</div>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addNode('errorHandler')}
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Error Handler
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addNode('notification')}
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Notification
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                    <Button onClick={exportFlow} className="w-full bg-cyan-600 hover:bg-cyan-500">
                        <Code className="mr-2 h-4 w-4" />
                        Export Flow
                    </Button>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-medium mb-3">Legend</h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Action</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span>Condition</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Loop</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Error Handler</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Parallel</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                            <span>Notification</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 relative">
                <div className="absolute top-4 left-4 z-10">
                    <Card className="p-3 bg-white/95 backdrop-blur">
                        <h2 className="font-bold text-lg">Visual Flow Builder</h2>
                        <p className="text-sm text-slate-600">Drag nodes to arrange • Click to connect</p>
                    </Card>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-slate-50"
                >
                    <Background />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'action': return '#3b82f6';
                                case 'condition': return '#f59e0b';
                                case 'loop': return '#a855f7';
                                case 'errorHandler': return '#ef4444';
                                case 'parallel': return '#10b981';
                                case 'notification': return '#06b6d4';
                                default: return '#94a3b8';
                            }
                        }}
                    />
                </ReactFlow>
            </div>

            {/* Properties Panel */}
            {selectedNode && (
                <div className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4">Node Properties</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Type</label>
                            <Badge className="ml-2">{selectedNode.type}</Badge>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Label</label>
                            <input
                                type="text"
                                value={selectedNode.data.label}
                                onChange={(e) => {
                                    setNodes((nds) =>
                                        nds.map((node) =>
                                            node.id === selectedNode.id
                                                ? { ...node, data: { ...node.data, label: e.target.value } }
                                                : node
                                        )
                                    );
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md"
                            />
                        </div>

                        {selectedNode.type === 'action' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium block mb-1">Adapter</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={selectedNode.data.adapter}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500"
                                    />
                                </div>

                                {selectedNode.data.label === 'Data Mapper' ? (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-cyan-600 border-cyan-200 hover:bg-cyan-50"
                                        onClick={() => {
                                            // Redirect to Mappers page with edit param
                                            // Assuming the mapper ID is stored in data.config.mapper_id or similar
                                            // For now, we might not have the ID if it wasn't passed in initialFlow perfectly.
                                            // But let's assume we can pass it.
                                            const mapperId = selectedNode.data.mapperId;
                                            if (mapperId) {
                                                window.location.href = `/dashboard/mappers?edit=${mapperId}`;
                                            } else {
                                                // Fallback or just go to mappers
                                                window.location.href = `/dashboard/mappers`;
                                            }
                                        }}
                                    >
                                        <GitBranch className="mr-2 h-4 w-4" />
                                        Edit Mapper Configuration
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                                        onClick={() => {
                                            const adapterId = selectedNode.data.adapter;
                                            if (adapterId) {
                                                window.location.href = `/dashboard/connections?edit=${adapterId}`;
                                            } else {
                                                window.location.href = `/dashboard/connections`;
                                            }
                                        }}
                                    >
                                        <Zap className="mr-2 h-4 w-4" />
                                        Edit Connection / Adapter
                                    </Button>
                                )}
                            </div>
                        )}

                        {selectedNode.type === 'condition' && (
                            <div>
                                <label className="text-sm font-medium block mb-1">Condition</label>
                                <input
                                    type="text"
                                    placeholder="e.g., data.status === 'active'"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-sm"
                                />
                            </div>
                        )}

                        {selectedNode.type === 'loop' && (
                            <div>
                                <label className="text-sm font-medium block mb-1">Iterator</label>
                                <input
                                    type="text"
                                    placeholder="e.g., for item in items"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-sm"
                                />
                            </div>
                        )}

                        {selectedNode.type === 'errorHandler' && (
                            <div>
                                <label className="text-sm font-medium block mb-1">Max Retries</label>
                                <input
                                    type="number"
                                    defaultValue={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        variant="destructive"
                        className="w-full mt-6"
                        onClick={() => {
                            setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
                            setSelectedNode(null);
                        }}
                    >
                        Delete Node
                    </Button>
                </div>
            )}
        </div>
    );
}
