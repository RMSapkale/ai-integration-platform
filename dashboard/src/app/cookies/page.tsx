"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function CookiesPage() {
    // Basic state for demo purposes
    const [preferences, setPreferences] = useState({
        essential: true,
        functional: true,
        analytics: false,
        marketing: false,
    });

    // Simple save handler
    const handleSave = () => {
        // In a real app, this would save to local storage or a backend
        alert("Preferences saved! (This is a demo)");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-500/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-cyan-600 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Legal</span>
                </div>
            </header>

            <main className="container mx-auto px-6 max-w-4xl pt-16">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                        <Cookie className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                        Cookie Settings
                    </h1>
                </div>

                <p className="text-slate-500 mb-12 text-lg max-w-2xl">
                    We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. You can choose which cookies you want to accept below.
                </p>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="essential" className="text-lg font-bold">Essential Cookies</Label>
                                <p className="text-slate-500 text-sm">
                                    These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.
                                </p>
                            </div>
                            <Switch id="essential" checked={true} disabled />
                        </div>
                    </div>

                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="functional" className="text-lg font-bold">Functional Cookies</Label>
                                <p className="text-slate-500 text-sm">
                                    These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.
                                </p>
                            </div>
                            <Switch
                                id="functional"
                                checked={preferences.functional}
                                onCheckedChange={(c) => setPreferences(prev => ({ ...prev, functional: c }))}
                            />
                        </div>
                    </div>

                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="analytics" className="text-lg font-bold">Analytics Data</Label>
                                <p className="text-slate-500 text-sm">
                                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
                                </p>
                            </div>
                            <Switch
                                id="analytics"
                                checked={preferences.analytics}
                                onCheckedChange={(c) => setPreferences(prev => ({ ...prev, analytics: c }))}
                            />
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="marketing" className="text-lg font-bold">Marketing Cookies</Label>
                                <p className="text-slate-500 text-sm">
                                    These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
                                </p>
                            </div>
                            <Switch
                                id="marketing"
                                checked={preferences.marketing}
                                onCheckedChange={(c) => setPreferences(prev => ({ ...prev, marketing: c }))}
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 flex justify-end gap-4">
                        <Button variant="outline">Reset to Defaults</Button>
                        <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white">Save Preferences</Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
