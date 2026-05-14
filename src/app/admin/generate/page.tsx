import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Video } from "lucide-react"
import VideoGenerator from "@/components/VideoGenerator"

export default async function GenerateVideoPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8">
            <div className="max-w-3xl mx-auto">

                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Admin
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Video className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-white">AI Video Generator</h1>
                            <p className="text-slate-400 text-sm mt-0.5">Generate narrated lesson videos from any subject</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0 animate-pulse" />
                    <p className="text-sm text-slate-400">
                        Make sure the <span className="text-purple-300 font-medium">FastAPI server</span> is running on{" "}
                        <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-purple-300">
                            http://localhost:8000
                        </code>
                        {" "}before generating.
                    </p>
                </div>

                <VideoGenerator />
            </div>
        </div>
    )
}
