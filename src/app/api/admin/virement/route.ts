import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEnrollmentEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const { transferId, action } = await req.json()

        if (!transferId || !action || !["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid transfer ID or action" }, { status: 400 })
        }

        // Fetch the bank transfer request
        const transfer = await prisma.bankTransfer.findUnique({
            where: { id: transferId },
        })

        if (!transfer) {
            return NextResponse.json({ error: "Bank transfer request not found" }, { status: 404 })
        }

        if (transfer.status !== "PENDING") {
            return NextResponse.json({ error: "Bank transfer has already been processed" }, { status: 400 })
        }

        if (action === "approve") {
            if (!transfer.courseId) {
                return NextResponse.json({ error: "No course ID linked to this transfer" }, { status: 400 })
            }

            // Fetch course
            const course = await prisma.course.findUnique({
                where: { id: transfer.courseId }
            })

            if (!course) {
                return NextResponse.json({ error: "Course not found" }, { status: 404 })
            }

            // Run approval transaction
            await prisma.$transaction([
                // 1. Update transfer status
                prisma.bankTransfer.update({
                    where: { id: transferId },
                    data: { status: "APPROVED" }
                }),

                // 2. Update matching PENDING payment to COMPLETED
                prisma.payment.updateMany({
                    where: {
                        userId: transfer.userId,
                        courseId: transfer.courseId,
                        paymentMethod: "BANK_TRANSFER",
                        status: "PENDING"
                    },
                    data: { status: "COMPLETED" }
                }),

                // 3. Create or activate enrollment
                prisma.enrollment.upsert({
                    where: {
                        userId_courseId: {
                            userId: transfer.userId,
                            courseId: transfer.courseId
                        }
                    },
                    update: { status: "ACTIVE" },
                    create: {
                        userId: transfer.userId,
                        courseId: transfer.courseId,
                        status: "ACTIVE"
                    }
                })
            ])

            // Send confirmation email
            const student = await prisma.user.findUnique({
                where: { id: transfer.userId }
            })

            if (student?.email) {
                sendEnrollmentEmail(student.email, student.name ?? "there", course.title, course.id).catch(console.error)
            }

        } else if (action === "reject") {
            // Run rejection transaction
            await prisma.$transaction([
                // 1. Update transfer status
                prisma.bankTransfer.update({
                    where: { id: transferId },
                    data: { status: "REJECTED" }
                }),

                // 2. Update matching PENDING payment to FAILED
                prisma.payment.updateMany({
                    where: {
                        userId: transfer.userId,
                        courseId: transfer.courseId,
                        paymentMethod: "BANK_TRANSFER",
                        status: "PENDING"
                    },
                    data: { status: "FAILED" }
                })
            ])
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to process bank transfer:", error)
        return NextResponse.json({ error: "Failed to process bank transfer request" }, { status: 500 })
    }
}
