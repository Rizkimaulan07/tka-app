import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Flame,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartTooltip } from "@/components/chart-tooltip"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
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
import { SUBJECTS, getSubject } from "@/data/subjects"
import {
  getOverallStats,
  getScoreTrend,
  getSubjectPerformance,
  getTopicPerformance,
} from "@/lib/analytics"
import { cn, formatDate } from "@/lib/utils"
import type { SubjectId } from "@/types"

type SubjectFilter = SubjectId | "semua"

export function AnalyticsPage() {
  const { attempts, questions } = useApp()
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("semua")

  const stats = useMemo(
    () => getOverallStats(attempts, questions),
    [attempts, questions],
  )
  const subjectPerformance = useMemo(
    () => getSubjectPerformance(attempts, questions),
    [attempts, questions],
  )
  const topicPerformance = useMemo(
    () => getTopicPerformance(attempts, questions),
    [attempts, questions],
  )

  const subjectScoreMap = useMemo(
    () =>
      new Map(
        subjectPerformance.map((item) => [item.subject.id, item] as const),
      ),
    [subjectPerformance],
  )
  const radarData = SUBJECTS.map((subject) => ({
    subject: subject.short,
    full: subject.name,
    score: subjectScoreMap.get(subject.id)?.percentage ?? 0,
    chart: subject.chart,
  }))
  const trendData = getScoreTrend(attempts).map((item) => ({
    label: formatDate(item.date, { day: "numeric", month: "short" }),
    score: item.score,
    name: item.examTitle,
  }))
  const strongTopics = [...topicPerformance]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3)
  const weakTopics = [...topicPerformance]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
  const weakestSubject = [...subjectPerformance].sort(
    (a, b) => a.percentage - b.percentage,
  )[0]
  const filteredTopics = topicPerformance.filter(
    (topic) => subjectFilter === "semua" || topic.subjectId === subjectFilter,
  )

  if (attempts.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analitik"
          title="Analisis Kemampuan"
          description="Pahami kekuatan dan area yang perlu diperbaiki dari setiap tes yang kamu kerjakan."
        />
        <EmptyState
          icon={<BrainCircuit className="size-5" />}
          title="Belum ada data untuk dianalisis"
          description="Kerjakan minimal satu tryout atau latihan agar kami bisa memetakan kemampuanmu per mapel dan topik."
          action={
            <Button asChild>
              <Link to="/tryout">Mulai latihan pertama</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analitik"
        title="Analisis Kemampuan"
        description="Pahami kekuatan dan area yang perlu diperbaiki dari setiap tes yang kamu kerjakan."
        action={
          <Button asChild>
            <Link to="/tryout">
              <Target className="size-4" />
              Mulai latihan
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
          label="Akurasi jawaban"
          value={`${stats.accuracy}%`}
          hint={`${stats.totalQuestions} soal dijawab`}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Skor terbaik"
          value={String(stats.bestScore)}
          hint="personal best"
          icon={<Trophy className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Total percobaan"
          value={String(stats.totalAttempts)}
          hint="tryout & latihan"
          icon={<TrendingUp className="size-5" />}
          tone="sky"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="animate-rise">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Profil kemampuan</CardTitle>
              <CardDescription className="mt-1">
                Penguasaan rata-rata per mapel TKA.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <BrainCircuit className="size-3" />
              4 mapel
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                      fontWeight: 700,
                    }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Tooltip content={<ChartTooltip suffix="%" />} />
                  <Radar
                    name="Penguasaan"
                    dataKey="score"
                    stroke="#7c6cf6"
                    fill="#7c6cf6"
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#7c6cf6" }}
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((subject) => {
                const item = subjectScoreMap.get(subject.id)
                return (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/25 px-2.5 py-2"
                  >
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: subject.chart }}
                      />
                      <span className="truncate text-[10px] font-semibold text-muted-foreground">
                        {subject.name}
                      </span>
                    </span>
                    <span className="text-[11px] font-extrabold text-foreground">
                      {item?.percentage ?? 0}%
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-rise">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Tren skor</CardTitle>
              <CardDescription className="mt-1">
                Perkembangan skor dari setiap percobaan.
              </CardDescription>
            </div>
            <Badge variant="success" className="gap-1">
              <TrendingUp className="size-3" />
              Target 85
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 12, right: 8, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip content={<ChartTooltip suffix="" />} />
                  <ReferenceLine
                    y={85}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{
                      value: "Target 85",
                      position: "insideTopRight",
                      fill: "#10b981",
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Skor"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#scoreGradient)"
                    dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2">
              <span className="text-[10px] text-muted-foreground">
                Skor terakhir
              </span>
              <span className="text-xs font-extrabold text-foreground">
                {stats.latestScore}{" "}
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    stats.delta >= 0
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-rose-600 dark:text-rose-300",
                  )}
                >
                  ({stats.delta >= 0 ? "+" : ""}
                  {stats.delta} dari tes sebelumnya)
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-rise">
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Peta penguasaan topik</CardTitle>
            <CardDescription className="mt-1">
              Persentase jawaban benar untuk setiap topik yang pernah diuji.
            </CardDescription>
          </div>
          <Badge variant="secondary">{filteredTopics.length} topik</Badge>
        </CardHeader>
        <CardContent>
          <div className="scrollbar-thin mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSubjectFilter("semua")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors",
                subjectFilter === "semua"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              Semua mapel
            </button>
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => setSubjectFilter(subject.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors",
                  subjectFilter === subject.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {subject.name}
              </button>
            ))}
          </div>

          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {filteredTopics.map((topic) => {
              const subject = getSubject(topic.subjectId)
              return (
                <div key={`${topic.subjectId}-${topic.topic}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: subject.chart }}
                      />
                      <p className="truncate text-[11px] font-bold text-foreground">
                        {topic.topic}
                      </p>
                      <span className="shrink-0 text-[9px] text-muted-foreground">
                        {subject.short}
                      </span>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold text-foreground">
                      {topic.percentage}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
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
                    {topic.correct} dari {topic.total} soal benar
                  </p>
                </div>
              )
            })}
            {filteredTopics.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground sm:col-span-2">
                Belum ada data topik untuk mapel ini.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="animate-rise border-emerald-500/20 bg-emerald-500/[0.025]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Kekuatanmu</CardTitle>
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <Trophy className="size-4" />
              </span>
            </div>
            <CardDescription>Pertahankan performa di topik ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {strongTopics.map((topic) => (
              <div
                key={`${topic.subjectId}-${topic.topic}`}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-card/70 px-2.5 py-2"
              >
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-foreground">
                    {topic.topic}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {getSubject(topic.subjectId).name}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                  {topic.percentage}%
                </span>
              </div>
            ))}
            {strongTopics.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Belum ada topik yang menonjol.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-rise border-amber-500/20 bg-amber-500/[0.025]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Fokus perbaikan</CardTitle>
              <span className="grid size-8 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
                <Flame className="size-4" />
              </span>
            </div>
            <CardDescription>Latih topik ini lebih sering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {weakTopics.map((topic) => (
              <div
                key={`${topic.subjectId}-${topic.topic}`}
                className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-card/70 px-2.5 py-2"
              >
                <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-foreground">
                    {topic.topic}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {getSubject(topic.subjectId).name}
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                  {topic.percentage}%
                </span>
              </div>
            ))}
            {weakTopics.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Belum ada data yang cukup.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="animate-rise border-primary/20 bg-gradient-to-br from-primary/[0.09] via-card to-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Rencana belajar</CardTitle>
              <Sparkles className="size-4 text-primary" />
            </div>
            <CardDescription>
              Rekomendasi berdasarkan data terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Fokus utama:{" "}
                <strong className="text-foreground">
                  {weakestSubject?.subject.name ?? "Matematika"}
                </strong>
                {weakestSubject
                  ? ` (${weakestSubject.percentage}% penguasaan).`
                  : "."}{" "}
                Kerjakan 10 soal tambahan dan tinjau pembahasannya.
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                "Ulangi 10 soal topik terlemah",
                "Tinjau pembahasan jawaban salah",
                "Kerjakan satu tryout minggu ini",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-card/60 px-2 py-1.5 text-[10px] text-muted-foreground"
                >
                  <CheckCircle2 className="size-3 text-primary/70" />
                  {item}
                </div>
              ))}
            </div>
            <Button size="sm" asChild className="w-full text-xs">
              <Link to="/tryout">
                Mulai rencana belajar
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
