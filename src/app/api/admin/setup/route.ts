import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request) {
    try {
        const adminEmail = "admin@smartconsulting.com"
        const userEmail = "user@smartconsulting.com"
        const defaultPassword = "password123"

        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        // Upsert admin
        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: { role: "ADMIN", password: hashedPassword },
            create: {
                name: "Admin User",
                email: adminEmail,
                password: hashedPassword,
                role: "ADMIN"
            }
        })

        // Upsert standard user
        const user = await prisma.user.upsert({
            where: { email: userEmail },
            update: { role: "USER", password: hashedPassword },
            create: {
                name: "Standard User",
                email: userEmail,
                password: hashedPassword,
                role: "USER"
            }
        })

        // Upsert course (from seed.ts)
        const course = await prisma.course.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                title: 'Generative AI for Business Automation',
                description: 'A comprehensive 6-week online journey designed exclusively for business leaders to master LLMs and intelligent workflow automation.',
                price: 1999,
                modules: JSON.stringify([
                    {
                        title: "Module 1: Foundations of Generative and Agentic AI",
                        videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_1/preview",
                        description: "An introduction to the course and an overview of generative and agentic AI concepts that will shape modern business."
                    },
                    {
                        title: "Module 2: Introduction to Generative AI",
                        videoUrl: "https://drive.google.com/file/d/DRIVE_FILE_ID_2/preview",
                        description: "Deep dive into how generative AI models work, their capabilities, and how to apply them in enterprise contexts."
                    }
                ])
            },
        })

        return NextResponse.json({
            message: "Setup successful! You can now log in.",
            accounts: {
                admin: { email: admin.email, password: defaultPassword, role: admin.role },
                user: { email: user.email, password: defaultPassword, role: user.role }
            }
        })
    } catch (error) {
        console.error("Setup error:", error)
        return NextResponse.json({ error: "Failed to run setup" }, { status: 500 })
    }
}
