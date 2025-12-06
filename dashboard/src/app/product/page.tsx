"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Zap, Shield, Globe } from "lucide-react";

export default function ProductPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Navigation */}
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
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold mb-8 text-slate-900">The Neural Integration Platform</h1>
                    <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                        Iwings isn't just another iPaaS. It's the first integration platform built from the ground up with a neural core, designed to understand your business intent and auto-generate complex workflows.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="h-12 w-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-cyan-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI-Powered Flow Gen</h3>
                            <p className="text-slate-600">Describe what you want in plain English, and our agent builds the entire integration, including logic and error handling.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Universal Security</h3>
                            <p className="text-slate-600">Enterprise-grade security by default. SOC2 Type II compliant, with end-to-end encryption for all data in transit and at rest.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                <Globe className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Global Edge Network</h3>
                            <p className="text-slate-600">Run your integrations close to your data. Our distributed execution engine ensures low latency and high availability.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <Check className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Self-Healing</h3>
                            <p className="text-slate-600">Integrations that fix themselves. When APIs change, our neural agents detect the break and propose fixes automatically.</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to see it in action?</h2>
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/25">
                                Start Your Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
                © 2024 Integrationwings LLC. All rights reserved.
            </footer>
        </div>
    );
}
