"use client"

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { FlowBuilder } from "@/components/FlowBuilder"
import api from "@/lib/api"
import { Loader2 } from 'lucide-react'

function FlowBuilderContent() {
    const searchParams = useSearchParams()
    const flowId = searchParams.get('flowId')
    const [flow, setFlow] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (flowId) {
            setLoading(true)
            const fetchFlow = async () => {
                try {
                    const res = await api.get(`/flows/${flowId}`)
                    if (res.data.status === 'success') {
                        setFlow(res.data.flow)
                    }
                } catch (error) {
                    console.error('Failed to load flow', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchFlow()
        }
    }, [flowId])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                    <p className="text-slate-500">Loading flow...</p>
                </div>
            </div>
        )
    }

    return <FlowBuilder initialFlow={flow} />
}

export default function FlowBuilderPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            </div>
        }>
            <FlowBuilderContent />
        </Suspense>
    )
}
