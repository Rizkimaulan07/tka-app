import {
  BookOpenText,
  BrainCircuit,
  Calculator,
  Languages,
  type LucideIcon,
} from "lucide-react"
import { getSubject } from "@/data/subjects"
import type { SubjectId } from "@/types"
import { cn } from "@/lib/utils"

const icons: Record<SubjectId, LucideIcon> = {
  matematika: Calculator,
  "bahasa-indonesia": BookOpenText,
  "bahasa-inggris": Languages,
  "penalaran-umum": BrainCircuit,
}

const sizes = {
  sm: { box: "size-8 rounded-lg", icon: "size-4" },
  md: { box: "size-10 rounded-xl", icon: "size-5" },
  lg: { box: "size-12 rounded-2xl", icon: "size-6" },
}

export function SubjectIcon({
  subjectId,
  size = "md",
  className,
}: {
  subjectId: SubjectId
  size?: keyof typeof sizes
  className?: string
}) {
  const subject = getSubject(subjectId)
  const Icon = icons[subjectId]
  const sizing = sizes[size]

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center border",
        subject.bg,
        subject.border,
        subject.color,
        sizing.box,
        className,
      )}
    >
      <Icon className={sizing.icon} strokeWidth={2} />
    </span>
  )
}
