import {
  BellRing,
  CheckCircle2,
  Clock3,
  Download,
  LockKeyhole,
  School,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useApp } from "@/context/use-app"
import { cn, downloadCSV, initials } from "@/lib/utils"
import type { StudentRecap } from "@/types"

const statusVariant = {
  Selesai: "success",
  Mengerjakan: "warning",
  "Belum mulai": "outline",
} as const

function RekapContent() {
  const { recaps: students, classes: classPerformance } = useApp()
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("semua")
  const [statusFilter, setStatusFilter] = useState<
    "semua" | StudentRecap["status"]
  >("semua")

  const completed = students.filter(
    (student) => student.status === "Selesai",
  )
  const inProgress = students.filter(
    (student) => student.status === "Mengerjakan",
  )
  const notStarted = students.filter(
    (student) => student.status === "Belum mulai",
  )
  const averageScore = Math.round(
    completed.reduce((sum, student) => sum + student.score, 0) /
      Math.max(1, completed.length),
  )
  const participation = Math.round(
    (completed.length / Math.max(1, students.length)) * 100,
  )
  const classes = [...new Set(students.map((student) => student.className))]

  const filtered = students.filter((student) => {
    const query = search.trim().toLowerCase()
    const matchesQuery =
      query.length === 0 ||
      student.name.toLowerCase().includes(query) ||
      student.className.toLowerCase().includes(query)
    const matchesClass =
      classFilter === "semua" || student.className === classFilter
    const matchesStatus =
      statusFilter === "semua" || student.status === statusFilter
    return matchesQuery && matchesClass && matchesStatus
  })

  const unfinished = students.filter(
    (student) => student.status !== "Selesai",
  )

  const resetFilters = () => {
    setSearch("")
    setClassFilter("semua")
    setStatusFilter("semua")
  }

  const handleExport = () => {
    downloadCSV("rekap-nilai-tka.csv", [
      ["Nama", "Kelas", "Progres (%)", "Skor", "Status", "Waktu"],
      ...filtered.map((student) => [
        student.name,
        student.className,
        student.progress,
        student.status === "Selesai" ? student.score : "-",
        student.status,
        student.submittedAt,
      ]),
    ])
    toast.success("Rekap nilai berhasil diekspor sebagai CSV.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen guru"
        title="Rekap Nilai"
        description="Pantau penyelesaian tryout, nilai siswa, dan partisipasi kelas dalam satu tampilan."
        action={
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4" />
            Ekspor rekap
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Peserta ujian"
          value={String(students.length)}
          hint={`${classes.length} kelas`}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Sudah selesai"
          value={String(completed.length)}
          hint={`${participation}% partisipasi`}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Sedang mengerjakan"
          value={String(inProgress.length)}
          hint={`${notStarted.length} belum mulai`}
          icon={<Clock3 className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Rata-rata nilai"
          value={String(averageScore)}
          hint="peserta yang selesai"
          icon={<TrendingUp className="size-5" />}
          tone="sky"
          trend={3}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="animate-rise min-w-0 overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle>Rekap peserta</CardTitle>
                <CardDescription className="mt-1">
                  Simulasi TKA Lengkap · 45 menit · 24 soal
                </CardDescription>
              </div>
              <Badge variant="secondary">{filtered.length} peserta</Badge>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau kelas..."
                  className="pl-9"
                  aria-label="Cari peserta"
                />
              </div>
              <Select
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
                className="sm:w-36"
                aria-label="Filter kelas"
              >
                <option value="semua">Semua kelas</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "semua" | StudentRecap["status"],
                  )
                }
                className="sm:w-40"
                aria-label="Filter status"
              >
                <option value="semua">Semua status</option>
                <option value="Selesai">Selesai</option>
                <option value="Mengerjakan">Mengerjakan</option>
                <option value="Belum mulai">Belum mulai</option>
              </Select>
              {(search ||
                classFilter !== "semua" ||
                statusFilter !== "semua") && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>

          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<Search className="size-5" />}
                title="Peserta tidak ditemukan"
                description="Coba ubah kata kunci atau filter yang dipilih."
                action={
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset filter
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/35 text-[9px] font-bold tracking-wide text-muted-foreground uppercase">
                      <th className="px-4 py-3 font-bold">Siswa</th>
                      <th className="px-3 py-3 font-bold">Kelas</th>
                      <th className="px-3 py-3 font-bold">Progres</th>
                      <th className="px-3 py-3 font-bold">Skor</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-muted/25"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                              {initials(student.name)}
                            </span>
                            <span className="font-semibold text-foreground">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">
                          {student.className}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  student.progress === 100
                                    ? "bg-emerald-500"
                                    : student.progress > 0
                                      ? "bg-amber-500"
                                      : "bg-muted-foreground/30",
                                )}
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {student.status === "Selesai" ? (
                            <span
                              className={cn(
                                "font-extrabold",
                                student.score >= 75
                                  ? "text-emerald-700 dark:text-emerald-300"
                                  : "text-amber-700 dark:text-amber-300",
                              )}
                            >
                              {student.score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={statusVariant[student.status]}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-muted-foreground">
                          {student.submittedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border/60 md:hidden">
                {filtered.map((student) => (
                  <div key={student.id} className="p-4">
                    <div className="flex items-start gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-extrabold text-primary">
                        {initials(student.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-foreground">
                            {student.name}
                          </p>
                          <Badge variant={statusVariant[student.status]}>
                            {student.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {student.className} · {student.submittedAt}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            student.progress === 100
                              ? "bg-emerald-500"
                              : student.progress > 0
                                ? "bg-amber-500"
                                : "bg-muted-foreground/30",
                          )}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {student.progress}%
                      </span>
                      {student.status === "Selesai" && (
                        <span
                          className={cn(
                            "text-sm font-extrabold",
                            student.score >= 75
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-amber-700 dark:text-amber-300",
                          )}
                        >
                          {student.score}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <aside className="space-y-5">
          <Card className="animate-rise">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Ringkasan kelas</CardTitle>
                <School className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {classPerformance.map((item) => (
                <div key={item.className}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-foreground">
                        {item.className}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {item.students} siswa
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-foreground">
                      {item.average}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.average}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="animate-rise border-amber-500/20 bg-amber-500/[0.03]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Belum selesai</CardTitle>
                <Badge variant="warning">{unfinished.length} siswa</Badge>
              </div>
              <CardDescription>
                Dorong siswa menyelesaikan ujian sebelum waktu habis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              {unfinished.map((student) => (
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
                    <p className="text-[9px] text-muted-foreground">
                      {student.className} · progres {student.progress}%
                    </p>
                  </div>
                  <Badge variant={statusVariant[student.status]}>
                    {student.status === "Mengerjakan" ? "Aktif" : "Belum"}
                  </Badge>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-1 w-full gap-1.5 text-xs"
                onClick={() =>
                  toast.success(
                    `Pengingat dikirim ke ${unfinished.length} siswa yang belum selesai.`,
                  )
                }
              >
                <BellRing className="size-3.5" />
                Kirim pengingat
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-card px-4 py-3">
            <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Ujian ditutup pukul 21.00. Peserta yang belum mengumpulkan akan
              dinilai berdasarkan jawaban yang tersimpan.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function RekapGate() {
  const { setRole } = useApp()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen guru"
        title="Rekap Nilai"
        description="Pantau penyelesaian tryout, nilai siswa, dan partisipasi kelas."
      />
      <div className="animate-rise relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center sm:p-12">
        <div className="pointer-events-none absolute -top-20 left-1/2 size-60 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-md">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="size-6" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-foreground">
            Halaman khusus guru
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Rekap nilai hanya dapat diakses dalam mode guru. Beralih ke mode
            guru untuk melihat data seluruh peserta.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setRole("guru")
              toast.success("Mode guru aktif. Rekap nilai terbuka.")
            }}
          >
            <LockKeyhole className="size-4" />
            Masuk mode guru
          </Button>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Mode demo · tidak memerlukan kata sandi
          </p>
        </div>
      </div>
    </div>
  )
}

export function RekapPage() {
  const { role } = useApp()

  return role === "guru" ? <RekapContent /> : <RekapGate />
}
