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
                    <div className="w-8 h-8 bg-blue-600 font-extrabold text-white flex items-center justify-center rounded-lg mr-2 shadow-sm text-sm">EE</div>
                    Executive<span className="text-blue-600">Edu</span>
                </Link>
                <nav className="hidden md:flex gap-8 items-center">
                    <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About Us</Link>
                    <Link href="/courses/1" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Courses</Link>
                    <Link href="/#benefits" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">For Business</Link>
                </nav>
                <div className="flex items-center gap-4">
                    {session ? (
                        <>
<<<<<<< Updated upstream
                            <Link href="/dashboard">
                                <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">Dashboard</Button>
=======
                            {(session.user as any)?.role === "ADMIN" ? (
                                <Link href="/admin">
                                    <Button variant="ghost" className="text-sm font-medium text-purple-700 hover:text-purple-800">Admin Panel</Button>
                                </Link>
                            ) : (
                                <Link href="/dashboard">
                                    <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">Dashboard</Button>
                                </Link>
                            )}
                            <Link href="/profile">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm hover:bg-blue-700 transition-colors cursor-pointer">
                                    {(session.user?.name ?? session.user?.email ?? "?")
                                        .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
>>>>>>> Stashed changes
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
