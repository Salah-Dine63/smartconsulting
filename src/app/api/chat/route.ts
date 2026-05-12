import Anthropic from "@anthropic-ai/sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
        return new Response("ANTHROPIC_API_KEY is not configured", { status: 500 })
    }

    const { messages, moduleTitle, moduleDescription, courseTitle } = await req.json()

    const client = new Anthropic({ apiKey })

    try {
        const stream = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1024,
            system: `You are an AI learning assistant for the course "${courseTitle}".
The student is currently watching: "${moduleTitle}".
Module description: ${moduleDescription}

Your role:
- Answer questions about the current module's topic
- Explain concepts in simple, practical terms
- Give real-world business examples when helpful
- Keep responses concise (2-4 sentences unless the question needs more depth)
- Stay focused on AI, business automation, and the course content`,
            messages,
            stream: true,
        })

        const encoder = new TextEncoder()
        const readable = new ReadableStream({
            async start(controller) {
                for await (const event of stream) {
                    if (
                        event.type === "content_block_delta" &&
                        event.delta.type === "text_delta"
                    ) {
                        controller.enqueue(encoder.encode(event.delta.text))
                    }
                }
                controller.close()
            },
        })

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        })
    } catch (err) {
        console.error("[/api/chat] Anthropic error:", err)
        return new Response("AI service error", { status: 500 })
    }
}
