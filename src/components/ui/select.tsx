import { ChevronDown } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-xl border border-input bg-card py-2 pr-9 pl-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
