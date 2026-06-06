import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const PYTHON_API = (process.env.VIDEO_API_URL || "http://localhost:8000").replace(/\/$/, "");
        const body = await req.json()
        const res = await fetch(`${PYTHON_API}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (e: any) {
        return NextResponse.json({ detail: `Video API unavailable: ${e.message}` }, { status: 503 })
    }
}
