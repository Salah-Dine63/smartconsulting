// src/app/checkout/[id]/page.tsx

import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import StripeButton from "@/components/StripeButton"
import FreeEnrollButton from "@/components/FreeEnrollButton"
import {
    CheckCircle2,
    Lock,
    Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
} from "@/components/ui/card"

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const { id } = await params

    const course = await prisma.course.findUnique({
        where: {
            id,
        },
    })

    if (!course) {
        notFound()
    }

    let skills: string[] = []
    let features: string[] = []

    try {
        skills = JSON.parse(course.skills || "[]")
    } catch {
        skills = []
    }

    try {
        features = JSON.parse(course.features || "[]")
    } catch {
        features = []
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">

            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e40af20,transparent_35%),radial-gradient(circle_at_bottom_left,#06b6d420,transparent_35%)]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">

                {/* HEADER */}
                <div className="text-center mb-16">

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                        <Sparkles className="w-4 h-4" />
                        Secure Checkout
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                        Complete Your Enrollment
                    </h1>

                    <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Unlock premium business education and gain lifetime access to this professional learning experience.
                    </p>

                </div>

                <div className="grid lg:grid-cols-3 gap-10">

                    {/* LEFT SIDE */}
                    <div className="lg:col-span-2 space-y-10">

                        {/* COURSE DETAILS */}
                        <Card className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">

                            <div className="relative h-[320px] overflow-hidden">

                                <img
                                    src={
                                        course.imageUrl ||
                                        "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop"
                                    }
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                                <div className="absolute bottom-8 left-8 right-8">

                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
                                        Premium Roobotix Program
                                    </div>

                                    <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                                        {course.title}
                                    </h2>

                                    <p className="text-slate-200 text-lg leading-relaxed max-w-3xl">
                                        {course.description}
                                    </p>

                                </div>
                            </div>

                            <CardContent className="p-8 space-y-10">

                                {/* WHAT YOU LEARN */}
                                <div>

                                    <h3 className="text-2xl font-black text-white mb-6">
                                        What You Will Learn
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-5">

                                        {skills.map((item, index) => (

                                            <div
                                                key={index}
                                                className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                                            >

                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                                </div>

                                                <span className="text-slate-300 font-medium leading-relaxed">
                                                    {item}
                                                </span>

                                            </div>
                                        ))}

                                    </div>
                                </div>

                                {/* FEATURES */}
                                <div>

                                    <h3 className="text-2xl font-black text-white mb-6">
                                        Included In This Program
                                    </h3>

                                    <div className="grid sm:grid-cols-2 gap-5">

                                        {features.map((feature, index) => (

                                            <div
                                                key={index}
                                                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6"
                                            >

                                                <div className="text-white font-bold">
                                                    {feature}
                                                </div>

                                            </div>
                                        ))}

                                    </div>
                                </div>

                                {/* CAREER OUTCOMES */}
                                <div>

                                    <h3 className="text-2xl font-black text-white mb-6">
                                        Career Outcomes
                                    </h3>

                                    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-blue-950/40 to-slate-950 p-8">

                                        <div className="grid md:grid-cols-3 gap-8">

                                            <div>

                                                <div className="text-5xl font-black text-blue-400 mb-2">
                                                    +240%
                                                </div>

                                                <p className="text-slate-300 font-medium">
                                                    Demand increase for AI & Automation skills
                                                </p>

                                            </div>

                                            <div>

                                                <div className="text-5xl font-black text-cyan-400 mb-2">
                                                    Executive
                                                </div>

                                                <p className="text-slate-300 font-medium">
                                                    {course.careerOutcome}
                                                </p>

                                            </div>

                                            <div>

                                                <div className="text-5xl font-black text-emerald-400 mb-2">
                                                    Real
                                                </div>

                                                <p className="text-slate-300 font-medium">
                                                    Enterprise business use-cases included
                                                </p>

                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </CardContent>

                        </Card>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="lg:col-span-1">

                        <div className="sticky top-24">

                            <Card className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

                                {/* PRICE */}
                                <div className="p-8 border-b border-slate-800">

                                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-3">
                                        Total Price
                                    </p>

                                    <div className="text-5xl font-black text-white mb-2">
                                        {course.price === 0 ? "FREE" : `$${course.price}`}
                                    </div>

                                    <p className="text-slate-400">
                                        Lifetime premium access
                                    </p>

                                </div>

                                {/* PAYMENT METHODS */}
                                <CardContent className="p-8 space-y-6">

                                    {course.price === 0 ? (
                                        <FreeEnrollButton courseId={course.id} />
                                    ) : (
                                        <>
                                            {/* STRIPE */}
                                            <StripeButton courseId={course.id} />
                                            {/* PAYPAL */}
                                            <form
                                                action="/api/paypal"
                                                method="POST"
                                            >

                                                <input
                                                    type="hidden"
                                                    name="courseId"
                                                    value={course.id}
                                                />

                                                <Button
                                                    type="submit"
                                                    className="w-full h-14 rounded-2xl bg-[#0070BA] hover:bg-[#0062a3] text-white font-bold text-lg"
                                                >
                                                    Pay with PayPal
                                                </Button>

                                            </form>
                                        </>
                                    )}



                                    {/* SECURITY */}
                                    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 flex items-start gap-4">

                                        <Lock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />

                                        <div>

                                            <h4 className="font-bold text-white mb-1">
                                                {course.price === 0 ? "Free Enrollment" : "Secure Payment"}
                                            </h4>

                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {course.price === 0 
                                                    ? "Get instant lifetime access. No payment card or bank information is required."
                                                    : "All transactions are encrypted and securely processed using enterprise-grade payment infrastructure."}
                                            </p>

                                        </div>

                                    </div>

                                </CardContent>

                            </Card>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    )
}