"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Server, Plus, Activity, Shield, Zap, MoreHorizontal, Trash2, Edit } from "lucide-react";
import api from "@/lib/api";

interface APIEndpoint {
    id: string;
    name: string;
    path: string;
    method: string;
    flow_id: string;
    rate_limit: number;
    auth_type: string;
    status: "Active" | "Inactive";
}

interface Flow {
    id: string;
    name: string;
}

export default function APIManagementPage() {
    const [apis, setApis] = useState<APIEndpoint[]>([]);
    const [flows, setFlows] = useState<Flow[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newApi, setNewApi] = useState<Partial<APIEndpoint>>({
        method: "POST",
        rate_limit: 60,
        auth_type: "ApiKey",
        status: "Active"
    });

    useEffect(() => {
        fetchApis();
        fetchFlows();
    }, []);

    const fetchApis = async () => {
        try {
            const res = await api.get("/apis");
            setApis(res.data.apis || []);
        } catch (error) {
            console.error("Failed to fetch APIs", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFlows = async () => {
        try {
            const res = await api.get("/flows");
            setFlows(res.data.flows || []);
        } catch (error) {
            console.error("Failed to fetch flows", error);
        }
    };

    const handleCreate = async () => {
        try {
            await api.post("/apis", newApi);
            setIsCreateOpen(false);
            fetchApis();
            setNewApi({ method: "POST", rate_limit: 60, auth_type: "ApiKey", status: "Active" });
        } catch (error) {
            console.error("Failed to create API", error);
        }
    };

    return (
        <div className="flex-1 p-8 bg-slate-50 min-h-screen text-slate-900 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">API Management</h1>
                        <p className="text-slate-500 mt-1">Expose your integration flows as managed APIs.</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Create API
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white text-slate-900 border-slate-200">
                            <DialogHeader>
                                <DialogTitle>Create Managed API</DialogTitle>
                                <DialogDescription>
                                    Expose an integration flow as a REST endpoint.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">API Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Order Sync API"
                                        value={newApi.name || ""}
                                        onChange={(e) => setNewApi({ ...newApi, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-1 grid gap-2">
                                        <Label htmlFor="method">Method</Label>
                                        <Select
                                            value={newApi.method}
                                            onValueChange={(val) => setNewApi({ ...newApi, method: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GET">GET</SelectItem>
                                                <SelectItem value="POST">POST</SelectItem>
                                                <SelectItem value="PUT">PUT</SelectItem>
                                                <SelectItem value="DELETE">DELETE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3 grid gap-2">
                                        <Label htmlFor="path">Path</Label>
                                        <Input
                                            id="path"
                                            placeholder="/api/v1/resource"
                                            value={newApi.path || ""}
                                            onChange={(e) => setNewApi({ ...newApi, path: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="flow">Target Flow</Label>
                                    <Select
                                        value={newApi.flow_id}
                                        onValueChange={(val) => setNewApi({ ...newApi, flow_id: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a flow to trigger" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {flows.map((flow) => (
                                                <SelectItem key={flow.id} value={flow.id}>
                                                    {flow.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="rate_limit">Rate Limit (req/min)</Label>
                                        <Input
                                            id="rate_limit"
                                            type="number"
                                            value={newApi.rate_limit}
                                            onChange={(e) => setNewApi({ ...newApi, rate_limit: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="auth">Authentication</Label>
                                        <Select
                                            value={newApi.auth_type}
                                            onValueChange={(val) => setNewApi({ ...newApi, auth_type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Auth Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None (Public)</SelectItem>
                                                <SelectItem value="ApiKey">API Key</SelectItem>
                                                <SelectItem value="OAuth2">OAuth2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-700 text-white">Create API</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Requests</CardTitle>
                            <Activity className="h-4 w-4 text-cyan-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">245.8k</div>
                            <p className="text-xs text-slate-500 mt-1">+12% from last month</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Avg Latency</CardTitle>
                            <Zap className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">124ms</div>
                            <p className="text-xs text-slate-500 mt-1">-5ms from last week</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active Policies</CardTitle>
                            <Shield className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">8</div>
                            <p className="text-xs text-slate-500 mt-1">Rate limiting & Auth enabled</p>
                        </CardContent>
                    </Card>
                </div>

                {/* API List */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Managed APIs</CardTitle>
                        <CardDescription>List of active API endpoints and their configurations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading APIs...</div>
                        ) : apis.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Server className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                                <p>No APIs created yet.</p>
                                <Button variant="link" onClick={() => setIsCreateOpen(true)} className="text-cyan-600">Create your first API</Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Path</TableHead>
                                        <TableHead>Target Flow</TableHead>
                                        <TableHead>Auth</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apis.map((api) => (
                                        <TableRow key={api.id}>
                                            <TableCell className="font-medium">{api.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    api.method === 'GET' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                                                        api.method === 'POST' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                                                            api.method === 'DELETE' ? 'border-red-200 bg-red-50 text-red-700' :
                                                                'border-slate-200 bg-slate-50 text-slate-700'
                                                }>
                                                    {api.method}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-600">{api.path}</TableCell>
                                            <TableCell>
                                                {flows.find(f => f.id === api.flow_id)?.name || api.flow_id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Shield className="h-3 w-3" /> {api.auth_type}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={api.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}>
                                                    {api.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-cyan-600">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
