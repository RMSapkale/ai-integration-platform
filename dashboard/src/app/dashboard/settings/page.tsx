"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { User, Lock, Bell, Shield, Globe } from "lucide-react"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h2>
            </div>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="bg-white border border-slate-200">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="account" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                        <Lock className="mr-2 h-4 w-4" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal information and public profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" placeholder="John Doe" defaultValue="Amol" className="bg-white border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="john@example.com" defaultValue="amol@antigravity.com" className="bg-white border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" value="Administrator" disabled className="bg-slate-100 border-slate-200 text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input id="company" defaultValue="Antigravity" className="bg-white border-slate-200" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>
                                Manage your password and security settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" className="bg-white border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input id="confirm-password" type="password" className="bg-white border-slate-200" />
                            </div>
                            <div className="flex justify-end">
                                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">Update Password</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-100 shadow-sm bg-red-50/30">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions for your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive">Delete Account</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Choose what you want to be notified about.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                                    <span>Email Notifications</span>
                                    <span className="font-normal text-xs text-slate-500">Receive daily summaries of your integration activity.</span>
                                </Label>
                                <Switch id="email-notifications" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="security-alerts" className="flex flex-col space-y-1">
                                    <span>Security Alerts</span>
                                    <span className="font-normal text-xs text-slate-500">Get notified about suspicious login attempts.</span>
                                </Label>
                                <Switch id="security-alerts" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                                    <span>Marketing Emails</span>
                                    <span className="font-normal text-xs text-slate-500">Receive news about new features and updates.</span>
                                </Label>
                                <Switch id="marketing-emails" />
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">Save Preferences</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
