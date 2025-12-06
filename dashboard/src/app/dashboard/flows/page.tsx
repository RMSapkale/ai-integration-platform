"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Play, Pause, Settings, MoreHorizontal, Loader2, RefreshCw, Pencil, Eye, Trash2, GitBranch } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { FlowViewer } from "@/components/FlowViewer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FlowsPage() {
    const [flows, setFlows] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFlow, setSelectedFlow] = useState<any | null>(null)
    const [isVisualizeOpen, setIsVisualizeOpen] = useState(false)

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [flowToDelete, setFlowToDelete] = useState<any | null>(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")

    const fetchFlows = async () => {
        setLoading(true)
        try {
            const res = await api.get("/flows")
            if (res.data.status === "success") {
                setFlows(res.data.flows)
            }
        } catch (error) {
            console.error("Failed to fetch flows", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFlows()
    }, [])

    const handleCreateFlow = () => {
        // This button might be redundant if creation happens via Chat, 
        // but we can keep it for future manual creation or redirect to chat
        window.location.href = "/dashboard"
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active"
        try {
            const res = await api.patch(`/flows/${id}/status`, { status: newStatus })
            if (res.data.status === "success") {
                setFlows(flows.map(flow => {
                    if (flow.id === id) {
                        return { ...flow, status: newStatus }
                    }
                    return flow
                }))
            }
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    const handleEdit = (id: string) => {
        window.location.href = `/dashboard?flowId=${id}`
    }

    const handleVisualize = (flow: any) => {
        setSelectedFlow(flow)
        setIsVisualizeOpen(true)
    }

    const confirmDelete = (flow: any) => {
        setFlowToDelete(flow)
        setDeleteConfirmation("")
        setIsDeleteOpen(true)
    }

    const handleDelete = async () => {
        if (!flowToDelete) return

        try {
            await api.delete(`/flows/${flowToDelete.id}`)
            setFlows(flows.filter(f => f.id !== flowToDelete.id))
            setIsDeleteOpen(false)
            setFlowToDelete(null)
        } catch (error) {
            console.error("Failed to delete flow", error)
        }
    }

    const renderFlowPath = (flow: any) => {
        if (flow.trigger && flow.steps) {
            const steps = flow.steps.map((s: any) => s.adapter_id).join(" → ")
            return (
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">{flow.trigger.adapter_id}</span>
                    <span>→</span>
                    <span className="font-semibold text-slate-700">{steps}</span>
                </div>
            )
        } else if (flow.source && flow.destination) {
            // Fallback for old model
            return (
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">{flow.source.adapter_id || flow.source}</span>
                    <span>→</span>
                    <span className="font-semibold text-slate-700">{flow.destination.adapter_id || flow.destination}</span>
                </div>
            )
        }
        return <span className="text-slate-500">Unknown Flow Structure</span>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Active Flows</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={fetchFlows} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handleCreateFlow} className="bg-cyan-600 hover:bg-cyan-500 text-white">Create Flow</Button>
                </div>
            </div>

            {loading && flows.length === 0 ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {flows.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            No flows found. Create one using the AI Chat!
                        </div>
                    ) : (
                        flows.map((flow) => (
                            <Card key={flow.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-medium text-slate-900">
                                        {flow.name}
                                    </CardTitle>
                                    <Badge variant={flow.status === "Active" ? "default" : "secondary"} className={flow.status === "Active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-700"}>
                                        {flow.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                                            {renderFlowPath(flow)}
                                            <div>Last run: {flow.lastRun || "Never"}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-cyan-600"
                                                            onClick={() => handleVisualize(flow)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Visualize Flow</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-cyan-600"
                                                            onClick={() => window.location.href = `/dashboard/flow-builder?flowId=${flow.id}`}
                                                        >
                                                            <GitBranch className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Open in Flow Builder</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-500 hover:text-cyan-600"
                                                            onClick={() => toggleStatus(flow.id, flow.status)}
                                                        >
                                                            {flow.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{flow.status === "Active" ? "Deactivate" : "Activate"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`h-8 w-8 ${flow.status === "Active" ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-900"}`}
                                                                onClick={() => flow.status !== "Active" && handleEdit(flow.id)}
                                                                disabled={flow.status === "Active"}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{flow.status === "Active" ? "Deactivate flow to edit" : "Edit Flow"}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => confirmDelete(flow)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Delete Flow</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            <Dialog open={isVisualizeOpen} onOpenChange={setIsVisualizeOpen}>
                <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Flow Visualization: {selectedFlow?.name}</DialogTitle>
                        <DialogDescription>
                            Read-only view of the integration flow structure.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 h-full min-h-[500px] border rounded-md">
                        {selectedFlow && <FlowViewer flowData={selectedFlow} />}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Flow</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">{flowToDelete?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="confirm-name" className="mb-2 block">
                            Type <span className="font-mono font-bold">{flowToDelete?.name}</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-name"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Type flow name here"
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteConfirmation !== flowToDelete?.name}
                        >
                            Delete Flow
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
