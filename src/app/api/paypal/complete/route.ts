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

        // Generate simulated PayPal transaction/order ID
        const mockOrderId = `PAYPAL-MOCK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`

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
                    amount: course.price,
                    paymentMethod: "PAYPAL",
                    paypalOrderId: mockOrderId,
                    status: "COMPLETED"
                }
            })
        ])

        // Send enrollment confirmation email
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user?.email) {
            sendEnrollmentEmail(user.email, user.name ?? "there", course.title, course.id).catch(console.error)
        }

        return NextResponse.json({ success: true, orderId: mockOrderId })
    } catch (error) {
        console.error("PayPal complete transaction error:", error)
        return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
    }
}
