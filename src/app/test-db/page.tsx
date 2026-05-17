import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function TestDbPage() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            password: true, // we will display a preview of the hash
            createdAt: true,
        }
    })

    return (
        <div className="p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4">Database Users Inspector</h1>
            <table className="w-full border-collapse border border-slate-300">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-slate-300 p-2 text-left">ID</th>
                        <th className="border border-slate-300 p-2 text-left">Name</th>
                        <th className="border border-slate-300 p-2 text-left">Email</th>
                        <th className="border border-slate-300 p-2 text-left">Role</th>
                        <th className="border border-slate-300 p-2 text-left">Password Hash Preview</th>
                        <th className="border border-slate-300 p-2 text-left">Password Exists?</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50">
                            <td className="border border-slate-300 p-2">{user.id}</td>
                            <td className="border border-slate-300 p-2">{user.name || "N/A"}</td>
                            <td className="border border-slate-300 p-2">{user.email || "N/A"}</td>
                            <td className="border border-slate-300 p-2">{user.role}</td>
                            <td className="border border-slate-300 p-2">
                                {user.password ? `${user.password.substring(0, 15)}...` : "NULL"}
                            </td>
                            <td className="border border-slate-300 p-2">
                                {user.password ? "✅ YES" : "❌ NO"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
