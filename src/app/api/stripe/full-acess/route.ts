import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function POST() {

    try {

        const session =
            await getStripe().checkout.sessions.create({

                payment_method_types: ["card"],

                mode: "payment",

                line_items: [
                    {
                        price_data: {

                            currency: "usd",

                            product_data: {
                                name: "Roobotix Full Access",
                            },

                            unit_amount: 199900,
                        },

                        quantity: 1,
                    },
                ],

                success_url:
                    `${process.env.NEXTAUTH_URL}/dashboard?plan=FULL`,

                cancel_url:
                    `${process.env.NEXTAUTH_URL}/plans`,
            } as any)

        return NextResponse.json({
            url: session.url,
        })

    } catch (error) {

        console.log(error)

        return NextResponse.json(
            {
                error: "Stripe error",
            },
            {
                status: 500,
            }
        )
    }
}