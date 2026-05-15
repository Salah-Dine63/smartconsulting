"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Lock, Loader2, Eye, EyeOff, Camera, ImagePlus } from "lucide-react"
import { toast } from "sonner"

interface Props {
    initialName: string
    initialEmail: string
    initialImage: string
    hasPassword: boolean
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
    if (password.length === 0) return { label: "", color: "", width: "0%" }
    if (password.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" }
    if (password.length < 8) return { label: "Weak", color: "bg-orange-500", width: "50%" }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Medium", color: "bg-yellow-500", width: "75%" }
    return { label: "Strong", color: "bg-green-500", width: "100%" }
}

export default function ProfileForm({ initialName, initialEmail, initialImage, hasPassword }: Props) {
    const { update } = useSession()

    // Avatar
    const [imageUrl, setImageUrl] = useState(initialImage)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(initialImage)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Info form
    const [name, setName] = useState(initialName)
    const [email, setEmail] = useState(initialEmail)
    const [infoLoading, setInfoLoading] = useState(false)

    // Password form
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [passLoading, setPassLoading] = useState(false)

    const strength = getPasswordStrength(newPassword)

    const initials = (name || email || "?")
        .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.")
            return
        }
        if (file.size > 3 * 1024 * 1024) {
            toast.error("Image must be under 3MB.")
            return
        }

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
        setAvatarLoading(true)

        const formData = new FormData()
        formData.append("avatar", file)

        try {
            const res = await fetch("/api/profile/avatar", { method: "POST", body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Upload failed")
            setImageUrl(data.imageUrl)
            await update({ image: data.imageUrl })
            toast.success("Profile picture updated!")
        } catch (err: any) {
            setPreviewUrl(imageUrl) // revert preview on error
            toast.error(err.message || "Failed to upload image.")
        } finally {
            setAvatarLoading(false)
        }
    }

    async function saveInfo(e: React.FormEvent) {
        e.preventDefault()
        setInfoLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update")
            await update({ name, email })
            toast.success("Profile updated successfully!")
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile.")
        } finally {
            setInfoLoading(false)
        }
    }

    async function changePassword(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return }
        if (newPassword.length < 8) { toast.error("Password must be at least 8 characters."); return }
        setPassLoading(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update password")
            toast.success("Password changed successfully!")
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
        } catch (err: any) {
            toast.error(err.message || "Failed to change password.")
        } finally {
            setPassLoading(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* ── Avatar Upload ── */}
            <Card className="border border-slate-200 shadow-sm rounded-2xl bg-white">
                <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                        <Camera className="w-5 h-5 text-blue-600" />
                        Profile Picture
                    </CardTitle>
                    <CardDescription>Click on your avatar to upload a new photo. Max 3MB.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                        {/* Clickable avatar */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarLoading}
                            className="relative group w-24 h-24 rounded-2xl overflow-hidden shadow-md shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-2xl font-extrabold">
                                    {initials}
                                </div>
                            )}
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {avatarLoading
                                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    : <Camera className="w-6 h-6 text-white" />
                                }
                            </div>
                        </button>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700">Upload a new photo</p>
                            <p className="text-xs text-slate-400">JPG, PNG, GIF or WebP · Max 3MB</p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={avatarLoading}
                                className="gap-2 text-sm"
                            >
                                {avatarLoading
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading...</>
                                    : <><ImagePlus className="w-3.5 h-3.5" />Choose Photo</>
                                }
                            </Button>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </CardContent>
            </Card>

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
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="h-11" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={infoLoading} className="bg-blue-900 hover:bg-blue-800 text-white px-6">
                                {infoLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* ── Change Password ── */}
            {hasPassword ? (
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
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <div className="relative">
                                    <Input id="currentPassword" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-11 pr-10" required />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input id="newPassword" type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className="h-11 pr-10" required />
                                        <button type="button" onClick={() => setShowNew(!showNew)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {newPassword.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                                            </div>
                                            <p className={`text-xs font-medium ${strength.label === "Strong" ? "text-green-600" : strength.label === "Medium" ? "text-yellow-600" : "text-red-500"}`}>
                                                {strength.label}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Input id="confirmPassword" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="h-11 pr-10" required />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" disabled={passLoading} className="bg-blue-900 hover:bg-blue-800 text-white px-6">
                                    {passLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</> : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
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
