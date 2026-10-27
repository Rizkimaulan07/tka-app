import { EXAM_MAP } from "@/data/exams"
import { QUESTION_MAP } from "@/data/questions"
import type {
  ActivityItem,
  Attempt,
  ClassPerformance,
  StudentRecap,
  SubjectId,
} from "@/types"

export const ATTEMPTS_STORAGE_KEY = "siap-tka:attempts:v1"
export const QUESTIONS_STORAGE_KEY = "siap-tka:questions:v1"
export const ROLE_STORAGE_KEY = "siap-tka:role:v1"
export const THEME_STORAGE_KEY = "siap-tka:theme:v1"

export const PROFILES = {
  siswa: {
    name: "Aulia Rahma",
    roleLabel: "Siswa · XII IPA 2",
    detail: "Target TKA 2026",
    initials: "AR",
  },
  guru: {
    name: "Dimas Prakoso",
    roleLabel: "Guru Matematika",
    detail: "Wali kelas XII IPA 2",
    initials: "DP",
  },
} as const

function hash(value: string) {
  // FNV-1a: distribusi hash yang jauh lebih merata daripada polinomial sederhana.
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return Math.abs(result) % 100_000
}

function simulatedCorrect(examId: string, questionId: string, rate: number) {
  return hash(`${examId}:${questionId}`) % 100 < Math.round(rate * 100)
}

function buildAttempt(
  examId: string,
  subjectRates: Partial<Record<SubjectId, number>>,
  daysAgo: number,
  timeRatio: number,
): Attempt {
  const exam = EXAM_MAP[examId]!
  const answers: Record<string, string[]> = {}
  let correctCount = 0

  for (const questionId of exam.questionIds) {
    const question = QUESTION_MAP[questionId]
    if (!question) continue
    const rate = subjectRates[question.subjectId] ?? 0.7

    if (simulatedCorrect(examId, questionId, rate)) {
      answers[questionId] = [...question.correctOptionIds]
      correctCount += 1
    } else {
      const wrongOption = question.options.find(
        (option) => !question.correctOptionIds.includes(option.id),
      )
      if (wrongOption) answers[questionId] = [wrongOption.id]
    }
  }

  const finishedAt = new Date(Date.now() - daysAgo * 86_400_000)
  const startedAt = new Date(
    finishedAt.getTime() -
      exam.durationMinutes * 60_000 * timeRatio,
  )
  const total = exam.questionIds.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

  return {
    id: `seed-${examId}-${daysAgo}`,
    examId,
    examTitle: exam.title,
    subjectIds: exam.subjectIds,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    answers,
    flagged: [],
    score,
    correctCount,
    total,
    timeSpentSeconds: Math.round(exam.durationMinutes * 60 * timeRatio),
  }
}

export const SEED_ATTEMPTS: Attempt[] = [
  buildAttempt(
    "tryout-tka-1",
    { matematika: 0.55, "penalaran-umum": 0.5 },
    28,
    0.92,
  ),
  buildAttempt("latihan-bindo", { "bahasa-indonesia": 0.68 }, 21, 0.78),
  buildAttempt("tryout-bing", { "bahasa-inggris": 0.66 }, 14, 0.8),
  buildAttempt(
    "simulasi-tka",
    {
      matematika: 0.78,
      "penalaran-umum": 0.7,
      "bahasa-indonesia": 0.86,
      "bahasa-inggris": 0.74,
    },
    7,
    0.82,
  ),
  buildAttempt(
    "tryout-tka-1",
    { matematika: 0.9, "penalaran-umum": 0.8 },
    1,
    0.9,
  ),
]

export const CLASS_PERFORMANCE: ClassPerformance[] = [
  { className: "XII IPA 1", students: 32, average: 84 },
  { className: "XII IPA 2", students: 30, average: 79 },
  { className: "XII IPS 1", students: 28, average: 74 },
  { className: "XII IPS 2", students: 26, average: 71 },
]

export const STUDENT_RECAPS: StudentRecap[] = [
  {
    id: "s-01",
    name: "Aulia Rahma",
    className: "XII IPA 2",
    score: 92,
    progress: 100,
    status: "Selesai",
    submittedAt: "Hari ini · 10.42",
  },
  {
    id: "s-02",
    name: "Bima Aditya",
    className: "XII IPA 1",
    score: 88,
    progress: 100,
    status: "Selesai",
    submittedAt: "Hari ini · 10.38",
  },
  {
    id: "s-03",
    name: "Citra Lestari",
    className: "XII IPA 2",
    score: 85,
    progress: 100,
    status: "Selesai",
    submittedAt: "Hari ini · 10.35",
  },
  {
    id: "s-04",
    name: "Daffa Pratama",
    className: "XII IPS 1",
    score: 74,
    progress: 100,
    status: "Selesai",
    submittedAt: "Hari ini · 10.31",
  },
  {
    id: "s-05",
    name: "Eka Putri",
    className: "XII IPA 1",
    score: 0,
    progress: 64,
    status: "Mengerjakan",
    submittedAt: "Sedang mengerjakan",
  },
  {
    id: "s-06",
    name: "Fajar Nugroho",
    className: "XII IPS 2",
    score: 0,
    progress: 0,
    status: "Belum mulai",
    submittedAt: "—",
  },
  {
    id: "s-07",
    name: "Gita Maharani",
    className: "XII IPA 2",
    score: 90,
    progress: 100,
    status: "Selesai",
    submittedAt: "Hari ini · 10.22",
  },
  {
    id: "s-08",
    name: "Hendra Wijaya",
    className: "XII IPS 1",
    score: 69,
    progress: 100,
    status: "Selesai",
    submittedAt: "Hari ini · 10.18",
  },
]

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "a-01",
    name: "Citra Lestari",
    action: "menyelesaikan Simulasi TKA Lengkap",
    time: "2 menit lalu",
    score: 85,
  },
  {
    id: "a-02",
    name: "Bima Aditya",
    action: "menyelesaikan Tryout TKA 1",
    time: "8 menit lalu",
    score: 88,
  },
  {
    id: "a-03",
    name: "Eka Putri",
    action: "mulai mengerjakan Simulasi TKA Lengkap",
    time: "12 menit lalu",
  },
  {
    id: "a-04",
    name: "Daffa Pratama",
    action: "menyelesaikan Latihan Literasi",
    time: "25 menit lalu",
    score: 74,
  },
  {
    id: "a-05",
    name: "Gita Maharani",
    action: "menyelesaikan Tryout Bahasa Inggris",
    time: "40 menit lalu",
    score: 90,
  },
]
