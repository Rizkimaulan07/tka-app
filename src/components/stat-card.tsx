import type { ReactNode } from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

type StatTone = "primary" | "success" | "warning" | "sky"

const toneStyles: Record<StatTone, string> = {
  primary:
    "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
}

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: ReactNode
  tone?: StatTone
  trend?: number
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "animate-rise p-4 transition-shadow duration-300 hover:shadow-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-[11px] leading-snug font-medium text-muted-foreground sm:text-xs">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl sm:size-10",
            toneStyles[tone],
          )}
        >
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px]">
        {typeof trend === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold",
              trend >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-300",
            )}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(trend)}
          </span>
        )}
        {hint && <span className="truncate text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  )
}
