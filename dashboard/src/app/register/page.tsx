"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Zap, ArrowRight, Lock, Mail, User, Building } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { motion } from "framer-motion"
import NeuralCore from "@/components/NeuralCore"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const companyName = formData.get("companyName") as string
        const taxId = formData.get("taxId") as string

        try {
            await axios.post("/api/register", {
                name,
                email,
                password,
                companyName,
                taxId
            })
            router.push("/login")
        } catch (err: any) {
            setError(err.response?.data || "Something went wrong")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden font-sans selection:bg-cyan-500/30">
            <NeuralCore />

            <div className="absolute top-6 left-6 z-20">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 bg-white/50 backdrop-blur-sm border border-slate-200 shadow-sm hover:shadow-md transition-all gap-2">
                        <ArrowRight className="h-4 w-4 rotate-180" /> Back to Home
                    </Button>
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative h-16 w-16 mb-4 overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-900/10">
                                <Image
                                    src="/iwings-logo.jpg"
                                    alt="Iwings Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Create Account
                            </h1>
                            <p className="text-slate-500 text-sm mt-2">
                                Join the neural network today
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="John Doe"
                                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-slate-700">Company Name</Label>
                                <div className="relative group">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        placeholder="Acme Corp"
                                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="taxId" className="text-slate-700">Tax ID</Label>
                                <div className="relative group">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                    <Input
                                        id="taxId"
                                        name="taxId"
                                        placeholder="XX-XXXXXXX"
                                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20 border-0 mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?{" "}
                                <Link href="/login" className="text-cyan-600 hover:text-cyan-500 font-medium transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-400">
                                By clicking "Create Account", you agree to our <Link href="#" className="underline hover:text-slate-600">Terms</Link> and <Link href="#" className="underline hover:text-slate-600">Privacy Policy</Link>.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
