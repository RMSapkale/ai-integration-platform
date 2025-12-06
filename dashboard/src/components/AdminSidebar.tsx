"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    Building2,
    Workflow,
    Network,
    Puzzle,
    BarChart3,
    CreditCard,
    Settings,
    FileText,
    LogOut,
    Shield
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const adminNavItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Companies", href: "/admin/companies", icon: Building2 },
    { name: "Flows", href: "/admin/flows", icon: Workflow },
    { name: "Connections", href: "/admin/connections", icon: Network },
    { name: "Adapters", href: "/admin/adapters", icon: Puzzle },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Billing", href: "/admin/billing", icon: CreditCard },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { logout } = useAuth()

    const handleSignOut = () => {
        logout()
        router.push('/admin/login')
    }

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-900 text-white">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-6">
                <Shield className="h-8 w-8 text-cyan-400" />
                <div>
                    <div className="text-lg font-bold">Admin Panel</div>
                    <div className="text-xs text-slate-400">Iwings Platform</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                {adminNavItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/50"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                )}
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Back to Dashboard & Sign Out */}
            <div className="border-t border-slate-700 p-4 space-y-2">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <LayoutDashboard className="mr-3 h-5 w-5" />
                        Back to Dashboard
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
