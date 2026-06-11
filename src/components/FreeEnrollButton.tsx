"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

export default function FreeEnrollButton({ courseId }: { courseId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEnroll = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/enroll-free", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            })
            if (res.ok) {
                router.push(`/courses/${courseId}?success=true`)
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || "Failed to enroll in free course.")
            }
        } catch (error) {
            console.error("Error during free enrollment:", error)
            alert("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleEnroll}
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 cursor-pointer"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enrolling...
                </>
            ) : (
                <>
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                    Enroll for Free
                </>
            )}
        </Button>
    )
}
