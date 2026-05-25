import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

import { Lock } from "lucide-react"

import { CourseCard } from "@/components/CourseCard"

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ plan?: string }>
}) {
    const resolvedSearchParams = await searchParams

    const planParam = resolvedSearchParams.plan
    const selectedPlan =
        planParam === "PARTIAL"
            ? "PARTIAL"
            : planParam === "FULL"
            ? "FULL"
            : planParam === "FREE"
            ? "FREE"
            : undefined
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    if ((session.user as { role?: string }).role === "ADMIN") {
        redirect("/admin")
    }

    const userId = (session.user as { id?: string }).id

    if (!userId) {
        redirect("/login")
    }

    const enrollments = await prisma.enrollment.findMany({
        where: {
            userId,
        },
        include: {
            course: true,
        },
    })

    const allCourses = await prisma.course.findMany()

    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "ACTIVE",
        },
    })

    // priorité :
    // URL > DB > FREE
    const userPlan =
        selectedPlan ||
        subscription?.planType ||
        "FREE"

    const enrolledCourseIds = enrollments.map(
        (e) => e.courseId
    )

    return (

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 p-6 md:p-10 font-sans transition-colors duration-200">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">

                    <div>

                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                            Student Workspace
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
                            Welcome back,{" "}
                            <span className="text-slate-950 dark:text-slate-100 font-bold">
                                {session.user.name ?? session.user.email}
                            </span>
                        </p>

                    </div>

                </header>

                {/* PLAN BADGE */}
                <div className="mb-8">

                    <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest
                        ${
                            userPlan === "FREE"
                                ? "bg-slate-200 text-slate-700"
                                : userPlan === "PARTIAL"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                        }`}
                    >
                        {userPlan} PLAN
                    </div>

                </div>

                {/* COURSES */}
                <section>

                    <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">
                        Course Library
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {allCourses.map((course) => {

                            let moduleCount = 0

                            try {

                                const parsedModules = JSON.parse(course.modules)

                                moduleCount = Array.isArray(parsedModules)
                                    ? parsedModules.length
                                    : 0

                            } catch {

                                moduleCount = 0
                            }

                            const isFree = userPlan === "FREE"
                            const isFull = userPlan === "FULL"

                            // cours déjà acheté
                            const alreadyPurchased =
                                enrolledCourseIds.includes(course.id)

                            // accès réel
                            const isUnlocked =
                                isFull || alreadyPurchased

                            return (

                                <div
                                    key={course.id}
                                    className="relative"
                                >

                                    {/* FREE => lock */}
                                    {!isUnlocked && (
                                        <div className="absolute top-4 right-4 z-20 bg-slate-900 text-white p-2 rounded-full shadow-lg">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className={!isUnlocked ? "opacity-70" : ""}>

                                        <CourseCard
                                            title={course.title}
                                            description={course.description}
                                            moduleCount={moduleCount}
                                            price={course.price}
                                            imageUrl={course.imageUrl}

                                            buttonText={
    isFree
        ? "Upgrade"

        : isFull
        ? "Access Course"

        : "Buy Course"
}

href={
    // FREE
    isFree

        ? "/plans"

        // FULL
        : isFull

        ? `/courses/${course.id}/video`

        // PARTIAL
        : `/checkout/${course.id}`
}
                                        />

                                    </div>

                                </div>
                            )
                        })}

                    </div>

                </section>

            </div>

        </div>
    )
}