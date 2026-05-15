import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Home, Search } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Logo mark */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-3xl font-black text-white">404</span>
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                    Page not found
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed mb-10">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-5 font-semibold gap-2">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/courses">
                        <Button variant="outline" className="w-full sm:w-auto rounded-xl px-6 py-5 font-semibold gap-2 border-slate-200">
                            <BookOpen className="w-4 h-4" />
                            Browse Courses
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200">
                    <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" />
                        Lost? Try browsing our course catalog.
                    </p>
                </div>
            </div>
        </div>
    )
}
