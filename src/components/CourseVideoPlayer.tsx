"use client"

import { useState } from "react"
import { PlayCircle, ArrowLeft, Lock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import VideoChatbot from "@/components/VideoChatbot"

interface Module {
    title: string
    videoUrl?: string
    description?: string
    quiz?: any
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
    const [completedModules, setCompletedModules] = useState<number[]>([])
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
    
    const active = normalizeModule(modules[activeIndex], activeIndex)
    const progress = Math.round(((completedModules.length) / modules.length) * 100) || 0
    const embedUrl = toEmbedUrl(active.videoUrl)

    function handleVideoEnd() {
        if (!completedModules.includes(activeIndex)) {
            setCompletedModules([...completedModules, activeIndex])
        }
    }

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
                    {modules.map((mod, i) => {
                        const isLocked = i > 0 && !completedModules.includes(i - 1)
                        return (
                        <button
                            key={i}
                            onClick={() => { if (!isLocked) setActiveIndex(i) }}
                            disabled={isLocked}
                            className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all duration-200 ${
                                i === activeIndex
                                    ? "bg-blue-600/10 border border-blue-500/20"
                                    : "hover:bg-slate-800 border border-transparent"
                            } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {isLocked ? (
                                <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                            ) : i === activeIndex ? (
                                <PlayCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            ) : completedModules.includes(i) ? (
                                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-500 shrink-0 mt-0.5" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-700 shrink-0 mt-0.5" />
                            )}
                            <span
                                className={`text-sm tracking-wide ${
                                    i === activeIndex
                                        ? "text-blue-100 font-semibold"
                                        : isLocked
                                        ? "text-slate-600 font-medium"
                                        : "text-slate-300 font-medium"
                                }`}
                            >
                                {normalizeModule(mod, i).title}
                            </span>
                        </button>
                    )})}
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
                                onEnded={handleVideoEnd}
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
                    <div className="max-w-5xl mx-auto w-full mt-8 overflow-y-auto pb-12">
                        <h1 className="text-3xl font-extrabold text-white mb-4">{active.title}</h1>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-3xl mb-8">{active.description}</p>
                        
                        {active.quiz && (
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-3xl">
                                <h3 className="text-xl font-bold text-white mb-4">Knowledge Check</h3>
                                <p className="text-slate-300 font-medium mb-4">{active.quiz.question}</p>
                                <div className="space-y-3">
                                    {active.quiz.options.map((opt: string, optIdx: number) => {
                                        const selected = quizAnswers[activeIndex]
                                        const isAnswered = selected !== undefined
                                        const isCorrect = isAnswered && optIdx === active.quiz.correct_index
                                        const isWrong = isAnswered && selected === optIdx && selected !== active.quiz.correct_index
                                        
                                        return (
                                            <button
                                                key={optIdx}
                                                disabled={isAnswered}
                                                onClick={() => setQuizAnswers({...quizAnswers, [activeIndex]: optIdx})}
                                                className={`w-full text-left p-4 rounded-lg border transition-all ${
                                                    isCorrect ? "bg-green-500/10 border-green-500/50 text-green-400" :
                                                    isWrong ? "bg-red-500/10 border-red-500/50 text-red-400" :
                                                    isAnswered ? "bg-slate-800/50 border-slate-800 text-slate-500" :
                                                    "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:bg-slate-800/80"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>{opt}</span>
                                                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                    {isWrong && <XCircle className="w-5 h-5 text-red-500" />}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                                {quizAnswers[activeIndex] !== undefined && (
                                    <div className={`mt-6 p-4 rounded-lg text-sm border ${
                                        quizAnswers[activeIndex] === active.quiz.correct_index 
                                            ? "bg-green-500/10 border-green-500/20 text-green-300" 
                                            : "bg-blue-500/10 border-blue-500/20 text-blue-300"
                                    }`}>
                                        <p className="font-semibold mb-1">Explanation:</p>
                                        <p>{active.quiz.explanation}</p>
                                    </div>
                                )}
                            </div>
                        )}
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
