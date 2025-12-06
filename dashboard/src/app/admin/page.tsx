"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, Building2, Workflow, Network, TrendingUp, Activity } from "lucide-react"
import { analyticsAPI } from "@/lib/api-client"

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState({
        total_users: 0,
        active_users: 0,
        suspended_users: 0,
        total_companies: 0,
        total_mrr: 0,
        admin_users: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadAnalytics()
    }, [])

    const loadAnalytics = async () => {
        try {
            setIsLoading(true)
            const data = await analyticsAPI.getOverview()
            setAnalytics(data)
        } catch (error) {
            console.error("Failed to load analytics:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const stats = [
        { name: "Total Users", value: analytics.total_users.toString(), icon: Users, change: "+12%", color: "text-blue-600 bg-blue-100" },
        { name: "Companies", value: analytics.total_companies.toString(), icon: Building2, change: "+5%", color: "text-purple-600 bg-purple-100" },
        { name: "Active Users", value: analytics.active_users.toString(), icon: Workflow, change: "+23%", color: "text-cyan-600 bg-cyan-100" },
        { name: "Suspended Users", value: analytics.suspended_users.toString(), icon: Network, change: "+8%", color: "text-red-600 bg-red-100" },
        { name: "Monthly Revenue", value: `$${analytics.total_mrr.toLocaleString()}`, icon: TrendingUp, change: "+18%", color: "text-emerald-600 bg-emerald-100" },
        { name: "Admin Users", value: analytics.admin_users.toString(), icon: Activity, change: "+34%", color: "text-orange-600 bg-orange-100" },
    ]

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome to the admin control panel</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.name} className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { user: "John Doe", action: "created a new flow", time: "2 minutes ago" },
                            { user: "Jane Smith", action: "updated connection", time: "15 minutes ago" },
                            { user: "Acme Corp", action: "upgraded to Enterprise", time: "1 hour ago" },
                            { user: "Bob Wilson", action: "created 3 new adapters", time: "2 hours ago" },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-900">{activity.user}</p>
                                    <p className="text-sm text-slate-600">{activity.action}</p>
                                </div>
                                <p className="text-xs text-slate-500">{activity.time}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">System Health</h2>
                    <div className="space-y-4">
                        {[
                            { name: "API Server", status: "Operational", color: "bg-green-500" },
                            { name: "Database", status: "Operational", color: "bg-green-500" },
                            { name: "Queue System", status: "Operational", color: "bg-green-500" },
                            { name: "Email Service", status: "Degraded", color: "bg-yellow-500" },
                        ].map((service, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${service.color}`}></div>
                                    <p className="font-medium text-slate-900">{service.name}</p>
                                </div>
                                <p className="text-sm text-slate-600">{service.status}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
