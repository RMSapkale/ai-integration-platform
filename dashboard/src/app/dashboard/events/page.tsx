"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react"

export default function EventsPage() {
    const events = [
        { id: 1, type: "OrderCreated", source: "Shopify", status: "Success", time: "10:42 AM", duration: "120ms" },
        { id: 2, type: "UserUpdated", source: "Auth0", status: "Success", time: "10:41 AM", duration: "85ms" },
        { id: 3, type: "InventorySync", source: "NetSuite", status: "Failed", time: "10:38 AM", duration: "450ms" },
        { id: 4, type: "TicketCreated", source: "Zendesk", status: "Success", time: "10:35 AM", duration: "110ms" },
        { id: 5, type: "LeadQualified", source: "HubSpot", status: "Success", time: "10:30 AM", duration: "95ms" },
        { id: 6, type: "PaymentProcessed", source: "Stripe", status: "Success", time: "10:28 AM", duration: "200ms" },
        { id: 7, type: "EmailSent", source: "SendGrid", status: "Warning", time: "10:25 AM", duration: "800ms" },
    ]

    const [isLoading, setIsLoading] = useState(false)
    const [eventsList, setEventsList] = useState(events)

    const handleRefresh = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Events Processed</h2>
                <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>
            <div className="rounded-md border border-slate-200 bg-white">
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="animate-spin h-8 w-8 text-cyan-600" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {eventsList.map((event) => (
                                <div key={event.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${event.status === 'Success' ? 'bg-emerald-100 text-emerald-600' : event.status === 'Failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{event.type}</p>
                                            <p className="text-sm text-slate-500">{event.source}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900">{event.time}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 justify-end">
                                                <Clock className="h-3 w-3" /> {event.duration}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={`${event.status === 'Success' ? 'border-emerald-200 text-emerald-700' : event.status === 'Failed' ? 'border-red-200 text-red-700' : 'border-yellow-200 text-yellow-700'}`}>
                                            {event.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
