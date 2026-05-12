import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { sendEnrollmentEmail } from "@/lib/email"

// IMPORTANT REMINDER: Add STRIPE_SECRET_KEY to your .env file
const stripeSecret = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" as any }) : null

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Determine the origin URL for redirects
        const url = new URL(req.url)
        const origin = `${url.protocol}//${url.host}`

        if (!session || !session.user) {
            return NextResponse.redirect(`${origin}/login`, 303)
        }

        const formData = await req.formData().catch(() => null)
        let courseId = formData ? formData.get("courseId")?.toString() : null

        // Fallback if accessed via JSON depending on client
        if (!courseId) {
            courseId = "1"
        }

        const course = await prisma.course.findUnique({ where: { id: courseId } })

        if (!course) {
            return NextResponse.redirect(`${origin}/?error=course_not_found`, 303)
        }

        if (!stripe) {
            // Mock flow if Stripe keys are not provided
            console.warn("No Stripe keys found, running mock flow. User implicitly enrolled.")

            const existing = await prisma.enrollment.findFirst({
                where: { userId: (session.user as any).id, courseId: course.id }
            })

            if (!existing) {
                await prisma.enrollment.create({
                    data: {
                        userId: (session.user as any).id,
                        courseId: course.id,
                        status: "ACTIVE"
                    }
                })
                const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
                if (user?.email) {
                    sendEnrollmentEmail(user.email, user.name ?? "there", course.title, course.id).catch(console.error)
                }
            }
            return NextResponse.redirect(`${origin}/dashboard`, 303)
        }

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: course.title,
                        },
                        unit_amount: Math.round(course.price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/dashboard?success=true`,
            cancel_url: `${origin}/courses/${course.id}?canceled=true`,
            client_reference_id: (session.user as any).id,
            metadata: {
                courseId: course.id,
            }
        })

        if (stripeSession.url) {
            return NextResponse.redirect(stripeSession.url, 303)
        }
        return NextResponse.redirect(`${origin}/?error=stripe_error`, 303)

    } catch (error) {
        console.error("Stripe Checkout Error", error)
        return NextResponse.redirect(`${new URL(req.url).origin}/?error=internal_error`, 303)
    }
}
