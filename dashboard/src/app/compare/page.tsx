"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function ComparePage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="px-6 h-20 flex items-center bg-white border-b border-slate-200">
                <div className="container mx-auto flex items-center justify-between">
                    <Link className="flex items-center gap-2 font-bold text-xl" href="/">
                        <div className="h-8 w-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">I</div>
                        Iwings
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/">
                            <Button variant="ghost">Back to Home</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-5xl font-bold mb-6 text-slate-900">Why Iwings?</h1>
                    <p className="text-xl text-slate-600">See how we stack up against traditional iPaaS providers.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto">
                    <div className="grid grid-cols-3 p-6 bg-slate-50 border-b border-slate-200 font-bold text-lg">
                        <div className="text-slate-500">Feature</div>
                        <div className="text-center text-cyan-700">Iwings (Neural)</div>
                        <div className="text-center text-slate-500">Traditional iPaaS</div>
                    </div>

                    {[
                        { feature: "Integration Building", iwings: "Generative AI (Text-to-Flow)", others: "Manual Drag & Drop" },
                        { feature: "API Maintenance", iwings: "Self-Healing Agents", others: "Manual Updates" },
                        { feature: "Data Mapping", iwings: "Auto-Semantic Mapping", others: "Manual Field Matching" },
                        { feature: "Custom Connectors", iwings: "Auto-Generated from Docs", others: "Months of Dev Work" },
                        { feature: "Pricing", iwings: "Flat Rate / Task", others: "Per Connector / Complex" },
                    ].map((row, i) => (
                        <div key={i} className="grid grid-cols-3 p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <div className="font-medium text-slate-900 flex items-center">{row.feature}</div>
                            <div className="text-center text-cyan-700 font-bold flex items-center justify-center bg-cyan-50 rounded-lg py-2 mx-4">{row.iwings}</div>
                            <div className="text-center text-slate-500 flex items-center justify-center">{row.others}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/register">
                        <Button size="lg" className="h-14 px-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20">
                            Switch to the Future
                        </Button>
                    </Link>
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
                © 2024 Integrationwings LLC. All rights reserved.
            </footer>
        </div>
    );
}
