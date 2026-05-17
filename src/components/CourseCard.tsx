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
    <div className="h-full flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden group">
      {/* Banner */}
      {imageUrl ? (
        <div className="h-44 overflow-hidden shrink-0 relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-slate-950/5 dark:bg-black/20" />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 relative shrink-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-black text-white/10 dark:text-white/5 tracking-tighter select-none group-hover:scale-[1.05] transition-transform duration-700 inline-block">
              ACADEMY
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Body — flex-col so button stays pinned at bottom */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1.5 line-clamp-2 leading-snug group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>

        {/* flex-1 spacer always present so metadata/button stay at bottom */}
        <div className="flex-1 mb-4">
          {description && (
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500 font-semibold mb-4">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            {moduleCount != null
              ? `${moduleCount} Module${moduleCount !== 1 ? "s" : ""}`
              : "Modules"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            {duration ?? "Self-paced"}
          </span>
          {level && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-455 border border-indigo-100 dark:border-indigo-900/30">
              {level}
            </span>
          )}
        </div>

        <Link href={href}>
          <Button className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 rounded-xl py-2.5 h-10 text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer">
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  )
}
