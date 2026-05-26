import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    // Security: require a secret token in query params
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    
    if (token !== "fix-my-videos-now") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const courses = await prisma.course.findMany({
            select: { id: true, title: true, modules: true }
        })

        const toFix = courses.filter(c => c.modules && c.modules.includes("w3schools.com"))
        const toFixIds = toFix.map(c => c.id)

        console.log(`Found ${toFix.length} courses with cartoon video URLs:`, toFixIds)

        // Delete the offending courses entirely so the user can regenerate them cleanly
        if (toFixIds.length > 0) {
            // First remove enrollments referencing these courses
            await prisma.enrollment.deleteMany({
                where: { courseId: { in: toFixIds } }
            })
            await prisma.payment.deleteMany({
                where: { courseId: { in: toFixIds } }
            })
            await prisma.course.deleteMany({
                where: { id: { in: toFixIds } }
            })
        }

        return NextResponse.json({
            success: true,
            deleted: toFix.length,
            courses: toFix.map(c => ({ id: c.id, title: c.title })),
            message: toFix.length > 0
                ? `Deleted ${toFix.length} course(s) with cartoon video. Please regenerate them from the Admin dashboard.`
                : "No courses had the cartoon video URL. The problem may be elsewhere."
        })
    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
