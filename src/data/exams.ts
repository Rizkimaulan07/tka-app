import type { Exam } from "@/types"

const QUESTION_BANK_IDS = {
  mathAndReasoning: [
    "q-mat-01",
    "q-mat-02",
    "q-mat-03",
    "q-mat-04",
    "q-mat-05",
    "q-mat-06",
    "q-pen-01",
    "q-pen-02",
    "q-pen-03",
    "q-pen-04",
    "q-pen-05",
    "q-pen-06",
  ],
  bahasaIndonesia: [
    "q-bin-01",
    "q-bin-02",
    "q-bin-03",
    "q-bin-04",
    "q-bin-05",
    "q-bin-06",
  ],
  bahasaInggris: [
    "q-eng-01",
    "q-eng-02",
    "q-eng-03",
    "q-eng-04",
    "q-eng-05",
    "q-eng-06",
  ],
  all: [
    "q-mat-01",
    "q-mat-02",
    "q-mat-03",
    "q-mat-04",
    "q-mat-05",
    "q-mat-06",
    "q-pen-01",
    "q-pen-02",
    "q-pen-03",
    "q-pen-04",
    "q-pen-05",
    "q-pen-06",
    "q-bin-01",
    "q-bin-02",
    "q-bin-03",
    "q-bin-04",
    "q-bin-05",
    "q-bin-06",
    "q-eng-01",
    "q-eng-02",
    "q-eng-03",
    "q-eng-04",
    "q-eng-05",
    "q-eng-06",
  ],
}

const {
  mathAndReasoning,
  bahasaIndonesia,
  bahasaInggris,
  all: allQuestions,
} = QUESTION_BANK_IDS

export const EXAMS: Exam[] = [
  {
    id: "simulasi-tka",
    title: "Simulasi TKA Lengkap",
    description:
      "Uji kesiapanmu dengan paket simulasi lengkap yang mencakup empat mapel inti TKA.",
    level: "Simulasi",
    durationMinutes: 45,
    questionIds: allQuestions,
    subjectIds: [
      "matematika",
      "bahasa-indonesia",
      "bahasa-inggris",
      "penalaran-umum",
    ],
    participants: 1284,
    schedule: "Bisa dikerjakan kapan saja",
    isActive: true,
    featured: true,
  },
  {
    id: "tryout-tka-1",
    title: "Tryout TKA 1",
    description:
      "Fokus pada Matematika dan Penalaran Umum dengan soal bertingkat. Cocok untuk mengukur kemampuan awal.",
    level: "Tryout",
    durationMinutes: 25,
    questionIds: mathAndReasoning,
    subjectIds: ["matematika", "penalaran-umum"],
    participants: 312,
    schedule: "Hari ini · 08.00–21.00",
    isActive: true,
  },
  {
    id: "latihan-bindo",
    title: "Latihan Literasi Bahasa Indonesia",
    description:
      "Latihan santai untuk mengasah pemahaman bacaan, ejaan, dan kalimat efektif.",
    level: "Latihan",
    durationMinutes: 10,
    questionIds: bahasaIndonesia,
    subjectIds: ["bahasa-indonesia"],
    participants: 846,
    schedule: "Bisa dikerjakan kapan saja",
    isActive: true,
  },
  {
    id: "tryout-bing",
    title: "Tryout Bahasa Inggris",
    description:
      "Tantang dirimu dengan soal reading, grammar, dan vocabulary setara TKA.",
    level: "Tryout",
    durationMinutes: 10,
    questionIds: bahasaInggris,
    subjectIds: ["bahasa-inggris"],
    participants: 274,
    schedule: "Besok · 08.00–20.00",
    isActive: true,
  },
]

export const EXAM_MAP = Object.fromEntries(
  EXAMS.map((exam) => [exam.id, exam]),
) as Record<string, Exam>
