"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, RotateCcw, Sparkles, CheckCircle, XCircle, Loader2, BookOpen, ExternalLink, RefreshCw } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_VIDEO_API_URL || "http://localhost:8000"

type Status = "idle" | "generating" | "done" | "error"
type PublishStatus = "idle" | "loading" | "success" | "error"

interface JobStatus {
    status: string
    progress: number
    step: string
    video_url: string | null
    thumbnail_url: string | null
    error: string | null
    modules?: { title: string, description: string, videoUrl: string }[]
}

interface Job {
    id: string
    subject: string
    theme: string
    level: string
    status: string
    progress: number
    created_at: number
}

interface CreatedCourse {
    id: string
    title: string
}

const THEMES = [
    { id: "dark-purple", name: "Dark Purple", desc: "Elegant neon violet", dot: "bg-purple-600", border: "border-purple-200", glow: "shadow-purple-100/30" },
    { id: "ocean", name: "Ocean Blue", desc: "Modern deep teal", dot: "bg-cyan-500", border: "border-cyan-200", glow: "shadow-cyan-100/30" },
    { id: "corporate", name: "Corporate", desc: "Sleek slate blue", dot: "bg-blue-600", border: "border-blue-200", glow: "shadow-blue-100/30" },
    { id: "minimal", name: "Minimal Carbon", desc: "Pure slate grey", dot: "bg-slate-400", border: "border-slate-200", glow: "shadow-slate-100/30" },
    { id: "forest", name: "Emerald Forest", desc: "Premium organic moss", dot: "bg-emerald-600", border: "border-emerald-200", glow: "shadow-emerald-100/30" },
]

const LEVELS = [
    { id: "beginner", name: "Beginner", desc: "Introductory concepts" },
    { id: "intermediate", name: "Intermediate", desc: "Core practical applications" },
    { id: "advanced", name: "Advanced", desc: "Complex implementations" },
    { id: "expert", name: "Expert", desc: "Architectural mastery" },
]

