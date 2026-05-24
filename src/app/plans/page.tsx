import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Lock, Crown } from "lucide-react"

export default function PlansPage() {

    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "Explore the platform and preview all courses.",
            features: [
                "Access dashboard",
                "View all courses",
                "Locked premium content",
                "No course access",
            ],
            button: "Start Free",
           href: "/dashboard?plan=FREE",
            highlighted: false,
            icon: <Lock className="w-5 h-5" />
        },

        {
            name: "Partial Access",
            price: "$99/mo",
            description: "Purchase courses individually.",
            features: [
                "Access dashboard",
                "View course pages",
                "Buy courses separately",
                "Stripe / PayPal / Bank Transfer",
            ],
            button: "Choose Partial",
            href: "/dashboard?plan=PARTIAL",
            highlighted: true,
            icon: <Check className="w-5 h-5" />
        },

        {
            name: "Full Access",
            price: "$1999",
            description: "Unlimited access to all premium programs.",
            features: [
                "Unlimited course access",
                "All premium videos",
                "All future updates",
                "Priority support",
            ],
            button: "Get Full Access",
            href: "/full-acess",
            highlighted: false,
            icon: <Crown className="w-5 h-5" />
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-white py-20 px-4">

            <div className="max-w-7xl mx-auto">

                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-8">
                        Roobotix Pricing
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                        Choose Your Learning Plan
                    </h1>

                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Flexible premium plans for executives, developers and companies.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {plans.map((plan) => (

                        <div
                            key={plan.name}
                            className={`relative rounded-3xl border transition-all duration-300 overflow-hidden
                            
                            ${plan.highlighted
                                ? "border-blue-500 bg-gradient-to-b from-blue-950 to-slate-900 scale-105 shadow-2xl shadow-blue-900/40"
                                : "border-slate-800 bg-slate-900"}
                            `}
                        >

                            {plan.highlighted && (
                                <div className="absolute top-0 inset-x-0 bg-blue-500 text-center py-2 text-xs font-black uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}

                            <div className="p-10">

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                        {plan.icon}
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {plan.name}
                                        </h2>

                                        <p className="text-slate-400 text-sm">
                                            {plan.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <div className="text-5xl font-black tracking-tight">
                                        {plan.price}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">

                                    {plan.features.map((feature) => (
                                        <div
                                            key={feature}
                                            className="flex items-center gap-3 text-slate-300"
                                        >
                                            <Check className="w-5 h-5 text-blue-400 shrink-0" />

                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href={plan.href}>
                                    <Button
                                        className={`w-full h-14 rounded-2xl text-base font-bold transition-all
                                        
                                        ${plan.highlighted
                                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                                            : "bg-white text-slate-900 hover:bg-slate-200"}
                                        `}
                                    >
                                        {plan.button}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}