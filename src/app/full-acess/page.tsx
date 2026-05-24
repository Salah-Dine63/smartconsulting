import StripeFullButton from "@/components/StripeFullButton"

export default function FullAccessPage() {

    return (

        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-2xl w-full">

                <div className="text-center mb-10">

                    <h1 className="text-5xl font-black text-slate-900 mb-4">
                        Full Access
                    </h1>

                    <p className="text-slate-600 text-lg">
                        Unlock all premium business courses instantly.
                    </p>
                </div>

                <div className="bg-slate-900 rounded-3xl p-10 text-white text-center mb-10">

                    <div className="text-6xl font-black mb-3">
                        $1999
                    </div>

                    <p className="text-slate-300">
                        One-time payment
                    </p>
                </div>

                <div className="space-y-5 mb-10">

                    <div className="flex items-center gap-3">
                        ✅ Unlimited access
                    </div>

                    <div className="flex items-center gap-3">
                        ✅ All current courses
                    </div>

                    <div className="flex items-center gap-3">
                        ✅ Future premium updates
                    </div>

                    <div className="flex items-center gap-3">
                        ✅ Roobotix certifications
                    </div>

                </div>

                <StripeFullButton />

            </div>

        </div>
    )
}