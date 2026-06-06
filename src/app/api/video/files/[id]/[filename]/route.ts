import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; filename: string }> }
) {
    const { id, filename } = await params

    // Validate filename to prevent path traversal
    if (!/^[\w\-\.]+$/.test(filename) || filename.includes("..")) {
        return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    // Proxy the request to the Python video API (HF Spaces or local)
    const PYTHON_API = (process.env.VIDEO_API_URL || "http://localhost:8000").replace(/\/$/, "")
    const pythonUrl = `${PYTHON_API}/files/${id}/${filename}`

    try {
        const upstream = await fetch(pythonUrl, {
            headers: {
                // Forward range requests for video seeking
                ...(req.headers.get("range") ? { range: req.headers.get("range")! } : {}),
            },
        })

        if (!upstream.ok) {
            return NextResponse.json({ error: "File not found" }, { status: upstream.status })
        }

        const contentType = filename.endsWith(".mp4") ? "video/mp4"
            : filename.endsWith(".png") ? "image/png"
            : "application/octet-stream"

        const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600",
            "Accept-Ranges": "bytes",
        }

        // Forward range response headers
        const contentRange = upstream.headers.get("content-range")
        const contentLength = upstream.headers.get("content-length")
        if (contentRange) headers["Content-Range"] = contentRange
        if (contentLength) headers["Content-Length"] = contentLength

        return new Response(upstream.body, {
            status: upstream.status,
            headers,
        })
    } catch (err) {
        console.error("Video proxy error:", err)
        return NextResponse.json({ error: "Failed to fetch video" }, { status: 502 })
    }
}
