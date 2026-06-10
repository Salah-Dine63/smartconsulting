"use client"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"

export default function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    if (pathname.includes("/video")) return null

    return (
        <header className="border-b bg-white relative z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-blue-950 tracking-tight flex items-center">
                    <div className="w-10 h-10 mr-2 rounded-xl bg-blue-950/5 border border-blue-200 shadow-sm flex items-center justify-center">
                        <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="8" y="8" width="48" height="48" rx="12" fill="#0f172a" />
                            <path d="M32 18L20 30L32 42L44 30L32 18Z" fill="#38bdf8" />
                            <circle cx="32" cy="30" r="5" fill="#ffffff" />
                            <path d="M18 30H12M52 30H46M32 44V50" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                    </div>
                    Agent<span className="text-blue-600">ix</span>
                </Link>
                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About Us</Link>
                    <Link href="/plans" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Courses</Link>
                    <Link href="/#benefits" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">For Business</Link>
                </nav>
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
                            {(session.user as { role?: string })?.role === "ADMIN" ? (
                                <div className="flex items-center gap-2">
                                    <Link href="/admin/video-generator">
                                        <Button variant="ghost" className="text-sm font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1.5 bg-indigo-50/50">
                                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                            AI Generator
                                        </Button>
                                    </Link>
                                    <Link href="/admin">
                                        <Button variant="ghost" className="text-sm font-medium text-purple-700 hover:text-purple-800">Admin Panel</Button>
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">Dashboard</Button>
                                </Link>
                            )}
                            <Link href="/profile">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm hover:bg-blue-700 transition-colors cursor-pointer overflow-hidden">
                                    {(session.user as any)?.image ? (
                                        <img src={(session.user as any).image} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        (session.user?.name ?? session.user?.email ?? "?")
                                            .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
                                    )}
                                </div>
                            </Link>
                            <Button onClick={() => signOut()} variant="outline" className="text-sm font-medium border-slate-200">Log out</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">Sign in</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-blue-900 hover:bg-blue-800 text-white shadow-md">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
