"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, Terminal, Copy, Check } from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

const QUICK_QUESTIONS = [
    "How do I run the project?",
    "What environment variables do I need?",
    "How do I create an admin account?",
    "The register page shows Internal Error",
    "How does the video generator work?",
    "What is the database structure?",
]

export default function SetupAgentPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: `👋 Hi! I'm the **SmartConsulting Setup Agent**.

I know everything about this project — the codebase, setup steps, environment variables, common errors, and architecture.

**Ask me anything**, for example:
- *"How do I run the project?"*
- *"What .env variables do I need?"*
- *"I get an Internal Error when registering"*
- *"How does the AI video generator work?"*

How can I help you get started?`,
        },
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function sendMessage(text: string) {
        if (!text.trim() || loading) return
        const userMessage: Message = { role: "user", content: text }
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInput("")
        setLoading(true)
        setMessages(prev => [...prev, { role: "assistant", content: "" }])

        try {
            const res = await fetch("/api/setup-agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            })

            if (!res.ok || !res.body) throw new Error("Failed")

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
                    content: "⚠️ Could not connect to the AI. Make sure `ANTHROPIC_API_KEY` is set in your `.env` file.",
                }
                return updated
            })
        } finally {
            setLoading(false)
            inputRef.current?.focus()
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        sendMessage(input)
    }

    function copyCode(text: string, index: number) {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    function renderMessage(content: string, msgIndex: number) {
        // Split by code blocks
        const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g)
        return parts.map((part, i) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const code = part.slice(3, -3).replace(/^\w+\n/, "")
                const key = `${msgIndex}-${i}`
                return (
                    <div key={key} className="relative my-2 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs text-slate-400 font-mono">command</span>
                            </div>
                            <button
                                onClick={() => copyCode(code.trim(), parseInt(key))}
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                {copiedIndex === parseInt(key)
                                    ? <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied!</span></>
                                    : <><Copy className="w-3 h-3" />Copy</>
                                }
                            </button>
                        </div>
                        <pre className="bg-slate-950 p-3 overflow-x-auto text-sm font-mono text-green-300 leading-relaxed">
                            {code.trim()}
                        </pre>
                    </div>
                )
            }
            if (part.startsWith("`") && part.endsWith("`")) {
                return (
                    <code key={i} className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono">
                        {part.slice(1, -1)}
                    </code>
                )
            }
            // Render bold **text**
            const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
            return (
                <span key={i}>
                    {boldParts.map((bp, j) => {
                        if (bp.startsWith("**") && bp.endsWith("**")) {
                            return <strong key={j} className="font-semibold text-white">{bp.slice(2, -2)}</strong>
                        }
                        return <span key={j}>{bp}</span>
                    })}
                </span>
            )
        })
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">

            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-tight">SmartConsulting Setup Agent</h1>
                    <p className="text-slate-400 text-xs">AI assistant — knows the full codebase & setup process</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-slate-400">Online</span>
                </div>
            </div>

            {/* Quick questions */}
            <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_QUESTIONS.map(q => (
                    <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        disabled={loading}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-40"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                            msg.role === "user"
                                ? "bg-blue-600"
                                : "bg-gradient-to-br from-indigo-600 to-blue-700"
                        }`}>
                            {msg.role === "user"
                                ? <User className="w-4 h-4 text-white" />
                                : <Bot className="w-4 h-4 text-white" />
                            }
                        </div>

                        {/* Bubble */}
                        <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
                            msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-sm"
                                : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                        }`}>
                            {msg.content
                                ? renderMessage(msg.content, i)
                                : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            }
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur px-4 py-4">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about setup, errors, architecture..."
                        disabled={loading}
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 disabled:opacity-50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors shrink-0"
                    >
                        {loading
                            ? <Loader2 className="w-5 h-5 animate-spin" />
                            : <Send className="w-5 h-5" />
                        }
                    </button>
                </form>
                <p className="text-center text-xs text-slate-600 mt-2">
                    Powered by Claude AI · SmartConsulting
                </p>
            </div>
        </div>
    )
}
