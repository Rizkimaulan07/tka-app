import type { Subject } from "@/types"

export const SUBJECTS: Subject[] = [
  {
    id: "matematika",
    name: "Matematika",
    short: "MAT",
    color: "text-indigo-600 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/20",
    dot: "bg-indigo-500",
    chart: "#6366f1",
  },
  {
    id: "bahasa-indonesia",
    name: "Bahasa Indonesia",
    short: "BIN",
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
    chart: "#10b981",
  },
  {
    id: "bahasa-inggris",
    name: "Bahasa Inggris",
    short: "ENG",
    color: "text-sky-600 dark:text-sky-300",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/20",
    dot: "bg-sky-500",
    chart: "#0ea5e9",
  },
  {
    id: "penalaran-umum",
    name: "Penalaran Umum",
    short: "PEN",
    color: "text-amber-600 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
    dot: "bg-amber-500",
    chart: "#f59e0b",
  },
]

export const SUBJECT_MAP = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, subject]),
) as Record<Subject["id"], Subject>

export function getSubject(id: Subject["id"]): Subject {
  return SUBJECT_MAP[id]
}
