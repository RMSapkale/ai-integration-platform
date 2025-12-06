"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Workflow, DollarSign, Activity } from "lucide-react"

export default function AnalyticsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-slate-600 mt-2">Platform metrics and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { name: "Total Revenue", value: "$127,450", change: "+18.2%", trend: "up", icon: DollarSign },
                    { name: "Active Users", value: "1,234", change: "+12.5%", trend: "up", icon: Users },
                    { name: "Flow Executions", value: "45.2K", change: "+34.1%", trend: "up", icon: Workflow },
                    { name: "API Calls", value: "2.4M", change: "-2.3%", trend: "down", icon: Activity },
                ].map((metric) => (
                    <Card key={metric.name} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <metric.icon className="h-8 w-8 text-cyan-600" />
                            {metric.trend === "up" ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                        </div>
                        <p className="text-sm text-slate-600">{metric.name}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{metric.value}</p>
                        <p className={`text-sm mt-2 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                            {metric.change} from last month
                        </p>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">User Growth</h2>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[45, 52, 48, 65, 72, 68, 85, 92, 88, 105, 112, 120].map((height, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-cyan-600 to-blue-500 rounded-t" style={{ height: `${height}%` }}></div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-500">
                        <span>Jan</span>
                        <span>Dec</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Revenue Breakdown</h2>
                    <div className="space-y-4">
                        {[
                            { plan: "Enterprise Plus", revenue: 45678, percent: 36 },
                            { plan: "Enterprise", revenue: 38900, percent: 30 },
                            { plan: "Professional", revenue: 28450, percent: 22 },
                            { plan: "Starter", revenue: 14422, percent: 12 },
                        ].map((item) => (
                            <div key={item.plan}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">{item.plan}</span>
                                    <span className="text-sm text-slate-600">${item.revenue.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-600 to-blue-500" style={{ width: `${item.percent}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Top Companies by Revenue</h2>
                    <div className="space-y-3">
                        {[
                            { name: "Global Systems", revenue: 5999, users: 120 },
                            { name: "Acme Corp", revenue: 2999, users: 45 },
                            { name: "Tech Inc", revenue: 999, users: 12 },
                            { name: "StartupXYZ", revenue: 299, users: 3 },
                        ].map((company, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium">{company.name}</p>
                                    <p className="text-sm text-slate-600">{company.users} users</p>
                                </div>
                                <p className="text-lg font-bold text-green-600">${company.revenue}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Most Active Flows</h2>
                    <div className="space-y-3">
                        {[
                            { name: "Salesforce to HubSpot Sync", executions: 12450 },
                            { name: "Daily Data Backup", executions: 8920 },
                            { name: "Customer Onboarding", executions: 6780 },
                            { name: "Invoice Processing", executions: 5340 },
                        ].map((flow, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <p className="font-medium">{flow.name}</p>
                                <p className="text-sm text-slate-600">{flow.executions.toLocaleString()} runs</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
