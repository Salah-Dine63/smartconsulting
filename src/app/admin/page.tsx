import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Users, BookOpen, DollarSign, TrendingUp } from "lucide-react"
import AdminCourseForm from "@/components/AdminCourseForm"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== "ADMIN") {
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
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Total Courses", value: courses.length, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
        { label: "Enrollments", value: totalEnrollments, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
        { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-1">Manage your platform</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <p className="text-2xl font-bold text-white">{s.value}</p>
                            <p className="text-sm text-slate-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-10">
                    {/* Courses */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Courses</h2>
                            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{courses.length} total</span>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {courses.map((course) => (
                                <div key={course.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white line-clamp-1">{course.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{course._count.enrollments} enrolled</p>
                                    </div>
                                    <span className="text-sm font-bold text-green-400">${course.price.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Enrollments */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-800">
                            <h2 className="text-lg font-bold text-white">Recent Enrollments</h2>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {enrollments.map((e) => (
                                <div key={e.id} className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {(e.user.name ?? e.user.email ?? "?")[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">{e.user.name ?? e.user.email}</p>
                                        <p className="text-xs text-slate-400 truncate">{e.course.title}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                                        {e.status}
                                    </span>
                                </div>
                            ))}
                            {enrollments.length === 0 && (
                                <p className="p-6 text-sm text-slate-500 text-center">No enrollments yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Users */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-10">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-lg font-bold text-white">Recent Users</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left p-4 text-slate-400 font-medium">Name</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Email</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                                    <th className="text-left p-4 text-slate-400 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-white font-medium">{u.name ?? "—"}</td>
                                        <td className="p-4 text-slate-400">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-purple-500/10 text-purple-400" : "bg-slate-700 text-slate-400"}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Course */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-lg font-bold text-white">Add New Course</h2>
                        <p className="text-sm text-slate-400 mt-1">Create a new course for your platform</p>
                    </div>
                    <div className="p-6">
                        <AdminCourseForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
