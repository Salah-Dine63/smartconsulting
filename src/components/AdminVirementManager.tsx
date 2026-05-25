"use client"

import { useState } from "react"
import { Check, X, FileText, Loader2, Landmark } from "lucide-react"

interface Transfer {
    id: string
    userId: string
    courseId: string | null
    amount: number
    receiptUrl: string
    status: string
    createdAt: Date
    courseTitle: string
    user: {
        name: string | null
        email: string | null
    }
}

interface Props {
    transfers: Transfer[]
}

export default function AdminVirementManager({ transfers: initialTransfers }: Props) {
    const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleAction = async (transferId: string, action: "approve" | "reject") => {
        setProcessingId(transferId)
        try {
            const res = await fetch("/api/admin/virement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transferId,
                    action,
                }),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                // Remove from the list or update status
                setTransfers(prev => prev.filter(t => t.id !== transferId))
                alert(`Bank transfer successfully ${action === "approve" ? "approved" : "rejected"}!`)
            } else {
                alert(data.error || "Failed to process bank transfer.")
            }
        } catch (err) {
            console.error("Virement process error:", err)
            alert("An error occurred. Please try again.")
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                    <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Pending Bank Transfers</h2>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-150 dark:border-indigo-900/30 px-3 py-1 rounded-full">
                    {transfers.length} pending
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase">
                            <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Student</th>
                            <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Course</th>
                            <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Amount</th>
                            <th className="text-left p-4 font-semibold tracking-wider text-[11px]">Receipt</th>
                            <th className="text-center p-4 font-semibold tracking-wider text-[11px] w-[180px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {transfers.map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/20 transition-colors">
                                <td className="p-4">
                                    <div className="font-semibold text-slate-900 dark:text-slate-100">{t.user.name || "—"}</div>
                                    <div className="text-xs text-slate-400 dark:text-slate-550 mt-0.5">{t.user.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{t.courseTitle}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">ID: {t.courseId}</div>
                                </td>
                                <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                                    ${t.amount.toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <a
                                        href={t.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350 rounded-lg border border-slate-250 dark:border-slate-750 transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>View File</span>
                                    </a>
                                </td>
                                <td className="p-4 text-center">
                                    {processingId === t.id ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleAction(t.id, "approve")}
                                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.93]"
                                                title="Approve & Enroll"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleAction(t.id, "reject")}
                                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.93]"
                                                title="Reject Receipt"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {transfers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-sm text-slate-400 dark:text-slate-500 text-center font-medium">
                                    No pending bank transfers to review
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
