"use client"
import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)

    if (pathname.includes("/video")) return null

    const navLinks = [
        { href: "/about", label: "About Us" },
        { href: "/courses", label: "Courses" },
        { href: "/#benefits", label: "For Business" },
    ]

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]) && href !== "/#benefits"

    return (
        <header className="border-b bg-white relative z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-blue-950 tracking-tight flex items-center shrink-0">
                    <div className="w-8 h-8 bg-blue-600 font-extrabold text-white flex items-center justify-center rounded-lg mr-2 shadow-sm text-sm">EE</div>
                    Executive<span className="text-blue-600">Edu</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${
                                isActive(link.href)
                                    ? "text-blue-600 border-b-2 border-blue-600 pb-0.5"
                                    : "text-slate-600 hover:text-blue-600"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-3">
                    {session ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all cursor-pointer shrink-0">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold">
                                            {(session.user?.name ?? session.user?.email ?? "?")
                                                .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <Button onClick={() => signOut()} variant="outline" className="text-sm font-medium border-slate-200">
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-blue-700">
                                    Sign in
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-blue-900 hover:bg-blue-800 text-white shadow-md">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    isActive(link.href)
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
                            {session ? (
                                <>
                                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start text-sm font-medium">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start text-sm font-medium">
                                            My Profile
                                        </Button>
                                    </Link>
                                    <Button onClick={() => { signOut(); setMobileOpen(false) }} className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-0 text-sm font-medium">
                                        Log out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                                        <Button variant="outline" className="w-full text-sm font-medium">
                                            Sign in
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                                        <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
