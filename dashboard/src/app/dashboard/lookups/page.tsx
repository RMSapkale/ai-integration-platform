"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Download, Upload, Trash2, Edit, Database, FileText } from "lucide-react"

export default function LookupsPage() {
    const [lookups, setLookups] = useState<any[]>([])
    const [selectedLookup, setSelectedLookup] = useState<any | null>(null)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

    // Form states
    const [newLookup, setNewLookup] = useState({
        id: "",
        name: "",
        description: "",
        type: "key_value",
        data: [] as any[],
        tags: [] as string[]
    })

    const [csvContent, setCsvContent] = useState("")
    const [newEntry, setNewEntry] = useState({ key: "", value: "" })

    useEffect(() => {
        fetchLookups()
    }, [])

    const fetchLookups = async () => {
        try {
            const res = await api.get("/lookups")
            setLookups(res.data.lookups || [])
        } catch (error) {
            console.error("Error fetching lookups:", error)
        }
    }

    const createLookup = async () => {
        try {
            await api.post("/lookups", newLookup)
            setIsCreateDialogOpen(false)
            setNewLookup({
                id: "",
                name: "",
                description: "",
                type: "key_value",
                data: [],
                tags: []
            })
            fetchLookups()
        } catch (error) {
            console.error("Error creating lookup:", error)
        }
    }

    const updateLookup = async () => {
        if (!selectedLookup) return
        try {
            await api.put(`/lookups/${selectedLookup.id}`, {
                name: selectedLookup.name,
                description: selectedLookup.description,
                data: selectedLookup.data,
                tags: selectedLookup.tags
            })
            setIsEditDialogOpen(false)
            setSelectedLookup(null)
            fetchLookups()
        } catch (error) {
            console.error("Error updating lookup:", error)
        }
    }

    const deleteLookup = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lookup table?")) return
        try {
            await api.delete(`/lookups/${id}`)
            fetchLookups()
        } catch (error) {
            console.error("Error deleting lookup:", error)
        }
    }

    const importCSV = async (lookupId: string) => {
        try {
            await api.post(`/lookups/${lookupId}/import-csv`, {
                csv_content: csvContent,
                has_header: true
            })
            setIsImportDialogOpen(false)
            setCsvContent("")
            fetchLookups()
        } catch (error) {
            console.error("Error importing CSV:", error)
        }
    }

    const exportCSV = async (lookupId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/lookups/${lookupId}/export-csv`)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${lookupId}.csv`
            a.click()
        } catch (error) {
            console.error("Error exporting CSV:", error)
        }
    }

    const addEntry = () => {
        if (newEntry.key && newEntry.value) {
            setNewLookup({
                ...newLookup,
                data: [...newLookup.data, { ...newEntry }]
            })
            setNewEntry({ key: "", value: "" })
        }
    }

    const addEntryToExisting = () => {
        if (!selectedLookup || !newEntry.key || !newEntry.value) return
        setSelectedLookup({
            ...selectedLookup,
            data: [...selectedLookup.data, { ...newEntry }]
        })
        setNewEntry({ key: "", value: "" })
    }

    const removeEntry = (index: number, isNew: boolean = true) => {
        if (isNew) {
            setNewLookup({
                ...newLookup,
                data: newLookup.data.filter((_, i) => i !== index)
            })
        } else if (selectedLookup) {
            setSelectedLookup({
                ...selectedLookup,
                data: selectedLookup.data.filter((_: any, i: number) => i !== index)
            })
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Lookup Tables</h1>
                    <p className="text-slate-600 mt-1">Manage reference data and mappings</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-cyan-600 hover:bg-cyan-500">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Lookup
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Lookup Table</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">ID</label>
                                <Input
                                    placeholder="e.g., dept_mapping"
                                    value={newLookup.id}
                                    onChange={(e) => setNewLookup({ ...newLookup, id: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="e.g., Department Code Mapping"
                                    value={newLookup.name}
                                    onChange={(e) => setNewLookup({ ...newLookup, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    placeholder="Describe what this lookup table is for..."
                                    value={newLookup.description}
                                    onChange={(e) => setNewLookup({ ...newLookup, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                                    value={newLookup.type}
                                    onChange={(e) => setNewLookup({ ...newLookup, type: e.target.value })}
                                >
                                    <option value="key_value">Key-Value</option>
                                    <option value="multi_column">Multi-Column</option>
                                    <option value="range">Range-Based</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Data Entries</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        placeholder="Key"
                                        value={newEntry.key}
                                        onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Value"
                                        value={newEntry.value}
                                        onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                                    />
                                    <Button onClick={addEntry}>Add</Button>
                                </div>

                                {newLookup.data.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Key</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead className="w-20">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {newLookup.data.map((entry, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{entry.key}</TableCell>
                                                    <TableCell>{entry.value}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeEntry(index, true)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            <Button onClick={createLookup} className="w-full">
                                Create Lookup Table
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Lookup Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lookups.map((lookup) => (
                    <Card key={lookup.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-cyan-600" />
                                <h3 className="font-bold">{lookup.name}</h3>
                            </div>
                            <Badge variant="outline">{lookup.type}</Badge>
                        </div>

                        {lookup.description && (
                            <p className="text-sm text-slate-600 mb-3">{lookup.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                            <FileText className="h-4 w-4" />
                            <span>{lookup.data?.length || 0} entries</span>
                        </div>

                        {lookup.tags && lookup.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {lookup.tags.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedLookup(lookup)
                                    setIsEditDialogOpen(true)
                                }}
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSelectedLookup(lookup)
                                    setIsImportDialogOpen(true)
                                }}
                            >
                                <Upload className="h-4 w-4 mr-1" />
                                Import
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportCSV(lookup.id)}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Export
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteLookup(lookup.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {lookups.length === 0 && (
                <div className="text-center py-12">
                    <Database className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No lookup tables yet</h3>
                    <p className="text-slate-600 mb-4">Create your first lookup table to manage reference data</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Lookup Table
                    </Button>
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Lookup Table</DialogTitle>
                    </DialogHeader>
                    {selectedLookup && (
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    value={selectedLookup.name}
                                    onChange={(e) => setSelectedLookup({ ...selectedLookup, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={selectedLookup.description || ""}
                                    onChange={(e) => setSelectedLookup({ ...selectedLookup, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Data Entries</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        placeholder="Key"
                                        value={newEntry.key}
                                        onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Value"
                                        value={newEntry.value}
                                        onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                                    />
                                    <Button onClick={addEntryToExisting}>Add</Button>
                                </div>

                                {selectedLookup.data && selectedLookup.data.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Key</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead className="w-20">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedLookup.data.map((entry: any, index: number) => (
                                                <TableRow key={index}>
                                                    <TableCell>{entry.key}</TableCell>
                                                    <TableCell>{entry.value}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeEntry(index, false)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            <Button onClick={updateLookup} className="w-full">
                                Save Changes
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Import CSV Dialog */}
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import CSV</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">CSV Content</label>
                            <Textarea
                                placeholder="key,value&#10;IT,10001&#10;HR,10002"
                                value={csvContent}
                                onChange={(e) => setCsvContent(e.target.value)}
                                rows={10}
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                First row should contain column headers
                            </p>
                        </div>
                        <Button
                            onClick={() => selectedLookup && importCSV(selectedLookup.id)}
                            className="w-full"
                        >
                            Import CSV
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
