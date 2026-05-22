import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {

    try {

        const body = await req.json()

        console.log(body)

        // =========================
        // FULL ACCESS
        // =========================

        if (body.fullAccess) {

            const session = await getStripe().checkout.sessions.create({

                payment_method_types: ["card"],

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
            metadata: {
                courseId: course.id,
            },
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