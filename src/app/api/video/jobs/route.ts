import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const PYTHON_API = (process.env.VIDEO_API_URL || "http://localhost:8000").replace(/\/$/, "")

export async function GET() {
    try {
        const res = await fetch(`${PYTHON_API}/jobs`)
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (e: any) {
        return NextResponse.json([], { status: 200 })
    }
}
