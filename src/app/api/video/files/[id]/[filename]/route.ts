import { NextResponse } from "next/server"
import { createReadStream, existsSync, statSync } from "fs"
import { join } from "path"
import { Readable } from "stream"

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

    // Check video_api/output first, then root output/
    const possiblePaths = [
        join(process.cwd(), "video_api", "output", id, filename),
        join(process.cwd(), "video_api", "output", id, "slides", filename),
        join(process.cwd(), "output", id, filename),
        join(process.cwd(), "output", id, "slides", filename),
    ]

    let filePath: string | null = null
    for (const p of possiblePaths) {
        if (existsSync(p)) { filePath = p; break }
    }

    if (!filePath) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const stat = statSync(filePath)
    const contentType = filename.endsWith(".mp4") ? "video/mp4"
        : filename.endsWith(".png") ? "image/png"
        : "application/octet-stream"

    // Support range requests for video seeking
    const rangeHeader = req.headers.get("range")
    if (rangeHeader && contentType === "video/mp4") {
        const [startStr, endStr] = rangeHeader.replace("bytes=", "").split("-")
        const start = parseInt(startStr, 10)
        const end = endStr ? parseInt(endStr, 10) : stat.size - 1
        const chunkSize = end - start + 1

        const stream = createReadStream(filePath, { start, end })
        const readable = Readable.toWeb(stream) as ReadableStream

        return new Response(readable, {
            status: 206,
            headers: {
                "Content-Range": `bytes ${start}-${end}/${stat.size}`,
                "Accept-Ranges": "bytes",
                "Content-Length": String(chunkSize),
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        })
    }

    const stream = createReadStream(filePath)
    const readable = Readable.toWeb(stream) as ReadableStream

    return new Response(readable, {
        status: 200,
        headers: {
            "Content-Length": String(stat.size),
            "Content-Type": contentType,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=3600",
        },
    })
}
