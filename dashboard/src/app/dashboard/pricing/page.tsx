"use client"

import { Check, Zap, Building2, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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

    const comparisons = [
        { platform: "MuleSoft", price: "$30K - $200K/year", savings: "60% cheaper" },
        { platform: "Workato", price: "$50K - $128K/year", savings: "50% cheaper" },
        { platform: "Boomi", price: "$6K - $50K/year", savings: "Competitive" },
        { platform: "Oracle", price: "$10K - $100K+/year", savings: "80% cheaper" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <Badge className="mb-4 bg-cyan-100 text-cyan-700 border-cyan-200">
                        Transparent Pricing
                    </Badge>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 bg-clip-text text-transparent">
                        Enterprise Power, Startup Pricing
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        40-60% cheaper than MuleSoft, Workato, and Oracle. No hidden fees, no "contact sales" - just honest, transparent pricing.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            ✓ 14-day free trial
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                            ✓ No credit card required
                        </Badge>
                        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                            ✓ Cancel anytime
                        </Badge>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {plans.map((plan) => {
                        const Icon = plan.icon
                        return (
                            <Card
                                key={plan.name}
                                className={`relative p-6 ${plan.popular
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
                                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-cyan-100' : 'bg-slate-100'
                                        }`}>
                                        <Icon className={`h-6 w-6 ${plan.popular ? 'text-cyan-600' : 'text-slate-600'
                                            }`} />
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

                                <Button
                                    className={`w-full mb-6 ${plan.popular
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                                        : ''
                                        }`}
                                    variant={plan.popular ? 'default' : 'outline'}
                                >
                                    {plan.price ? 'Start Free Trial' : 'Contact Sales'}
                                </Button>

                                <div className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <div key={feature} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {plan.limits.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <p className="text-xs text-slate-500 font-medium mb-2">Limits:</p>
                                        {plan.limits.map((limit) => (
                                            <p key={limit} className="text-xs text-slate-500">• {limit}</p>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-xl border border-slate-200 p-8 mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">How We Compare</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4">Platform</th>
                                    <th className="text-left py-3 px-4">Their Pricing</th>
                                    <th className="text-left py-3 px-4">Your Savings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisons.map((comp) => (
                                    <tr key={comp.platform} className="border-b border-slate-100">
                                        <td className="py-3 px-4 font-medium">{comp.platform}</td>
                                        <td className="py-3 px-4 text-slate-600">{comp.price}</td>
                                        <td className="py-3 px-4">
                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                {comp.savings}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Features Comparison */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-8 mb-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6">
                            <div className="text-3xl mb-3">🤖</div>
                            <h3 className="font-bold mb-2">AI-Powered</h3>
                            <p className="text-sm text-slate-600">
                                Generate flows from natural language. Unique in the market!
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-6">
                            <div className="text-3xl mb-3">♾️</div>
                            <h3 className="font-bold mb-2">Unlimited Systems</h3>
                            <p className="text-sm text-slate-600">
                                Auto-generate adapters for ANY system. No limits!
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-6">
                            <div className="text-3xl mb-3">💰</div>
                            <h3 className="font-bold mb-2">60% Cheaper</h3>
                            <p className="text-sm text-slate-600">
                                Enterprise features at startup prices. No hidden fees!
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Questions?</h2>
                    <p className="text-slate-600 mb-6">
                        We're here to help. Contact us at{" "}
                        <a href="mailto:sales@yourplatform.com" className="text-cyan-600 hover:underline">
                            sales@yourplatform.com
                        </a>
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                            Start Your Free Trial
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
