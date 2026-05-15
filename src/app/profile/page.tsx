import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BookOpen, TrendingUp, Calendar, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import ProfileForm from "@/components/ProfileForm"

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect("/login")

    const userId = (session.user as any).id

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            _count: { select: { enrollments: true, payments: true } },
        },
    })

    if (!user) redirect("/login")

    const initials = (user.name ?? user.email ?? "?")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    })

    const stats = [
        { label: "Enrolled Courses", value: user._count.enrollments, icon: BookOpen,   color: "text-blue-600",   bg: "bg-blue-50" },
        { label: "Total Purchases",  value: user._count.payments,    icon: TrendingUp,  color: "text-green-600",  bg: "bg-green-50" },
        { label: "Member Since",     value: joinDate,                 icon: Calendar,    color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Account Type",     value: user.role,                icon: ShieldCheck, color: "text-orange-600", bg: "bg-orange-50" },
    ]

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="container mx-auto max-w-3xl">

                {/* Header */}
                <div className="flex items-center gap-5 mb-10">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg shadow-blue-200">
                            {user.image ? (
                                <img src={user.image} alt={user.name ?? "Avatar"} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white text-2xl font-extrabold">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {user.name ?? "My Profile"}
                        </h1>
                        <p className="text-slate-500 mt-1">{user.email}</p>
                        <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full ${
                            user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                        }`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {stats.map(s => (
                        <Card key={s.label} className="border border-slate-200 shadow-sm rounded-2xl bg-white">
                            <CardContent className="pt-5 pb-5">
                                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                </div>
                                <p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p>
                                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Edit Forms */}
                <ProfileForm
                    initialName={user.name ?? ""}
                    initialEmail={user.email ?? ""}
                    initialImage={user.image ?? ""}
                    hasPassword={!!user.password}
                />
            </div>
        </div>
    )
}
