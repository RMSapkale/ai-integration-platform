"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Zap, Shield, Globe, Cpu, Network, Activity, Layers, MessageSquare, Briefcase, Users, Server, BarChart3, Lock } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import NeuralCore from "@/components/NeuralCore";
import { useRef, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white overflow-x-hidden font-sans">
            {/* 3D Background - Fixed */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <NeuralCore />
            </div>

            {/* Header */}
            <header className={`px-6 h-20 flex items-center fixed w-full z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm" : "bg-transparent"}`}>
                <div className="container mx-auto flex items-center justify-between">
                    <Link className="flex items-center gap-3" href="#">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-900/10">
                            <Image
                                src="/iwings-logo.jpg"
                                alt="Iwings Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Iwings
                        </span>
                    </Link>
                    <nav className="hidden md:flex gap-8">
                        <Link className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors" href="/product">Product</Link>
                        <Link className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors" href="/solutions">Solutions</Link>
                        <Link className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors" href="/compare">Compare</Link>
                        <Link className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors" href="/pricing">Pricing</Link>
                    </nav>
                    <div className="flex gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">Log in</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-6">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative z-10">
                {/* Hero Section */}
                <section ref={targetRef} className="w-full min-h-screen flex items-center justify-center relative perspective-1000 pt-20">
                    <motion.div
                        style={{ opacity, scale, y }}
                        className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700 border border-cyan-100 mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            New: Neural Adapter Generator v2.0
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-slate-900 leading-[1.1]"
                        >
                            Integrate your enterprise <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-violet-600 to-blue-600 animate-gradient-x">
                                at the speed of AI
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="mx-auto max-w-[800px] text-slate-600 text-xl md:text-2xl leading-relaxed mb-10"
                        >
                            The intelligent automation platform that builds, heals, and optimizes your integrations automatically. No more brittle scripts.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                        >
                            <Link href="/register">
                                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/25">
                                    Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/product">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-slate-300 hover:bg-white hover:border-slate-400 bg-white/50 backdrop-blur-sm">
                                    View Interactive Demo
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="mt-12 text-sm text-slate-500 flex items-center gap-6"
                        >
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> No credit card required</span>
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> SOC2 Compliant</span>
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 14-day free trial</span>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Trusted By Section (Marquee) */}
                <section className="py-10 border-y border-slate-200 bg-white/80 backdrop-blur-sm overflow-hidden">
                    <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted by forward-thinking teams</p>
                    <div className="relative w-full overflow-hidden">
                        <div className="flex w-[200%] animate-marquee">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex min-w-[50%] justify-around items-center px-10 gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    {["Acme Corp", "GlobalBank", "TechStart", "CloudScale", "DataFlow", "Nebula", "Vortex"].map((company, j) => (
                                        <div key={j} className="flex items-center gap-2 font-bold text-xl text-slate-800">
                                            <div className="h-8 w-8 bg-slate-800 rounded-md"></div> {company}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Value Proposition Grid */}
                <section id="solutions" className="py-32 bg-white">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">Why the world's best teams switch to Iwings</h2>
                            <p className="text-xl text-slate-600">
                                Legacy iPaaS tools were built for the cloud era. Iwings is built for the AI era.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Briefcase,
                                    title: "For Sales Operations",
                                    desc: "Automate quote-to-cash in minutes. Sync Salesforce, HubSpot, and NetSuite without waiting for IT.",
                                    color: "text-white",
                                    bg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30",
                                },
                                {
                                    icon: Users,
                                    title: "For HR Teams",
                                    desc: "Seamless onboarding from day one. Connect Workday, Greenhouse, and Slack to deliver the perfect employee experience.",
                                    color: "text-white",
                                    bg: "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30",
                                },
                                {
                                    icon: Server,
                                    title: "For Engineering",
                                    desc: "Focus on your core product, not plumbing. Let AI generate and maintain your internal integrations.",
                                    color: "text-white",
                                    bg: "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30",
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group p-8 rounded-2xl bg-white border border-slate-100 hover:border-cyan-100 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className={`h-8 w-8 ${item.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">{item.desc}</p>
                                    <div className="mt-8 flex items-center text-cyan-600 font-medium group-hover:gap-2 transition-all cursor-pointer">
                                        Learn more <ArrowRight className="h-4 w-4 ml-1" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Tabs Section */}
                <section className="py-24 bg-slate-50 border-y border-slate-200">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="md:w-1/2">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                                    The only platform with <br />
                                    <span className="text-cyan-600">Neural Intelligence</span>
                                </h2>
                                <p className="text-lg text-slate-600 mb-8">
                                    Traditional iPaaS requires you to define every step. Iwings understands your intent and builds the flow for you.
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { title: "Natural Language Design", desc: "Just describe your flow in plain English. We handle the complexity." },
                                        { title: "Self-Healing Connections", desc: "If an API changes, our agents automatically update the adapters." },
                                        { title: "Universal Mapper", desc: "AI instantly maps fields between any two systems, no matter how nested." }
                                    ].map((feat, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1 h-6 w-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                                                <Check className="h-4 w-4 text-cyan-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{feat.title}</h4>
                                                <p className="text-slate-600">{feat.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:w-1/2 w-full">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                                    <div className="absolute top-0 w-full h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                                        <div className="ml-4 h-6 w-3/4 bg-white rounded-md border border-slate-200 text-xs flex items-center px-2 text-slate-400">
                                            ai-agent://generate-flow
                                        </div>
                                    </div>
                                    <div className="pt-16 pb-8 px-8 min-h-[400px] flex flex-col justify-center">
                                        <div className="space-y-4">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[80%]"
                                            >
                                                <p className="text-slate-700">Sync Salesforce Opportunities to NetSuite Orders when stage changes to "Closed Won".</p>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8 }}
                                                className="ml-auto bg-cyan-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%]"
                                            >
                                                <p>I've created that flow for you. I also added a check for inventory levels in NetSuite before creating the order.</p>
                                                <div className="mt-3 bg-white/10 rounded-lg p-3 border border-white/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Zap className="h-4 w-4" /> <strong>Flow Generated</strong>
                                                    </div>
                                                    <div className="text-xs opacity-90 font-mono">
                                                        Trigger: Salesforce (Opp Updated)<br />
                                                        Step 1: NetSuite (Check Inventory)<br />
                                                        Step 2: NetSuite (Create Order)
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integration Grid Marquee */}
                <section className="py-20 overflow-hidden bg-slate-900 text-white">
                    <div className="container px-4 mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Connects with everything. Literally.</h2>
                        <p className="text-slate-400">Over 1,000+ pre-built adapters and the ability to generate new ones in seconds.</p>
                    </div>

                    <div className="relative w-full">
                        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

                        {/* Row 1 - Left */}
                        <div className="flex w-[200%] animate-marquee mb-8">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex min-w-[50%] justify-around items-center px-4 gap-4">
                                    {["Salesforce", "HubSpot", "Zendesk", "Jira", "Slack", "Teams", "ServiceNow", "Workday", "NetSuite", "Oracle"].map((app, j) => (
                                        <div key={j} className="h-20 w-44 bg-slate-800 rounded-xl flex items-center gap-3 px-4 border border-slate-700 font-bold text-slate-200 hover:bg-slate-700 transition-colors">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br ${j % 4 === 0 ? "from-blue-500 to-cyan-600" :
                                                j % 4 === 1 ? "from-violet-500 to-purple-600" :
                                                    j % 4 === 2 ? "from-pink-500 to-rose-600" : "from-amber-500 to-orange-600"
                                                } text-white shadow-sm`}>
                                                {app[0]}
                                            </div>
                                            {app}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Row 2 - Right */}
                        <div className="flex w-[200%] animate-marquee2">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex min-w-[50%] justify-around items-center px-4 gap-4">
                                    {["Shopify", "Stripe", "QuickBooks", "Xero", "Marketo", "Pardot", "GitHub", "GitLab", "Twilio", "SendGrid"].map((app, j) => (
                                        <div key={j} className="h-20 w-44 bg-slate-800 rounded-xl flex items-center gap-3 px-4 border border-slate-700 font-bold text-slate-200 hover:bg-slate-700 transition-colors">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br ${j % 4 === 0 ? "from-green-500 to-emerald-600" :
                                                j % 4 === 1 ? "from-blue-500 to-indigo-600" :
                                                    j % 4 === 2 ? "from-purple-500 to-violet-600" : "from-orange-500 to-red-600"
                                                } text-white shadow-sm`}>
                                                {app[0]}
                                            </div>
                                            {app}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-gradient-to-b from-slate-50 to-white">
                    <div className="container px-4 mx-auto">
                        <div className="max-w-4xl mx-auto text-center bg-cyan-600 rounded-3xl p-12 md:p-20 relative overflow-hidden text-white shadow-2xl">
                            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-400 rounded-full blur-3xl opacity-20"></div>
                            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-400 rounded-full blur-3xl opacity-20"></div>

                            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Ready to automate the boring stuff?</h2>
                            <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto relative z-10">
                                Join 5,000+ companies using Iwings to save time and reduce errors.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                                <Link href="/register">
                                    <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-white text-cyan-600 hover:bg-slate-100 border-0">
                                        Get Started for Free
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button size="lg" variant="outline" className="h-16 px-10 text-lg rounded-full border-cyan-200 bg-transparent text-white hover:bg-cyan-500 hover:text-white hover:border-transparent transition-colors">
                                        Talk to Sales
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-800 relative z-20">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2">
                            <Link className="flex items-center gap-2 mb-4" href="#">
                                <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold">I</div>
                                <span className="text-xl font-bold text-white">Iwings</span>
                            </Link>
                            <p className="text-slate-400 max-w-xs mb-6 text-sm leading-relaxed">
                                The intelligent integration platform for modern enterprises. Connecting your world, one node at a time.
                            </p>
                            <div className="flex gap-4">
                                <div className="h-9 w-9 rounded-full bg-slate-800 hover:bg-cyan-600 transition-colors flex items-center justify-center cursor-pointer">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-slate-800 hover:bg-cyan-600 transition-colors flex items-center justify-center cursor-pointer">
                                    <span className="sr-only">GitHub</span>
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-slate-800 hover:bg-cyan-600 transition-colors flex items-center justify-center cursor-pointer">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Product</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link href="/product" className="hover:text-cyan-400 transition-colors">Features</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Integrations</Link></li>
                                <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Security</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Changelog</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Resources</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">API Reference</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Community</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Partners</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Company</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">About</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
                                <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Legal</Link></li>
                                <li><Link href="/coming-soon" className="hover:text-cyan-400 transition-colors">Media Kit</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                        <p>© 2024 Integrationwings LLC. All rights reserved.</p>
                        <div className="flex gap-8">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
