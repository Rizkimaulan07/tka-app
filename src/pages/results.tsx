import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  Target,
  Trophy,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/context/use-app"
import { getSubject } from "@/data/subjects"
import { getOverallStats } from "@/lib/analytics"
import { cn, formatDate, formatDuration } from "@/lib/utils"

type ResultFilter = "semua" | "tuntas" | "perlu-latihan"

const filters: Array<{ value: ResultFilter; label: string }> = [
  { value: "semua", label: "Semua hasil" },
  { value: "tuntas", label: "Tuntas (≥70)" },
  { value: "perlu-latihan", label: "Perlu latihan" },
]

export function ResultsPage() {
  const { attempts, questions } = useApp()
  const [filter, setFilter] = useState<ResultFilter>("semua")

  const stats = useMemo(
    () => getOverallStats(attempts, questions),
    [attempts, questions],
  )
  const sorted = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
      ),
    [attempts],
  )
  const filtered = sorted.filter((attempt) => {
    if (filter === "semua") return true
    if (filter === "tuntas") return attempt.score >= 70
    return attempt.score < 70
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Jejak belajarmu"
        title="Hasil & Pembahasan"
        description="Lihat perkembangan skor, buka pembahasan tiap soal, dan temukan pola kesalahan untuk diperbaiki."
        action={
          <Button asChild>
            <Link to="/tryout">
              <ClipboardList className="size-4" />
              Kerjakan tes baru
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Rata-rata skor"
          value={String(stats.averageScore)}
          hint="seluruh percobaan"
          icon={<Target className="size-5" />}
          trend={stats.delta}
        />
        <StatCard
          label="Tes diselesaikan"
          value={String(stats.totalAttempts)}
          hint="tryout & latihan"
          icon={<History className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Akurasi jawaban"
          value={`${stats.accuracy}%`}
          hint={`${stats.totalQuestions} soal`}
          icon={<BarChart3 className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Skor terbaik"
          value={String(stats.bestScore)}
          hint="personal best"
          icon={<Trophy className="size-5" />}
          tone="sky"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                filter === item.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Menampilkan {filtered.length} dari {sorted.length} hasil · terbaru
          lebih dulu
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<History className="size-5" />}
          title={
            sorted.length === 0
              ? "Belum ada hasil ujian"
              : "Belum ada hasil di kategori ini"
          }
          description={
            sorted.length === 0
              ? "Kerjakan tryout pertamamu untuk mulai melihat skor dan pembahasan di sini."
              : "Coba pilih kategori lain untuk melihat hasil yang tersedia."
          }
          action={
            <Button asChild>
              <Link to="/tryout">Lihat daftar tes</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((attempt, index) => {
            const passed = attempt.score >= 70
            const accuracy =
              attempt.total > 0
                ? Math.round((attempt.correctCount / attempt.total) * 100)
                : 0
            return (
              <Link
                key={attempt.id}
                to={`/hasil/${attempt.id}`}
                className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <Card className="animate-rise transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-md">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-2xl text-base font-extrabold shadow-sm",
                        passed
                          ? "bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-gradient-to-br from-amber-500/15 to-rose-500/10 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {attempt.score}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                          {attempt.examTitle}
                        </h3>
                        <Badge variant={passed ? "success" : "warning"}>
                          {passed ? "Tuntas" : "Perlu latihan"}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {formatDate(attempt.finishedAt, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="size-3" />
                          {formatDuration(attempt.timeSpentSeconds)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          {attempt.correctCount}/{attempt.total} benar ·{" "}
                          {accuracy}% akurasi
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {attempt.subjectIds.map((subjectId) => {
                          const subject = getSubject(subjectId)
                          return (
                            <span
                              key={subjectId}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                                subject.bg,
                                subject.color,
                              )}
                            >
                              <span
                                className="size-1 rounded-full"
                                style={{ backgroundColor: subject.chart }}
                              />
                              {subject.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] font-medium text-muted-foreground">
                          Jawaban benar
                        </p>
                        <p className="text-sm font-extrabold text-foreground">
                          {attempt.correctCount}
                          <span className="text-[10px] font-medium text-muted-foreground">
                            /{attempt.total}
                          </span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-bold text-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                        Pembahasan
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
