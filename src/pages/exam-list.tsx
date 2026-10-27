import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  History,
  Layers3,
  Play,
  Search,
  Sparkles,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "@/components/page-header"
import { SubjectIcon } from "@/components/subject-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { Input } from "@/components/ui/input"
import { useApp } from "@/context/use-app"
import { EXAMS } from "@/data/exams"
import { getSubject } from "@/data/subjects"
import { getRemainingSeconds, loadSession } from "@/lib/exam-session"
import { cn, formatNumber } from "@/lib/utils"
import type { Attempt, ExamLevel } from "@/types"

type Filter = "Semua" | ExamLevel

const filters: Filter[] = ["Semua", "Simulasi", "Tryout", "Latihan"]

const levelVariant: Record<
  ExamLevel,
  "default" | "success" | "warning" | "sky"
> = {
  Simulasi: "warning",
  Tryout: "default",
  Latihan: "success",
}

export function ExamListPage() {
  const { attempts } = useApp()
  const [filter, setFilter] = useState<Filter>("Semua")
  const [query, setQuery] = useState("")

  const bestScores = useMemo(() => {
    const map = new Map<string, Attempt>()
    for (const attempt of attempts) {
      const current = map.get(attempt.examId)
      if (!current || attempt.score > current.score) {
        map.set(attempt.examId, attempt)
      }
    }
    return map
  }, [attempts])

  const activeExamIds = useMemo(() => {
    const ids = new Set<string>()
    for (const exam of EXAMS) {
      const session = loadSession(exam.id)
      if (session && getRemainingSeconds(exam, session) > 0) {
        ids.add(exam.id)
      }
    }
    return ids
  }, [])

  const filteredExams = EXAMS.filter((exam) => {
    const matchesFilter = filter === "Semua" || exam.level === filter
    const normalizedQuery = query.trim().toLowerCase()
    const subjectNames = exam.subjectIds
      .map((subjectId) => getSubject(subjectId).name)
      .join(" ")
    const matchesQuery =
      normalizedQuery.length === 0 ||
      exam.title.toLowerCase().includes(normalizedQuery) ||
      exam.description.toLowerCase().includes(normalizedQuery) ||
      subjectNames.toLowerCase().includes(normalizedQuery)
    return matchesFilter && matchesQuery
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Perpustakaan tes"
        title="Tryout & Latihan"
        description="Pilih paket yang sesuai dengan targetmu. Semua jawaban tersimpan otomatis dan dapat dibahas setelah dikumpulkan."
        action={
          <Button variant="outline" asChild>
            <Link to="/hasil">
              <History className="size-4" />
              Riwayat hasil
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="scrollbar-thin flex items-center gap-1.5 overflow-x-auto pb-1">
          {filters.map((item) => {
            const count =
              item === "Semua"
                ? EXAMS.length
                : EXAMS.filter((exam) => exam.level === item).length
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filter === item
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {item}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[9px] font-bold",
                    filter === item
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari tes atau mapel..."
            className="pl-9"
            aria-label="Cari tes"
          />
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <EmptyState
          icon={<Search className="size-5" />}
          title="Tes tidak ditemukan"
          description="Coba kata kunci lain atau ubah filter jenjang tes."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("")
                setFilter("Semua")
              }}
            >
              Reset filter
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredExams.map((exam) => {
            const best = bestScores.get(exam.id)
            const isActive = activeExamIds.has(exam.id)
            return (
              <Link
                key={exam.id}
                to={`/tryout/${exam.id}`}
                className="group block h-full focus-visible:outline-none"
              >
                <Card
                  className={cn(
                    "animate-rise flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-ring/50",
                    exam.featured && "border-primary/25",
                  )}
                >
                  {exam.featured && (
                    <div className="flex items-center gap-1.5 border-b border-primary/15 bg-gradient-to-r from-primary/12 via-primary/5 to-transparent px-5 py-2 text-[10px] font-bold text-primary">
                      <Sparkles className="size-3" />
                      Paket rekomendasi
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex -space-x-1.5">
                        {exam.subjectIds.slice(0, 3).map((subjectId) => (
                          <SubjectIcon
                            key={subjectId}
                            subjectId={subjectId}
                            size="sm"
                            className="border-2"
                          />
                        ))}
                        {exam.subjectIds.length > 3 && (
                          <span className="grid size-8 place-items-center rounded-lg border-2 border-card bg-muted text-[9px] font-bold text-muted-foreground">
                            +{exam.subjectIds.length - 3}
                          </span>
                        )}
                      </div>
                      <Badge variant={levelVariant[exam.level]}>
                        {exam.level}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-start gap-2">
                      <h3 className="text-base font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {exam.title}
                      </h3>
                      {isActive && (
                        <span className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-300">
                          <span className="size-1 animate-pulse rounded-full bg-emerald-500" />
                          AKTIF
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {exam.description}
                    </p>

                    {best && (
                      <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="size-3" />
                        Skor terbaik {best.score}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-medium text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Layers3 className="size-3" />
                        {exam.questionIds.length} soal
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3" />
                        {exam.durationMinutes} menit
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {formatNumber(exam.participants)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-4">
                      <span className="truncate text-[10px] text-muted-foreground">
                        {exam.schedule}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
                        {isActive ? (
                          <>
                            <Play className="size-3" />
                            Lanjutkan
                          </>
                        ) : (
                          <>
                            Lihat detail
                            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground">
        <ChevronLeft className="size-3 rotate-180" />
        Semua paket sudah termasuk pembahasan dan analisis hasil.
      </div>
    </div>
  )
}
