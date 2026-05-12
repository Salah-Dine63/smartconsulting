import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { title, description, price, imageUrl, modules } = await req.json()

    if (!title || !description || !price) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const course = await prisma.course.create({
        data: {
            title,
            description,
            price,
            imageUrl: imageUrl || null,
            modules: JSON.stringify(modules ?? []),
        },
    })

    return NextResponse.json(course, { status: 201 })
}
