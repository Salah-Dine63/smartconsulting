import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { name, email, currentPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // If changing password, verify current password
    if (newPassword) {
        if (!currentPassword) {
            return NextResponse.json({ error: "Current password required" }, { status: 400 })
        }
        if (!user.password) {
            return NextResponse.json({ error: "Cannot change password for OAuth accounts" }, { status: 400 })
        }
        const valid = await bcrypt.compare(currentPassword, user.password)
        if (!valid) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
        }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email && email !== user.email) {
        const exists = await prisma.user.findUnique({ where: { email } })
        if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 400 })
        updateData.email = email
    }
    if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10)
    }

    await prisma.user.update({ where: { id: userId }, data: updateData })

    return NextResponse.json({ success: true })
}
