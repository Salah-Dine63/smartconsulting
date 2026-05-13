"use client"

import { useState } from "react"
import { PlayCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import VideoChatbot from "@/components/VideoChatbot"

interface Module {
    title: string
    videoUrl?: string
    description?: string
}

interface Props {
    courseTitle: string
    modules: (Module | string)[]
}

function normalizeModule(mod: Module | string, index: number): Module {
    if (typeof mod === "string") {
        return { title: mod, videoUrl: "", description: "" }
    }
    return mod
}

function isLocalVideo(url?: string): boolean {
    if (!url) return false
    return url.startsWith("/") || /\.(mp4|webm|ogg|mov)$/i.test(url)
}

function toEmbedUrl(url?: string): string {
    if (!url) return ""
    if (url.includes("drive.google.com/file/d/")) {
        return url.replace(/\/view.*$/, "/preview").replace(/\/edit.*$/, "/preview")
    }
    return url
}

export default function CourseVideoPlayer({ courseTitle, modules }: Props) {
    const [activeIndex, setActiveIndex] = useState(0)
    const active = normalizeModule(modules[activeIndex], activeIndex)
    const progress = Math.round(((activeIndex + 1) / modules.length) * 100)
    const embedUrl = toEmbedUrl(active.videoUrl)

    return (
        <div className="flex bg-slate-950 text-slate-300" style={{ minHeight: "calc(100vh - 64px)" }}>
            {/* Sidebar */}
            <aside className="w-80 border-r border-slate-800 bg-slate-900 overflow-y-auto hidden md:block">
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h2 className="text-xl font-bold text-white line-clamp-2 leading-tight">{courseTitle}</h2>
                    <div className="mt-4 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{progress}% COMPLETED</p>
                </div>
                <div className="p-4 space-y-2">
                    {modules.map((mod, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all duration-200 ${
                                i === activeIndex
                                    ? "bg-blue-600/10 border border-blue-500/20"
                                    : "hover:bg-slate-800 border border-transparent"
                            }`}
                        >
                            {i === activeIndex ? (
                                <PlayCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            ) : i < activeIndex ? (
                                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-500 shrink-0 mt-0.5" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-700 shrink-0 mt-0.5" />
                            )}
                            <span
                                className={`text-sm tracking-wide ${
                                    i === activeIndex
                                        ? "text-blue-100 font-semibold"
                                        : i < activeIndex
                                        ? "text-slate-300 font-medium"
                                        : "text-slate-400 font-medium"
                                }`}
                            >
                                {normalizeModule(mod, i).title}
                            </span>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 bg-black p-4 md:p-8 flex flex-col">
                    <div className="aspect-video w-full max-w-5xl mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex-shrink-0">
                        {isLocalVideo(active.videoUrl) ? (
                            <video
                                key={active.videoUrl}
                                src={active.videoUrl}
                                className="w-full h-full"
                                controls
                                controlsList="nodownload"
                            />
                        ) : embedUrl ? (
                            <iframe
                                key={embedUrl}
                                src={embedUrl}
                                className="w-full h-full"
                                allow="autoplay"
                                allowFullScreen
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                                Video coming soon
                            </div>
                        )}
                    </div>
                    <div className="max-w-5xl mx-auto w-full mt-8 overflow-y-auto">
                        <h1 className="text-3xl font-extrabold text-white mb-4">{active.title}</h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">{active.description}</p>
                    </div>
                </div>
            </main>

            {/* Chatbot Sidebar */}
            <VideoChatbot
                courseTitle={courseTitle}
                moduleTitle={active.title}
                moduleDescription={active.description ?? ""}
            />
        </div>
    )
}
