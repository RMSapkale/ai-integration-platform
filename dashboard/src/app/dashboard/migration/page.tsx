"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Database, Layers, Zap, ArrowRight, ChevronLeft, ShieldCheck, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Platform {
    id: string;
    name: string;
    icon: string;
}

interface MigrationStats {
    platform: string;
    flows_found: number;
    connections_found: number;
    complexity: string;
}

const iconMap: any = {
    Database: Database,
    Layers: Layers,
    Zap: Zap
};

export default function MigrationPage() {
    const [step, setStep] = useState(1);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [credentials, setCredentials] = useState({ url: "", clientId: "", clientSecret: "" });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<MigrationStats | null>(null);
    const [migrationResult, setMigrationResult] = useState<any>(null);

    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const res = await api.get("/migration/platforms");
                setPlatforms(res.data.platforms);
            } catch (error) {
                console.error("Failed to fetch platforms", error);
            }
        };
        fetchPlatforms();
    }, []);

    const handleAnalyze = async () => {
        if (!selectedPlatform) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Smooth delay
            const res = await api.post("/migration/analyze", {
                platform_id: selectedPlatform,
                credentials: credentials
            });
            setStats(res.data.stats);
            setStep(3);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!selectedPlatform) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Smooth delay
            const res = await api.post("/migration/execute", {
                platform_id: selectedPlatform,
                credentials: credentials
            });
            setMigrationResult(res.data.result);
            setStep(4);
        } catch (error) {
            console.error("Migration failed", error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: "Select Platform" },
        { id: 2, title: "Connect" },
        { id: 3, title: "Analyze" },
        { id: 4, title: "Migrate" }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">One-Click Migration</h1>
                    <p className="text-slate-500">Seamlessly import your integrations from legacy platforms.</p>
                </div>

                {/* Stepper */}
                <div className="relative flex justify-between items-center px-12">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 h-0.5 bg-cyan-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    backgroundColor: step >= s.id ? "#06b6d4" : "#e2e8f0",
                                    color: step >= s.id ? "#ffffff" : "#64748b",
                                    scale: step === s.id ? 1.1 : 1
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10"
                            >
                                {step > s.id ? <CheckCircle size={16} /> : s.id}
                            </motion.div>
                            <span className={`text-xs font-medium ${step >= s.id ? 'text-cyan-700' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-2xl">
                    <CardContent className="p-8 min-h-[400px] flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col"
                            >
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h2 className="text-xl font-semibold text-slate-900">Select Source Platform</h2>
                                            <p className="text-sm text-slate-500 mt-1">Choose where you want to migrate from</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                            {platforms.map((platform) => {
                                                const Icon = iconMap[platform.icon] || Database;
                                                const isSelected = selectedPlatform === platform.id;
                                                return (
                                                    <div
                                                        key={platform.id}
                                                        onClick={() => setSelectedPlatform(platform.id)}
                                                        className={`
                                                            relative group cursor-pointer rounded-xl p-6 border-2 transition-all duration-200
                                                            flex flex-col items-center justify-center gap-4 text-center
                                                            ${isSelected
                                                                ? 'border-cyan-500 bg-cyan-50/50 shadow-md shadow-cyan-100'
                                                                : 'border-slate-100 hover:border-cyan-200 hover:bg-slate-50'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            p-4 rounded-full transition-colors
                                                            ${isSelected ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-cyan-500'}
                                                        `}>
                                                            <Icon size={32} />
                                                        </div>
                                                        <span className={`font-medium ${isSelected ? 'text-cyan-900' : 'text-slate-600'}`}>
                                                            {platform.name}
                                                        </span>
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 text-cyan-500">
                                                                <CheckCircle size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="max-w-md mx-auto w-full space-y-6">
                                        <div className="text-center">
                                            <h2 className="text-xl font-semibold text-slate-900">Connect to {platforms.find(p => p.id === selectedPlatform)?.name}</h2>
                                            <p className="text-sm text-slate-500 mt-1">Enter your credentials to securely scan for integrations</p>
                                        </div>

                                        <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Instance URL</Label>
                                                <div className="relative">
                                                    <Server className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        className="pl-9 bg-white"
                                                        placeholder="https://instance.example.com"
                                                        value={credentials.url}
                                                        onChange={(e) => setCredentials({ ...credentials, url: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Client ID / Username</Label>
                                                    <Input
                                                        className="bg-white"
                                                        placeholder="Client ID"
                                                        value={credentials.clientId}
                                                        onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Secret / Password</Label>
                                                    <Input
                                                        type="password"
                                                        className="bg-white"
                                                        placeholder="••••••••"
                                                        value={credentials.clientSecret}
                                                        onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                                            <ShieldCheck size={12} />
                                            <span>Credentials are encrypted and never stored permanently.</span>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8">
                                        <div className="text-center">
                                            <h2 className="text-xl font-semibold text-slate-900">Analysis Complete</h2>
                                            <p className="text-sm text-slate-500 mt-1">We found the following artifacts to migrate</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-100 text-center space-y-2">
                                                <div className="text-cyan-600 font-medium text-sm uppercase tracking-wide">Flows</div>
                                                <div className="text-4xl font-bold text-cyan-700">{stats?.flows_found}</div>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 text-center space-y-2">
                                                <div className="text-violet-600 font-medium text-sm uppercase tracking-wide">Connections</div>
                                                <div className="text-4xl font-bold text-violet-700">{stats?.connections_found}</div>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 text-center space-y-2">
                                                <div className="text-blue-600 font-medium text-sm uppercase tracking-wide">Complexity</div>
                                                <div className="text-xl font-bold text-blue-700 pt-2">{stats?.complexity}</div>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-emerald-900">Ready to Migrate</h4>
                                                <p className="text-sm text-emerald-700/80 mt-1">
                                                    All artifacts are compatible with Iwings Neural Engine.
                                                    The migration process will automatically convert logic, mappings, and connection placeholders.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="flex flex-col items-center justify-center flex-1 text-center space-y-6">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"
                                        >
                                            <CheckCircle size={40} />
                                        </motion.div>

                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-slate-900">Migration Successful!</h2>
                                            <p className="text-slate-500 max-w-md mx-auto">
                                                Successfully migrated <span className="font-semibold text-slate-900">{migrationResult?.migrated_flows.length} flows</span> and <span className="font-semibold text-slate-900">{migrationResult?.migrated_connections.length} connections</span>.
                                            </p>
                                        </div>

                                        <div className="w-full max-w-lg grid gap-3 mt-4 text-left">
                                            {migrationResult?.migrated_flows.map((flow: any, i: number) => (
                                                <motion.div
                                                    key={flow.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="p-3 bg-white border border-slate-100 rounded-lg flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-50 rounded-md text-slate-400">
                                                            <Zap size={14} />
                                                        </div>
                                                        <span className="font-medium text-slate-700 text-sm">{flow.name}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100">Active</Badge>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Actions */}
                        <div className="flex justify-between items-center pt-8 mt-auto border-t border-slate-100">
                            {step > 1 && step < 4 ? (
                                <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-slate-500 hover:text-slate-900">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            ) : <div></div>}

                            {step === 1 && (
                                <Button
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8"
                                    disabled={!selectedPlatform}
                                    onClick={() => setStep(2)}
                                >
                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}

                            {step === 2 && (
                                <Button
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8"
                                    onClick={handleAnalyze}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Analyze Account"}
                                </Button>
                            )}

                            {step === 3 && (
                                <Button
                                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 px-8"
                                    onClick={handleMigrate}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <><Zap className="mr-2 h-4 w-4" /> Start Migration</>}
                                </Button>
                            )}

                            {step === 4 && (
                                <Button
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8"
                                    onClick={() => window.location.href = '/dashboard/flows'}
                                >
                                    View Active Flows <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
