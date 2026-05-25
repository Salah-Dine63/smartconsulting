import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { subject, theme, level } = await req.json()
        
        // We create a mock job ID that embeds the start time 
        // so we can simulate progress over time without a real database.
        const encodedSubject = Buffer.from(subject || "unknown").toString('base64')
        const jobId = `mock-job-${Date.now()}-${encodedSubject}`
        
        return NextResponse.json({ job_id: jobId })
    } catch (e) {
        return NextResponse.json({ detail: "Invalid request payload" }, { status: 400 })
    }
}
