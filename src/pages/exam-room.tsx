import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudCheck,
  Flag,
  Info,
  Layers3,
  LogOut,
  Menu,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/context/use-app"
import { EXAMS } from "@/data/exams"
import { QUESTION_TYPE_LABEL } from "@/data/questions"
import { getSubject } from "@/data/subjects"
import { gradeExam } from "@/lib/analytics"
import {
  clearSession,
  getRemainingSeconds,
  loadSession,
  saveSession,
  startSession,
} from "@/lib/exam-session"
import { cn, formatClock, formatDuration } from "@/lib/utils"
import type {
  ActiveExamSession,
  Attempt,
  Exam,
  Question,
  QuestionType,
} from "@/types"

const difficultyVariant = {
  mudah: "success",
  sedang: "warning",
  sulit: "destructive",
} as const

const typeLabel: Record<QuestionType, string> = QUESTION_TYPE_LABEL

function QuestionNavigator({
  questions,
  answers,
  flagged,
  currentIndex,
  onSelect,
}: {
  questions: Question[]
  answers: Record<string, string[]>
  flagged: string[]
  currentIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-5">
      {questions.map((question, index) => {
        const isCurrent = index === currentIndex
        const isAnswered = (answers[question.id]?.length ?? 0) > 0
        const isFlagged = flagged.includes(question.id)
        return (
          <button
            key={question.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Soal ${index + 1}${isAnswered ? ", sudah dijawab" : ", belum dijawab"}${isFlagged ? ", ragu-ragu" : ""}`}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "relative grid aspect-square place-items-center rounded-xl border text-xs font-bold transition-all duration-150",
              isCurrent &&
                "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/25 ring-offset-2 ring-offset-card",
              !isCurrent &&
                isAnswered &&
                "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300",
              !isCurrent &&
                !isAnswered &&
                "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted",
              isFlagged &&
                "after:absolute after:top-1 after:right-1 after:size-1.5 after:rounded-full after:bg-amber-500",
            )}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}

function ExamRoomContent({ exam }: { exam: Exam }) {
  const { questions, addAttempt, profile } = useApp()
  const navigate = useNavigate()

  const [session, setSession] = useState<ActiveExamSession>(() => {
    const stored = loadSession(exam.id)
    if (stored && getRemainingSeconds(exam, stored) > 0) return stored
    return startSession(exam)
  })
  const [now, setNow] = useState(() => Date.now())
  const [exitOpen, setExitOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)
  const submittingRef = useRef(false)
  const submitRef = useRef<(auto?: boolean) => void>(() => undefined)

  const examQuestions = useMemo(
    () =>
      exam.questionIds
        .map((questionId) =>
          questions.find((question) => question.id === questionId),
        )
        .filter((question): question is Question => Boolean(question)),
    [exam, questions],
  )

  const currentIndex = Math.max(
    0,
    Math.min(session.currentIndex, examQuestions.length - 1),
  )
  const currentQuestion = examQuestions[currentIndex]
  const answeredCount = examQuestions.filter(
    (question) => (session.answers[question.id]?.length ?? 0) > 0,
  ).length
  const flaggedCount = session.flagged.length
  const total = examQuestions.length
  const progressValue = total > 0 ? (answeredCount / total) * 100 : 0
  const endTime = session.startedAt + exam.durationMinutes * 60_000
  const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
  const minutesLeft = Math.ceil(remaining / 60)
  const timerTone =
    remaining <= 300
      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300"
      : remaining <= 600
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-border bg-muted/60 text-foreground"

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    saveSession(session)
  }, [session])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const handleSubmit = async (auto = false) => {
    if (submittedRef.current || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)

    try {
      const result = gradeExam(exam, questions, session.answers)
      const finishedAt = new Date()
      const attempt: Attempt = {
        id: `attempt-${Date.now()}`,
        examId: exam.id,
        examTitle: exam.title,
        subjectIds: exam.subjectIds,
        startedAt: new Date(session.startedAt).toISOString(),
        finishedAt: finishedAt.toISOString(),
        answers: session.answers,
        flagged: session.flagged,
        score: result.score,
        correctCount: result.correctCount,
        total: result.total,
        timeSpentSeconds: Math.max(
          1,
          Math.min(
            exam.durationMinutes * 60,
            Math.round((finishedAt.getTime() - session.startedAt) / 1000),
          ),
        ),
      }

      await addAttempt(attempt)

      submittedRef.current = true
      clearSession(exam.id)
      setSubmitOpen(false)
      setExitOpen(false)
      navigate(`/hasil/${attempt.id}`, { replace: true })
      toast.success(
        auto
          ? "Waktu habis. Jawabanmu dikumpulkan otomatis."
          : "Jawaban berhasil dikumpulkan. Lihat hasilmu!",
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Jawaban gagal disimpan. Periksa koneksi database lalu coba lagi.",
      )
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  submitRef.current = handleSubmit

  useEffect(() => {
    if (remaining <= 0) {
      submitRef.current(true)
    }
  }, [remaining])

  if (!currentQuestion) {
    return (
      <div className="grid min-h-svh place-items-center p-6 text-center">
        <div>
          <AlertTriangle className="mx-auto size-8 text-amber-500" />
          <h1 className="mt-3 text-lg font-bold">Soal tidak tersedia</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paket ujian ini sedang tidak memiliki soal yang bisa dikerjakan.
          </p>
          <Button className="mt-4" onClick={() => navigate("/tryout")}>
            Kembali ke daftar tes
          </Button>
        </div>
      </div>
    )
  }

  const selected = session.answers[currentQuestion.id] ?? []
  const isFlagged = session.flagged.includes(currentQuestion.id)
  const subject = getSubject(currentQuestion.subjectId)
  const isLast = currentIndex === total - 1

  const goToQuestion = (index: number) => {
    setSession((current) => ({ ...current, currentIndex: index }))
    setNavOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleAnswer = (optionId: string) => {
    const isMultiple = currentQuestion.type === "pilihan-ganda-kompleks"
    setSession((current) => {
      const existing = current.answers[currentQuestion.id] ?? []
      const next = isMultiple
        ? existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId]
        : existing.includes(optionId)
          ? []
          : [optionId]
      return {
        ...current,
        answers: { ...current.answers, [currentQuestion.id]: next },
      }
    })
  }

  const toggleFlag = () => {
    setSession((current) => ({
      ...current,
      flagged: current.flagged.includes(currentQuestion.id)
        ? current.flagged.filter((id) => id !== currentQuestion.id)
        : [...current.flagged, currentQuestion.id],
    }))
  }

  const goPrevious = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1)
  }

  const goNext = () => {
    if (!isLast) goToQuestion(currentIndex + 1)
  }

  const navigator = (
    <QuestionNavigator
      questions={examQuestions}
      answers={session.answers}
      flagged={session.flagged}
      currentIndex={currentIndex}
      onSelect={goToQuestion}
    />
  )

  return (
    <div className="min-h-svh bg-muted/20">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Logo compact />
          <div className="hidden border-l border-border pl-3 sm:block">
            <p className="text-[9px] font-semibold tracking-wide text-muted-foreground uppercase">
              Sedang mengerjakan
            </p>
            <p className="max-w-[220px] truncate text-xs font-bold text-foreground md:max-w-xs">
              {exam.title}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-sm font-bold tabular-nums sm:px-3",
                timerTone,
              )}
            >
              <Clock3 className="size-3.5" />
              {formatClock(remaining)}
            </div>
            <span className="hidden items-center gap-1 text-[10px] font-medium text-muted-foreground md:flex">
              <CloudCheck className="size-3.5 text-emerald-500" />
              Tersimpan
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExitOpen(true)}
              className="gap-1.5"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
        <Progress
          value={progressValue}
          className="h-1 rounded-none bg-muted"
          indicatorClassName="rounded-none bg-gradient-to-r from-primary to-violet-400"
        />
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-7">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Soal {currentIndex + 1} dari {total}
              </Badge>
              <Badge variant="outline" className={cn(subject.bg, subject.color)}>
                {subject.name}
              </Badge>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground lg:hidden">
              {answeredCount}/{total} terjawab
            </span>
          </div>

          <Card className="border-border/80 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-5 py-3 sm:px-6">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Layers3 className="size-3" />
                {currentQuestion.topic}
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={difficultyVariant[currentQuestion.difficulty]}>
                  {currentQuestion.difficulty === "mudah"
                    ? "Mudah"
                    : currentQuestion.difficulty === "sedang"
                      ? "Sedang"
                      : "Sulit"}
                </Badge>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {typeLabel[currentQuestion.type]}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 sm:p-7">
              <div className="flex gap-3 sm:gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-extrabold text-primary">
                  {currentIndex + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-relaxed font-semibold whitespace-pre-line text-foreground sm:text-base">
                    {currentQuestion.prompt}
                  </p>
                  {currentQuestion.type === "pilihan-ganda-kompleks" && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-700 dark:text-sky-300">
                      <Info className="size-3" />
                      Pilih lebih dari satu jawaban yang benar.
                    </p>
                  )}

                  <div
                    className="mt-5 space-y-2.5"
                    role={
                      currentQuestion.type === "pilihan-ganda-kompleks"
                        ? "group"
                        : "radiogroup"
                    }
                    aria-label="Pilihan jawaban"
                  >
                    {currentQuestion.options.map((option) => {
                      const isSelected = selected.includes(option.id)
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role={
                            currentQuestion.type === "pilihan-ganda-kompleks"
                              ? "checkbox"
                              : "radio"
                          }
                          aria-checked={isSelected}
                          onClick={() => toggleAnswer(option.id)}
                          className={cn(
                            "group flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-150 sm:p-4",
                            isSelected
                              ? "border-primary bg-primary/[0.055] shadow-sm ring-1 ring-primary/20"
                              : "border-border bg-card hover:border-primary/30 hover:bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid size-7 shrink-0 place-items-center border text-[11px] font-extrabold transition-colors sm:size-8",
                              currentQuestion.type === "pilihan-ganda-kompleks"
                                ? "rounded-md"
                                : "rounded-full",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground",
                            )}
                          >
                            {option.id.toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-foreground">
                            {option.text}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-3 sm:px-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFlag}
                className={cn(
                  "gap-1.5 text-xs",
                  isFlagged &&
                    "bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 hover:text-amber-800 dark:text-amber-300",
                )}
              >
                <Flag
                  className={cn("size-3.5", isFlagged && "fill-current")}
                />
                {isFlagged ? "Ditandai ragu" : "Ragu-ragu"}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrevious}
                  disabled={currentIndex === 0}
                  className="gap-1 text-xs"
                >
                  <ArrowLeft className="size-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                  <span className="sm:hidden">Kembali</span>
                </Button>
                {isLast ? (
                  <Button
                    size="sm"
                    onClick={() => setSubmitOpen(true)}
                    className="gap-1.5 bg-emerald-600 text-xs hover:bg-emerald-700"
                  >
                    <Send className="size-3.5" />
                    Kumpulkan
                  </Button>
                ) : (
                  <Button size="sm" onClick={goNext} className="gap-1 text-xs">
                    Selanjutnya
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Button
            variant="outline"
            className="w-full gap-2 lg:hidden"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="size-4" />
            Navigasi soal · {answeredCount}/{total} terjawab
            <ChevronRight className="ml-auto size-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="size-3 text-emerald-500" />
            Setiap perubahan jawaban tersimpan otomatis di perangkat ini
          </div>
        </div>

        <aside className="hidden space-y-4 lg:block">
          <Card className="sticky top-24">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Navigasi soal</CardTitle>
              <Badge variant="secondary">
                {answeredCount}/{total}
              </Badge>
            </CardHeader>
            <CardContent>
              {navigator}
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-border/70 pt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-primary" />
                  Sedang dikerjakan
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-emerald-500/30" />
                  Sudah dijawab
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm border border-border bg-card" />
                  Belum dijawab
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm border border-border bg-card">
                    <span className="m-auto mt-0.5 block size-1 rounded-full bg-amber-500" />
                  </span>
                  Ragu-ragu
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-muted/45 p-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Progres jawaban</span>
                  <span className="font-bold text-foreground">
                    {Math.round(progressValue)}%
                  </span>
                </div>
                <Progress value={progressValue} className="mt-2 h-1.5" />
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{flaggedCount} ditandai ragu</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="size-2.5" />
                    {minutesLeft} menit lagi
                  </span>
                </div>
              </div>

              <Button
                className="mt-3 w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setSubmitOpen(true)}
              >
                <Send className="size-4" />
                Selesai ujian
              </Button>
              <p className="mt-2 text-center text-[9px] text-muted-foreground">
                Waktu tersisa {formatClock(remaining)}
              </p>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-card px-4 py-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Kerjakan soal yang mudah lebih dulu. Tandai soal sulit dengan
              ragu-ragu, lalu kembali sebelum mengumpulkan.
            </p>
          </div>
        </aside>
      </main>

      <Dialog open={exitOpen} onClose={() => setExitOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keluar dari ujian?</DialogTitle>
            <DialogDescription>
              Jawabanmu sudah tersimpan. Kamu bisa melanjutkan ujian ini nanti
              sebelum waktu habis.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Terjawab</span>
              <span className="font-bold text-foreground">
                {answeredCount}/{total}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Sisa waktu</span>
              <span className="font-mono font-bold text-foreground">
                {formatClock(remaining)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExitOpen(false)}>
              Lanjut mengerjakan
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setExitOpen(false)
                navigate("/tryout")
              }}
            >
              Keluar sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={submitOpen} onClose={() => setSubmitOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selesai dan kumpulkan?</DialogTitle>
            <DialogDescription>
              Pastikan semua jawaban sudah kamu periksa. Jawaban tidak dapat
              diubah setelah dikumpulkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Terjawab</span>
                <span className="font-bold text-foreground">
                  {answeredCount}/{total}
                </span>
              </div>
              <Progress value={progressValue} className="mt-2 h-1.5" />
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{total - answeredCount} belum dijawab</span>
                <span>{flaggedCount} ditandai ragu</span>
              </div>
            </div>
            {total - answeredCount > 0 && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Masih ada {total - answeredCount} soal yang belum dijawab.
                  Kamu masih bisa kembali dan melengkapinya.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-[10px] text-muted-foreground">
              <CloudCheck className="size-3.5 shrink-0 text-emerald-500" />
              Waktu pengerjaan:{" "}
              {formatDuration(
                Math.min(
                  exam.durationMinutes * 60,
                  Math.max(1, Math.floor((now - session.startedAt) / 1000)),
                ),
              )}{" "}
              · Sisa {formatClock(remaining)}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmitOpen(false)}
              disabled={submitting}
            >
              Periksa lagi
            </Button>
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => void handleSubmit(false)}
              disabled={submitting}
            >
              <Send className="size-4" />
              {submitting ? "Menyimpan..." : "Kumpulkan jawaban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={navOpen} onClose={() => setNavOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Navigasi soal</DialogTitle>
            <DialogDescription>
              {answeredCount} dari {total} soal terjawab · {flaggedCount}{" "}
              ditandai ragu-ragu
            </DialogDescription>
          </DialogHeader>
          {navigator}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-primary" />
              Aktif
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-500/30" />
              Terjawab
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-border bg-card" />
              Kosong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Ragu
            </span>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNavOpen(false)}
              className="w-full sm:w-auto"
            >
              Kembali ke soal
            </Button>
            <Button
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
              onClick={() => {
                setNavOpen(false)
                setSubmitOpen(true)
              }}
            >
              <Send className="size-4" />
              Kumpulkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="pointer-events-none fixed right-4 bottom-4 z-20 hidden rounded-full border border-border/60 bg-card/80 px-2.5 py-1 text-[9px] font-medium text-muted-foreground shadow-sm backdrop-blur md:block lg:hidden">
        {profile.initials} · {exam.level}
      </div>
    </div>
  )
}

export function ExamRoomPage() {
  const { examId } = useParams()
  const exam = EXAMS.find((item) => item.id === examId)

  if (!exam) {
    return (
      <div className="grid min-h-svh place-items-center p-6 text-center">
        <div>
          <AlertTriangle className="mx-auto size-8 text-amber-500" />
          <h1 className="mt-3 text-lg font-bold">Ujian tidak ditemukan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paket ujian yang kamu cari tidak tersedia.
          </p>
          <Button className="mt-4" asChild>
            <a href="#/tryout">Kembali ke daftar tes</a>
          </Button>
        </div>
      </div>
    )
  }

  return <ExamRoomContent exam={exam} />
}
