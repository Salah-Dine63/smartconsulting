"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

interface Props {
    courseTitle: string
    moduleTitle: string
    moduleDescription: string
}

export default function VideoChatbot({ courseTitle, moduleTitle, moduleDescription }: Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `Hi! I'm your AI assistant for this course. Ask me anything about "${moduleTitle}" and I'll help you understand it.`
        }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Reset chat when module changes
    useEffect(() => {
        setMessages([{
            role: "assistant",
            content: `Hi! I'm your AI assistant for this course. Ask me anything about "${moduleTitle}" and I'll help you understand it.`
        }])
    }, [moduleTitle])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Message = { role: "user", content: input }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput("")
        setLoading(true)

        // Add empty assistant message to stream into
        setMessages(prev => [...prev, { role: "assistant", content: "" }])

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseTitle,
                    moduleTitle,
                    moduleDescription,
                    messages: newMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            })

            if (!res.ok || !res.body) throw new Error("Failed to get response")

            const reader = res.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value)
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: "assistant",
                        content: updated[updated.length - 1].content + chunk,
                    }
                    return updated
                })
            }
        } catch {
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: "assistant",
                    content: "Sorry, I couldn't connect to the AI. Please try again.",
                }
                return updated
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <aside className="w-80 border-l border-slate-800 bg-slate-900 hidden lg:flex flex-col h-full">
            <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-white">Course Assistant</h3>
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500" title="AI powered" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-slate-700"}`}>
                            {msg.role === "user"
                                ? <User className="w-4 h-4 text-white" />
                                : <Bot className="w-4 h-4 text-blue-400" />
                            }
                        </div>
                        <div className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm ${
                            msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-slate-800 text-slate-200 rounded-tl-sm"
                        }`}>
                            {msg.content || (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about this module..."
                        disabled={loading}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full transition-colors"
                    >
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Send className="w-4 h-4" />
                        }
                    </button>
                </form>
            </div>
        </aside>
    )
}
