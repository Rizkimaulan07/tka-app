import { GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="SiapTKA — kembali ke dashboard"
    >
      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-300 group-hover:scale-105">
        <GraduationCap className="size-5.5" strokeWidth={2.2} />
        <span className="absolute -top-3 -right-3 size-6 rounded-full bg-white/20 blur-sm" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Siap<span className="text-primary">TKA</span>
          </span>
          <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground">
            BELAJAR · LATIH · SIAP
          </span>
        </span>
      )}
    </Link>
  )
}
