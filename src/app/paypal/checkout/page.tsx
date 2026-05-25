import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import PayPalCheckoutClient from "./PayPalCheckoutClient"

export default async function PayPalCheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ courseId?: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const { courseId } = await searchParams

    if (!courseId) {
        notFound()
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
    })

    if (!course) {
        notFound()
    }

    return (
        <PayPalCheckoutClient
            courseId={course.id}
            courseTitle={course.title}
            coursePrice={course.price}
            userEmail={session.user.email ?? ""}
        />
    )
}
