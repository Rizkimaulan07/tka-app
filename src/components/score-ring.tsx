import { useId } from "react"
import { cn } from "@/lib/utils"

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
}

export function ScoreRing({
  score,
  size = 140,
  strokeWidth = 11,
  label = "Skor",
  className,
}: ScoreRingProps) {
  const gradientId = useId().replaceAll(":", "")
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score))
  const offset = circumference - (progress / 100) * circumference
  const [from, to] =
    score >= 80
      ? ["#10b981", "#22d3ee"]
      : score >= 70
        ? ["#7c6cf6", "#60a5fa"]
        : ["#f59e0b", "#fb7185"]

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        role="img"
        aria-label={`${label}: ${score}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-extrabold tracking-tight text-foreground"
          style={{ fontSize: size * 0.27 }}
        >
          {score}
        </span>
        <span
          className="font-semibold tracking-wide text-muted-foreground uppercase"
          style={{ fontSize: Math.max(9, size * 0.075) }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
