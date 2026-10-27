import type { ActiveExamSession, Exam } from "@/types"

const SESSION_PREFIX = "siap-tka:session:"

function key(examId: string) {
  return `${SESSION_PREFIX}${examId}`
}

export function loadSession(examId: string): ActiveExamSession | null {
  try {
    const raw = localStorage.getItem(key(examId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ActiveExamSession
    if (!parsed || parsed.examId !== examId) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: ActiveExamSession) {
  localStorage.setItem(key(session.examId), JSON.stringify(session))
}

export function clearSession(examId: string) {
  localStorage.removeItem(key(examId))
}

export function startSession(exam: Exam) {
  const existing = loadSession(exam.id)
  if (
    existing &&
    getRemainingSeconds(exam, existing) > 0
  ) {
    return existing
  }
  if (existing) clearSession(exam.id)

  const session: ActiveExamSession = {
    examId: exam.id,
    startedAt: Date.now(),
    answers: {},
    flagged: [],
    currentIndex: 0,
  }
  saveSession(session)
  return session
}

export function getRemainingSeconds(exam: Exam, session: ActiveExamSession) {
  const endTime = session.startedAt + exam.durationMinutes * 60_000
  return Math.max(0, Math.floor((endTime - Date.now()) / 1000))
}

export function getSessionProgress(session: ActiveExamSession) {
  return {
    answered: Object.values(session.answers).filter(
      (answer) => answer.length > 0,
    ).length,
    flagged: session.flagged.length,
  }
}
