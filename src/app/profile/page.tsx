"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Shield, Key, AlertCircle, CheckCircle2, Loader2, Camera } from "lucide-react"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Status states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sync profile details when session is loaded
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      setImage((session.user as any).image || "")
    }
  }, [session])

  // Redirect if not authenticated
  if (!session) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Please log in to manage your account profile settings.</p>
          <Button onClick={() => router.push("/login")} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-6 font-semibold">
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  const userInitial = (session?.user?.name || session?.user?.email || "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Update next-auth session
      await update({ name, email })
      setSuccess("Profile information updated successfully.")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      try {
        const response = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Something went wrong")
        }

        setImage(base64String)
        await update({ image: base64String })
        setSuccess("Profile picture updated successfully.")
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setSuccess("Password changed successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
            Manage your personal settings, password, and security preferences.
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-semibold">{success}</div>
          </div>
        )}

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl overflow-hidden">
              <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 relative"></div>
              <CardContent className="pt-0 pb-8 px-6 text-center relative">
                
                {/* Avatar with Camera Hover Overlay */}
                <div className="relative w-24 h-24 mx-auto -mt-12 mb-4 group cursor-pointer">
                  <label htmlFor="profile-image-input" className="cursor-pointer block w-full h-full">
                    <div className="w-full h-full rounded-2xl bg-blue-600 border-4 border-white dark:border-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                      {image ? (
                        <img src={image} alt="Avatar" className="w-full h-full object-cover animate-in fade-in duration-300" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200">
                      <Camera className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                    </div>
                  </label>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {session?.user?.name || "Student"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {session?.user?.email}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Role</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {(session?.user as any)?.role || "STUDENT"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 font-medium">Platform</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Roobotix</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columns 2 & 3: Forms */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Form 1: Personal Details */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</CardTitle>
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Update your account name and contact email address.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-600 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto h-12 bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-xl font-semibold shadow-md shadow-blue-500/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Form 2: Password Security */}
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-3xl">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Security & Password</CardTitle>
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                      Update your password to keep your account secure.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-600 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-600 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto h-12 bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-xl font-semibold shadow-md shadow-indigo-500/20"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </div>
  )
}
