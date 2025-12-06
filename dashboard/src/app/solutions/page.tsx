"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Briefcase, Server, ShoppingCart } from "lucide-react";

export default function SolutionsPage() {
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
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-5xl font-bold mb-6 text-slate-900 text-center">Solutions for Every Team</h1>
                    <p className="text-xl text-slate-600 mb-16 text-center max-w-2xl mx-auto leading-relaxed">
                        Whether you're in Marketing, Sales, HR, or Engineering, Iwings unifies your stack and automates your busiest workflows.
                    </p>

                    <div className="space-y-12">
                        {/* Sales */}
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="md:w-1/3 flex justify-center">
                                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Briefcase className="h-10 w-10 text-blue-600" />
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h3 className="text-2xl font-bold mb-4">Sales Operations</h3>
                                <p className="text-slate-600 mb-4 text-lg">
                                    Eliminate data silos between your CRM and ERP. Automate Quote-to-Cash, ensuring that every closed deal in Salesforce instantly triggers an invoice in NetSuite and an onboarding project in Asana.
                                </p>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2 text-slate-700"><div className="h-2 w-2 rounded-full bg-blue-500"></div> Instant Lead Enrichment</li>
                                    <li className="flex items-center gap-2 text-slate-700"><div className="h-2 w-2 rounded-full bg-blue-500"></div> Automated Contract Generation</li>
                                    <li className="flex items-center gap-2 text-slate-700"><div className="h-2 w-2 rounded-full bg-blue-500"></div> Real-time Revenue Dashboards</li>
                                </ul>
                                <Link href="/contact"><Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">Explore Sales Solutions</Button></Link>
                            </div>
                        </div>

                        {/* HR */}
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                            <div className="md:w-1/3 flex justify-center md:order-last">
                                <div className="h-24 w-24 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Users className="h-10 w-10 text-purple-600" />
                                </div>
                            </div>
                            <div className="md:w-2/3">
                                <h3 className="text-2xl font-bold mb-4">HR & People Ops</h3>
                                <p className="text-slate-600 mb-4 text-lg">
                                    Deliver a world-class employee experience from day one. Sync Workday, Greenhouse, and Slack to automate provisioning, payroll updates, and culture onboarding.
                                </p>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center gap-2 text-slate-700"><div className="h-2 w-2 rounded-full bg-purple-500"></div> Zero-touch Onboarding</li>
                                    <li className="flex items-center gap-2 text-slate-700"><div className="h-2 w-2 rounded-full bg-purple-500"></div> Automated Offboarding & Access Control</li>
                                    <li className="flex items-center gap-2 text-slate-700"><div className="h-2 w-2 rounded-full bg-purple-500"></div> synchronized Org Charts</li>
                                </ul>
                                <Link href="/contact"><Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">Explore HR Solutions</Button></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
                © 2024 Integrationwings LLC. All rights reserved.
            </footer>
        </div>
    );
}
