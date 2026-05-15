"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
    if (password.length === 0) return { label: "", color: "", width: "0%" }
    if (password.length < 6) return { label: "Too short", color: "bg-red-500", width: "25%" }
    if (password.length < 8) return { label: "Weak", color: "bg-orange-500", width: "50%" }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Medium", color: "bg-yellow-500", width: "75%" }
    return { label: "Strong", color: "bg-green-500", width: "100%" }
}

export default function RegisterPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const strength = getPasswordStrength(password)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.")
            return
        }
        setLoading(true)

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            })

            if (res.ok) {
                toast.success("Account created! Signing you in...")
                await signIn("credentials", { email, password, redirect: false })
                router.push("/dashboard")
            } else {
                const data = await res.json()
                const msg = data.message || "Registration failed"
                if (msg.toLowerCase().includes("email")) {
                    toast.error("This email is already registered. Try signing in.")
                } else {
                    toast.error(msg)
                }
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-sm">EE</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
                    <p className="mt-2 text-sm text-slate-600">Start your professional learning journey today</p>
                </div>

                <Card className="border-0 shadow-xl shadow-slate-200/60">
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Register</CardTitle>
                            <CardDescription>Fill in your details to get started for free.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Password strength bar */}
                                {password.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                                style={{ width: strength.width }}
                                            />
                                        </div>
                                        <p className={`text-xs font-medium ${
                                            strength.label === "Strong" ? "text-green-600" :
                                            strength.label === "Medium" ? "text-yellow-600" :
                                            "text-red-500"
                                        }`}>
                                            {strength.label}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col pb-2">
                            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white" disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
                            </Button>
                        </CardFooter>
                    </form>

                    <div className="px-6 pb-6 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button type="button" variant="outline" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full gap-2">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>
                            <Button type="button" variant="outline" onClick={() => signIn("linkedin", { callbackUrl: "/dashboard" })} className="w-full gap-2">
                                <svg className="w-4 h-4" fill="#0A66C2" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                LinkedIn
                            </Button>
                        </div>

                        <p className="text-sm text-center text-slate-600">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-blue-900 hover:text-blue-700 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
