import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const PYTHON_API = (process.env.VIDEO_API_URL || "http://localhost:8000").replace(/\/$/, "");
        const res = await fetch(`${PYTHON_API}/status/${id}`)
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (e: any) {
        return NextResponse.json({ detail: `Video API unavailable: ${e.message}` }, { status: 503 })
    }
}
