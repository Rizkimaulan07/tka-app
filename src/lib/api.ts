import type {
  Attempt,
  ClassPerformance,
  Question,
  StudentRecap,
} from "@/types"

export interface BootstrapData {
  questions: Question[]
  attempts: Attempt[]
  recaps: StudentRecap[]
  classes: ClassPerformance[]
}

export type QuestionInput = Omit<Question, "id">

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ApiError"
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(
      "Tidak dapat terhubung ke server. Pastikan database dan API sudah berjalan.",
    )
  }

  if (!response.ok) {
    let message = "Permintaan ke server gagal."

    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // Respons bukan JSON; pakai pesan default.
    }

    throw new ApiError(message)
  }

  return (await response.json()) as T
}

export function fetchBootstrap() {
  return request<BootstrapData>("/api/bootstrap", { cache: "no-store" })
}

export function createQuestion(question: QuestionInput) {
  return request<Question>("/api/questions", {
    method: "POST",
    body: JSON.stringify(question),
  })
}

export function updateQuestion(question: Question) {
  return request<Question>(`/api/questions/${encodeURIComponent(question.id)}`, {
    method: "PUT",
    body: JSON.stringify(question),
  })
}

export function deleteQuestion(questionId: string) {
  return request<{ ok: boolean; id: string }>(
    `/api/questions/${encodeURIComponent(questionId)}`,
    { method: "DELETE" },
  )
}

export function createAttempt(attempt: Attempt) {
  return request<Attempt>("/api/attempts", {
    method: "POST",
    body: JSON.stringify(attempt),
  })
}
