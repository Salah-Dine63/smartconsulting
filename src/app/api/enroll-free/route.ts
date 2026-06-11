import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEnrollmentEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
        }

        const { courseId } = await req.json()

        if (!courseId) {
            return NextResponse.json({ error: "Missing courseId" }, { status: 400 })
        }

        // Fetch course
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        })

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 })
        }

        // Verify that the course is indeed free
        if (course.price !== 0) {
            return NextResponse.json({ error: "This course is not free. Payment is required." }, { status: 400 })
        }

        // Execute transaction to record payment and enrollment
        await prisma.$transaction([
            // 1. Create enrollment
            prisma.enrollment.upsert({
                where: {
                    userId_courseId: {
                        userId,
                        courseId,
                    }
                },
                update: {
                    status: "ACTIVE"
                },
                create: {
                    userId,
                    courseId,
                    status: "ACTIVE"
                }
            }),

            // 2. Record payment
            prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    amount: 0,
                    paymentMethod: "FREE",
                    status: "COMPLETED"
                }
            })
        ])

        // Send enrollment confirmation email
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.email) {
            sendEnrollmentEmail(user.email, user.name ?? "there", course.title, course.id).catch(console.error)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Free enrollment transaction error:", error)
        return NextResponse.json({ error: "Failed to process enrollment" }, { status: 500 })
    }
}
