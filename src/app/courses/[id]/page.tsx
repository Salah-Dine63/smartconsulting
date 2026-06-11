import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    CheckCircle,
    PlayCircle,
    BookOpen,
    Clock,
} from "lucide-react"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function CoursePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ success?: string }>
}) {
    const { id } = await params
    const query = await searchParams
    const paymentSuccess = query.success === "true"

    const session = await getServerSession(authOptions)

    const userId = (session?.user as { id?: string })?.id
    const userRole = (session?.user as { role?: string })?.role
    const isAdmin = userRole === "ADMIN"

    const course = await prisma.course.findUnique({
        where: {
            id,
        },
    })

    if (!course) {
        notFound()
    }

    let subscription = null
    let enrollment = null

    if (userId) {

        subscription =
            await prisma.subscription.findFirst({
                where: {
                    userId,
                    status: "ACTIVE",
                },
            })

        enrollment =
            await prisma.enrollment.findFirst({
                where: {
                    userId,
                    courseId: id,
                },
            })
    }

    let modulesList: any[] = []

    try {

        modulesList = JSON.parse(
            course.modules || "[]"
        )

    } catch {

        modulesList =
            typeof course.modules === "string"
                ? course.modules.split(",")
                : []
    }

    const duration = "6 Weeks"

    const level =
        course.price >= 999
            ? "Expert"
            : course.price >= 699
            ? "Advanced"
            : course.price >= 399
            ? "Intermediate"
            : "Beginner"

    const userPlan =
        subscription?.planType || "FREE"

    const isFull = userPlan === "FULL"

    const hasCourseAccess = isFull || !!enrollment || isAdmin

    return (

        <div className="min-h-screen bg-slate-50 py-12">

            <div className="container mx-auto px-4 max-w-6xl">

                <div className="grid md:grid-cols-3 gap-8">

                    {/* LEFT */}

                    <div className="md:col-span-2 space-y-8">

                        <div>

                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200">
                                Course Outline
                            </div>

                            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                                {course.title}
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed">
                                {course.description}
                            </p>

                        </div>

                        {/* SUCCESS MESSAGE */}

                        {query.success && (

                            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-600 font-semibold">
                                Payment successful 🎉
                            </div>
                        )}

                        {/* WHAT YOU LEARN */}

                        <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">

                            <CardHeader className="bg-white border-b border-slate-100">

                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                    <CheckCircle className="text-blue-600" />
                                    What You Will Learn
                                </CardTitle>

                            </CardHeader>

                            <CardContent className="pt-6 grid sm:grid-cols-2 gap-4 bg-slate-50/50">

                                {[
                                    "Deploy language models safely within the enterprise.",
                                    "Automate repetitive daily workflows using AI.",
                                    "Design custom intelligent agents for your teams.",
                                    "Navigate data privacy and LLM governance.",
                                ].map((item, idx) => (

                                    <div
                                        key={idx}
                                        className="flex gap-3 items-start"
                                    >

                                        <div className="w-6 h-6 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <CheckCircle className="text-blue-600 w-4 h-4" />
                                        </div>

                                        <span className="text-slate-700 font-medium">
                                            {item}
                                        </span>

                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* CURRICULUM */}

                        <div>

                            <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
                                Course Curriculum
                            </h2>

                            <div className="space-y-3">

                                {modulesList.map((mod, i) => (

                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                                    >

                                        <div className="w-12 h-12 bg-slate-100 text-slate-600 flex items-center justify-center rounded-xl font-black shrink-0 text-lg">
                                            {i + 1}
                                        </div>

                                        <div>

                                            <h4 className="font-bold text-slate-800">

                                                {typeof mod === "string"
                                                    ? mod
                                                    : mod.title || `Module ${i + 1}`}

                                            </h4>

                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}

                    <div className="md:col-span-1">

                        <div className="sticky top-24">

                            <Card className="border border-slate-200 shadow-2xl overflow-hidden rounded-3xl">

                                <div className="bg-slate-900 p-8 text-center text-white relative">

                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>

                                    <div className="text-5xl font-black mb-2 tracking-tight">
                                        {course.price === 0 ? "FREE" : `$${course.price}`}
                                    </div>

                                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
                                        {level} Program
                                    </p>

                                </div>

                                <CardContent className="p-8 space-y-6 bg-white">

                                    <div className="space-y-4">

                                        <div className="flex items-center gap-4 text-slate-700 font-medium">

                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-blue-600" />
                                            </div>

                                            <span>
                                                {duration} Program
                                            </span>

                                        </div>

                                        <div className="flex items-center gap-4 text-slate-700 font-medium">

                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-blue-600" />
                                            </div>

                                            <span>
                                                {level} Level
                                            </span>

                                        </div>

                                        <div className="flex items-center gap-4 text-slate-700 font-medium">

                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <PlayCircle className="w-5 h-5 text-blue-600" />
                                            </div>

                                            <span>
                                                On-Demand Premium Video
                                            </span>

                                        </div>

                                    </div>
{paymentSuccess && (
    <div className="mb-6 rounded-xl bg-green-100 border border-green-300 p-4 text-green-700 font-semibold">
        Payment successful 🎉
    </div>
)}
                                    <div className="pt-4 border-t border-slate-100 space-y-4">

                                        {hasCourseAccess ? (

                                            <Button
                                                asChild
                                                size="lg"
                                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-6 text-lg rounded-xl"
                                            >

                                                <a
                                                    href={`/courses/${course.id}/video`}
                                                >
                                                    Access Course
                                                </a>

                                            </Button>

                                        ) : (

                                            <Button
                                                asChild
                                                size="lg"
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 text-lg rounded-xl"
                                            >

                                                <a
                                                    href={`/checkout/${course.id}`}
                                                >
                                                    {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                                                </a>

                                            </Button>
                                        )}

                                        <p className="text-xs font-medium text-center text-slate-400">
                                            Secure payments powered by Stripe, PayPal & Bank Transfer.
                                        </p>

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