"use client"

import { useState } from "react"
import { Plus, X, BookOpen, Layers } from "lucide-react"

export default function AdminCourseForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [modules, setModules] = useState([{ title: "", videoUrl: "", description: "" }])

    const addModule = () => setModules([...modules, { title: "", videoUrl: "", description: "" }])
    const removeModule = (i: number) => setModules(modules.filter((_, idx) => idx !== i))
    const updateModule = (i: number, field: string, value: string) => {
        const updated = [...modules]
        updated[i] = { ...updated[i], [field]: value }
        setModules(updated)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const form = new FormData(e.currentTarget)

        const body = {
            title: form.get("title"),
            description: form.get("description"),
            price: parseFloat(form.get("price") as string),
            imageUrl: form.get("imageUrl"),
            modules,
        }

        try {
            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (res.ok) {
                setSuccess(true)
                setModules([{ title: "", videoUrl: "", description: "" }])
                ;(e.target as HTMLFormElement).reset()
                setTimeout(() => setSuccess(false), 4000)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
                <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Course curriculum created successfully!
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Title</label>
                    <input 
                        name="title" 
                        required 
                        placeholder="e.g. Generative AI for Business Automation" 
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-400 transition-all duration-205 shadow-sm" 
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea 
                        name="description" 
                        required 
                        rows={3} 
                        placeholder="Course overview and core objectives..." 
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-400 transition-all duration-205 resize-none shadow-sm" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price (USD)</label>
                    <input 
                        name="price" 
                        type="number" 
                        required 
                        min="0" 
                        step="0.01" 
                        placeholder="199" 
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-400 transition-all duration-205 shadow-sm" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Image URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input 
                        name="imageUrl" 
                        placeholder="https://..." 
                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-400 transition-all duration-205 shadow-sm" 
                    />
                </div>
            </div>

            {/* Modules */}
            <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Course Modules</label>
                    </div>
                    <button 
                        type="button" 
                        onClick={addModule} 
                        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 px-3 py-1.5 rounded-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                </div>
                <div className="space-y-3">
                    {modules.map((mod, i) => (
                        <div key={i} className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 relative group hover:border-slate-300 transition-colors">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-150 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Module {i + 1}</span>
                                </div>
                                {modules.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeModule(i)} 
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                                <input 
                                    value={mod.title} 
                                    onChange={e => updateModule(i, "title", e.target.value)} 
                                    required
                                    placeholder="Module title" 
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all shadow-sm" 
                                />
                                <input 
                                    value={mod.videoUrl} 
                                    onChange={e => updateModule(i, "videoUrl", e.target.value)} 
                                    required
                                    placeholder="Video URL (e.g. /files/job_id/lesson.mp4)" 
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all font-mono shadow-sm" 
                                />
                                <textarea 
                                    value={mod.description} 
                                    onChange={e => updateModule(i, "description", e.target.value)} 
                                    required
                                    rows={2}
                                    placeholder="Module description" 
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 transition-all resize-none shadow-sm" 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold px-6 py-3.5 rounded-xl text-sm shadow-md transition-all hover:scale-[1.002] active:scale-[0.998] cursor-pointer"
            >
                {loading ? "Creating Course..." : "Create Course"}
            </button>
        </form>
    )
}
