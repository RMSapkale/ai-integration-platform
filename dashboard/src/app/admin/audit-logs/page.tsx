"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { auditLogAPI } from "@/lib/api-client"

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        try {
            setIsLoading(true)
            const response = await auditLogAPI.list()
            setLogs(response.audit_logs || [])
        } catch (error: any) {
            console.error("Failed to load audit logs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredLogs = logs.filter(log =>
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource_type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
                    <p className="text-slate-600 mt-2">Track all system activities and changes</p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Total Events</p>
                    <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Success</p>
                    <p className="text-2xl font-bold text-green-600">{logs.filter(l => l.status === "success").length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{logs.filter(l => l.status !== "success").length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Today</p>
                    <p className="text-2xl font-bold text-blue-600">{logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}</p>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-6 mb-6">
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search logs by user, action, or resource..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>
            </Card>

            {/* Logs Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-mono text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                                <TableCell>{log.user_id}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600">{log.resource_type}: {log.resource_id || 'N/A'}</TableCell>
                                <TableCell className="font-mono text-sm">{log.ip_address || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={log.status === "success" ? "default" : "destructive"}
                                        className={log.status === "success" ? "bg-green-100 text-green-700 border-green-200" : ""}
                                    >
                                        {log.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
