"use client";

import { useCallback, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function FlowViewer({ flowData }: { flowData?: any }) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    useEffect(() => {
        if (flowData) {
            const newNodes: Node[] = [];
            const newEdges: Edge[] = [];
            let xPos = 0;
            const yPos = 100;
            const xGap = 300;

            // 1. Trigger Node
            if (flowData.trigger) {
                newNodes.push({
                    id: 'trigger',
                    position: { x: xPos, y: yPos },
                    data: { label: `Trigger: ${flowData.trigger.adapter_id}` },
                    type: 'input',
                    sourcePosition: Position.Right,
                    style: { background: '#ecfeff', border: '1px solid #06b6d4', color: '#0e7490', fontWeight: 'bold' }
                });
                xPos += xGap;
            }

            // 2. Steps
            if (flowData.steps && Array.isArray(flowData.steps)) {
                flowData.steps.forEach((step: any, index: number) => {
                    const isLast = index === flowData.steps.length - 1;
                    const nodeId = `step-${index}`;

                    const isMapper = step.adapter_id === 'mapper';

                    newNodes.push({
                        id: nodeId,
                        position: { x: xPos, y: yPos },
                        data: { label: `Step ${index + 1}: ${isMapper ? 'Mapper (Transform)' : step.adapter_id}` },
                        type: isLast ? 'output' : 'default',
                        targetPosition: Position.Left,
                        sourcePosition: isLast ? undefined : Position.Right,
                        style: isLast
                            ? { background: '#f0fdf4', border: '1px solid #22c55e', color: '#15803d', fontWeight: 'bold' }
                            : isMapper
                                ? { background: '#f5f3ff', border: '1px solid #8b5cf6', color: '#7c3aed', fontWeight: 'bold' } // Purple for Mapper
                                : { background: '#f8fafc', border: '1px solid #94a3b8', color: '#475569' }
                    });

                    // Add Edge from previous node
                    const sourceId = index === 0 ? 'trigger' : `step-${index - 1}`;
                    newEdges.push({
                        id: `e-${sourceId}-${nodeId}`,
                        source: sourceId,
                        target: nodeId,
                        animated: true,
                        style: { stroke: '#94a3b8' }
                    });

                    xPos += xGap;
                });
            } else if (flowData.source && flowData.destination) {
                // Fallback for old model (Source -> Destination)
                newNodes.push({
                    id: 'source',
                    position: { x: 0, y: 100 },
                    data: { label: `Source: ${flowData.source.adapter_id}` },
                    type: 'input',
                    sourcePosition: Position.Right,
                    style: { background: '#ecfeff', border: '1px solid #06b6d4', color: '#0e7490', fontWeight: 'bold' }
                });
                newNodes.push({
                    id: 'dest',
                    position: { x: 300, y: 100 },
                    data: { label: `Dest: ${flowData.destination.adapter_id}` },
                    type: 'output',
                    targetPosition: Position.Left,
                    style: { background: '#f0fdf4', border: '1px solid #22c55e', color: '#15803d', fontWeight: 'bold' }
                });
                newEdges.push({ id: 'e-source-dest', source: 'source', target: 'dest', animated: true, style: { stroke: '#94a3b8' } });
            }

            setNodes(newNodes);
            setEdges(newEdges);
        }
    }, [flowData, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls showInteractive={false} />
                <Background gap={12} size={1} color="#e2e8f0" />
            </ReactFlow>
        </div>
    );
}
