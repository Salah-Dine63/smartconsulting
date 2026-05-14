"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download, RotateCcw, Sparkles, CheckCircle, XCircle, Loader2, BookOpen, ExternalLink } from "lucide-react"

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

        const body = {
            title: courseTitle.trim(),
            description: courseDescription.trim(),
            price: parseFloat(coursePrice),
            imageUrl: thumbUrl,
            modules: [
                {
                    title: courseTitle.trim(),
                    videoUrl: videoUrl,
                    description: `AI-generated lesson — ${level} level`,
                },
            ],
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
                <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                    <CardHeader className="border-b border-slate-800">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            Generate a New Video
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Enter a subject and the AI pipeline will build a full narrated lesson video.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-slate-300">Subject / Topic</Label>
                            <Input
                                id="subject"
                                placeholder="e.g. Python decorators for beginners"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && startGeneration()}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 h-11"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme" className="text-slate-300">Visual Theme</Label>
                                <select
                                    id="theme"
                                    value={theme}
                                    onChange={e => setTheme(e.target.value)}
                                    className="w-full h-11 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm focus:outline-none focus:border-purple-500"
                                >
                                    <option value="dark-purple">Dark Purple</option>
                                    <option value="ocean">Ocean</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="minimal">Minimal</option>
                                    <option value="forest">Forest</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="level" className="text-slate-300">Difficulty Level</Label>
                                <select
                                    id="level"
                                    value={level}
                                    onChange={e => setLevel(e.target.value)}
                                    className="w-full h-11 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 text-sm focus:outline-none focus:border-purple-500"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={startGeneration}
                            disabled={!subject.trim()}
                            className="w-full bg-purple-700 hover:bg-purple-600 text-white h-11 text-base font-semibold disabled:opacity-40"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Video
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Generating ── */}
            {uiState === "generating" && (
                <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                    <CardHeader className="border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                Generating Video…
                            </CardTitle>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                RUNNING
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">{step}</span>
                                <span className="text-purple-400 font-semibold">{progress}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-700"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 text-center pt-2">
                            Generation takes 3–5 minutes. Do not close this page.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ── Done ── */}
            {uiState === "done" && videoUrl && (
                <>
                    {/* Video preview */}
                    <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                        <CardHeader className="border-b border-slate-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    Video Ready
                                </CardTitle>
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                    DONE
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-5">
                                <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
                                    <video src={videoUrl} controls className="w-full" />
                                </div>
                                {thumbUrl && (
                                    <div className="space-y-2">
                                        <img src={thumbUrl} alt="Thumbnail" className="w-full rounded-xl border border-slate-800 object-cover" />
                                        <p className="text-xs text-slate-500 text-center">Thumbnail</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <a href={videoUrl} download="lesson.mp4" className="flex-1">
                                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:border-purple-500 hover:text-purple-400">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download MP4
                                    </Button>
                                </a>
                                <Button variant="outline" onClick={reset} className="border-slate-700 text-slate-300 hover:border-slate-500">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    New Video
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Publish as course */}
                    <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                        <CardHeader className="border-b border-slate-800">
                            <CardTitle className="text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                                Publish as Course
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Turn this video into a course on the platform — the video and thumbnail are linked automatically.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">

                            {/* Success state */}
                            {publishStatus === "success" && createdCourse && (
                                <div className="space-y-4">
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-green-400 font-semibold text-sm">Course published successfully!</p>
                                            <p className="text-slate-400 text-xs mt-1">"{createdCourse.title}" is now live on the platform.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <a href={`/courses/${createdCourse.id}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full bg-blue-700 hover:bg-blue-600 text-white">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View Course
                                            </Button>
                                        </a>
                                        <Button variant="outline" onClick={reset} className="border-slate-700 text-slate-300">
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
                                        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 text-sm text-red-300">
                                            {errorMsg}
                                        </div>
                                    )}

                                    {/* Pre-filled fields */}
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Course Title</Label>
                                        <Input
                                            value={courseTitle}
                                            onChange={e => setCourseTitle(e.target.value)}
                                            placeholder="Course title"
                                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Description</Label>
                                        <textarea
                                            value={courseDescription}
                                            onChange={e => setCourseDescription(e.target.value)}
                                            rows={3}
                                            placeholder="Course description..."
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-500 resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Price (USD)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={coursePrice}
                                            onChange={e => setCoursePrice(e.target.value)}
                                            placeholder="e.g. 199"
                                            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 h-11"
                                        />
                                    </div>

                                    {/* Auto-linked info */}
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 space-y-2">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Auto-linked</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                                            Video: <span className="text-slate-300 truncate">{videoUrl}</span>
                                        </div>
                                        {thumbUrl && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                                                Thumbnail: <span className="text-slate-300 truncate">{thumbUrl}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={publishCourse}
                                        disabled={!courseTitle.trim() || !courseDescription.trim() || !coursePrice || publishStatus === "loading"}
                                        className="w-full bg-blue-700 hover:bg-blue-600 text-white h-11 font-semibold disabled:opacity-40"
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
                <Card className="bg-slate-900 border-red-900/50 rounded-2xl">
                    <CardHeader className="border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-400" />
                                Generation Failed
                            </CardTitle>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                ERROR
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4 text-sm text-red-300 break-words">
                            {errorMsg}
                        </div>
                        <Button variant="outline" onClick={reset} className="w-full border-slate-700 text-slate-300 hover:border-slate-500">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── History ── */}
            <Card className="bg-slate-900 border-slate-800 rounded-2xl">
                <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-base">Recent Jobs</CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadHistory}
                        className="border-slate-700 text-slate-400 hover:text-white text-xs h-7"
                    >
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="pt-4">
                    {jobs.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-6">No jobs yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {jobs.map(j => (
                                <div key={j.id} className="flex items-center justify-between py-3.5">
                                    <div>
                                        <p className="text-sm font-medium text-white">{j.subject}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {j.theme} · {j.level} · {timeAgo(j.created_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={j.status} />
                                        {j.status === "done" && (
                                            <a href={`${API_URL}/files/${j.id}/lesson.mp4`} download>
                                                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-purple-400 h-7 text-xs">
                                                    <Download className="w-3 h-3" />
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
        done:    "bg-green-500/10 text-green-400 border-green-500/20",
        error:   "bg-red-500/10 text-red-400 border-red-500/20",
        running: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        pending: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    }
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${map[status] ?? map.pending}`}>
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
