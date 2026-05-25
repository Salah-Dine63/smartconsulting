import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
        }

        const formData = await req.formData()
        const courseId = formData.get("courseId") as string
        const receipt = formData.get("receipt") as File

        if (!courseId || !receipt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Fetch course details
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        })

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 })
        }

        // Handle file saving
        const buffer = Buffer.from(await receipt.arrayBuffer())
        const ext = path.extname(receipt.name) || ".jpg"
        const filename = `${userId}-${courseId}-${Date.now()}${ext}`
        
        // Define directory path inside public
        const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts")
        
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true })
        
        // Save file
        await fs.writeFile(path.join(uploadDir, filename), buffer)
        
        const receiptUrl = `/uploads/receipts/${filename}`

        // Write to database
        await prisma.$transaction([
            // 1. Record BankTransfer request
            prisma.bankTransfer.create({
                data: {
                    userId,
                    courseId,
                    amount: course.price,
                    receiptUrl,
                    status: "PENDING"
                }
            }),

            // 2. Record Payment row with PENDING status
            prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    amount: course.price,
                    paymentMethod: "BANK_TRANSFER",
                    status: "PENDING"
                }
            })
        ])

        return NextResponse.json({ success: true, message: "Receipt uploaded successfully" })
    } catch (error) {
        console.error("Bank transfer upload error:", error)
        return NextResponse.json({ error: "Failed to upload receipt" }, { status: 500 })
    }
}
