"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
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
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
                    <div>
                        <h1 className="text-5xl font-bold mb-6 text-slate-900">Talk to Sales</h1>
                        <p className="text-xl text-slate-600 mb-12">
                            Ready to transform your enterprise integration strategy? Our team is here to help you get started.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-6 w-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                    <p className="text-slate-600">sales@iwings.io</p>
                                    <p className="text-slate-500 text-sm">We reply within 24 hours.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-6 w-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Call Us</h3>
                                    <p className="text-slate-600">+1 (555) 123-4567</p>
                                    <p className="text-slate-500 text-sm">Mon-Fri, 9am-6pm EST.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-6 w-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Visit Us</h3>
                                    <p className="text-slate-600">100 Innovation Way, Suite 500<br />San Francisco, CA 94105</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">First Name</label>
                                    <input className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Jane" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                                    <input className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Work Email</label>
                                <input className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="jane@company.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Company Size</label>
                                <select className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white">
                                    <option>1-50 employees</option>
                                    <option>51-200 employees</option>
                                    <option>201-1000 employees</option>
                                    <option>1000+ employees</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Message</label>
                                <textarea className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Tell us about your project..."></textarea>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
                © 2024 Integrationwings LLC. All rights reserved.
            </footer>
        </div>
    );
}
