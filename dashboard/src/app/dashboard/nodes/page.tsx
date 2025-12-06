"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Server, Database, Cloud, Loader2, Clock } from "lucide-react"

export default function NodesPage() {
    const nodes = [
        { id: 1, name: "US-East-1", type: "Region", status: "Online", load: "45%", icon: Globe },
        { id: 2, name: "Worker-01", type: "Compute", status: "Online", load: "78%", icon: Server },
        { id: 3, name: "Worker-02", type: "Compute", status: "Online", load: "62%", icon: Server },
        { id: 4, name: "Primary-DB", type: "Database", status: "Online", load: "30%", icon: Database },
        { id: 5, name: "Cache-Cluster", type: "Cache", status: "Online", load: "15%", icon: Cloud },
        { id: 6, name: "EU-West-1", type: "Region", status: "Maintenance", load: "0%", icon: Globe },
        { id: 7, name: "Worker-EU-01", type: "Compute", status: "Offline", load: "0%", icon: Server },
        { id: 8, name: "Analytics-DB", type: "Database", status: "Online", load: "88%", icon: Database },
    ]

    const [isLoading, setIsLoading] = useState(false)
    const [nodesList, setNodesList] = useState(nodes)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Connected Nodes</h2>
                <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-cyan-600" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {nodesList.map((node) => (
                        <Card key={node.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    {node.type}
                                </CardTitle>
                                <node.icon className="h-4 w-4 text-slate-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-2">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900">{node.name}</div>
                                        <div className="text-xs text-slate-500 mt-1">Load: {node.load}</div>
                                    </div>
                                    <Badge variant={node.status === "Online" ? "default" : "destructive"} className={node.status === "Online" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : node.status === "Maintenance" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                                        {node.status}
                                    </Badge>
                                </div>
                                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${parseInt(node.load) > 80 ? 'bg-red-500' : parseInt(node.load) > 60 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                        style={{ width: node.load }}
                                    ></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
