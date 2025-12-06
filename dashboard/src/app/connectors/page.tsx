"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Cloud, MessageSquare, Database } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AdapterField {
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
}

interface AdapterAction {
    name: string;
    label: string;
    description: string;
}

interface Adapter {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    connection_fields: AdapterField[];
    actions: AdapterAction[];
}

const iconMap: any = {
    Globe: Globe,
    Cloud: Cloud,
    MessageSquare: MessageSquare,
    Database: Database,
};

export default function ConnectorsPage() {
    const [adapters, setAdapters] = useState<Adapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedAdapter, setSelectedAdapter] = useState<Adapter | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchAdapters = async () => {
            try {
                const res = await api.get("/adapters");
                setAdapters(res.data.adapters);
            } catch (error) {
                console.error("Failed to fetch adapters", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdapters();
    }, []);

    const categories = ["All", ...Array.from(new Set(adapters.map(a => a.category)))];

    const filteredAdapters = adapters.filter(adapter => {
        const matchesSearch = adapter.name.toLowerCase().includes(search.toLowerCase()) ||
            adapter.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || adapter.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleConfigure = (adapter: Adapter) => {
        setSelectedAdapter(adapter);
        setFormValues({});
        setIsConfigOpen(true);
    };

    const handleInputChange = (name: string, value: any) => {
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const isFieldVisible = (adapterId: string, fieldName: string, values: Record<string, any>) => {
        if (adapterId !== 'http') return true;

        const authType = values['auth_type'];

        if (fieldName === 'base_url' || fieldName === 'auth_type') return true;

        if (authType === 'Basic') {
            return ['username', 'password'].includes(fieldName);
        }
        if (authType === 'Bearer') {
            return ['token'].includes(fieldName);
        }
        if (authType === 'ApiKey') {
            return ['api_key_key', 'api_key_value', 'api_key_location'].includes(fieldName);
        }
        if (authType === 'OAuth2') {
            return ['client_id', 'client_secret', 'auth_url', 'token_url', 'scopes', 'grant_type'].includes(fieldName);
        }

        return false;
    };

    const handleSaveConfiguration = async () => {
        if (!selectedAdapter) return;

        try {
            await api.post("/connections", {
                adapter_id: selectedAdapter.id,
                name: formValues.name || `${selectedAdapter.name} Connection`,
                config: formValues
            });
            setIsConfigOpen(false);
            setFormValues({});
            // Optional: Show success toast
        } catch (error) {
            console.error("Failed to save connection", error);
        }
    };

    return (
        <div className="h-full bg-slate-50">
            <div className="max-w-6xl mx-auto">
                {/* ... existing code ... */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Connector Library</h1>
                        <p className="text-slate-500 mt-2">Browse and configure {adapters.length} enterprise integration adapters.</p>
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <input
                        className="flex-1 p-2 border rounded-md"
                        placeholder="Search connectors (e.g., Salesforce, Oracle)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="p-2 border rounded-md"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAdapters.map((adapter) => {
                            const Icon = iconMap[adapter.icon] || Globe;
                            return (
                                <Card key={adapter.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <CardTitle>{adapter.name}</CardTitle>
                                            <Badge variant="secondary" className="mt-1">{adapter.category}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-4 h-10 line-clamp-2">{adapter.description}</CardDescription>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase">Actions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {adapter.actions.slice(0, 3).map((action) => (
                                                    <Badge key={action.name} variant="outline" className="text-xs">
                                                        {action.label}
                                                    </Badge>
                                                ))}
                                                {adapter.actions.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">+{adapter.actions.length - 3} more</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white"
                                            onClick={() => handleConfigure(adapter)}
                                        >
                                            Configure
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Configure {selectedAdapter?.name}</DialogTitle>
                        <DialogDescription>
                            Enter the connection details for this adapter.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="conn_name" className="text-right">
                                Connection Name
                            </Label>
                            <Input
                                id="conn_name"
                                className="col-span-3"
                                placeholder="e.g., Production Salesforce"
                                value={formValues.name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                            />
                        </div>

                        {selectedAdapter?.connection_fields.map((field) => {
                            if (!isFieldVisible(selectedAdapter.id, field.name, formValues)) return null;

                            return (
                                <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={field.name} className="text-right">
                                        {field.label}
                                    </Label>
                                    {field.type === 'select' ? (
                                        <select
                                            id={field.name}
                                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formValues[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        >
                                            <option value="" disabled>Select {field.label}</option>
                                            {field.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <Input
                                            id={field.name}
                                            type={field.type === "password" ? "password" : "text"}
                                            className="col-span-3"
                                            placeholder={`Enter ${field.label}`}
                                            value={formValues[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveConfiguration}>Save Configuration</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
