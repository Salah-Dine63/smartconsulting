"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return
        
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed to delete")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to delete course")
            setLoading(false)
        }
    }

    return (
        <button 
            onClick={handleDelete} 
            disabled={loading}
            className="ml-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Course"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    )
}
