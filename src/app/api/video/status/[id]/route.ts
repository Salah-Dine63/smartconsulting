import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const res = await fetch(`http://localhost:8000/status/${id}`)
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (e: any) {
        return NextResponse.json({ detail: `Video API unavailable: ${e.message}` }, { status: 503 })
    }
}
