import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  CalendarClock,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Flame,
  Layers3,
  Lightbulb,
  Play,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartTooltip } from "@/components/chart-tooltip"
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
import { Progress } from "@/components/ui/progress"
import { useApp } from "@/context/use-app"
import { EXAMS } from "@/data/exams"
import { getSubject } from "@/data/subjects"
import {
  getOverallStats,
  getSubjectPerformance,
} from "@/lib/analytics"
import {
  cn,
  formatClock,
  formatDuration,
  formatRelative,
  greeting,
} from "@/lib/utils"
import {
  getRemainingSeconds,
  loadSession,
} from "@/lib/exam-session"
import type { Attempt, Exam } from "@/types"

function ExamScheduleItem({ exam }: { exam: Exam }) {
  return (
    <Link
      to={`/tryout/${exam.id}`}
      className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/50"
    >
      <div className="flex -space-x-1.5">
        {exam.subjectIds.slice(0, 3).map((subjectId) => {
          const subject = getSubject(subjectId)
          return (
            <span
              key={subjectId}
              className={`grid size-7 place-items-center rounded-full border-2 border-card text-[8px] font-extrabold ${subject.bg} ${subject.color}`}
              title={subject.name}
            >
              {subject.short}
            </span>
          )
        })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-foreground">
          {exam.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock3 className="size-2.5" />
          {exam.durationMinutes} menit
          <span className="text-border">·</span>
          {exam.schedule}
        </p>
      </div>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}

function RecentResultRow({ attempt }: { attempt: Attempt }) {
  const passed = attempt.score >= 70
  return (
    <Link
      to={`/hasil/${attempt.id}`}
      className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/50"
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold ${
          passed
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-300"
        }`}
      >
        {attempt.score}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-foreground">
          {attempt.examTitle}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {formatRelative(attempt.finishedAt)} · {attempt.correctCount}/
          {attempt.total} benar
        </p>
      </div>
      <Badge variant={passed ? "success" : "warning"} className="text-[9px]">
        {passed ? "Tuntas" : "Perlu latihan"}
      </Badge>
      <ArrowUpRight className="size-3.5 text-muted-foreground/40 transition-colors group-hover:text-primary" />
    </Link>
  )
}

export function StudentDashboard() {
  const { attempts, questions, profile } = useApp()

  const sortedAttempts = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
      ),
    [attempts],
  )
  const stats = useMemo(
    () => getOverallStats(attempts, questions),
    [attempts, questions],
  )
  const subjectPerformance = useMemo(
    () => getSubjectPerformance(attempts, questions),
    [attempts, questions],
  )
  const chartData = subjectPerformance.map((item) => ({
    name: item.subject.short,
    full: item.subject.name,
    value: item.percentage,
    fill: item.subject.chart,
  }))
  const latest = sortedAttempts[0]
  const targetScore = 85
  const activeSession = useMemo(() => {
    for (const exam of EXAMS) {
      const session = loadSession(exam.id)
      if (!session) continue
      const remaining = getRemainingSeconds(exam, session)
      if (remaining > 0) return { exam, session, remaining }
    }
    return null
  }, [])
  const recommendedExam =
    EXAMS.find((exam) => exam.featured) ?? EXAMS[0]!
  const progressToTarget = Math.round(
    Math.min(100, (stats.averageScore / targetScore) * 100),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard siswa"
        title={`${greeting()}, ${profile.name.split(" ")[0]} 👋`}
        description="Konsisten sedikit setiap hari lebih baik daripada belajar semalam suntuk. Yuk lanjutkan progresmu."
        action={
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/tryout">
              <Play className="size-4" />
              Mulai tryout
            </Link>
          </Button>
        }
      />

      {activeSession && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <span className="absolute top-1 right-1 size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <BookOpenCheck className="size-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-foreground">
                Ujian sedang berlangsung: {activeSession.exam.title}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Sisa waktu {formatClock(activeSession.remaining)} · jawabanmu
                tersimpan otomatis
              </p>
            </div>
          </div>
          <Button size="sm" className="gap-1.5" asChild>
            <Link to={`/ujian/${activeSession.exam.id}`}>
              Lanjutkan
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Rata-rata skor"
          value={String(stats.averageScore)}
          hint="dari semua tes"
          icon={<Target className="size-5" />}
          trend={stats.delta}
        />
        <StatCard
          label="Ujian selesai"
          value={String(stats.totalAttempts)}
          hint="tryout & latihan"
          icon={<ClipboardCheck className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Akurasi jawaban"
          value={`${stats.accuracy}%`}
          hint={`${stats.totalQuestions} soal dikerjakan`}
          icon={<Zap className="size-5" />}
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

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <div className="animate-rise relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-7">
            <div className="pointer-events-none absolute -top-20 -right-10 size-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 size-60 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <div className="pointer-events-none absolute top-8 right-8 hidden size-28 rounded-full border border-white/15 sm:block" />
            <div className="relative grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm">
                  <Sparkles className="size-3" />
                  Simulasi TKA 2026
                </span>
                <h2 className="mt-4 max-w-md text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-[28px]">
                  Siap hadapi TKA dengan latihan yang terukur.
                </h2>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
                  Kerjakan simulasi lengkap, dapatkan pembahasan, dan lihat
                  area yang perlu kamu perkuat.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <Button
                    size="sm"
                    asChild
                    className="bg-white text-indigo-700 shadow-md hover:bg-white/90"
                  >
                    <Link to={`/tryout/${recommendedExam.id}`}>
                      <Play className="size-3.5" />
                      Mulai simulasi
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="border border-white/15 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/tryout">Lihat semua tes</Link>
                  </Button>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium text-white/65">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers3 className="size-3.5" />
                    {recommendedExam.questionIds.length} soal
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    {recommendedExam.durationMinutes} menit
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpenCheck className="size-3.5" />4 mapel
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-auto w-full max-w-[210px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-white/65">
                      Skor terakhirmu
                    </p>
                    <Trophy className="size-4 text-amber-300" />
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-4xl leading-none font-extrabold">
                      {latest?.score ?? 0}
                    </span>
                    <span className="pb-1 text-[10px] text-white/60">/100</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
                    <ArrowUpRight className="size-3" />
                    {stats.delta >= 0 ? "+" : ""}
                    {stats.delta} poin dari tes sebelumnya
                  </div>
                  <div className="mt-4 flex h-12 items-end gap-1.5" aria-hidden="true">
                    {[55, 72, 64, 81, 76, 88, 83].map((height, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex-1 rounded-t-sm",
                          index === 6 ? "bg-white" : "bg-white/40",
                        )}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[9px] text-white/50">
                    Tren 7 tes terakhir
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="animate-rise">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Penguasaan per mapel</CardTitle>
                <CardDescription className="mt-1">
                  Rata-rata benar berdasarkan seluruh tes yang kamu kerjakan.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="shrink-0 text-xs">
                <Link to="/analisis">
                  Analisis
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border)"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.45 }}
                      content={<ChartTooltip suffix="%" />}
                    />
                    <Bar
                      dataKey="value"
                      name="Penguasaan"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={46}
                      isAnimationActive={false}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {subjectPerformance.map((item) => (
                  <div
                    key={item.subject.id}
                    className="rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: item.subject.chart }}
                      />
                      <p className="truncate text-[10px] font-semibold text-muted-foreground">
                        {item.subject.name}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-foreground">
                      {item.percentage}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-rise">
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>Hasil terbaru</CardTitle>
                <CardDescription className="mt-1">
                  Lanjutkan pembahasan untuk memahami kesalahanmu.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="shrink-0 text-xs">
                <Link to="/hasil">
                  Semua hasil
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {sortedAttempts.slice(0, 3).map((attempt) => (
                <RecentResultRow key={attempt.id} attempt={attempt} />
              ))}
              {sortedAttempts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Belum ada hasil. Mulai tryout pertamamu!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="animate-rise overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Target skor</CardTitle>
                <Badge variant="default">
                  <Target className="size-3" />
                  {targetScore}
                </Badge>
              </div>
              <CardDescription>
                Rata-rata skor seluruh tes yang kamu kerjakan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-2">
              <ScoreRing score={stats.averageScore} size={144} label="Rata-rata" />
              <div className="mt-4 w-full">
                <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold">
                  <span className="text-muted-foreground">Progres ke target</span>
                  <span className="text-primary">{progressToTarget}%</span>
                </div>
                <Progress value={progressToTarget} className="h-2" />
                <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  {stats.averageScore >= targetScore ? (
                    <>Kamu sudah melewati target. Pertahankan konsistensi! 🎉</>
                  ) : (
                    <>
                      Butuh <strong className="text-foreground">{targetScore - stats.averageScore} poin</strong> lagi.
                      Fokus pada mapel dengan penguasaan terendah.
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-rise">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Jadwal terdekat</CardTitle>
                <CalendarClock className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-1">
              {EXAMS.filter((exam) => exam.isActive)
                .slice(0, 3)
                .map((exam) => (
                  <ExamScheduleItem key={exam.id} exam={exam} />
                ))}
              <Button variant="outline" size="sm" asChild className="mt-2 w-full text-xs">
                <Link to="/tryout">Lihat semua jadwal</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="animate-rise relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/12 via-amber-500/5 to-transparent p-5">
            <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-amber-400/20 blur-2xl" />
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
              <Lightbulb className="size-4" />
            </span>
            <p className="mt-3 text-sm font-bold text-foreground">Tips hari ini</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Kerjakan soal tersulit lebih dulu saat energimu masih penuh, lalu
              kembali ke soal yang ditandai ragu-ragu.
            </p>
            <Link
              to="/analisis"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline dark:text-amber-300"
            >
              Lihat rekomendasi belajar
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <Flame className="size-3 text-orange-500" />
            Terakhir belajar {latest ? formatRelative(latest.finishedAt) : "—"} ·{" "}
            {latest ? formatDuration(latest.timeSpentSeconds) : "0 menit"}
          </div>
        </aside>
      </section>
    </div>
  )
}
