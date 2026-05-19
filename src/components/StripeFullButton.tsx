"use client"

export default function StripeFullButton() {

    const handleCheckout = async () => {
    try {

        const response = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullAccess: true,
            }),
        })

        const data = await response.json()

        console.log(data)

        if (data.url) {
            window.location.href = data.url
        } else {
            console.error("Stripe URL not found")
        }

    } catch (error) {
        console.error(error)
    }
}

    return (

        <button
            onClick={handleCheckout}
            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl"
        >
            Unlock Full Access
        </button>
    )
}