export default function VideoGenerator() {
    const [subject, setSubject] = useState("")
    const [theme, setTheme] = useState("dark-purple")
    const [level, setLevel] = useState("intermediate")
    const [uiState, setUiState] = useState<Status>("idle")
    const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [errorMsg, setErrorMsg] = useState("")
    const pollRef = useRef<NodeJS.Timeout | null>(null)

    // Course creation state
    const [courseTitle, setCourseTitle] = useState("")
    const [courseDescription, setCourseDescription] = useState("")
    const [coursePrice, setCoursePrice] = useState("")
    const [publishStatus, setPublishStatus] = useState<PublishStatus>("idle")
    const [createdCourse, setCreatedCourse] = useState<CreatedCourse | null>(null)

    useEffect(() => {
        loadHistory()
        return () => { if (pollRef.current) clearInterval(pollRef.current) }
    }, [])

    async function loadHistory() {
        try {
            const res = await fetch(`${API_URL}/jobs`)
            if (res.ok) setJobs(await res.json())
        } catch {}
    }

    async function startGeneration() {
        if (!subject.trim()) return
        setUiState("generating")
        setPublishStatus("idle")
        setCreatedCourse(null)
        setJobStatus({ status: "pending", progress: 0, step: "Queued...", video_url: null, thumbnail_url: null, error: null })

        try {
            const res = await fetch(`${API_URL}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject: subject.trim(), theme, level }),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Unknown error" }))
                throw new Error(err.detail || `HTTP ${res.status}`)
            }
            const data = await res.json()
            startPolling(data.job_id)
        } catch (err: any) {
            setErrorMsg(err.message)
            setUiState("error")
        }
    }

    function startPolling(id: string) {
        if (pollRef.current) clearInterval(pollRef.current)
        const poll = async () => {
            try {
                const res = await fetch(`${API_URL}/status/${id}`)
                if (!res.ok) return
                const data: JobStatus = await res.json()
                setJobStatus(data)
                if (data.status === "done") {
                    clearInterval(pollRef.current!)
                    setUiState("done")
                    // Pre-fill course title with the subject
                    setCourseTitle(subject.trim())
                    setCourseDescription(`An AI-generated ${level} level lesson on: ${subject.trim()}. Covers key concepts with narrated slides and visual examples.`)
                    loadHistory()
                } else if (data.status === "error") {
                    clearInterval(pollRef.current!)
                    setErrorMsg(data.error || "Pipeline failed.")
                    setUiState("error")
                    loadHistory()
                }
            } catch {}
        }
        poll()
        pollRef.current = setInterval(poll, 3000)
    }

    async function publishCourse() {
        if (!courseTitle.trim() || !courseDescription.trim() || !coursePrice) return
        setPublishStatus("loading")

        const videoUrl = jobStatus?.video_url ? `${API_URL}${jobStatus.video_url}` : ""
        const thumbUrl = jobStatus?.thumbnail_url ? `${API_URL}${jobStatus.thumbnail_url}` : null

        const modules = jobStatus?.modules?.length ? jobStatus.modules.map(mod => ({
            title: mod.title,
            videoUrl: mod.videoUrl ? `${API_URL}${mod.videoUrl}` : "",
            description: mod.description,
            quiz: mod.quiz
        })) : [
            {
                title: courseTitle.trim(),
                videoUrl: videoUrl,
                description: `AI-generated lesson — ${level} level`,
            },
        ];

        const body = {
            title: courseTitle.trim(),
            description: courseDescription.trim(),
            price: parseFloat(coursePrice),
            imageUrl: thumbUrl,
            modules: modules,
        }

        try {
            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed to create course" }))
                throw new Error(err.error || `HTTP ${res.status}`)
            }
            const course = await res.json()
            setCreatedCourse({ id: course.id, title: course.title })
            setPublishStatus("success")
        } catch (err: any) {
            setErrorMsg(err.message)
            setPublishStatus("error")
        }
    }

    function reset() {
        if (pollRef.current) clearInterval(pollRef.current)
        setUiState("idle")
        setJobStatus(null)
        setErrorMsg("")
        setCourseTitle("")
        setCourseDescription("")
        setCoursePrice("")
        setPublishStatus("idle")
        setCreatedCourse(null)
    }

    const progress = jobStatus?.progress ?? 0
    const step = jobStatus?.step ?? "…"
    const videoUrl = jobStatus?.video_url ? `${API_URL}${jobStatus.video_url}` : null
    const thumbUrl = jobStatus?.thumbnail_url ? `${API_URL}${jobStatus.thumbnail_url}` : null

    return (
        <div className="space-y-6">

            {/* ── Form ── */}
            {uiState === "idle" && (
                <Card className="bg-white border border-slate-150/80 rounded-2xl shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Generate a New Video
                        </CardTitle>
                        <CardDescription className="text-slate-550 mt-1">
                            Enter a subject and the AI pipeline will build a full narrated lesson video.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subject / Topic</Label>
                            <Input
                                id="subject"
                                placeholder="e.g. Python decorators for beginners"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && startGeneration()}
                                className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 h-11 shadow-sm rounded-xl"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visual Theme</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                                {THEMES.map(t => {
                                    const active = theme === t.id
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTheme(t.id)}
                                            className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between min-h-[95px] shadow-sm ${
                                                active 
                                                    ? `bg-white border-indigo-650 ring-4 ring-indigo-500/5 ${t.glow}` 
                                                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className={`w-3.5 h-3.5 rounded-full ${t.dot} shadow-sm`} />
                                                {active && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 leading-tight mt-3">{t.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Difficulty Level</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                                {LEVELS.map(l => {
                                    const active = level === l.id
                                    return (
                                        <button
                                            key={l.id}
                                            type="button"
                                            onClick={() => setLevel(l.id)}
                                            className={`p-3.5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between min-h-[80px] shadow-sm ${
                                                active 
                                                    ? "bg-white border-indigo-600 ring-4 ring-indigo-500/5" 
                                                    : "bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30"
                                            }`}
                                        >
                                            <p className={`text-xs font-bold transition-colors ${active ? "text-indigo-600" : "text-slate-900"}`}>{l.name}</p>
                                            <p className="text-[10px] text-slate-400 leading-tight mt-1">{l.desc}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <Button
                            onClick={startGeneration}
                            disabled={!subject.trim()}
                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-45 text-white h-11 text-base font-semibold rounded-xl shadow-md transition-all hover:scale-[1.002] active:scale-[0.998] mt-2 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 mr-2 text-indigo-300 animate-pulse" />
                            Generate Course Video
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Generating ── */}
            {uiState === "generating" && (
                <Card className="bg-white border border-slate-150/80 rounded-2xl shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-slate-900 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 text-indigo-550 animate-spin" />
                                Generating Video…
                            </CardTitle>
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                RUNNING
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">{step}</span>
                                <span className="text-indigo-600 font-bold">{progress}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div
                                    className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center pt-2">
                            Generation takes 3–5 minutes. Do not close this page.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ── Done ── */}
            {uiState === "done" && videoUrl && (
                <>
                    {/* Video preview */}
                    <Card className="bg-white border border-slate-150/80 rounded-2xl shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-slate-900 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    Video Ready
                                </CardTitle>
                                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    DONE
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-5">
                                <div className="rounded-xl overflow-hidden bg-black border border-slate-200">
                                    <video src={videoUrl} controls className="w-full" />
                                </div>
                                {thumbUrl && (
                                    <div className="space-y-2">
                                        <img src={thumbUrl} alt="Thumbnail" className="w-full rounded-xl border border-slate-200 object-cover aspect-video" />
                                        <p className="text-xs text-slate-400 text-center font-medium">Thumbnail</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <a href={videoUrl} download="lesson.mp4" className="flex-1">
                                    <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 font-semibold">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download MP4
                                    </Button>
                                </a>
                                <Button variant="outline" onClick={reset} className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-10 font-semibold">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    New Video
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publish as course */}
                    <Card className="bg-white border border-slate-150/80 rounded-2xl shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-slate-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-500" />
                                Publish as Course
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium mt-1">
                                Turn this video into a course on the platform — the video and thumbnail are linked automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">

                            {/* Success state */}
                            {publishStatus === "success" && createdCourse && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-emerald-800 font-bold text-sm">Course published successfully!</p>
                                            <p className="text-slate-550 text-xs mt-1">&quot;{createdCourse.title}&quot; is now live on the platform.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={`/courses/${createdCourse.id}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View Course
                                            </Button>
                                        </a>
                                        <Button variant="outline" onClick={reset} className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Generate Another
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Form state */}
                            {publishStatus !== "success" && (
                                <div className="space-y-4">
                                    {publishStatus === "error" && (
                                        <div className="bg-red-50 border border-red-150 rounded-xl p-3.5 text-sm text-red-800 font-medium">
                                            {errorMsg}
                                        </div>
                                    )}

                                    {/* Pre-filled fields */}
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Title</Label>
                                        <Input
                                            value={courseTitle}
                                            onChange={e => setCourseTitle(e.target.value)}
                                            placeholder="Course title"
                                            className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 h-11 shadow-sm rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</Label>
                                        <textarea
                                            value={courseDescription}
                                            onChange={e => setCourseDescription(e.target.value)}
                                            rows={3}
                                            placeholder="Course description..."
                                            className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 resize-none shadow-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price (USD)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={coursePrice}
                                            onChange={e => setCoursePrice(e.target.value)}
                                            placeholder="e.g. 199"
                                            className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 h-11 shadow-sm rounded-xl"
                                        />
                                    </div>

                                    {/* Auto-linked info */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-inner">
                                        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Auto-linked Content</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-505">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                            Video: <span className="text-slate-600 truncate font-mono">{videoUrl}</span>
                                        </div>
                                        {thumbUrl && (
                                            <div className="flex items-center gap-2 text-xs text-slate-505">
                                                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                                Thumbnail: <span className="text-slate-600 truncate font-mono">{thumbUrl}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={publishCourse}
                                        disabled={!courseTitle.trim() || !courseDescription.trim() || !coursePrice || publishStatus === "loading"}
                                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-45 text-white h-11 font-semibold rounded-xl"
                                    >
                                        {publishStatus === "loading" ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing…</>
                                        ) : (
                                            <><BookOpen className="w-4 h-4 mr-2" /> Publish Course</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {/* ── Error ── */}
            {uiState === "error" && (
                <Card className="bg-white border border-red-200 rounded-2xl shadow-sm">
                    <CardHeader className="border-b border-red-100 bg-red-50/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-red-800 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                Generation Failed
                            </CardTitle>
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/50">
                                ERROR
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="bg-red-50 border border-red-150 rounded-xl p-4 text-sm text-red-800 break-words font-medium">
                            {errorMsg}
                        </div>
                        <Button variant="outline" onClick={reset} className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── History ── */}
            <Card className="bg-white border border-slate-150/80 rounded-2xl shadow-sm">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-900 text-base font-bold">Recent Jobs</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadHistory}
                        className="border-slate-200 text-slate-655 hover:bg-slate-50 text-xs h-8 px-3 rounded-lg"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="pt-5">
                    {jobs.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6 font-medium">No jobs generated yet.</p>
                    ) : (
                        <div className="space-y-3.5">
                            {jobs.map(j => (
                                <div key={j.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/30 transition-all duration-200 gap-4 shadow-sm">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
                                            <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 leading-snug">{j.subject}</p>
                                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-450 font-medium">
                                                <span className="capitalize">{j.theme.replace("-", " ")} theme</span>
                                                <span>•</span>
                                                <span className="capitalize">{j.level} level</span>
                                                <span>•</span>
                                                <span>{timeAgo(j.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 border-slate-100 pt-3.5 sm:pt-0 shrink-0">
                                        <StatusBadge status={j.status} />
                                        {j.status === "done" && (
                                            <a href={`${API_URL}/files/${j.id}/lesson.mp4`} download>
                                                <Button variant="outline" size="sm" className="border-slate-200 text-slate-655 hover:bg-slate-50 hover:border-slate-300 h-8 text-xs font-semibold px-3 rounded-lg bg-white shadow-sm">
                                                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                    Download MP4
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        done:    "bg-emerald-50 text-emerald-700 border-emerald-150",
        error:   "bg-red-50 text-red-700 border-red-150",
        running: "bg-indigo-50 text-indigo-700 border-indigo-150",
        pending: "bg-slate-50 text-slate-500 border-slate-200",
    }
    return (
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide ${map[status] ?? map.pending}`}>
            {status.toUpperCase()}
        </span>
    )
}

function timeAgo(ts: number) {
    const diff = Math.floor(Date.now() / 1000 - ts)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}
