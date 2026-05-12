import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlayCircle, Clock } from "lucide-react"

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
                                <Link href="/courses/1">
                                    <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-lg px-8 py-6 text-base font-semibold">
                                        Explore Our Catalog
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {enrollments.map((enr: any) => (
                                <Card key={enr.id} className="border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden bg-white group">
                                    <div className="h-48 bg-gradient-to-br from-blue-950 via-slate-900 to-black relative">
                                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                                            <span className="text-5xl font-black text-white/50 tracking-tighter">AI</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-8">
                                        <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 leading-tight">{enr.course.title}</h3>
                                        <p className="text-slate-600 line-clamp-3 mb-6 text-sm leading-relaxed">{enr.course.description}</p>
                                        <div className="flex items-center gap-3 text-sm text-slate-500 mb-8 font-medium">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <span>{JSON.parse(enr.course.modules).length} Modules • Self-paced</span>
                                        </div>
                                        <Link href={`/courses/${enr.course.id}/video`}>
                                            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 py-6 text-base font-semibold transition-transform active:scale-95">
                                                Continue Learning
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Recommended for You</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allCourses.filter((c: any) => !enrollments.some((e: any) => e.courseId === c.id)).map((course: any) => (
                            <Card key={course.id} className="border border-slate-200 shadow-sm rounded-2xl bg-white opacity-80 hover:opacity-100 transition-opacity">
                                <CardHeader>
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/courses/${course.id}`}>
                                        <Button variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 py-5 font-semibold rounded-xl">
                                            View Course
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
