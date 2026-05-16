import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, context: any) {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params

    try {
        await prisma.$transaction([
            prisma.enrollment.deleteMany({ where: { courseId: id } }),
            prisma.payment.deleteMany({ where: { courseId: id } }),
            prisma.course.delete({ where: { id: id } }),
        ])
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete course:", error)
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
    }
}
