import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Flag,
  Lightbulb,
  MinusCircle,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { ScoreRing } from "@/components/score-ring"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useApp } from "@/context/use-app"
import { getSubject } from "@/data/subjects"
import {
  getAttemptQuestions,
  getAttemptSubjects,
  getTopicPerformance,
  isAnswerCorrect,
} from "@/lib/analytics"
import { cn, formatDate, formatDuration } from "@/lib/utils"
import type { Attempt, Question } from "@/types"

type ReviewFilter = "semua" | "salah" | "ragu"

const filterLabels: Array<{ value: ReviewFilter; label: string }> = [
  { value: "semua", label: "Semua soal" },
  { value: "salah", label: "Perlu diperbaiki" },
  { value: "ragu", label: "Ragu-ragu" },
]

function ReviewItem({
  question,
  number,
  answer,
  flagged,
}: {
  question: Question
  number: number
  answer: string[] | undefined
  flagged: boolean
}) {
  const selected = new Set(answer ?? [])
  const correct = new Set(question.correctOptionIds)
  const answered = (answer?.length ?? 0) > 0
  const isCorrect = isAnswerCorrect(question, answer)
  const subject = getSubject(question.subjectId)
  const answerLabel = answered
    ? answer!.map((id) => id.toUpperCase()).join(", ")
    : "Tidak dijawab"
  const keyLabel = question.correctOptionIds
    .map((id) => id.toUpperCase())
    .join(", ")

  return (
    <details className="group rounded-2xl border border-border/70 bg-card transition-colors open:border-primary/20 open:bg-muted/15">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-3.5 sm:p-4">
        <span
          className={cn(
            "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
            isCorrect
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              : answered
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : "bg-muted text-muted-foreground",
          )}
        >
          {isCorrect ? (
            <CheckCircle2 className="size-4" />
          ) : answered ? (
            <XCircle className="size-4" />
          ) : (
            <MinusCircle className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
              Soal {number}
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-bold",
                subject.bg,
                subject.color,
              )}
            >
              {subject.short}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              {question.topic}
            </span>
            {flagged && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                <Flag className="size-2.5" />
                Ragu
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-medium text-foreground">
            {question.prompt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge
            variant={isCorrect ? "success" : answered ? "destructive" : "outline"}
            className="hidden sm:inline-flex"
          >
            {isCorrect ? "Benar" : answered ? "Salah" : "Kosong"}
          </Badge>
          <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
        </div>
      </summary>

      <div className="border-t border-border/60 px-3.5 pt-4 pb-4 sm:px-4">
        <p className="text-sm leading-relaxed font-medium whitespace-pre-line text-foreground">
          {question.prompt}
        </p>

        <div className="mt-4 space-y-2">
          {question.options.map((option) => {
            const isCorrectOption = correct.has(option.id)
            const isSelected = selected.has(option.id)
            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl border px-3 py-2.5",
                  isCorrectOption
                    ? "border-emerald-500/30 bg-emerald-500/8"
                    : isSelected
                      ? "border-rose-500/30 bg-rose-500/8"
                      : "border-border/70 bg-card",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[9px] font-extrabold",
                    isCorrectOption
                      ? "border-emerald-500/40 bg-emerald-500 text-white"
                      : isSelected
                        ? "border-rose-500/40 bg-rose-500 text-white"
                        : "border-border bg-muted/60 text-muted-foreground",
                  )}
                >
                  {isCorrectOption ? (
                    <Check className="size-3" />
                  ) : isSelected ? (
                    <X className="size-3" />
                  ) : (
                    option.id.toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1 text-xs leading-relaxed text-foreground">
                  {option.text}
                </span>
                {isCorrectOption && (
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 dark:text-emerald-300">
                    Kunci
                  </span>
                )}
                {isSelected && !isCorrectOption && (
                  <span className="shrink-0 rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-bold text-rose-700 dark:text-rose-300">
                    Jawabanmu
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-muted/40 px-3 py-2 text-[10px]">
          <span className="text-muted-foreground">
            Jawabanmu:{" "}
            <strong
              className={cn(
                "font-bold",
                isCorrect
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300",
              )}
            >
              {answerLabel}
            </strong>
          </span>
          <span className="text-muted-foreground">
            Kunci:{" "}
            <strong className="font-bold text-emerald-700 dark:text-emerald-300">
              {keyLabel}
            </strong>
          </span>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <div>
            <p className="text-[10px] font-bold tracking-wide text-primary uppercase">
              Pembahasan
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {question.explanation}
            </p>
          </div>
        </div>
      </div>
    </details>
  )
}

function ResultDetailContent({ attempt }: { attempt: Attempt }) {
  const { questions } = useApp()
  const [filter, setFilter] = useState<ReviewFilter>("semua")

  const attemptQuestions = useMemo(
    () => getAttemptQuestions(attempt, questions),
    [attempt, questions],
  )
  const subjectBreakdown = useMemo(
    () => getAttemptSubjects(attempt, questions),
    [attempt, questions],
  )
  const topicPerformance = useMemo(
    () => getTopicPerformance([attempt], questions),
    [attempt, questions],
  )

  const answeredCount = attemptQuestions.filter(
    (question) => (attempt.answers[question.id]?.length ?? 0) > 0,
  ).length
  const unanswered = Math.max(0, attemptQuestions.length - answeredCount)
  const wrongCount = Math.max(0, answeredCount - attempt.correctCount)
  const accuracy =
    answeredCount > 0
      ? Math.round((attempt.correctCount / answeredCount) * 100)
      : 0
  const passed = attempt.score >= 70
  const grade =
    attempt.score >= 90
      ? "Luar biasa!"
      : attempt.score >= 80
        ? "Kerja bagus!"
        : attempt.score >= 70
          ? "Kamu tuntas!"
          : "Terus semangat!"
  const message =
    attempt.score >= 90
      ? "Penguasaanmu sangat kuat. Pertahankan konsistensi dan bantu temanmu belajar."
      : attempt.score >= 80
        ? "Sedikit lagi menuju penguasaan penuh. Fokus pada topik dengan penguasaan terendah."
        : attempt.score >= 70
          ? "Kamu sudah melewati batas tuntas. Tinjau pembahasan soal yang salah untuk menaikkan skor."
          : "Jangan menyerah. Pelajari pembahasan di bawah, lalu ulangi tes saat kamu sudah lebih siap."
  const weakTopics = [...topicPerformance]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
  const wrongTotal = attemptQuestions.filter(
    (question) => !isAnswerCorrect(question, attempt.answers[question.id]),
  ).length
  const reviewItems = attemptQuestions
    .map((question, index) => ({ question, number: index + 1 }))
    .filter(({ question }) => {
      if (filter === "salah") {
        return !isAnswerCorrect(question, attempt.answers[question.id])
      }
      if (filter === "ragu") return attempt.flagged.includes(question.id)
      return true
    })

  const filterCounts: Record<ReviewFilter, number> = {
    semua: attemptQuestions.length,
    salah: wrongTotal,
    ragu: attempt.flagged.length,
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-xs">
        <Link to="/hasil">
          <ArrowLeft className="size-3.5" />
          Kembali ke hasil
        </Link>
      </Button>

      <PageHeader
        eyebrow="Pembahasan hasil"
        title={attempt.examTitle}
        description={`Dikumpulkan ${formatDate(attempt.finishedAt, {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} · waktu pengerjaan ${formatDuration(attempt.timeSpentSeconds)}`}
        action={
          <>
            <Button variant="outline" asChild>
              <Link to="/analisis">
                <BarChart3 className="size-4" />
                Analisis
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/tryout/${attempt.examId}`}>
                <RotateCcw className="size-4" />
                Kerjakan ulang
              </Link>
            </Button>
          </>
        }
      />

      <Card className="animate-rise relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary/10 blur-3xl" />
        <CardContent className="relative flex flex-col items-center gap-5 p-5 sm:flex-row sm:gap-7 sm:p-7">
          <ScoreRing
            score={attempt.score}
            size={160}
            label={passed ? "Tuntas" : "Skor"}
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <Badge variant={passed ? "success" : "warning"}>
                {passed ? "Mencapai KKM 70" : "Di bawah KKM 70"}
              </Badge>
              <Badge variant="secondary">{grade}</Badge>
            </div>
            <h2 className="mt-2.5 text-2xl font-extrabold tracking-tight text-foreground">
              {grade}
            </h2>
            <p className="mx-auto mt-1.5 max-w-xl text-xs leading-relaxed text-muted-foreground sm:mx-0">
              {message}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-500" />
                {attempt.correctCount} dari {attempt.total} benar
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3" />
                {formatDate(attempt.finishedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="size-3" />
                {formatDuration(attempt.timeSpentSeconds)}
              </span>
              <span className="inline-flex items-center gap-1">
                <BarChart3 className="size-3" />
                Akurasi {accuracy}%
              </span>
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
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
          <div className="grid w-full shrink-0 grid-cols-3 gap-2 sm:w-auto sm:grid-cols-1">
            <div className="rounded-xl bg-emerald-500/8 px-3 py-2 text-center sm:text-left">
              <p className="text-[9px] text-muted-foreground">Benar</p>
              <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                {attempt.correctCount}
              </p>
            </div>
            <div className="rounded-xl bg-rose-500/8 px-3 py-2 text-center sm:text-left">
              <p className="text-[9px] text-muted-foreground">Salah</p>
              <p className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                {wrongCount}
              </p>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2 text-center sm:text-left">
              <p className="text-[9px] text-muted-foreground">Kosong</p>
              <p className="text-base font-extrabold text-foreground">
                {unanswered}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Jawaban benar"
          value={`${attempt.correctCount}/${attempt.total}`}
          hint={`${accuracy}% dari yang dijawab`}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Jawaban salah"
          value={String(wrongCount)}
          hint="tinjau pembahasannya"
          icon={<XCircle className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Tidak dijawab"
          value={String(unanswered)}
          hint="jangan dilewatkan"
          icon={<MinusCircle className="size-5" />}
          tone="sky"
        />
        <StatCard
          label="Waktu pengerjaan"
          value={formatDuration(attempt.timeSpentSeconds)}
          hint={`${attempt.flagged.length} soal ditandai`}
          icon={<Clock3 className="size-5" />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="animate-rise min-w-0">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle>Pembahasan soal</CardTitle>
                <CardDescription className="mt-1">
                  Buka tiap soal untuk melihat jawabanmu, kunci, dan penjelasan.
                </CardDescription>
              </div>
              <Badge variant="secondary">{attemptQuestions.length} soal</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filterLabels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors",
                    filter === item.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "rounded-full px-1 text-[8px] font-bold",
                      filter === item.value
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {filterCounts[item.value]}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4">
            {reviewItems.length === 0 ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
                <p className="mt-2 text-sm font-bold text-foreground">
                  Tidak ada soal di kategori ini
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coba pilih filter lain untuk melihat pembahasan.
                </p>
              </div>
            ) : (
              reviewItems.map(({ question, number }) => (
                <ReviewItem
                  key={question.id}
                  question={question}
                  number={number}
                  answer={attempt.answers[question.id]}
                  flagged={attempt.flagged.includes(question.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card className="animate-rise">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Penguasaan per mapel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectBreakdown.map((item) => (
                <div key={item.subject.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: item.subject.chart }}
                      />
                      {item.subject.name}
                    </span>
                    <span className="text-[11px] font-extrabold text-foreground">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.subject.chart,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    {item.correct} dari {item.total} soal benar
                  </p>
                </div>
              ))}
              {subjectBreakdown.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Data mapel tidak tersedia.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-rise border-primary/15 bg-gradient-to-br from-primary/[0.06] to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Fokus berikutnya</CardTitle>
                <Sparkles className="size-4 text-primary" />
              </div>
              <CardDescription>
                Topik yang perlu kamu perkuat dari hasil ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic) => (
                  <div
                    key={`${topic.subjectId}-${topic.topic}`}
                    className="rounded-xl border border-border/60 bg-card/80 px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-bold text-foreground">
                        {topic.topic}
                      </p>
                      <span
                        className={cn(
                          "text-[9px] font-bold",
                          topic.percentage >= 80
                            ? "text-emerald-600 dark:text-emerald-300"
                            : topic.percentage >= 60
                              ? "text-amber-600 dark:text-amber-300"
                              : "text-rose-600 dark:text-rose-300",
                        )}
                      >
                        {topic.percentage}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          topic.percentage >= 80
                            ? "bg-emerald-500"
                            : topic.percentage >= 60
                              ? "bg-amber-500"
                              : "bg-rose-500",
                        )}
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {getSubject(topic.subjectId).name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Semua topik sudah dikuasai dengan baik. Pertahankan!
                </p>
              )}
              <Button variant="outline" size="sm" asChild className="w-full text-xs">
                <Link to="/analisis">
                  Lihat analisis lengkap
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-rise">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <RotateCcw className="size-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Coba lebih baik lagi
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                    Ulangi tes ini setelah mempelajari pembahasan untuk melihat
                    peningkatan skor.
                  </p>
                </div>
              </div>
              <Button size="sm" asChild className="mt-3 w-full text-xs">
                <Link to={`/tryout/${attempt.examId}`}>
                  Kerjakan ulang tes
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export function ResultDetailPage() {
  const { attemptId } = useParams()
  const { attempts } = useApp()
  const attempt = attempts.find((item) => item.id === attemptId)

  if (!attempt) {
    return (
      <EmptyState
        icon={<BarChart3 className="size-5" />}
        title="Hasil tidak ditemukan"
        description="Hasil ujian ini tidak tersedia di perangkatmu. Mungkin data dihapus atau kamu membuka tautan yang salah."
        action={
          <Button asChild>
            <Link to="/hasil">Lihat semua hasil</Link>
          </Button>
        }
      />
    )
  }

  return <ResultDetailContent attempt={attempt} />
}
