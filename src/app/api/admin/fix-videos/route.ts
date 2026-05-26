import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Bad URL patterns that were saved by mistake
const BAD_PATTERNS = [
    "w3schools.com",
    "http://localhost:8000",
    "mov_bbb.mp4",
]

function hasBadUrl(modulesJson: string): boolean {
    return BAD_PATTERNS.some(p => modulesJson.includes(p))
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (token !== "fix-my-videos-now") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const courses = await prisma.course.findMany({
            select: { id: true, title: true, modules: true }
        })

        const toFix = courses.filter(c => c.modules && hasBadUrl(c.modules))
        const toFixIds = toFix.map(c => c.id)

        if (toFixIds.length > 0) {
            // Remove related records first (FK constraints)
            await prisma.enrollment.deleteMany({ where: { courseId: { in: toFixIds } } })
            await prisma.payment.deleteMany({ where: { courseId: { in: toFixIds } } })
            await prisma.course.deleteMany({ where: { id: { in: toFixIds } } })
        }

        return NextResponse.json({
            success: true,
            deleted: toFix.length,
            courses: toFix.map(c => ({ id: c.id, title: c.title })),
            message: toFix.length > 0
                ? `✅ Deleted ${toFix.length} bad course(s). Go to Admin → Generate a new course video.`
                : "✅ No bad courses found. All courses look clean."
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
