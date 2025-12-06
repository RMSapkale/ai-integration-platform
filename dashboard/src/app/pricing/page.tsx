"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, Zap, Building2, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
    const plans = [
        {
            name: "Starter",
            icon: Zap,
            price: 299,
            description: "Perfect for small businesses and startups",
            popular: false,
            features: [
                "5 active flows",
                "100,000 tasks/month",
                "10 connections",
                "5 GB data transfer",
                "AI flow generation (50/month)",
                "Visual flow builder",
                "Email support",
                "Community access",
            ],
            limits: [
                "2 users",
                "Standard adapters only",
            ]
        },
        {
            name: "Professional",
            icon: Building2,
            price: 999,
            description: "For growing businesses and mid-market",
            popular: true,
            features: [
                "25 active flows",
                "1 million tasks/month",
                "50 connections",
                "50 GB data transfer",
                "AI flow generation (unlimited)",
                "Auto-adapter generation (10/month)",
                "Lookup tables (unlimited)",
                "Advanced control flow",
                "Priority support",
                "Runtime export (3 deployments)",
            ],
            limits: [
                "10 users",
            ]
        },
        {
            name: "Enterprise",
            icon: Crown,
            price: 2999,
            description: "For large enterprises with complex needs",
            popular: false,
            features: [
                "Unlimited flows",
                "10 million tasks/month",
                "Unlimited connections",
                "500 GB data transfer",
                "AI flow generation (unlimited)",
                "Auto-adapter generation (unlimited)",
                "All advanced features",
                "Parallel execution",
                "Error handling & retry",
                "Runtime export (unlimited)",
                "Dedicated support",
                "99.9% SLA",
                "SSO/SAML",
                "Audit logs",
            ],
            limits: [
                "Unlimited users",
            ]
        },
        {
            name: "Enterprise Plus",
            icon: Sparkles,
            price: null,
            description: "Custom solutions for Fortune 500",
            popular: false,
            features: [
                "Everything in Enterprise",
                "Dedicated infrastructure",
                "99.99% SLA",
                "24/7 phone support",
                "Technical account manager",
                "Custom development",
                "On-premise deployment",
                "Multi-region support",
                "Advanced security (SOC 2, HIPAA)",
                "Volume discounts",
            ],
            limits: []
        }
    ]

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="px-6 h-20 flex items-center bg-white border-b border-slate-200">
                <div className="container mx-auto flex items-center justify-between">
                    <Link className="flex items-center gap-3" href="/">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg ring-1 ring-slate-900/10">
                            <Image
                                src="/iwings-logo.jpg"
                                alt="Iwings Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">
                            Iwings
                        </span>
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
                    <Badge className="mb-4 bg-cyan-100 text-cyan-700 border-cyan-200">
                        Transparent Pricing
                    </Badge>
                    <h1 className="text-5xl font-bold mb-6 text-slate-900">Choose Your Plan</h1>
                    <p className="text-xl text-slate-600">Enterprise-grade integration at startup-friendly prices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan) => {
                        const Icon = plan.icon
                        return (
                            <Card
                                key={plan.name}
                                className={`relative p-6 flex flex-col ${plan.popular
                                    ? 'border-2 border-cyan-500 shadow-xl shadow-cyan-100'
                                    : 'border border-slate-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600">
                                        Most Popular
                                    </Badge>
                                )}

                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-cyan-100' : 'bg-slate-100'}`}>
                                        <Icon className={`h-6 w-6 ${plan.popular ? 'text-cyan-600' : 'text-slate-600'}`} />
                                    </div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                </div>

                                <div className="mb-4">
                                    {plan.price ? (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold">${plan.price}</span>
                                                <span className="text-slate-500">/month</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-1">
                                                ${(plan.price * 12 * 0.8).toLocaleString()}/year (save 20%)
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-bold">Custom</div>
                                    )}
                                </div>

                                <p className="text-sm text-slate-600 mb-6">{plan.description}</p>

                                <Link href={plan.price ? "/register" : "/contact"}>
                                    <Button
                                        className={`w-full mb-6 ${plan.popular
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                                            : ''
                                            }`}
                                        variant={plan.popular ? 'default' : 'outline'}
                                    >
                                        {plan.price ? 'Start Free Trial' : 'Contact Sales'}
                                    </Button>
                                </Link>

                                <div className="space-y-3 flex-1">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </main>
            <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
                © 2024 Integrationwings LLC. All rights reserved.
            </footer>
        </div>
    );
}
