import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import VideoGenerator from "@/components/VideoGenerator"

export default async function VideoGeneratorPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white">Generate Video Course</h1>
                    <p className="text-slate-400 mt-1">Use AI to generate and publish new video courses</p>
                </div>
                <VideoGenerator />
            </div>
        </div>
    )
}
