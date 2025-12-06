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
import { Plus, Search, Edit, Trash2, CreditCard, Users, MoreVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { companyAPI } from "@/lib/api-client"

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: "",
        subscription_plan: "Starter",
        billing_email: "",
    })

    useEffect(() => {
        loadCompanies()
    }, [])

    const loadCompanies = async () => {
        try {
            setIsLoading(true)
            const response = await companyAPI.list()
            setCompanies(response.companies || [])
        } catch (error: any) {
            console.error("Failed to load companies:", error)
            alert(error.message || "Failed to load companies")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCompanies = companies.filter(company =>
        company.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalMRR = companies.reduce((sum, c) => sum + c.mrr, 0)
    const totalUsers = companies.reduce((sum, c) => sum + c.users, 0)

    const handleCreate = async () => {
        try {
            await companyAPI.create(formData)
            await loadCompanies()
            setIsCreateModalOpen(false)
            setFormData({ name: "", subscription_plan: "Starter", billing_email: "" })
        } catch (error: any) {
            console.error("Failed to create company:", error)
            alert(error.message || "Failed to create company")
        }
    }

    const handleEdit = async () => {
        try {
            await companyAPI.update(selectedCompany.id, formData)
            await loadCompanies()
            setIsEditModalOpen(false)
        } catch (error: any) {
            console.error("Failed to update company:", error)
            alert(error.message || "Failed to update company")
        }
    }

    const handleDelete = async () => {
        try {
            await companyAPI.delete(selectedCompany.id)
            await loadCompanies()
            setIsDeleteModalOpen(false)
            setSelectedCompany(null)
        } catch (error: any) {
            console.error("Failed to delete company:", error)
            alert(error.message || "Failed to delete company")
        }
    }

    const openEditModal = (company: any) => {
        setSelectedCompany(company)
        setFormData({
            name: company.name,
            subscription_plan: company.subscription_plan,
            billing_email: company.billing_email || "",
        })
        setIsEditModalOpen(true)
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Company Management</h1>
                    <p className="text-slate-600 mt-2">Manage organizations and subscriptions</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Company
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Total Companies</p>
                    <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${totalMRR.toLocaleString()}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-slate-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-purple-600">{companies.filter(c => c.status === "active").length}</p>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-6 mb-6">
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0"
                    />
                </div>
            </Card>

            {/* Companies Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>MRR</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCompanies.map((company) => (
                            <TableRow key={company.id}>
                                <TableCell className="font-medium">{company.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                        {company.subscription_plan}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={company.subscription_status === "active" ? "default" : "secondary"}
                                        className={company.subscription_status === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"}
                                    >
                                        {company.subscription_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">${company.mrr?.toLocaleString() || 0}</TableCell>
                                <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditModal(company)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Billing
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Users className="h-4 w-4 mr-2" />
                                                View Users
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setSelectedCompany(company); setIsDeleteModalOpen(true) }} className="text-red-600">
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

            {/* Create Company Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Company</DialogTitle>
                        <DialogDescription>Add a new organization to the platform</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Company Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Acme Corp"
                            />
                        </div>
                        <div>
                            <Label htmlFor="billing_email">Billing Email</Label>
                            <Input
                                id="billing_email"
                                type="email"
                                value={formData.billing_email}
                                onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                                placeholder="billing@company.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="plan">Subscription Plan</Label>
                            <Select value={formData.subscription_plan} onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Starter">Starter - $299/mo</SelectItem>
                                    <SelectItem value="Professional">Professional - $999/mo</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise - $2,999/mo</SelectItem>
                                    <SelectItem value="Enterprise Plus">Enterprise Plus - Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500">Create Company</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Company Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Company</DialogTitle>
                        <DialogDescription>Update company information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Company Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-billing_email">Billing Email</Label>
                            <Input
                                id="edit-billing_email"
                                type="email"
                                value={formData.billing_email}
                                onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-plan">Subscription Plan</Label>
                            <Select value={formData.subscription_plan} onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Starter">Starter - $299/mo</SelectItem>
                                    <SelectItem value="Professional">Professional - $999/mo</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise - $2,999/mo</SelectItem>
                                    <SelectItem value="Enterprise Plus">Enterprise Plus - Custom</SelectItem>
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
                        <DialogTitle>Delete Company</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedCompany?.name}? This will also delete all associated users and data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Company</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
