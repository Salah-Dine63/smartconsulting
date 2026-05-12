import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password required" }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        sendWelcomeEmail(user.email!, user.name ?? "there").catch(console.error)

        return NextResponse.json({ message: "User created successfully", userId: user.id }, { status: 201 })
    } catch (error) {
        console.error("Registration Error", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }
}
