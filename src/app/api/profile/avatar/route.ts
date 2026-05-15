import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const MAX_SIZE = 3 * 1024 * 1024 // 3MB

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = (session.user as any).id

    const formData = await req.formData()
    const file = formData.get("avatar") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Image must be under 3MB" }, { status: 400 })
    }

    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg"
    const filename = `${userId}.${ext}`
    const dir = path.join(process.cwd(), "public", "avatars")
    const filepath = path.join(dir, filename)

    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const imageUrl = `/avatars/${filename}?t=${Date.now()}`

    await prisma.user.update({
        where: { id: userId },
        data: { image: imageUrl },
    })

    return NextResponse.json({ imageUrl })
}
