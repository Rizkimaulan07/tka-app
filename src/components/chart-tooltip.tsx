import { cn } from "@/lib/utils"

interface TooltipPayloadItem {
  value?: number | string
  name?: string
  color?: string
  dataKey?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  suffix?: string
  labelFormatter?: (label: string | number) => string
  className?: string
}

export function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
  labelFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      className={cn(
        "min-w-36 rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-xl",
        className,
      )}
    >
      {label !== undefined && (
        <p className="mb-1.5 text-[11px] font-bold text-foreground">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div
            key={`${item.dataKey ?? item.name ?? "item"}-${index}`}
            className="flex items-center justify-between gap-4 text-[11px]"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: item.color ?? "var(--primary)" }}
              />
              {item.name ?? "Nilai"}
            </span>
            <span className="font-bold text-foreground">
              {item.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
