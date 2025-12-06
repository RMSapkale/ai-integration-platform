"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NeuralCore from "@/components/NeuralCore";

export default function ComingSoonPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
                <NeuralCore />
            </div>

            <div className="container mx-auto px-4 flex-1 flex flex-col items-center justify-center relative z-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/50 px-4 py-1.5 text-sm font-medium text-cyan-400 border border-cyan-800 mb-8 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    Under Construction
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    Something extraordinary <br /> is coming.
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                    We're building the future of intelligent integration. This page is currently being crafted by our neural networks.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
                    <input
                        type="email"
                        placeholder="Enter your email for updates"
                        className="h-12 px-6 rounded-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-80"
                    />
                    <Button className="h-12 px-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
                        Notify Me
                    </Button>
                </div>

                <Link href="/">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-900 gap-2">
                        <ArrowLeft className="h-4 w-4" /> Return Home
                    </Button>
                </Link>
            </div>

            <footer className="py-8 text-center text-slate-600 text-sm relative z-10">
                © 2024 Integrationwings LLC. All rights reserved.
            </footer>
        </div>
    );
}
