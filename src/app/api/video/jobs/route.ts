import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const res = await fetch("http://localhost:8000/jobs")
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (e: any) {
        return NextResponse.json([], { status: 200 })
    }
}
