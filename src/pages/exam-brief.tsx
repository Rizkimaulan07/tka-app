import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { EmptyState } from "@/components/empty-state"
import { SubjectIcon } from "@/components/subject-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useApp } from "@/context/use-app"
import { EXAMS } from "@/data/exams"
import { getSubject } from "@/data/subjects"
import {
  getRemainingSeconds,
  loadSession,
  startSession,
} from "@/lib/exam-session"
import { cn, formatClock, formatDate, formatNumber } from "@/lib/utils"
import type { Exam, ExamLevel } from "@/types"

const levelVariant: Record<
  ExamLevel,
  "default" | "success" | "warning" | "sky"
> = {
  Simulasi: "warning",
  Tryout: "default",
  Latihan: "success",
}

const rules = [
  "Timer mulai berjalan begitu ujian dimulai dan tidak dapat dijeda.",
  "Setiap jawaban tersimpan otomatis. Kamu tetap bisa melanjutkan setelah keluar.",
  "Gunakan tombol ragu-ragu untuk menandai soal yang ingin ditinjau kembali.",
  "Tidak ada pengurangan nilai untuk jawaban salah, jadi usahakan menjawab semua soal.",
  "Ujian akan dikumpulkan otomatis ketika waktu habis.",
]

function ExamBriefContent({ exam }: { exam: Exam }) {
  const { attempts, questions } = useApp()
  const navigate = useNavigate()

  const existingSession = useMemo(() => {
    const session = loadSession(exam.id)
    if (!session) return null
    return getRemainingSeconds(exam, session) > 0 ? session : null
  }, [exam])

  const latestAttempt = useMemo(
    () =>
      [...attempts]
        .filter((attempt) => attempt.examId === exam.id)
        .sort(
          (a, b) =>
            new Date(b.finishedAt).getTime() -
            new Date(a.finishedAt).getTime(),
        )[0],
    [attempts, exam.id],
  )

  const subjectBreakdown = useMemo(
    () =>
      exam.subjectIds.map((subjectId) => {
        const subjectQuestions = exam.questionIds
          .map((id) => questions.find((question) => question.id === id))
          .filter(
            (question) => question && question.subjectId === subjectId,
          )
        return {
          subject: getSubject(subjectId),
          count: subjectQuestions.length,
          topics: [
            ...new Set(subjectQuestions.map((question) => question!.topic)),
          ].slice(0, 3),
        }
      }),
    [exam, questions],
  )

  const answered = existingSession
    ? Object.values(existingSession.answers).filter(
        (answer) => answer.length > 0,
      ).length
    : 0
  const remaining = existingSession
    ? getRemainingSeconds(exam, existingSession)
    : 0

  const handleStart = () => {
    startSession(exam)
    toast.success(
      existingSession
        ? "Melanjutkan ujian. Fokus dan kerjakan dengan tenang."
        : "Ujian dimulai. Semoga hasilnya sesuai usahamu!",
    )
    navigate(`/ujian/${exam.id}`)
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-xs">
        <Link to="/tryout">
          <ArrowLeft className="size-3.5" />
          Kembali ke daftar tes
        </Link>
      </Button>

      <div className="animate-rise relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-6 md:grid-cols-[1.6fr_auto] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={levelVariant[exam.level]}>{exam.level}</Badge>
              <Badge variant="outline" className="gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Tersedia sekarang
              </Badge>
              {exam.featured && (
                <Badge variant="default" className="gap-1">
                  <Sparkles className="size-3" />
                  Rekomendasi
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground text-balance sm:text-3xl">
              {exam.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {exam.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[11px] font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Layers3 className="size-3.5 text-primary" />
                {exam.questionIds.length} soal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5 text-primary" />
                {exam.durationMinutes} menit
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" />
                {formatNumber(exam.participants)} peserta
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-primary" />
                {exam.schedule}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {exam.subjectIds.map((subjectId) => {
                const subject = getSubject(subjectId)
                return (
                  <span
                    key={subjectId}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                      subject.bg,
                      subject.border,
                      subject.color,
                    )}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: subject.chart }}
                    />
                    {subject.name}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="hidden md:grid size-32 place-items-center justify-self-end rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-inner lg:size-40">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="size-10 lg:size-12" strokeWidth={1.5} />
              <span className="text-[10px] font-bold tracking-wide uppercase">
                Siap TKA
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card className="animate-rise">
            <CardHeader>
              <CardTitle>Cakupan materi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {subjectBreakdown.map((item) => (
                <div
                  key={item.subject.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-3"
                >
                  <SubjectIcon subjectId={item.subject.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">
                      {item.subject.name}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {item.topics.join(" · ")}
                    </p>
                  </div>
                  <Badge variant="secondary">{item.count} soal</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="animate-rise">
            <CardHeader>
              <CardTitle>Aturan pengerjaan</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {rules.map((rule, index) => (
                  <li key={rule} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-extrabold text-primary">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {rule}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Pastikan koneksi internet stabil. Jika koneksi terputus,
                  jawaban tetap aman di perangkat ini dan akan tersedia saat
                  kamu kembali.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="animate-rise lg:sticky lg:top-24">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Ringkasan ujian</CardTitle>
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/25 p-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Durasi
                  </span>
                  <span className="font-bold text-foreground">
                    {exam.durationMinutes} menit
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Layers3 className="size-3.5" />
                    Jumlah soal
                  </span>
                  <span className="font-bold text-foreground">
                    {exam.questionIds.length} soal
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Target className="size-3.5" />
                    Nilai minimum
                  </span>
                  <span className="font-bold text-foreground">70</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="size-3.5" />
                    Penilaian
                  </span>
                  <span className="font-bold text-foreground">
                    Tanpa minus
                  </span>
                </div>
              </div>

              {existingSession && (
                <div className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Ujian sedang berlangsung
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {answered}/{exam.questionIds.length} soal terjawab · sisa{" "}
                    {formatClock(remaining)}
                  </p>
                </div>
              )}

              <Button
                size="lg"
                className="mt-4 w-full gap-2"
                onClick={handleStart}
                disabled={!exam.isActive}
              >
                <Play className="size-4" />
                {existingSession
                  ? "Lanjutkan ujian"
                  : latestAttempt
                    ? "Kerjakan ulang"
                    : "Mulai ujian"}
              </Button>
              <p className="mt-2 text-center text-[9px] leading-relaxed text-muted-foreground">
                Dengan memulai, kamu menyetujui aturan pengerjaan dan
                pengumpulan jawaban otomatis.
              </p>
            </CardContent>
          </Card>

          {latestAttempt && (
            <Card className="animate-rise">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-sm font-extrabold text-emerald-600 dark:text-emerald-300">
                    {latestAttempt.score}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-muted-foreground">
                      Percobaan terakhir
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {formatDate(latestAttempt.finishedAt, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                      to={`/hasil/${latestAttempt.id}`}
                      aria-label="Lihat pembahasan percobaan terakhir"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-2.5 py-2 text-[10px]">
                  <span className="text-muted-foreground">
                    {latestAttempt.correctCount}/{latestAttempt.total} jawaban
                    benar
                  </span>
                  <Link
                    to={`/hasil/${latestAttempt.id}`}
                    className="font-bold text-primary hover:underline"
                  >
                    Lihat pembahasan
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="size-3.5 shrink-0 text-emerald-500" />
            Jawaban dienkripsi dan disimpan aman di perangkatmu.
          </div>
        </aside>
      </div>
    </div>
  )
}

export function ExamBriefPage() {
  const { examId } = useParams()
  const exam = EXAMS.find((item) => item.id === examId)

  if (!exam) {
    return (
      <EmptyState
        icon={<AlertTriangle className="size-5" />}
        title="Tes tidak ditemukan"
        description="Paket tes yang kamu cari mungkin sudah tidak tersedia. Kembali ke daftar tes untuk memilih paket lain."
        action={
          <Button asChild>
            <Link to="/tryout">Lihat daftar tes</Link>
          </Button>
        }
      />
    )
  }

  return <ExamBriefContent exam={exam} />
}
