import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col">
            <div className="bg-slate-900 text-white py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 to-transparent"></div>
                <div className="absolute inset-0 bg-blue-900/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] z-0"></div>
                <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-800/50 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
                        Our Mission
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                        Pioneering the Future of <br className="hidden md:block" />Executive <span className="text-blue-500">Education</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        We exist to seamlessly bridge the gap between theoretical technology and practical enterprise execution. We empower global organizations through elite digital transformation training.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-24 flex-1">
                <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-8">Empowering Leaders to Automate Instantly</h2>
                        <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                            <p>
                                In a world where artificial intelligence and automation are rapidly displacing legacy workflows, technical intuition has become the single most valuable currency for modern business leadership.
                            </p>
                            <p>
                                ExecutiveEdu was founded by industry veterans to cut through the jargon. We don't teach you how to write code for the sake of coding. We teach you how to systematically deploy technology to reduce overhead, eliminate human error, and accelerate your company's digital outcomes.
                            </p>
                            <p>
                                Our flagship 6-week curriculum strips away theoretical noise to focus entirely on pragmatic, scalable business automation that generates immediate ROI.
                            </p>
                        </div>
                        <div className="mt-10 flex items-center gap-4">
                            <Link href="/courses/1">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                                    Explore Our Flagship Program
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative order-1 md:order-2">
                        <div className="aspect-[4/5] bg-gradient-to-tr from-slate-200 to-slate-100 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <img
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop"
                                alt="Corporate team working on digital transformation"
                                className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-3xl"></div>
                        </div>
                        <div className="absolute -bottom-8 -left-8 md:-left-12 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[240px] animate-in slide-in-from-bottom duration-1000 delay-300">
                            <div className="text-4xl font-black text-blue-600 mb-2">10k+</div>
                            <div className="text-sm font-bold text-slate-800 leading-snug">Enterprise Leaders Trained Globally</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
