import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { sendEnrollmentEmail } from "@/lib/email"

// IMPORTANT REMINDER: Add STRIPE_SECRET_KEY & STRIPE_WEBHOOK_SECRET to your .env file
const stripeSecret = process.env.STRIPE_SECRET_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" as any }) : null

export async function POST(req: Request) {
    if (!stripe || !webhookSecret) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 400 })
    }

    const payload = await req.text()
    const signature = req.headers.get("stripe-signature")

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(payload, signature!, webhookSecret)
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message)
        return NextResponse.json({ error: err.message }, { status: 400 })
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const courseId = session.metadata?.courseId

        if (userId && courseId) {
            // Create Enrollment
            await prisma.enrollment.create({
                data: {
                    userId,
                    courseId,
                    status: "ACTIVE"
                }
            })

            // Record Payment
            await prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    stripeSessionId: session.id,
                    amount: (session.amount_total || 0) / 100,
                    status: "COMPLETED"
                }
            })

            // Send enrollment confirmation email
            const [user, course] = await Promise.all([
                prisma.user.findUnique({ where: { id: userId } }),
                prisma.course.findUnique({ where: { id: courseId } }),
            ])
            if (user?.email && course) {
                sendEnrollmentEmail(user.email, user.name ?? "there", course.title, course.id).catch(console.error)
            }
        }
    }

    return NextResponse.json({ received: true })
}
