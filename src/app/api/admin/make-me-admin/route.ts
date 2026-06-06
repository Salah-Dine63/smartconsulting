import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return NextResponse.json({ error: "Please login first to be made an admin." }, { status: 401 })
    }

    const userId = (session.user as any).id

    if (!userId) {
        return NextResponse.json({ error: "User ID not found in session." }, { status: 400 })
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: "ADMIN" }
        })

        return NextResponse.json({
            success: true,
            message: `User ${user.email} is now an ADMIN! Please sign out and sign back in for the role change to take effect.`,
            user: { email: user.email, role: user.role }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
