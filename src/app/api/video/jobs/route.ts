import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json([]) // Return empty jobs history for now to avoid complexity
}
