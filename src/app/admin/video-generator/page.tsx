import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import VideoGenerator from "@/components/VideoGenerator"
import Link from "next/link"
import { ArrowLeft, Cpu, Activity, ShieldCheck, Terminal } from "lucide-react"

export default async function VideoGeneratorPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-650 font-sans pb-16">
            {/* Top Premium Navbar decoration / accent line */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />
            
            <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Back Navigation Button */}
                <div className="mb-8">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-all duration-200 group bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm">
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Return to Admin Console
                    </Link>
                </div>

                {/* Main Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pb-6 border-b border-slate-200/85">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                AI Pipeline Active
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Course Video Generator</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">
                            Generate high-fidelity business lessons complete with high-end voice narration and thematic slides.
                        </p>
                    </div>

                    {/* Admin Engine Metadata */}
                    <div className="flex gap-4 bg-white border border-slate-150/80 rounded-xl p-3.5 shrink-0 self-start md:self-auto shadow-sm">
                        <div className="flex items-center gap-2 text-xs text-slate-650 pr-4 border-r border-slate-100">
                            <Cpu className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                            <div>
                                <p className="font-bold text-slate-900">FastAPI API</p>
                                <p className="text-[10px] text-slate-400 font-semibold">Port 8000</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-650">
                            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            <div>
                                <p className="font-bold text-slate-900">Authorized</p>
                                <p className="text-[10px] text-slate-400 font-semibold">Admin Session</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Inner Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                    
                    {/* Left Column: The Generator itself */}
                    <div className="space-y-6">
                        <VideoGenerator />
                    </div>

                    {/* Right Column: Administrative Controls & Information */}
                    <div className="space-y-6">
                        {/* Box 1: Platform Rules */}
                        <div className="bg-white border border-slate-150/80 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Activity className="w-4.5 h-4.5 text-indigo-600" />
                                Processing Info
                            </h3>
                            <ul className="space-y-4 text-xs text-slate-500 font-medium">
                                <li className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">•</span>
                                    <span>Each generation synthesizes **slides**, **narrated voice overs**, and compiles them with **MoviePy**.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">•</span>
                                    <span>A lesson typically generates **6 to 10 thematic slides** depending on depth.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-indigo-600 font-bold">•</span>
                                    <span>**Persistence:** Video modules are linked into DB automatically upon publishing.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Box 2: System Logs Status */}
                        <div className="bg-white border border-slate-150/80 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Terminal className="w-4.5 h-4.5 text-indigo-600" />
                                Pipeline Logs
                            </h3>
                            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-850 font-mono text-[10px] text-slate-350 leading-relaxed min-h-[130px] flex flex-col justify-between shadow-inner">
                                <div className="space-y-1">
                                    <p className="text-slate-500">{"// Engine status checked..."}</p>
                                    <p className="text-slate-400">Restored local cached sessions</p>
                                    <p className="text-emerald-400">FastAPI backend listener live</p>
                                </div>
                                <div className="border-t border-slate-850 pt-2.5 text-slate-500 text-[9px] flex justify-between font-sans font-bold">
                                    <span>Engine: 1.0.0</span>
                                    <span className="text-emerald-400">ONLINE</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
