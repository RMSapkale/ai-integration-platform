"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, Trash2 } from "lucide-react"
import axios from "axios"

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function TeamPage() {
    const [users, setUsers] = useState<User[]>([
        { id: "1", name: "Amol", email: "amol@antigravity.com", role: "OWNER" },
        { id: "2", name: "Sarah Smith", email: "sarah@antigravity.com", role: "ADMIN" },
        { id: "3", name: "John Doe", email: "john@antigravity.com", role: "MEMBER" },
    ])
    const [loading, setLoading] = useState(false)
    const [inviteEmail, setInviteEmail] = useState("")
    const [inviting, setInviting] = useState(false)

    const handleInvite = async () => {
        if (!inviteEmail) return
        setInviting(true)
        // Simulate API call
        setTimeout(() => {
            setUsers([...users, { id: Date.now().toString(), name: "", email: inviteEmail, role: "MEMBER" }])
            setInviteEmail("")
            setInviting(false)
        }, 1000)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Team Management</h2>
            </div>
            <div className="grid gap-8">
                {/* Invite Section */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Invite New Member</CardTitle>
                        <CardDescription>Add a team member by email. They will be added as a MEMBER.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Input
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="max-w-md"
                        />
                        <Button onClick={handleInvite} disabled={inviting || !inviteEmail}>
                            {inviting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Invite
                        </Button>
                    </CardContent>
                </Card>

                {/* Members List */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Team Members ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-cyan-600" /></div>
                        ) : (
                            <div className="space-y-4">
                                {users.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {user.name?.[0] || user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.name || "Pending Invite"}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={user.role === "OWNER" ? "default" : "secondary"} className={user.role === "OWNER" ? "bg-blue-600" : "bg-slate-100 text-slate-700"}>
                                                {user.role}
                                            </Badge>
                                            {user.role !== "OWNER" && (
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
