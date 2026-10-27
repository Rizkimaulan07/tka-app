import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Download,
  Flame,
  Gauge,
  LibraryBig,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { SubjectIcon } from "@/components/subject-icon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input, Textarea } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  DIFFICULTY_LABEL,
  QUESTION_TYPE_LABEL,
} from "@/data/questions"
import { SUBJECTS, getSubject } from "@/data/subjects"
import { useApp } from "@/context/use-app"
import type { QuestionDraft } from "@/context/app-context"
import { cn, downloadCSV } from "@/lib/utils"
import type {
  Difficulty,
  Question,
  QuestionOption,
  QuestionType,
  SubjectId,
} from "@/types"

const difficultyVariant = {
  mudah: "success",
  sedang: "warning",
  sulit: "destructive",
} as const

const typeVariant = {
  "pilihan-ganda": "secondary",
  "pilihan-ganda-kompleks": "sky",
  "benar-salah": "warning",
} as const

const blankOptions = (): QuestionOption[] =>
  ["a", "b", "c", "d"].map((id) => ({ id, text: "" }))

interface FormState {
  subjectId: SubjectId
  topic: string
  difficulty: Difficulty
  type: QuestionType
  prompt: string
  options: QuestionOption[]
  correctOptionIds: string[]
  explanation: string
}

function blankForm(): FormState {
  return {
    subjectId: "matematika",
    topic: "",
    difficulty: "sedang",
    type: "pilihan-ganda",
    prompt: "",
    options: blankOptions(),
    correctOptionIds: [],
    explanation: "",
  }
}

function QuestionFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  initial: Question | null
  onClose: () => void
  onSave: (draft: QuestionDraft) => void
}) {
  const [form, setForm] = useState<FormState>(blankForm)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        subjectId: initial.subjectId,
        topic: initial.topic,
        difficulty: initial.difficulty,
        type: initial.type,
        prompt: initial.prompt,
        options: initial.options.map((option) => ({ ...option })),
        correctOptionIds: [...initial.correctOptionIds],
        explanation: initial.explanation,
      })
    } else {
      setForm(blankForm())
    }
    setError("")
  }, [open, initial])

  const isTrueFalse = form.type === "benar-salah"
  const isMultiple = form.type === "pilihan-ganda-kompleks"

  const handleTypeChange = (nextType: QuestionType) => {
    setForm((current) => {
      if (nextType === "benar-salah") {
        return {
          ...current,
          type: nextType,
          options: [
            { id: "a", text: "Benar" },
            { id: "b", text: "Salah" },
          ],
          correctOptionIds: current.correctOptionIds
            .filter((id) => id === "a" || id === "b")
            .slice(0, 1),
        }
      }
      const shouldResetOptions = current.options.length !== 4
      return {
        ...current,
        type: nextType,
        options: shouldResetOptions ? blankOptions() : current.options,
        correctOptionIds: isMultiple
          ? current.correctOptionIds.filter((id) =>
              current.options.some((option) => option.id === id),
            )
          : current.correctOptionIds.slice(0, 1),
      }
    })
  }

  const toggleCorrect = (optionId: string) => {
    setForm((current) => {
      if (current.type === "pilihan-ganda-kompleks") {
        return {
          ...current,
          correctOptionIds: current.correctOptionIds.includes(optionId)
            ? current.correctOptionIds.filter((id) => id !== optionId)
            : [...current.correctOptionIds, optionId],
        }
      }
      return {
        ...current,
        correctOptionIds: current.correctOptionIds.includes(optionId)
          ? []
          : [optionId],
      }
    })
  }

  const handleSubmit = () => {
    if (!form.prompt.trim()) {
      setError("Pertanyaan wajib diisi.")
      return
    }
    if (!form.topic.trim()) {
      setError("Topik wajib diisi.")
      return
    }
    if (!isTrueFalse && form.options.some((option) => !option.text.trim())) {
      setError("Lengkapi keempat pilihan jawaban.")
      return
    }
    if (form.correctOptionIds.length === 0) {
      setError("Tandai minimal satu jawaban benar.")
      return
    }
    if (!isMultiple && form.correctOptionIds.length > 1) {
      setError("Soal pilihan ganda hanya boleh memiliki satu kunci.")
      return
    }
    if (!form.explanation.trim()) {
      setError("Pembahasan wajib diisi agar siswa dapat belajar.")
      return
    }

    onSave({
      subjectId: form.subjectId,
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      type: form.type,
      prompt: form.prompt.trim(),
      options: form.options.map((option) => ({
        ...option,
        text: option.text.trim(),
      })),
      correctOptionIds: form.correctOptionIds,
      explanation: form.explanation.trim(),
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit soal" : "Tambah soal baru"}</DialogTitle>
          <DialogDescription>
            Lengkapi detail soal, pilihan jawaban, kunci, dan pembahasan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground">
                Mapel
              </label>
              <Select
                value={form.subjectId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    subjectId: event.target.value as SubjectId,
                  }))
                }
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground">
                Tingkat kesulitan
              </label>
              <Select
                value={form.difficulty}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    difficulty: event.target.value as Difficulty,
                  }))
                }
              >
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground">
                Tipe soal
              </label>
              <Select
                value={form.type}
                onChange={(event) =>
                  handleTypeChange(event.target.value as QuestionType)
                }
              >
                <option value="pilihan-ganda">Pilihan ganda</option>
                <option value="pilihan-ganda-kompleks">
                  Pilihan ganda kompleks
                </option>
                <option value="benar-salah">Benar / salah</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground">
              Topik
            </label>
            <Input
              value={form.topic}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  topic: event.target.value,
                }))
              }
              placeholder="Contoh: Aljabar, Ide Pokok, Grammar"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground">
              Pertanyaan
            </label>
            <Textarea
              value={form.prompt}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  prompt: event.target.value,
                }))
              }
              placeholder="Tulis pertanyaan atau teks bacaan di sini..."
              className="min-h-28"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label className="text-[10px] font-bold text-muted-foreground">
                Pilihan jawaban
              </label>
              <span className="text-[9px] text-muted-foreground">
                {isMultiple
                  ? "Klik huruf untuk memilih lebih dari satu kunci"
                  : "Klik huruf untuk menandai kunci jawaban"}
              </span>
            </div>
            <div className="space-y-2">
              {form.options.map((option) => {
                const isCorrect = form.correctOptionIds.includes(option.id)
                return (
                  <div key={option.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCorrect(option.id)}
                      aria-label={`Tandai pilihan ${option.id.toUpperCase()} sebagai kunci`}
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl border text-xs font-extrabold transition-colors",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                          : "border-border bg-muted/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {isCorrect ? (
                        <Check className="size-4" />
                      ) : (
                        option.id.toUpperCase()
                      )}
                    </button>
                    <Input
                      value={option.text}
                      readOnly={isTrueFalse}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          options: current.options.map((item) =>
                            item.id === option.id
                              ? { ...item, text: event.target.value }
                              : item,
                          ),
                        }))
                      }
                      placeholder={`Pilihan ${option.id.toUpperCase()}`}
                      className={cn(isTrueFalse && "bg-muted/40")}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground">
              Pembahasan
            </label>
            <Textarea
              value={form.explanation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  explanation: event.target.value,
                }))
              }
              placeholder="Jelaskan mengapa jawaban tersebut benar..."
              className="min-h-24"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/8 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rose-500" />
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>
            {initial ? "Simpan perubahan" : "Simpan soal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuestionBankContent() {
  const {
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useApp()
  const [search, setSearch] = useState("")
  const [subjectFilter, setSubjectFilter] = useState<SubjectId | "semua">(
    "semua",
  )
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "semua">(
    "semua",
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Question | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return questions.filter((question) => {
      const matchesSubject =
        subjectFilter === "semua" || question.subjectId === subjectFilter
      const matchesDifficulty =
        difficultyFilter === "semua" ||
        question.difficulty === difficultyFilter
      const matchesQuery =
        query.length === 0 ||
        question.prompt.toLowerCase().includes(query) ||
        question.topic.toLowerCase().includes(query) ||
        getSubject(question.subjectId).name.toLowerCase().includes(query)
      return matchesSubject && matchesDifficulty && matchesQuery
    })
  }, [questions, search, subjectFilter, difficultyFilter])

  const counts = useMemo(
    () => ({
      mudah: questions.filter((question) => question.difficulty === "mudah")
        .length,
      sedang: questions.filter((question) => question.difficulty === "sedang")
        .length,
      sulit: questions.filter((question) => question.difficulty === "sulit")
        .length,
    }),
    [questions],
  )

  const handleSave = (draft: QuestionDraft) => {
    if (editing) {
      updateQuestion({ ...draft, id: editing.id })
      toast.success("Soal berhasil diperbarui.")
    } else {
      addQuestion(draft)
      toast.success("Soal baru berhasil ditambahkan ke bank soal.")
    }
    setEditing(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteQuestion(deleteTarget.id)
    toast.success("Soal berhasil dihapus dari bank soal.")
    setDeleteTarget(null)
  }

  const handleExport = () => {
    downloadCSV("bank-soal-tka.csv", [
      [
        "No",
        "Mapel",
        "Topik",
        "Tipe",
        "Kesulitan",
        "Pertanyaan",
        "Pilihan",
        "Kunci",
        "Pembahasan",
      ],
      ...questions.map((question, index) => [
        index + 1,
        getSubject(question.subjectId).name,
        question.topic,
        QUESTION_TYPE_LABEL[question.type],
        DIFFICULTY_LABEL[question.difficulty],
        question.prompt,
        question.options
          .map((option) => `${option.id.toUpperCase()}. ${option.text}`)
          .join(" | "),
        question.correctOptionIds
          .map((id) => id.toUpperCase())
          .join(", "),
        question.explanation,
      ]),
    ])
    toast.success("Bank soal berhasil diekspor sebagai CSV.")
  }

  const resetFilters = () => {
    setSearch("")
    setSubjectFilter("semua")
    setDifficultyFilter("semua")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen guru"
        title="Bank Soal"
        description="Kelola soal TKA untuk seluruh mapel. Soal dapat digunakan kembali di berbagai paket tryout dan latihan."
        action={
          <>
            <Button
              variant="outline"
              onClick={handleExport}
              className="hidden sm:inline-flex"
            >
              <Download className="size-4" />
              Ekspor CSV
            </Button>
            <Button
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Tambah soal
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total soal"
          value={String(questions.length)}
          hint="siap dipakai"
          icon={<LibraryBig className="size-5" />}
        />
        <StatCard
          label="Tingkat mudah"
          value={String(counts.mudah)}
          hint="pemanasan"
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Tingkat sedang"
          value={String(counts.sedang)}
          hint="porsi terbesar"
          icon={<Gauge className="size-5" />}
          tone="warning"
        />
        <StatCard
          label="Tingkat sulit"
          value={String(counts.sulit)}
          hint="soal tantangan"
          icon={<Flame className="size-5" />}
          tone="sky"
        />
      </div>

      <Card className="animate-rise">
        <CardContent className="flex flex-col gap-2.5 p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari pertanyaan, topik, atau mapel..."
              className="pl-9"
              aria-label="Cari soal"
            />
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Select
              value={subjectFilter}
              onChange={(event) =>
                setSubjectFilter(event.target.value as SubjectId | "semua")
              }
              className="sm:w-44"
              aria-label="Filter mapel"
            >
              <option value="semua">Semua mapel</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
            <Select
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(
                  event.target.value as Difficulty | "semua",
                )
              }
              className="sm:w-40"
              aria-label="Filter kesulitan"
            >
              <option value="semua">Semua tingkat</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </Select>
            {(search ||
              subjectFilter !== "semua" ||
              difficultyFilter !== "semua") && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="size-5" />}
          title="Soal tidak ditemukan"
          description="Coba ubah kata kunci atau filter yang dipilih."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset filter
            </Button>
          }
        />
      ) : (
        <>
          <Card className="animate-rise hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 text-[9px] font-bold tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-bold">Soal</th>
                    <th className="px-3 py-3 font-bold">Mapel</th>
                    <th className="px-3 py-3 font-bold">Tipe</th>
                    <th className="px-3 py-3 font-bold">Kesulitan</th>
                    <th className="px-3 py-3 font-bold">Kunci</th>
                    <th className="px-4 py-3 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((question, index) => {
                    const subject = getSubject(question.subjectId)
                    return (
                      <tr
                        key={question.id}
                        className="transition-colors hover:bg-muted/25"
                      >
                        <td className="max-w-md px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[9px] font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="line-clamp-2 font-semibold text-foreground">
                                {question.prompt}
                              </p>
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {question.topic}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold",
                              subject.bg,
                              subject.color,
                            )}
                          >
                            <span
                              className="size-1 rounded-full"
                              style={{ backgroundColor: subject.chart }}
                            />
                            {subject.short}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={typeVariant[question.type]}>
                            {QUESTION_TYPE_LABEL[question.type]}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={difficultyVariant[question.difficulty]}>
                            {DIFFICULTY_LABEL[question.difficulty]}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            {question.correctOptionIds
                              .map((id) => id.toUpperCase())
                              .join(", ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit soal"
                              onClick={() => {
                                setEditing(question)
                                setFormOpen(true)
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Hapus soal"
                              className="text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600"
                              onClick={() => setDeleteTarget(question)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-2.5 md:hidden">
            {filtered.map((question, index) => {
              const subject = getSubject(question.subjectId)
              return (
                <Card key={question.id} className="animate-rise">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2.5">
                      <SubjectIcon
                        subjectId={question.subjectId}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">
                            Soal {index + 1} · {question.topic}
                          </span>
                          <Badge
                            variant={difficultyVariant[question.difficulty]}
                          >
                            {DIFFICULTY_LABEL[question.difficulty]}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground">
                          {question.prompt}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={cn("text-[9px] font-bold", subject.color)}>
                            {subject.short}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {QUESTION_TYPE_LABEL[question.type]}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            Kunci:{" "}
                            <strong className="text-emerald-700 dark:text-emerald-300">
                              {question.correctOptionIds
                                .map((id) => id.toUpperCase())
                                .join(", ")}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-1.5 border-t border-border/60 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-[10px]"
                        onClick={() => {
                          setEditing(question)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-[10px] text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300"
                        onClick={() => setDeleteTarget(question)}
                      >
                        <Trash2 className="size-3" />
                        Hapus
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <div className="flex flex-col items-center justify-between gap-2 text-[10px] text-muted-foreground sm:flex-row">
        <p>
          Menampilkan {filtered.length} dari {questions.length} soal.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleExport}
        >
          <Download className="size-3.5" />
          Unduh seluruh bank soal
        </Button>
      </div>

      <QuestionFormDialog
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus soal ini?</DialogTitle>
            <DialogDescription>
              Soal yang dihapus tidak dapat dikembalikan. Jika soal sudah
              terpakai di paket ujian, soal tersebut tidak akan muncul lagi saat
              ujian dikerjakan.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
              <p className="line-clamp-3 text-xs leading-relaxed text-foreground">
                {deleteTarget.prompt}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] font-bold text-muted-foreground">
                  {getSubject(deleteTarget.subjectId).name}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  · {deleteTarget.topic}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Hapus soal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeacherGate() {
  const { setRole } = useApp()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen guru"
        title="Bank Soal"
        description="Kelola bank soal TKA, lengkapi pembahasan, dan susun paket ujian."
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
            Bank soal hanya dapat diakses dalam mode guru. Beralih ke mode guru
            untuk menambah, mengedit, dan menghapus soal.
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setRole("guru")
              toast.success("Mode guru aktif. Kamu bisa mengelola bank soal.")
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

export function QuestionBankPage() {
  const { role } = useApp()

  return role === "guru" ? <QuestionBankContent /> : <TeacherGate />
}
