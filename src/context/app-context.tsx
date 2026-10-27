import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { QUESTION_BANK } from "@/data/questions"
import {
  ATTEMPTS_STORAGE_KEY,
  PROFILES,
  QUESTIONS_STORAGE_KEY,
  ROLE_STORAGE_KEY,
  SEED_ATTEMPTS,
  THEME_STORAGE_KEY,
} from "@/data/seed"
import type { Attempt, Question, Role } from "@/types"

export type Theme = "light" | "dark"
export type QuestionDraft = Omit<Question, "id">

export interface AppContextValue {
  role: Role
  setRole: (role: Role) => void
  theme: Theme
  toggleTheme: () => void
  profile: (typeof PROFILES)[Role]
  questions: Question[]
  attempts: Attempt[]
  addQuestion: (question: QuestionDraft) => Question
  updateQuestion: (question: Question) => void
  deleteQuestion: (questionId: string) => void
  addAttempt: (attempt: Attempt) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private mode. The app still works in-memory.
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() =>
    readStored<Role>(ROLE_STORAGE_KEY, "siswa"),
  )
  const [theme, setTheme] = useState<Theme>(() =>
    readStored<Theme>(THEME_STORAGE_KEY, "light"),
  )
  const [questions, setQuestions] = useState<Question[]>(() =>
    readStored<Question[]>(QUESTIONS_STORAGE_KEY, QUESTION_BANK),
  )
  const [attempts, setAttempts] = useState<Attempt[]>(() =>
    readStored<Attempt[]>(ATTEMPTS_STORAGE_KEY, SEED_ATTEMPTS),
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    writeStored(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    writeStored(QUESTIONS_STORAGE_KEY, questions)
  }, [questions])

  useEffect(() => {
    writeStored(ATTEMPTS_STORAGE_KEY, attempts)
  }, [attempts])

  const setRole = useCallback((nextRole: Role) => {
    setRoleState(nextRole)
    writeStored(ROLE_STORAGE_KEY, nextRole)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"))
  }, [])

  const addQuestion = useCallback((draft: QuestionDraft) => {
    const question: Question = {
      ...draft,
      id: `q-custom-${Date.now()}`,
    }
    setQuestions((current) => [question, ...current])
    return question
  }, [])

  const updateQuestion = useCallback((question: Question) => {
    setQuestions((current) =>
      current.map((item) => (item.id === question.id ? question : item)),
    )
  }, [])

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((current) =>
      current.filter((question) => question.id !== questionId),
    )
  }, [])

  const addAttempt = useCallback((attempt: Attempt) => {
    setAttempts((current) => [attempt, ...current])
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      setRole,
      theme,
      toggleTheme,
      profile: PROFILES[role],
      questions,
      attempts,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addAttempt,
    }),
    [
      role,
      setRole,
      theme,
      toggleTheme,
      questions,
      attempts,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addAttempt,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
