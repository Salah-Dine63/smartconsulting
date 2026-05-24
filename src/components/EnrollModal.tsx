"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { CreditCard, Landmark, Wallet } from "lucide-react"

interface Props {
    courseId: string
    courseTitle: string
    amount: number
}

export default function EnrollModal({
    courseId,
    courseTitle,
    amount,
}: Props) {

    const [loading, setLoading] = useState(false)
    const [receipt, setReceipt] = useState<File | null>(null)

    async function handleStripePayment() {
        setLoading(true)

        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId,
                }),
            })

            const data = await res.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handlePaypalPayment() {
        setLoading(true)

        try {
            const res = await fetch("/api/paypal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId,
                }),
            })

            const data = await res.json()

            if (data.approvalUrl) {
                window.location.href = data.approvalUrl
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleBankTransfer() {
        if (!receipt) {
            alert("Please upload your bank transfer receipt.")
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()

            formData.append("courseId", courseId)
            formData.append("receipt", receipt)

            const res = await fetch("/api/virement", {
                method: "POST",
                body: formData,
            })

            if (res.ok) {
                alert("Receipt uploaded successfully.")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 text-lg rounded-xl shadow-lg"
                >
                    Enroll Now
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg rounded-3xl border border-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                        Complete Enrollment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">

                    <div className="bg-slate-100 rounded-2xl p-5">
                        <h3 className="font-bold text-slate-900 text-lg">
                            {courseTitle}
                        </h3>

                        <p className="text-slate-500 mt-1">
                            Premium Roobotix Program
                        </p>

                        <div className="mt-4 text-4xl font-black text-blue-600">
                            ${amount}
                        </div>
                    </div>

                    <div className="space-y-4">

                        <Button
                            onClick={handleStripePayment}
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold flex items-center justify-center gap-3"
                        >
                            <CreditCard className="w-5 h-5" />
                            Pay with Card (Stripe)
                        </Button>

                        <Button
                            onClick={handlePaypalPayment}
                            disabled={loading}
                            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold flex items-center justify-center gap-3"
                        >
                            <Wallet className="w-5 h-5" />
                            Pay with PayPal
                        </Button>

                        <div className="border border-slate-200 rounded-2xl p-5 space-y-4">

                            <div className="flex items-center gap-3">
                                <Landmark className="w-5 h-5 text-slate-700" />
                                <h4 className="font-bold text-slate-900">
                                    Bank Transfer
                                </h4>
                            </div>

                            <div className="text-sm text-slate-600 space-y-1">
                                <p>Bank: Roobotix Bank</p>
                                <p>IBAN: MA12 0000 0000 0000 0000</p>
                                <p>SWIFT: ROOBOTIXMA</p>
                            </div>

                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) =>
                                    setReceipt(
                                        e.target.files?.[0] || null
                                    )
                                }
                                className="w-full border border-slate-200 rounded-xl p-3"
                            />

                            <Button
                                onClick={handleBankTransfer}
                                disabled={loading}
                                className="w-full rounded-xl"
                            >
                                Upload Receipt
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}