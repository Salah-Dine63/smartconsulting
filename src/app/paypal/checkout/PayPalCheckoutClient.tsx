"use client"

import { useState } from "react"
import { ShieldCheck, Lock, ArrowLeft, Loader2, Info } from "lucide-react"

interface Props {
    courseId: string
    courseTitle: string
    coursePrice: number
    userEmail: string
}

export default function PayPalCheckoutClient({
    courseId,
    courseTitle,
    coursePrice,
    userEmail,
}: Props) {
    const [step, setStep] = useState<"login" | "pay" | "processing">("login")
    const [paypalEmail, setPaypalEmail] = useState(userEmail)
    const [paypalPassword, setPaypalPassword] = useState("••••••••••••")
    const [error, setError] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (!paypalEmail) {
            setError("Please enter your PayPal email address.")
            return
        }
        setError("")
        setStep("pay")
    }

    const handleCompletePayment = async () => {
        setStep("processing")
        try {
            const response = await fetch("/api/paypal/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId,
                }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                // Success! Redirect to the course page
                window.location.href = `/courses/${courseId}?success=true`
            } else {
                setError(data.error || "Simulated PayPal transaction failed.")
                setStep("pay")
            }
        } catch (err) {
            console.error("PayPal capture error:", err)
            setError("Could not connect to PayPal simulation. Please try again.")
            setStep("pay")
        }
    }

    if (step === "processing") {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e40af20,transparent_50%)]"></div>
                <div className="relative z-10 text-center max-w-md w-full space-y-6">
                    <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto" />
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-slate-100">
                            Processing Payment
                        </h2>
                        <p className="text-slate-400 text-sm font-medium animate-pulse">
                            Securely communicating with PayPal servers...
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex gap-3 text-left">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-350 leading-relaxed">
                            Your transaction is fully encrypted. Please do not close this window or click the back button.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background design */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed810,transparent_45%)]"></div>

            <div className="relative z-10 w-full max-w-md">
                
                {/* Header Back Button */}
                <a 
                    href={`/checkout/${courseId}`} 
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to checkout
                </a>

                {/* PayPal Container */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                    
                    {/* Brand Banner */}
                    <div className="bg-slate-900 px-8 py-6 border-b border-slate-800 flex items-center justify-between">
                        {/* PayPal Simulated Logo */}
                        <div className="flex items-center gap-1.5 select-none">
                            <span className="text-2xl font-black tracking-tighter text-[#0070ba]">Pay</span>
                            <span className="text-2xl font-black tracking-tighter text-[#1546a0]">Pal</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-md ml-2">Simulated</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                            <Lock className="w-3 h-3 text-emerald-500" />
                            <span>SSL Secured</span>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                        
                        {/* Error display */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-2xl p-4 text-sm font-semibold mb-6">
                                {error}
                            </div>
                        )}

                        {/* STEP 1: LOGIN */}
                        {step === "login" && (
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-1">
                                    <h1 className="text-xl font-bold text-white tracking-tight">Pay with PayPal</h1>
                                    <p className="text-xs text-slate-400">Log in to your PayPal account to complete your purchase.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Email Address</label>
                                        <input
                                            type="email"
                                            value={paypalEmail}
                                            onChange={(e) => setPaypalEmail(e.target.value)}
                                            className="w-full h-12 bg-slate-950 border border-slate-850 rounded-xl px-4 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="your-paypal-email@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Password</label>
                                        <input
                                            type="password"
                                            value={paypalPassword}
                                            onChange={(e) => setPaypalPassword(e.target.value)}
                                            className="w-full h-12 bg-slate-950 border border-slate-850 rounded-xl px-4 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-2xl font-bold text-base transition-colors shadow-lg shadow-blue-900/20 active:scale-[0.99]"
                                >
                                    Log In
                                </button>

                                <div className="text-center">
                                    <button 
                                        type="button" 
                                        onClick={() => setStep("pay")}
                                        className="text-xs text-[#0070ba] hover:underline font-semibold"
                                    >
                                        Guest checkout or instant payment simulation
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: REVIEW & PAY */}
                        {step === "pay" && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h1 className="text-xl font-bold text-white tracking-tight">Review Your Purchase</h1>
                                    <p className="text-xs text-slate-400">Authenticated as: <span className="text-slate-300 font-bold">{paypalEmail}</span></p>
                                </div>

                                {/* Course Card Summary */}
                                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Course</p>
                                        <p className="text-sm font-extrabold text-white mt-0.5">{courseTitle}</p>
                                    </div>
                                    <div className="border-t border-slate-850 pt-3 flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-400">Total Price</span>
                                        <span className="text-lg font-black text-emerald-400">${coursePrice}</span>
                                    </div>
                                </div>

                                {/* Source Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-450 uppercase tracking-wider block">Payment Source</label>
                                    <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">PayPal Balance</p>
                                                <p className="text-[10px] text-slate-450 mt-0.5">Available: $5,420.00</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">Selected</span>
                                    </div>
                                </div>

                                {/* Info Warning */}
                                <div className="bg-slate-950/50 border border-slate-850/80 rounded-2xl p-4 flex gap-3 text-left">
                                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-400 leading-relaxed">
                                        This is a simulated transaction. No real money will be drawn from any actual PayPal account, and enrollment access will be immediately processed.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCompletePayment}
                                        className="w-full h-14 bg-[#ffc439] hover:bg-[#e0ab30] text-[#003087] rounded-2xl font-black text-base transition-colors shadow-lg active:scale-[0.99]"
                                    >
                                        Complete Purchase
                                    </button>
                                    
                                    <button
                                        onClick={() => setStep("login")}
                                        className="w-full h-12 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-2xl font-bold text-xs transition-colors"
                                    >
                                        Switch Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer security labels */}
                <p className="text-[10px] text-center text-slate-550 mt-6 leading-relaxed">
                    PayPal Enterprise Solutions. Encrypted using 256-bit AES protection. <br/>
                    Simulated transaction provider by smartconsulting-production.
                </p>
            </div>
        </div>
    )
}
