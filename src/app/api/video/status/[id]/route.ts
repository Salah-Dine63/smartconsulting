import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    
    // Parse the creation time from our mock ID
    const match = id.match(/^mock-job-(\d+)-/)
    if (!match) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }
    
    const startTime = parseInt(match[1])
    const elapsedSeconds = (Date.now() - startTime) / 1000
    
    let status = "pending"
    let progress = 0
    let step = "Initializing..."
    
    // Simulate progression over 15 seconds
    if (elapsedSeconds > 15) {
        status = "done"
        progress = 100
        step = "Video completed"
    } else if (elapsedSeconds > 10) {
        status = "running"
        progress = 85
        step = "Rendering final video..."
    } else if (elapsedSeconds > 6) {
        status = "running"
        progress = 55
        step = "Generating visual slides..."
    } else if (elapsedSeconds > 2) {
        status = "running"
        progress = 25
        step = "Writing lesson script..."
    }
    
    return NextResponse.json({
        status,
        progress,
        step,
        // We use a sample video URL when it finishes
        video_url: status === "done" ? "https://www.w3schools.com/html/mov_bbb.mp4" : null,
        thumbnail_url: status === "done" ? "https://picsum.photos/seed/video/800/450" : null,
        error: null,
        modules: status === "done" ? [
            {
                title: "Part 1: Introduction",
                description: "Basic overview of the generated concepts.",
                videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
            }
        ] : null
    })
}
