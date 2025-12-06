import AdminSidebar from "@/components/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full bg-slate-50">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
