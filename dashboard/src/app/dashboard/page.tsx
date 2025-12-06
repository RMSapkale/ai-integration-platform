"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUpRight, Cpu, Globe, Zap, Layers, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen text-slate-900 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your integration mesh.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-sm shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              System Operational
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Active Flows", value: "12", icon: Activity, color: "text-cyan-600", trend: "+2.5%", href: "/dashboard/flows" },
            { title: "Events Processed", value: "1.2M", icon: Zap, color: "text-violet-600", trend: "+14%", href: "/dashboard/events" },
            { title: "Connected Nodes", value: "8", icon: Globe, color: "text-blue-600", trend: "+1", href: "/dashboard/nodes" },
            { title: "Avg Latency", value: "45ms", icon: Cpu, color: "text-cyan-500", trend: "-12%", href: "#" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={stat.href} className={stat.href !== "#" ? "cursor-pointer" : ""}>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-cyan-200 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-cyan-600 transition-colors">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <span className="text-emerald-600 mr-1">{stat.trend}</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Chat Interface - Takes up 3 columns for more width */}
          <motion.div
            className="lg:col-span-3 h-[750px] rounded-xl border border-slate-200 bg-white overflow-hidden relative shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-grid-slate-100/[0.5] bg-[size:20px_20px]"></div>
            <div className="relative h-full flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-cyan-600" />
                  <h3 className="font-semibold text-slate-900">Neural Architect</h3>
                </div>
                <span className="text-xs text-slate-500">v2.1.0</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>
          </motion.div>

          {/* Recent Activity - Takes up 1 column */}
          <motion.div
            className="lg:col-span-1 space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white border-slate-200 shadow-sm h-full max-h-[365px] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Live Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { msg: "Salesforce Adapter connected", time: "2m ago", type: "success" },
                    { msg: "Flow 'Order Sync' triggered", time: "5m ago", type: "info" },
                    { msg: "High latency detected on Node-4", time: "12m ago", type: "warning" },
                    { msg: "New schema version deployed", time: "1h ago", type: "success" },
                    { msg: "User 'Admin' logged in", time: "2h ago", type: "info" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className={`mt-1 h-2 w-2 rounded-full ${item.type === 'success' ? 'bg-emerald-500' : item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="text-sm text-slate-700 leading-none">{item.msg}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100 shadow-sm h-[365px]">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Control Plane</span>
                    <span className="text-emerald-600">Operational</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Data Plane (Go)</span>
                    <span className="text-emerald-600">Operational</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Neural Engine</span>
                    <span className="text-yellow-600">High Load</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[85%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
