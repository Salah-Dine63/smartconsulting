import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {

    try {
        const sessionUser = await getServerSession(authOptions)
        const userId = (sessionUser?.user as any)?.id

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in to purchase." },
                { status: 401 }
            )
        }

        const body = await req.json()

        console.log(body)

        // =========================
        // FULL ACCESS
        // =========================

        if (body.fullAccess) {

            const session = await getStripe().checkout.sessions.create({

                payment_method_types: ["card"],
                client_reference_id: userId,
                metadata: {
                    planType: "FULL",
                },

                line_items: [
                    {
                        price_data: {

                            currency: "usd",

                            product_data: {
                                name: "Full Access Plan",
                                description:
                                    "Unlimited access to all courses",
                            },

                            unit_amount: 199900,
                        },

                        quantity: 1,
                    },
                ],

                mode: "payment",

                success_url:
                    `${process.env.NEXTAUTH_URL}/dashboard?plan=FULL`,

                cancel_url:
                    `${process.env.NEXTAUTH_URL}/plans`,
            })

            return NextResponse.json({
                url: session.url,
            })
        }

        // =========================
        // SINGLE COURSE
        // =========================

        const courseId = body.courseId

        if (!courseId) {

            return NextResponse.json(
                {
                    error: "Missing courseId",
                },
                {
                    status: 400,
                }
            )
        }

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
        })

        if (!course) {

            return NextResponse.json(
                {
                    error: "Course not found",
                },
                {
                    status: 404,
                }
            )
        }

        const session = await getStripe().checkout.sessions.create({

            payment_method_types: ["card"],
            client_reference_id: userId,
            metadata: {
                courseId: course.id,
            },

            line_items: [
                {
                    price_data: {

                        currency: "usd",

                        product_data: {
                            name: course.title,
                            description: course.description,
                        },

                        unit_amount:
                            Math.round(course.price * 100),
                    },

                    quantity: 1,
                },
            ],

            mode: "payment",

            success_url: `${process.env.NEXTAUTH_URL}/courses/${course.id}?success=true`,
           cancel_url: `${process.env.NEXTAUTH_URL}/checkout/${course.id}`,
        })

        return NextResponse.json({
            url: session.url,
        })

    } catch (error) {

        console.log(error)

        return NextResponse.json(
            {
                error: "Stripe session creation failed",
            },
            {
                status: 500,
            }
        )
    }
}