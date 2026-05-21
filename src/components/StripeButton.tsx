"use client"

export default function StripeButton({
    courseId,
}: {
    courseId: string
}) {

    const handleCheckout = async () => {
        try {
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

            if (data.url) {
                window.location.href = data.url
            } else {
                console.error("Stripe URL not found", data)
                alert(data.error || "Failed to initiate Stripe checkout. Please verify your Stripe configuration.")
            }
        } catch (error) {
            console.error("Error during checkout:", error)
            alert("An error occurred while connecting to the checkout service. Please try again.")
        }
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