"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, BookOpen, SlidersHorizontal } from "lucide-react"

interface Course {
    id: string
    title: string
    description: string
    price: number
    imageUrl: string
    moduleCount: number
}

export default function CourseCatalog({ courses }: { courses: Course[] }) {
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "free" | "paid">("all")

    const filtered = courses.filter((c) => {
        const matchesQuery =
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            c.description.toLowerCase().includes(query.toLowerCase())
        const matchesFilter =
            filter === "all" ||
            (filter === "free" && c.price === 0) ||
            (filter === "paid" && c.price > 0)
        return matchesQuery && matchesFilter
    })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-slate-900 text-white py-16 px-4">
                <div className="container mx-auto max-w-5xl text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-800/50 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6">
                        <BookOpen className="w-3.5 h-3.5" />
                        Course Catalog
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                        Find Your Next{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            Program
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Professional courses designed for executives and business leaders.
                    </p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto max-w-5xl px-4 py-4 flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                        />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                        {(["all", "free", "paid"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                                    filter === f
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto max-w-5xl px-4 py-12">
                {filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-7 h-7 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No courses found</h3>
                        <p className="text-slate-400">Try a different search term or filter.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((course) => (
                                <Link key={course.id} href={`/courses/${course.id}`} className="group">
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-gradient-to-br from-blue-900 to-slate-900 relative overflow-hidden">
                                            {course.imageUrl ? (
                                                <img
                                                    src={course.imageUrl}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                                        <BookOpen className="w-7 h-7 text-white/70" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                                    course.price === 0
                                                        ? "bg-green-500 text-white"
                                                        : "bg-white/90 text-slate-800"
                                                }`}>
                                                    {course.price === 0 ? "Free" : `$${course.price}`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {course.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
                                                {course.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {course.moduleCount} module{course.moduleCount !== 1 ? "s" : ""}
                                                </span>
                                                <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                                                    View Course →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
