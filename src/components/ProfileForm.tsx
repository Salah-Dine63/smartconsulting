"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface Props {
    initialName: string
    initialEmail: string
    hasPassword: boolean
}

export default function ProfileForm({ initialName, initialEmail, hasPassword }: Props) {
    // Info form
    const { update } = useSession()
    const [name, setName] = useState(initialName)
    const [email, setEmail] = useState(initialEmail)
    const [infoLoading, setInfoLoading] = useState(false)
    const [infoMsg, setInfoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // Password form
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passLoading, setPassLoading] = useState(false)
    const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

    async function saveInfo(e: React.FormEvent) {
        e.preventDefault()
        setInfoLoading(true)
        setInfoMsg(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update")
            await update({ name, email })
            setInfoMsg({ type: "success", text: "Profile updated successfully!" })
        } catch (err: any) {
            setInfoMsg({ type: "error", text: err.message })
        } finally {
            setInfoLoading(false)
        }
    }

    async function changePassword(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPassMsg({ type: "error", text: "Passwords do not match." })
            return
        }
        if (newPassword.length < 8) {
            setPassMsg({ type: "error", text: "Password must be at least 8 characters." })
            return
        }
        setPassLoading(true)
        setPassMsg(null)
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update password")
            setPassMsg({ type: "success", text: "Password changed successfully!" })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: any) {
            setPassMsg({ type: "error", text: err.message })
        } finally {
            setPassLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── Personal Info ── */}
            <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>Update your name and email address.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={saveInfo} className="space-y-4">
                        {infoMsg && (
                            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                                infoMsg.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                                {infoMsg.type === "success"
                                    ? <CheckCircle className="w-4 h-4 shrink-0" />
                                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                                {infoMsg.text}
                            </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your full name"
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="h-11"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={infoLoading}
                                className="bg-blue-900 hover:bg-blue-800 text-white px-6"
                            >
                                {infoLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* ── Change Password ── */}
            {hasPassword && (
                <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                            <Lock className="w-5 h-5 text-blue-600" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Make sure to use a strong password.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={changePassword} className="space-y-4">
                            {passMsg && (
                                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
                                    passMsg.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}>
                                    {passMsg.type === "success"
                                        ? <CheckCircle className="w-4 h-4 shrink-0" />
                                        : <AlertCircle className="w-4 h-4 shrink-0" />}
                                    {passMsg.text}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11"
                                    required
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        className="h-11"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="h-11"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    disabled={passLoading}
                                    className="bg-blue-900 hover:bg-blue-800 text-white px-6"
                                >
                                    {passLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</> : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!hasPassword && (
                <Card className="border border-slate-200 rounded-2xl bg-slate-50">
                    <CardContent className="pt-6 pb-6 flex items-center gap-3 text-sm text-slate-500">
                        <Lock className="w-4 h-4 shrink-0" />
                        You signed in with Google or LinkedIn — password management is handled by your provider.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
