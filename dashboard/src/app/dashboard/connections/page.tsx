"use client"

import { useEffect, useState, Suspense } from "react"
import api from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Cloud, MessageSquare, Database, Settings, Trash2, Save, Play, CheckCircle, AlertCircle } from "lucide-react"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Connection {
    id: string;
    adapter_id: string;
    name: string;
    config: any;
    schema?: any;
    used_by?: { id: string, name: string, type: string }[];
    usage_count?: number;
}

const iconMap: any = {
    "http": Globe,
    "sftp": Cloud,
    "salesforce": Cloud,
    "hubspot": Cloud,
    "dynamics": Cloud,
    "oracle_db": Database,
    "sap_s4hana": Database,
    "netsuite": Database,
    "postgres": Database,
    "servicenow": MessageSquare,
    "jira": MessageSquare,
    "zendesk": MessageSquare,
    "slack": MessageSquare,
    "teams": MessageSquare,
    "twilio": MessageSquare,
    "aws_s3": Cloud,
    "stripe": Globe,
};

function ConnectionsContent() {
    const [connections, setConnections] = useState<Connection[]>([])
    const [adapters, setAdapters] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Edit State
    const [editConfig, setEditConfig] = useState<any>({})
    const [editName, setEditName] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")

    // Test State
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<any>(null)

    const searchParams = useSearchParams()
    const editId = searchParams.get("edit")

    const fetchData = async () => {
        setLoading(true)
        try {
            const [connRes, adaptRes] = await Promise.all([
                api.get("/connections"),
                api.get("/adapters")
            ])
            setConnections(connRes.data.connections)
            setAdapters(adaptRes.data.adapters)
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Effect to handle auto-edit
    useEffect(() => {
        if (editId && connections.length > 0) {
            // Try to find by ID first
            let connToEdit = connections.find(c => c.id === editId)

            // If not found by ID, try to find by adapter_id (fallback for demo purposes if ID not passed)
            if (!connToEdit) {
                connToEdit = connections.find(c => c.adapter_id === editId)
            }

            if (connToEdit) {
                handleViewDetails(connToEdit)
            }
        }
    }, [editId, connections])

    const handleViewDetails = (conn: Connection) => {
        setSelectedConnection(conn)
        setEditConfig(conn.config || {})
        setEditName(conn.name)
        setTestResult(null)
        setIsDialogOpen(true)
    }

    const handleSaveConfig = async () => {
        if (!selectedConnection) return

        setIsSaving(true)
        try {
            const res = await api.put(`/connections/${selectedConnection.id}`, {
                config: editConfig,
                name: editName
            })

            if (res.data.status === "success") {
                setConnections(connections.map(c => c.id === selectedConnection.id ? res.data.connection : c))
                setSelectedConnection(res.data.connection)
                alert("Configuration saved successfully!")
            }
        } catch (error) {
            console.error("Failed to save config", error)
            alert("Failed to save configuration.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleTestConnection = async () => {
        if (!selectedConnection) return

        setIsTesting(true)
        setTestResult(null)
        try {
            const res = await api.post(`/connections/${selectedConnection.id}/test`)
            if (res.data.status === "success") {
                setTestResult({ success: true, message: res.data.message, schema: res.data.schema })
                // Update local connection with new schema
                const updatedConn = { ...selectedConnection, schema: res.data.schema }
                setSelectedConnection(updatedConn)
                setConnections(connections.map(c => c.id === selectedConnection.id ? updatedConn : c))
            }
        } catch (error) {
            console.error("Test failed", error)
            setTestResult({ success: false, message: "Connection test failed. Check logs." })
        } finally {
            setIsTesting(false)
        }
    }

    const confirmDelete = (conn: Connection) => {
        setConnectionToDelete(conn)
        setDeleteConfirmation("")
        setIsDeleteOpen(true)
    }

    const handleDelete = async () => {
        if (!connectionToDelete) return

        try {
            await api.delete(`/connections/${connectionToDelete.id}`)
            setConnections(connections.filter(c => c.id !== connectionToDelete.id))
            setIsDeleteOpen(false)
            setConnectionToDelete(null)
        } catch (error) {
            console.error("Failed to delete connection", error)
        }
    }

    const renderConfigForm = () => {
        if (!selectedConnection) return null

        const adapter = adapters.find(a => a.id === selectedConnection.adapter_id)
        if (!adapter || !adapter.connection_fields) {
            return (
                <Textarea
                    value={JSON.stringify(editConfig, null, 2)}
                    onChange={(e: any) => {
                        try {
                            setEditConfig(JSON.parse(e.target.value))
                        } catch (err) {
                            // Allow invalid JSON while typing, handle validation on save if needed
                        }
                    }}
                    className="font-mono text-xs h-full resize-none"
                    placeholder="{}"
                />
            )
        }

        return (
            <div className="space-y-4 overflow-y-auto pr-2">
                {adapter.connection_fields.map((field: any) => (
                    <div key={field.name} className="grid w-full items-center gap-1.5">
                        <Label htmlFor={field.name}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                        <Input
                            type={field.type === 'password' ? 'password' : 'text'}
                            id={field.name}
                            value={editConfig[field.name] || ''}
                            onChange={(e) => setEditConfig({ ...editConfig, [field.name]: e.target.value })}
                            placeholder={`Enter ${field.label}`}
                        />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Connections</h2>
            </div>
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-cyan-600" />
                </div>
            ) : connections.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500">No connections configured yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Go to the Connector Library to add one.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {connections.map((conn) => {
                        const Icon = iconMap[conn.adapter_id] || Globe
                        const adapter = adapters.find(a => a.id === conn.adapter_id)
                        const adapterName = adapter ? adapter.name : conn.adapter_id
                        const usageCount = conn.usage_count || 0

                        return (
                            <Card key={conn.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-md">
                                            <Icon className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-medium text-slate-900">
                                                {conn.name}
                                            </CardTitle>
                                            <p className="text-xs text-slate-500">{adapterName}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Connected
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-2 mb-4">
                                        <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200">
                                            Used in {usageCount} Flows
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-500 hover:text-slate-900"
                                            onClick={() => handleViewDetails(conn)}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Configure
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => confirmDelete(conn)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Connection Configuration: {selectedConnection?.name}</DialogTitle>
                        <DialogDescription>
                            Manage settings and test connectivity for {selectedConnection?.adapter_id}.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="config" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="config">Configuration</TabsTrigger>
                            <TabsTrigger value="test">Test & Schema</TabsTrigger>
                            <TabsTrigger value="usage">Usage ({selectedConnection?.usage_count || 0})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="config" className="flex-1 flex flex-col gap-4 mt-4 min-h-0">
                            <div className="flex-1 min-h-0 overflow-y-auto p-1 space-y-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="connection-name">Connection Name</Label>
                                    <Input
                                        id="connection-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter connection name"
                                    />
                                </div>
                                <div className="border-t border-slate-200 my-2"></div>
                                {renderConfigForm()}
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSaveConfig} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-500">
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Configuration
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="test" className="flex-1 flex flex-col gap-4 mt-4 min-h-0 overflow-y-auto">
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div>
                                    <h4 className="font-medium text-slate-900">Connectivity Test</h4>
                                    <p className="text-sm text-slate-500">Verify connection and fetch schema.</p>
                                </div>
                                <Button onClick={handleTestConnection} disabled={isTesting} variant="outline">
                                    {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Test Connection
                                </Button>
                            </div>

                            {testResult && (
                                <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResult.success ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                                        <span className={`font-medium ${testResult.success ? 'text-emerald-900' : 'text-red-900'}`}>
                                            {testResult.success ? 'Success' : 'Failed'}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${testResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {testResult.message}
                                    </p>
                                </div>
                            )}

                            {selectedConnection?.schema && (
                                <div className="space-y-2">
                                    <h4 className="font-medium text-slate-900">Discovered Schema</h4>
                                    <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                                        <pre className="text-xs font-mono">
                                            {JSON.stringify(selectedConnection.schema, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="usage" className="flex-1 flex flex-col gap-4 mt-4 min-h-0 overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-900 mb-2">Active Usage</h4>
                                    <p className="text-sm text-slate-500 mb-4">This connection is currently used in the following flows:</p>

                                    {selectedConnection?.used_by && selectedConnection.used_by.length > 0 ? (
                                        <div className="grid gap-2">
                                            {selectedConnection.used_by.map((usage, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-xs">
                                                            {usage.type[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{usage.name}</p>
                                                            <p className="text-xs text-slate-500">Used as {usage.type}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-cyan-600 hover:text-cyan-700" onClick={() => window.location.href = `/dashboard?flowId=${usage.id}`}>
                                                        View Flow
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                                            <p className="text-slate-500">No active flows are using this connection.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Connection</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">{connectionToDelete?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="confirm-name" className="mb-2 block">
                            Type <span className="font-mono font-bold">{connectionToDelete?.name}</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-name"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Type connection name here"
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteConfirmation !== connectionToDelete?.name}
                        >
                            Delete Connection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function ConnectionsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-600" /></div>}>
            <ConnectionsContent />
        </Suspense>
    )
}
