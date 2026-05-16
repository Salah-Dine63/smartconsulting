import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
        return new Response("GOOGLE_API_KEY is not configured", { status: 500 })
    }

    const { messages, moduleTitle, moduleDescription, courseTitle } = await req.json()

    // Format messages for Gemini API
    const geminiMessages = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
    }))

    const systemInstruction = `You are an AI learning assistant for the course "${courseTitle}".
The student is currently watching: "${moduleTitle}".
Module description: ${moduleDescription}

Your role:
- Answer questions about the current module's topic
- Explain concepts in simple, practical terms
- Give real-world business examples when helpful
- Keep responses concise (2-4 sentences unless the question needs more depth)
- Stay focused on the course content`

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: geminiMessages
            })
        })

        if (!response.ok) {
            const err = await response.text()
            console.error("[/api/chat] Gemini error:", err)
            throw new Error("Failed to fetch from Gemini")
        }

        const encoder = new TextEncoder()
        const readable = new ReadableStream({
            async start(controller) {
                if (!response.body) {
                    controller.close()
                    return
                }
                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ""

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    
                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split("\n")
                    buffer = lines.pop() || ""

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const dataStr = line.substring(6).trim()
                            if (dataStr === "[DONE]") continue
                            try {
                                const data = JSON.parse(dataStr)
                                const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                                if (text) {
                                    controller.enqueue(encoder.encode(text))
                                }
                            } catch (e) {}
                        }
                    }
                }
                
                // Flush buffer if any
                if (buffer.startsWith("data: ")) {
                    const dataStr = buffer.substring(6).trim()
                    if (dataStr !== "[DONE]") {
                        try {
                            const data = JSON.parse(dataStr)
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
                            if (text) {
                                controller.enqueue(encoder.encode(text))
                            }
                        } catch (e) {}
                    }
                }

                controller.close()
            }
        })

        return new Response(readable, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        })
    } catch (err) {
        console.error("[/api/chat] Error:", err)
        return new Response("AI service error", { status: 500 })
    }
}
