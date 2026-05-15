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

    const userId = (session.user as any).id
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: { course: true }
    })

    const allCourses = await prisma.course.findMany()

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Learning Dashboard</h1>
                    <p className="text-slate-600 mt-2 text-lg">Welcome back, {session.user.name}</p>
                </header>

                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Enrolled Courses</h2>
                    {enrollments.length === 0 ? (
                        <Card className="border-dashed border-2 border-slate-200 bg-white shadow-sm rounded-3xl">
                            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                    <PlayCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">No active enrollments yet</h3>
                                <p className="text-slate-500 mb-8 max-w-md leading-relaxed text-lg">You haven't enrolled in any courses yet. Discover our premium professional courses to get started.</p>
                                <Link href="/courses">
                                    <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-lg px-8 py-6 text-base font-semibold">
                                        Explore Our Catalog
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrollments.map((enr: any) => {
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
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Recommended for You</h2>
                    {(() => {
                        const recommended = allCourses.filter((c: any) => !enrollments.some((e: any) => e.courseId === c.id))
                        if (recommended.length === 0) return null
                        return (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {recommended.map((course: any) => {
                                    let moduleCount = 0
                                    try { moduleCount = JSON.parse(course.modules).length } catch {}
                                    return (
                                        <CourseCard
                                            key={course.id}
                                            title={course.title}
                                            description={course.description}
                                            moduleCount={moduleCount}
                                            imageUrl={course.imageUrl}
                                            buttonText="View Course"
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
