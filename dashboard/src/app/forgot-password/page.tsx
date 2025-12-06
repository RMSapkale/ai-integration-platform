"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Zap, ArrowRight, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import NeuralCore from "@/components/NeuralCore"

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            setSent(true)
        }, 1500)
    }

    return (
        <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 overflow-hidden">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-slate-100 border-r border-slate-200">
                <div className="absolute inset-0 z-0 opacity-60">
                    <NeuralCore />
                </div>
                <div className="relative z-10 p-12 text-center space-y-6 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center justify-center p-3 bg-white rounded-2xl border border-cyan-100 shadow-sm mb-4"
                    >
                        <Zap className="h-10 w-10 text-cyan-600" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="text-4xl font-bold tracking-tight text-slate-900"
                    >
                        Account <span className="text-cyan-600">Recovery</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="text-lg text-slate-600"
                    >
                        Securely reset your credentials and get back to your integration flows.
                    </motion.p>
                </div>
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/50 z-0 pointer-events-none"></div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10 bg-white">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your email to receive a reset link.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        {!sent ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700">Email address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            required
                                            className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white border-0 shadow-lg shadow-cyan-500/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full mb-2">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Check your inbox</h3>
                                <p className="text-slate-600">
                                    We've sent a password reset link to your email address.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-200 hover:bg-slate-50 text-slate-700"
                                    onClick={() => setSent(false)}
                                >
                                    Try another email
                                </Button>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm font-medium text-cyan-600 hover:text-cyan-500 transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
