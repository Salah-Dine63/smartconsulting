"use client"

export default function StripeButton({
    courseId,
}: {
    courseId: string
}) {

    const handleCheckout = async () => {

        const response = await fetch(
            "/api/stripe/checkout",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    courseId,
                }),
            }
        )

        const data = await response.json()

        window.location.href = data.url
    }

    return (
        <button
            onClick={handleCheckout}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg"
        >
            Pay with Credit Card
        </button>
    )
}