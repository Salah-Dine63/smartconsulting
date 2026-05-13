import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen } from "lucide-react"

interface CourseCardProps {
  title: string
  description?: string | null
  moduleCount?: number
  duration?: string
  level?: string
  imageUrl?: string | null
  buttonText?: string
  href: string
}

export function CourseCard({
  title,
  description,
  moduleCount,
  duration,
  level,
  imageUrl,
  buttonText = "View Course",
  href,
}: CourseCardProps) {
  return (
    <div className="h-full flex flex-col border border-slate-200 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden bg-white group">
      {/* Banner */}
      {imageUrl ? (
        <div className="h-44 overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-blue-950 via-slate-900 to-black relative shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-black text-white/20 tracking-tighter select-none group-hover:scale-110 transition-transform duration-700 inline-block">
              AI
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Body — flex-col so button stays pinned at bottom */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>

        {/* flex-1 spacer always present so metadata/button stay at bottom */}
        <div className="flex-1 mb-4">
          {description && (
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-medium mb-5">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
            {moduleCount != null
              ? `${moduleCount} Module${moduleCount !== 1 ? "s" : ""}`
              : "Modules"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            {duration ?? "Self-paced"}
          </span>
          {level && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              {level}
            </span>
          )}
        </div>

        <Link href={href}>
          <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 py-6 text-base font-semibold transition-transform active:scale-95">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  )
}
