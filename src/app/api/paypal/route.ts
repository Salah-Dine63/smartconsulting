import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        let courseId: string | null = null

        const contentType = req.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
            const body = await req.json()
            courseId = body.courseId
        } else {
            // Treat as form data
            const formData = await req.formData()
            courseId = formData.get("courseId") as string
        }

        if (!courseId) {
            return NextResponse.json({ error: "Missing courseId" }, { status: 400 })
        }

        const approvalUrl = `/paypal/checkout?courseId=${courseId}`

        if (contentType.includes("application/json")) {
            return NextResponse.json({ approvalUrl })
        } else {
            return NextResponse.redirect(new URL(approvalUrl, req.url), 303)
        }
    } catch (error) {
        console.error("PayPal initiation error:", error)
        return NextResponse.json({ error: "PayPal initialization failed" }, { status: 500 })
    }
}
