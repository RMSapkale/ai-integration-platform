"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Ban, CheckCircle, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { userAPI, companyAPI } from "@/lib/api-client"

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        company_id: undefined as number | undefined,
    })

    // Load users and companies
    useEffect(() => {
        loadUsers()
        loadCompanies()
    }, [])

    const loadUsers = async () => {
        try {
            setIsLoading(true)
            const response = await userAPI.list()
            setUsers(response.users || [])
        } catch (error: any) {
            console.error("Failed to load users:", error)
            alert(error.message || "Failed to load users")
        } finally {
            setIsLoading(false)
        }
    }

    const loadCompanies = async () => {
        try {
            const response = await companyAPI.list()
            setCompanies(response.companies || [])
        } catch (error) {
            console.error("Failed to load companies:", error)
        }
    }

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreate = async () => {
        try {
            if (!formData.password) {
                alert("Password is required")
                return
            }
            await userAPI.create(formData)
            await loadUsers()
            setIsCreateModalOpen(false)
            setFormData({ name: "", email: "", password: "", role: "user", company_id: undefined })
        } catch (error: any) {
            console.error("Failed to create user:", error)
            alert(error.message || "Failed to create user")
        }
    }

    const handleEdit = async () => {
        try {
            const { password, ...updateData } = formData
            await userAPI.update(selectedUser.id, updateData)
            await loadUsers()
            setIsEditModalOpen(false)
            setFormData({ name: "", email: "", password: "", role: "user", company_id: undefined })
        } catch (error: any) {
            console.error("Failed to update user:", error)
            alert(error.message || "Failed to update user")
        }
    }

    const handleDelete = async () => {
        try {
            await userAPI.delete(selectedUser.id)
            await loadUsers()
            setIsDeleteModalOpen(false)
            setSelectedUser(null)
        } catch (error: any) {
            console.error("Failed to delete user:", error)
            alert(error.message || "Failed to delete user")
        }
    }

    const handleSuspend = async (userId: number, currentStatus: string) => {
        try {
            if (currentStatus === "active") {
                await userAPI.suspend(userId)
            } else {
                await userAPI.activate(userId)
            }
            await loadUsers()
        } catch (error: any) {
            console.error("Failed to update user status:", error)
            alert(error.message || "Failed to update user status")
        }
    }

    const openEditModal = (user: any) => {
        setSelectedUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
            company_id: user.company_id,
        })
        setIsEditModalOpen(true)
    }

    const openDeleteModal = (user: any) => {
        setSelectedUser(user)
        setIsDeleteModalOpen(true)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-600 mt-2">Manage all platform users</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === "suspended").length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Admins</p>
                    <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === "admin").length}</p>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-6 mb-6">
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search users by name, email, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>
            </Card>

            {/* Users Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === "active" ? "default" : "destructive"} className={user.status === "active" ? "bg-green-100 text-green-700 border-green-200" : ""}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSuspend(user.id, user.status)}>
                                                {user.status === "active" ? (
                                                    <><Ban className="h-4 w-4 mr-2" />Suspend</>
                                                ) : (
                                                    <><CheckCircle className="h-4 w-4 mr-2" />Activate</>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteModal(user)} className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Create User Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>Add a new user to the platform</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <Label htmlFor="company">Company</Label>
                            <Select value={formData.company_id?.toString()} onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id.toString()}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500">Create User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Update user information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-company">Company</Label>
                            <Select value={formData.company_id?.toString()} onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id.toString()}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleEdit} className="bg-cyan-600 hover:bg-cyan-500">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete User</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
