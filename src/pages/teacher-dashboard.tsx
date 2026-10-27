import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BookOpenCheck,
  ClipboardList,
  Clock3,
  LibraryBig,
  Plus,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
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
import { RECENT_ACTIVITIES } from "@/data/seed"
import { cn, formatNumber, initials } from "@/lib/utils"

const classColors = ["#6366f1", "#8b5cf6", "#0ea5e9", "#10b981"]

export function TeacherDashboard() {
  const { questions, recaps, classes } = useApp()

  const totalStudents = classes.reduce(
    (sum, item) => sum + item.students,
    0,
  )
  const averageScore = Math.round(
    classes.reduce((sum, item) => sum + item.average * item.students, 0) /
      Math.max(1, totalStudents),
  )
  const topStudents = recaps
    .filter((student) => student.status === "Selesai")
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
  const needAttention = recaps.filter(
    (student) => student.status === "Selesai" && student.score < 75,
  )
  const chartData = classes.map((item) => ({
    name: item.className.replace("XII ", ""),
    full: item.className,
    average: item.average,
    students: item.students,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard guru"
        title="Selamat datang, Pak Dimas 👋"
        description="Pantau kesiapan siswa, kelola bank soal, dan ambil keputusan berdasarkan data."
        action={
          <>
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link to="/rekap">
                Rekap nilai
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild>
              <Link to="/bank-soal">
                <Plus className="size-4" />
                Buat soal
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Siswa aktif"
          value={formatNumber(totalStudents)}
          hint={`${classes.length} kelas binaan`}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Soal di bank"
          value={String(questions.length)}
          hint="4 mapel inti"
          icon={<LibraryBig className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Tryout aktif"
          value="2"
          hint="96 siswa mengerjakan"
          icon={<ClipboardList className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Rata-rata nilai"
          value={String(averageScore)}
          hint="naik 3,2 dari bulan lalu"
          icon={<TrendingUp className="size-5" />}
          tone="sky"
          trend={3}
        />
      </div>

      <section className="animate-rise relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-7">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-60 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-300" />
              </span>
              Live monitoring
            </span>
            <h2 className="mt-4 max-w-lg text-2xl leading-tight font-extrabold tracking-tight text-balance sm:text-[26px]">
              Simulasi TKA Lengkap sedang berlangsung
            </h2>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/70 sm:text-sm">
              68 dari 100 peserta telah menyelesaikan ujian. Pantau progres dan
              identifikasi siswa yang membutuhkan bantuan.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button
                asChild
                size="sm"
                className="bg-white text-indigo-700 shadow-md hover:bg-white/90"
              >
                <Link to="/rekap">
                  Pantau ujian
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="border border-white/15 text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/bank-soal">Kelola bank soal</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-medium text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-300" />
                68 selesai
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-300" />
                24 mengerjakan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-white/40" />8 belum
                mulai
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3" />
                45 menit
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-white/65">
                Penyelesaian ujian
              </p>
              <Activity className="size-4 text-white/70" />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl leading-none font-extrabold">68%</span>
              <span className="pb-1 text-[10px] text-white/60">
                dari 100 peserta
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300" />
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/60">
              <span>Rata-rata sementara</span>
              <span className="font-bold text-white">81,4</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-white/60">
              <span>Waktu tersisa</span>
              <span className="font-bold text-white">18 menit</span>
            </div>
            <div className="mt-4 flex -space-x-1.5">
              {["AR", "BA", "CL", "DP", "EP"].map((initial, index) => (
                <span
                  key={initial}
                  className="grid size-7 place-items-center rounded-full border-2 border-indigo-700 bg-white/20 text-[8px] font-bold text-white backdrop-blur-sm"
                  style={{ zIndex: 5 - index }}
                >
                  {initial}
                </span>
              ))}
              <span className="grid size-7 place-items-center rounded-full border-2 border-indigo-700 bg-white/15 text-[8px] font-bold text-white">
                +63
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card className="animate-rise">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Rata-rata nilai per kelas</CardTitle>
              <CardDescription className="mt-1">
                Berdasarkan seluruh tryout yang dikerjakan siswa.
              </CardDescription>
            </div>
            <Badge variant="success">
              <TrendingUp className="size-3" />
              +3,2
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 4, left: -26, bottom: 0 }}
                >
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
                    content={<ChartTooltip suffix="" />}
                  />
                  <Bar
                    dataKey="average"
                    name="Rata-rata"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={52}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.full}
                        fill={classColors[index % classColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {classes.map((item, index) => (
                <div
                  key={item.className}
                  className="rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{
                        backgroundColor: classColors[index % classColors.length],
                      }}
                    />
                    <p className="truncate text-[10px] font-semibold text-muted-foreground">
                      {item.className}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-extrabold text-foreground">
                    {item.average}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-rise">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Papan skor</CardTitle>
              <CardDescription className="mt-1">
                Siswa dengan nilai tertinggi.
              </CardDescription>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
              <Trophy className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {topStudents.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg text-[10px] font-extrabold",
                    index === 0
                      ? "bg-amber-400/15 text-amber-600 dark:text-amber-300"
                      : index === 1
                        ? "bg-slate-400/15 text-slate-600 dark:text-slate-300"
                        : index === 2
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-300"
                          : "bg-muted text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                  {initials(student.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">
                    {student.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {student.className}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-foreground">
                  {student.score}
                </span>
              </div>
            ))}
            <Button variant="outline" size="sm" asChild className="mt-2 w-full text-xs">
              <Link to="/rekap">
                Lihat semua nilai
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <Card className="animate-rise">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Aktivitas terbaru</CardTitle>
              <CardDescription className="mt-1">
                Pantau aktivitas siswa secara real-time.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <UserCheck className="size-3" />
              Live
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            {RECENT_ACTIVITIES.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-[9px] font-extrabold text-muted-foreground">
                  {initials(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground">
                    <strong className="font-bold text-foreground">
                      {item.name}
                    </strong>{" "}
                    {item.action}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground/80">
                    <Clock3 className="size-2.5" />
                    {item.time}
                  </p>
                </div>
                {typeof item.score === "number" && (
                  <Badge
                    variant={item.score >= 75 ? "success" : "warning"}
                    className="text-[9px]"
                  >
                    {item.score}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="animate-rise border-amber-500/20 bg-amber-500/[0.035]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Perlu perhatian</CardTitle>
                <Badge variant="warning">
                  <BellRing className="size-3" />
                  {needAttention.length} siswa
                </Badge>
              </div>
              <CardDescription>
                Nilai di bawah KKM 75. Berikan pendampingan tambahan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              {needAttention.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/70 px-2.5 py-2"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber-500/10 text-[9px] font-extrabold text-amber-700 dark:text-amber-300">
                    {initials(student.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-foreground">
                      {student.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {student.className} · {student.score} poin
                    </p>
                  </div>
                  <ArrowUpRight className="size-3.5 text-muted-foreground/50" />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-full gap-1.5 text-xs"
                onClick={() =>
                  toast.success(
                    `Pengingat belajar dikirim ke ${needAttention.length} siswa.`,
                  )
                }
              >
                <BellRing className="size-3.5" />
                Kirim pengingat belajar
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-rise">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <BookOpenCheck className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Siapkan tryout berikutnya
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Bank soal sudah berisi {questions.length} soal. Tambahkan
                    soal baru atau susun paket tryout untuk kelasmu.
                  </p>
                  <Link
                    to="/bank-soal"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                  >
                    Kelola bank soal
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
        <Clock3 className="size-3" />
        Data diperbarui otomatis setiap 30 detik
        <span className="size-1 rounded-full bg-emerald-500" />
      </div>
    </div>
  )
}
