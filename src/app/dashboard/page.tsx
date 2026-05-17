import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { CourseCard } from "@/components/CourseCard"

export default async function DashboardPage() {
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
        where: { userId },
        include: { course: true }
    })

    const allCourses = await prisma.course.findMany()

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-650 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Workspace</h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">Welcome back, <span className="text-slate-950 font-bold">{session.user.name ?? session.user.email}</span>. Continue your business learning path.</p>
                    </div>
                </header>

                <section className="mb-12">
                    <h2 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-5">Enrolled Courses</h2>
                    {enrollments.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-2xl">
                            <CardContent className="flex flex-col items-center justify-center p-12 md:p-16 text-center">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                                    <PlayCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">No active enrollments</h3>
                                <p className="text-slate-500 mb-6 max-w-md leading-relaxed text-xs font-semibold">You haven&apos;t enrolled in any business programs yet. Discover our premium curated course library to kickstart your study.</p>
                                <Link href="/courses/1">
                                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md px-6 py-2.5 text-xs font-semibold cursor-pointer">
                                        Explore Our Catalog
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enr) => {
                                let moduleCount = 0
                                try { moduleCount = JSON.parse(enr.course.modules).length } catch {}
                                return (
                                    <CourseCard
                                        key={enr.id}
                                        title={enr.course.title}
                                        description={enr.course.description}
                                        moduleCount={moduleCount}
                                        imageUrl={enr.course.imageUrl}
                                        buttonText="Continue Learning"
                                        href={`/courses/${enr.course.id}/video`}
                                    />
                                )
                            })}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-xs font-bold text-slate-455 uppercase tracking-widest mb-5">Recommended Curriculums</h2>
                    {(() => {
                        const recommended = allCourses.filter((c) => !enrollments.some((e) => e.courseId === c.id))
                        if (recommended.length === 0) {
                            return <p className="text-xs text-slate-400 font-semibold">No additional courses available at this time.</p>
                        }
                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommended.map((course) => {
                                    let moduleCount = 0
                                    try { moduleCount = JSON.parse(course.modules).length } catch {}
                                    return (
                                        <CourseCard
                                            key={course.id}
                                            title={course.title}
                                            description={course.description}
                                            moduleCount={moduleCount}
                                            imageUrl={course.imageUrl}
                                            buttonText="View Course Details"
                                            href={`/courses/${course.id}`}
                                        />
                                    )
                                })}
                            </div>
                        )
                    })()}
                </section>
            </div>
        </div>
    )
}
