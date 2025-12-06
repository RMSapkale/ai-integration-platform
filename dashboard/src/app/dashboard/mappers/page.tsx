"use client"

import { useEffect, useState, Suspense } from "react"
import api from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, Code, FileCode, Settings, Trash2, Play, Plus, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MappingRule {
    source_field: string;
    target_field: string;
    transformation?: string;
    condition?: string;
}

interface Mapper {
    id: string;
    name: string;
    description?: string;
    type: string;
    mapping_rules?: MappingRule[];
    javascript_code?: string;
    xslt_template?: string;
    source_schema?: any;
    target_schema?: any;
    created_at?: string;
    updated_at?: string;
    used_by?: { id: string, name: string }[];
    usage_count?: number;
}

const typeIcons: any = {
    "visual": GitBranch,
    "javascript": Code,
    "xslt": FileCode,
    "hybrid": Settings
};

function MappersContent() {
    const searchParams = useSearchParams()
    const editId = searchParams.get("edit")

    const [mappers, setMappers] = useState<Mapper[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedMapper, setSelectedMapper] = useState<Mapper | null>(null)

    // Create/Edit State
    const [mapperName, setMapperName] = useState("")
    const [mapperDescription, setMapperDescription] = useState("")
    const [mapperType, setMapperType] = useState("visual")
    const [javascriptCode, setJavascriptCode] = useState("")
    const [xsltTemplate, setXsltTemplate] = useState("")
    const [mappingRules, setMappingRules] = useState<MappingRule[]>([])

    // Test State
    const [isTestOpen, setIsTestOpen] = useState(false)
    const [testInput, setTestInput] = useState("{}")
    const [testOutput, setTestOutput] = useState<any>(null)
    const [isTesting, setIsTesting] = useState(false)

    // Delete State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [mapperToDelete, setMapperToDelete] = useState<Mapper | null>(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState("")

    const fetchMappers = async () => {
        setLoading(true)
        try {
            const res = await api.get("/mappers")
            setMappers(res.data.mappers)
        } catch (error) {
            console.error("Failed to fetch mappers", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMappers()
    }, [])

    // Effect to handle auto-edit
    useEffect(() => {
        if (editId && mappers.length > 0) {
            const mapperToEdit = mappers.find(m => m.id === editId)
            if (mapperToEdit) {
                handleEditMapper(mapperToEdit)
            }
        }
    }, [editId, mappers])

    const handleCreateMapper = async () => {
        try {
            const newMapper = {
                name: mapperName,
                description: mapperDescription,
                type: mapperType,
                mapping_rules: mapperType === "visual" ? mappingRules : undefined,
                javascript_code: mapperType === "javascript" ? javascriptCode : undefined,
                xslt_template: mapperType === "xslt" ? xsltTemplate : undefined
            }

            await api.post("/mappers", newMapper)
            setIsCreateOpen(false)
            resetForm()
            fetchMappers()
        } catch (error) {
            console.error("Failed to create mapper", error)
        }
    }

    const handleEditMapper = (mapper: Mapper) => {
        setSelectedMapper(mapper)
        setMapperName(mapper.name)
        setMapperDescription(mapper.description || "")
        setMapperType(mapper.type)
        setMappingRules(mapper.mapping_rules || [])
        setJavascriptCode(mapper.javascript_code || "")
        setXsltTemplate(mapper.xslt_template || "")
        setIsEditOpen(true)
    }

    const handleUpdateMapper = async () => {
        if (!selectedMapper) return

        try {
            const update = {
                name: mapperName,
                description: mapperDescription,
                type: mapperType,
                mapping_rules: mapperType === "visual" ? mappingRules : undefined,
                javascript_code: mapperType === "javascript" ? javascriptCode : undefined,
                xslt_template: mapperType === "xslt" ? xsltTemplate : undefined
            }

            await api.put(`/mappers/${selectedMapper.id}`, update)
            setIsEditOpen(false)
            resetForm()
            fetchMappers()
        } catch (error) {
            console.error("Failed to update mapper", error)
        }
    }

    const handleTestMapper = async (mapper: Mapper) => {
        setSelectedMapper(mapper)
        setTestInput(JSON.stringify({ name: "John Doe", email: "john@example.com" }, null, 2))
        setTestOutput(null)
        setIsTestOpen(true)
    }

    const runTest = async () => {
        if (!selectedMapper) return

        setIsTesting(true)
        try {
            const input = JSON.parse(testInput)
            const res = await api.post(`/mappers/${selectedMapper.id}/test`, { sample_input: input })
            setTestOutput(res.data)
        } catch (error) {
            console.error("Test failed", error)
            setTestOutput({ error: "Test failed. Check input format." })
        } finally {
            setIsTesting(false)
        }
    }

    const confirmDelete = (mapper: Mapper) => {
        setMapperToDelete(mapper)
        setDeleteConfirmation("")
        setIsDeleteOpen(true)
    }

    const handleDelete = async () => {
        if (!mapperToDelete) return

        try {
            await api.delete(`/mappers/${mapperToDelete.id}`)
            setMappers(mappers.filter(m => m.id !== mapperToDelete.id))
            setIsDeleteOpen(false)
            setMapperToDelete(null)
        } catch (error) {
            console.error("Failed to delete mapper", error)
        }
    }

    const resetForm = () => {
        setMapperName("")
        setMapperDescription("")
        setMapperType("visual")
        setJavascriptCode("")
        setXsltTemplate("")
        setMappingRules([])
        setSelectedMapper(null)
    }

    const addMappingRule = () => {
        setMappingRules([...mappingRules, { source_field: "", target_field: "", transformation: "" }])
    }

    const updateMappingRule = (index: number, field: keyof MappingRule, value: string) => {
        const newRules = [...mappingRules]
        newRules[index] = { ...newRules[index], [field]: value }
        setMappingRules(newRules)
    }

    const removeMappingRule = (index: number) => {
        setMappingRules(mappingRules.filter((_, i) => i !== index))
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mappers</h2>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-cyan-600 hover:bg-cyan-500">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Mapper
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin h-8 w-8 text-cyan-600" />
                </div>
            ) : mappers.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-slate-500">No mappers created yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Create your first data transformation mapper.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mappers.map((mapper) => {
                        const Icon = typeIcons[mapper.type] || GitBranch
                        const usageCount = mapper.usage_count || 0

                        return (
                            <Card key={mapper.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 rounded-md">
                                            <Icon className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-medium text-slate-900">
                                                {mapper.name}
                                            </CardTitle>
                                            <p className="text-xs text-slate-500 capitalize">{mapper.type}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    {mapper.description && (
                                        <p className="text-sm text-slate-600 mb-3">{mapper.description}</p>
                                    )}
                                    <div className="mb-4">
                                        <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200">
                                            Used in {usageCount} Flows
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-500 hover:text-slate-900"
                                            onClick={() => handleTestMapper(mapper)}
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Test
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-slate-500 hover:text-slate-900"
                                            onClick={() => handleEditMapper(mapper)}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => confirmDelete(mapper)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create Mapper Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Create New Mapper</DialogTitle>
                        <DialogDescription>
                            Create a data transformation mapper with visual mapping, JavaScript, or XSLT.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        <div className="grid gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="mapper-name">Mapper Name</Label>
                                <Input
                                    id="mapper-name"
                                    value={mapperName}
                                    onChange={(e) => setMapperName(e.target.value)}
                                    placeholder="e.g., Workday to Oracle HCM Mapper"
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="mapper-description">Description</Label>
                                <Input
                                    id="mapper-description"
                                    value={mapperDescription}
                                    onChange={(e) => setMapperDescription(e.target.value)}
                                    placeholder="Brief description of this mapper"
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="mapper-type">Mapper Type</Label>
                                <Select value={mapperType} onValueChange={setMapperType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="visual">Visual Mapping</SelectItem>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="xslt">XSLT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {mapperType === "visual" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Mapping Rules</Label>
                                    <Button size="sm" variant="outline" onClick={addMappingRule}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Rule
                                    </Button>
                                </div>
                                {mappingRules.map((rule, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                                        <Input
                                            placeholder="Source Field"
                                            value={rule.source_field}
                                            onChange={(e) => updateMappingRule(index, "source_field", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Target Field"
                                            value={rule.target_field}
                                            onChange={(e) => updateMappingRule(index, "target_field", e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Transform"
                                                value={rule.transformation || ""}
                                                onChange={(e) => updateMappingRule(index, "transformation", e.target.value)}
                                            />
                                            <Button size="sm" variant="ghost" onClick={() => removeMappingRule(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {mapperType === "javascript" && (
                            <div className="space-y-2">
                                <Label>JavaScript Code</Label>
                                <Textarea
                                    value={javascriptCode}
                                    onChange={(e) => setJavascriptCode(e.target.value)}
                                    placeholder="// Write your transformation code here&#10;function transform(input) {&#10;  return {&#10;    name: input.fullName,&#10;    email: input.emailAddress&#10;  };&#10;}"
                                    className="font-mono text-sm h-64"
                                />
                            </div>
                        )}

                        {mapperType === "xslt" && (
                            <div className="space-y-2">
                                <Label>XSLT Template</Label>
                                <Textarea
                                    value={xsltTemplate}
                                    onChange={(e) => setXsltTemplate(e.target.value)}
                                    placeholder="<xsl:stylesheet version=&quot;1.0&quot;>&#10;  <!-- Your XSLT template -->&#10;</xsl:stylesheet>"
                                    className="font-mono text-sm h-64"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateMapper} className="bg-cyan-600 hover:bg-cyan-500">
                            Create Mapper
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Mapper Dialog - Similar to Create */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Mapper: {selectedMapper?.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {/* Same form fields as create */}
                        <div className="grid gap-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="edit-mapper-name">Mapper Name</Label>
                                <Input
                                    id="edit-mapper-name"
                                    value={mapperName}
                                    onChange={(e) => setMapperName(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="edit-mapper-description">Description</Label>
                                <Input
                                    id="edit-mapper-description"
                                    value={mapperDescription}
                                    onChange={(e) => setMapperDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {mapperType === "visual" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Mapping Rules</Label>
                                    <Button size="sm" variant="outline" onClick={addMappingRule}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Rule
                                    </Button>
                                </div>
                                {mappingRules.map((rule, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                                        <Input
                                            placeholder="Source Field"
                                            value={rule.source_field}
                                            onChange={(e) => updateMappingRule(index, "source_field", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Target Field"
                                            value={rule.target_field}
                                            onChange={(e) => updateMappingRule(index, "target_field", e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Transform"
                                                value={rule.transformation || ""}
                                                onChange={(e) => updateMappingRule(index, "transformation", e.target.value)}
                                            />
                                            <Button size="sm" variant="ghost" onClick={() => removeMappingRule(index)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {mapperType === "javascript" && (
                            <div className="space-y-2">
                                <Label>JavaScript Code</Label>
                                <Textarea
                                    value={javascriptCode}
                                    onChange={(e) => setJavascriptCode(e.target.value)}
                                    className="font-mono text-sm h-64"
                                />
                            </div>
                        )}

                        {mapperType === "xslt" && (
                            <div className="space-y-2">
                                <Label>XSLT Template</Label>
                                <Textarea
                                    value={xsltTemplate}
                                    onChange={(e) => setXsltTemplate(e.target.value)}
                                    className="font-mono text-sm h-64"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateMapper} className="bg-cyan-600 hover:bg-cyan-500">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Mapper Dialog */}
            <Dialog open={isTestOpen} onOpenChange={setIsTestOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Test Mapper: {selectedMapper?.name}</DialogTitle>
                        <DialogDescription>
                            Test your mapper with sample input data
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Sample Input (JSON)</Label>
                            <Textarea
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                className="font-mono text-sm h-64"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Output</Label>
                            <Textarea
                                value={testOutput ? JSON.stringify(testOutput, null, 2) : ""}
                                readOnly
                                className="font-mono text-sm h-64 bg-slate-50"
                                placeholder="Output will appear here..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTestOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={runTest} disabled={isTesting} className="bg-cyan-600 hover:bg-cyan-500">
                            {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Run Test
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Mapper</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-bold text-slate-900">{mapperToDelete?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="confirm-name" className="mb-2 block">
                            Type <span className="font-mono font-bold">{mapperToDelete?.name}</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-name"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Type mapper name here"
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteConfirmation !== mapperToDelete?.name}
                        >
                            Delete Mapper
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function MappersPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-cyan-600" /></div>}>
            <MappersContent />
        </Suspense>
    )
}
