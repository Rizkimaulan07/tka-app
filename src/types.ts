export type Role = "siswa" | "guru"

export type SubjectId =
  | "matematika"
  | "bahasa-indonesia"
  | "bahasa-inggris"
  | "penalaran-umum"

export type Difficulty = "mudah" | "sedang" | "sulit"

export type QuestionType =
  | "pilihan-ganda"
  | "pilihan-ganda-kompleks"
  | "benar-salah"

export type ExamLevel = "Latihan" | "Tryout" | "Simulasi"

export interface Subject {
  id: SubjectId
  name: string
  short: string
  /** Tailwind text color class */
  color: string
  /** Tailwind background class */
  bg: string
  /** Tailwind border class */
  border: string
  /** Tailwind dot class */
  dot: string
  /** Hex color for charts */
  chart: string
}

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  subjectId: SubjectId
  topic: string
  difficulty: Difficulty
  type: QuestionType
  prompt: string
  options: QuestionOption[]
  correctOptionIds: string[]
  explanation: string
}

export interface Exam {
  id: string
  title: string
  description: string
  level: ExamLevel
  durationMinutes: number
  questionIds: string[]
  subjectIds: SubjectId[]
  participants: number
  schedule: string
  isActive: boolean
  featured?: boolean
}

export interface Attempt {
  id: string
  examId: string
  examTitle: string
  subjectIds: SubjectId[]
  startedAt: string
  finishedAt: string
  answers: Record<string, string[]>
  flagged: string[]
  score: number
  correctCount: number
  total: number
  timeSpentSeconds: number
}

export interface ActiveExamSession {
  examId: string
  startedAt: number
  answers: Record<string, string[]>
  flagged: string[]
  currentIndex: number
}

export interface StudentRecap {
  id: string
  name: string
  className: string
  score: number
  progress: number
  status: "Selesai" | "Mengerjakan" | "Belum mulai"
  submittedAt: string
}

export interface ClassPerformance {
  className: string
  students: number
  average: number
}

export interface ActivityItem {
  id: string
  name: string
  action: string
  time: string
  score?: number
}
