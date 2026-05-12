"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

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
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm font-medium">
                    ✓ Course created successfully!
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Course Title</label>
                    <input name="title" required placeholder="e.g. Generative AI for Business" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea name="description" required rows={3} placeholder="Course overview..." className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 resize-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Price (USD)</label>
                    <input name="price" type="number" required min="0" step="0.01" placeholder="1999" className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Image URL <span className="text-slate-500">(optional)</span></label>
                    <input name="imageUrl" placeholder="https://..." className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                </div>
            </div>

            {/* Modules */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-300">Modules</label>
                    <button type="button" onClick={addModule} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                </div>
                <div className="space-y-3">
                    {modules.map((mod, i) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-slate-400">MODULE {i + 1}</span>
                                {modules.length > 1 && (
                                    <button type="button" onClick={() => removeModule(i)} className="text-slate-500 hover:text-red-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <input value={mod.title} onChange={e => updateModule(i, "title", e.target.value)} placeholder="Module title" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                                <input value={mod.videoUrl} onChange={e => updateModule(i, "videoUrl", e.target.value)} placeholder="Google Drive video URL" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                                <input value={mod.description} onChange={e => updateModule(i, "description", e.target.value)} placeholder="Module description" className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                {loading ? "Creating..." : "Create Course"}
            </button>
        </form>
    )
}
