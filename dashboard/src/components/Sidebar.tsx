"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Activity, Settings, Users, Globe, Server, LogOut, Network, ArrowDownCircle, GitBranch, Workflow, BookOpen, DollarSign } from "lucide-react"
import { signOut } from "next-auth/react"

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Active Flows", href: "/dashboard/flows", icon: Activity },
    { name: "Flow Builder", href: "/dashboard/flow-builder", icon: Workflow },
    { name: "Connections", href: "/dashboard/connections", icon: Network },
    { name: "Mappers", href: "/dashboard/mappers", icon: GitBranch },
    { name: "Lookups", href: "/dashboard/lookups", icon: BookOpen },
    { name: "Connectors", href: "/connectors", icon: Globe },
    { name: "Migration", href: "/dashboard/migration", icon: ArrowDownCircle },
    { name: "API Management", href: "/dashboard/apis", icon: Server },
    { name: "Team", href: "/dashboard/team", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Pricing", href: "/dashboard/pricing", icon: DollarSign, adminOnly: true },
]


export default function Sidebar() {
    const pathname = usePathname()

    // TODO: Implement proper role-based access control
    // For now, show pricing to all users (set to true)
    // In production, check user role from authentication
    const isAdmin = true

    // Filter sidebar items based on role
    const filteredItems = sidebarItems.filter(item => {
        if (item.adminOnly) {
            return isAdmin
        }
        return true
    })

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                    <Image
                        src="/iwings-logo.jpg"
                        alt="Iwings Logo"
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                    Iwings
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-500"
                                )}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Sign Out Button */}
            <div className="border-t border-slate-200 p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
