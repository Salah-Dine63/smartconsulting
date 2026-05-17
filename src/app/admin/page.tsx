import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Users, BookOpen, DollarSign, TrendingUp, Sparkles } from "lucide-react"
import AdminCourseForm from "@/components/AdminCourseForm"
import DeleteCourseButton from "@/components/DeleteCourseButton"
import Link from "next/link"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
        redirect("/dashboard")
    }

    const [users, courses, enrollments, payments] = await Promise.all([
        prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.course.findMany({ include: { _count: { select: { enrollments: true } } } }),
        prisma.enrollment.findMany({ include: { user: true, course: true }, orderBy: { createdAt: "desc" }, take: 10 }),
        prisma.payment.findMany({ where: { status: "COMPLETED" } }),
    ])

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalUsers = await prisma.user.count()
    const totalEnrollments = await prisma.enrollment.count()

    const stats = [
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
        { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
        { label: "Enrollments", value: totalEnrollments, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
        { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 p-6 md:p-10 font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Admin Console</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage programs, student enrollments, and intelligence generation tools.</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                        <Link href="/admin/video-generator">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-550 dark:hover:bg-indigo-650 text-white font-semibold rounded-xl shadow-md active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer">
                                <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
                                AI Course Generator
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300 group">
                            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{s.value}</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                    {/* Courses */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Courses Catalog</h2>
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-150 dark:border-indigo-900/30 px-3 py-1 rounded-full">{courses.length} total</span>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[380px] overflow-y-auto">
                            {courses.map((course) => (
                                <div key={course.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{course.title}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{course._count.enrollments} enrolled</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">${course.price.toLocaleString()}</span>
                                        <DeleteCourseButton courseId={course.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Enrollments */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recent Enrollments</h2>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[380px] overflow-y-auto">
                            {enrollments.map((e) => (
                                <div key={e.id} className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                                        {(e.user.name ?? e.user.email ?? "?")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{e.user.name ?? e.user.email}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{e.course.title}</p>
                                    </div>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide ${e.status === "ACTIVE" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-700"}`}>
                                        {e.status}
                                    </span>
                                </div>
                            ))}
                            {enrollments.length === 0 && (
                                <p className="p-6 text-sm text-slate-400 dark:text-slate-500 text-center">No enrollments yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden mb-10 shadow-sm">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Active Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase">
                                    <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Name</th>
                                    <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Email</th>
                                    <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Role</th>
                                    <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/20 transition-colors">
                                        <td className="p-4 text-slate-900 dark:text-slate-100 font-semibold">{u.name ?? "—"}</td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide ${u.role === "ADMIN" ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450 border border-slate-200 dark:border-slate-700"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 dark:text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Course */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Add New Curriculum</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 font-medium">Draft and publish new business courses manually.</p>
                    </div>
                    <div className="p-6">
                        <AdminCourseForm />
                    </div>
                </div>

            </div>
        </div>
    )
}
