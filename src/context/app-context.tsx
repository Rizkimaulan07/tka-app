import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { PROFILES, ROLE_STORAGE_KEY, THEME_STORAGE_KEY } from "@/data/seed"
import {
  createAttempt as createAttemptApi,
  createQuestion as createQuestionApi,
  deleteQuestion as deleteQuestionApi,
  fetchBootstrap,
  updateQuestion as updateQuestionApi,
} from "@/lib/api"
import type {
  Attempt,
  ClassPerformance,
  Question,
  Role,
  StudentRecap,
} from "@/types"

export type Theme = "light" | "dark"
export type QuestionDraft = Omit<Question, "id">
export type LoadStatus = "loading" | "ready" | "error"

export interface AppContextValue {
  role: Role
  setRole: (role: Role) => void
  theme: Theme
  toggleTheme: () => void
  profile: (typeof PROFILES)[Role]
  questions: Question[]
  attempts: Attempt[]
  recaps: StudentRecap[]
  classes: ClassPerformance[]
  status: LoadStatus
  error: string | null
  refresh: () => void
  addQuestion: (question: QuestionDraft) => Promise<Question>
  updateQuestion: (question: Question) => Promise<void>
  deleteQuestion: (questionId: string) => Promise<void>
  addAttempt: (attempt: Attempt) => Promise<void>
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

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan yang tidak diketahui."
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() =>
    readStored<Role>(ROLE_STORAGE_KEY, "siswa"),
  )
  const [theme, setTheme] = useState<Theme>(() =>
    readStored<Theme>(THEME_STORAGE_KEY, "light"),
  )
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [recaps, setRecaps] = useState<StudentRecap[]>([])
  const [classes, setClasses] = useState<ClassPerformance[]>([])
  const [status, setStatus] = useState<LoadStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
    writeStored(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    let active = true

    setStatus("loading")
    setError(null)

    fetchBootstrap()
      .then((data) => {
        if (!active) return
        setQuestions(data.questions)
        setAttempts(data.attempts)
        setRecaps(data.recaps)
        setClasses(data.classes)
        setStatus("ready")
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(errorMessage(loadError))
        setStatus("error")
      })

    return () => {
      active = false
    }
  }, [reloadToken])

  const refresh = useCallback(() => {
    setReloadToken((current) => current + 1)
  }, [])

  const setRole = useCallback((nextRole: Role) => {
    setRoleState(nextRole)
    writeStored(ROLE_STORAGE_KEY, nextRole)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "light" ? "dark" : "light"))
  }, [])

  const addQuestion = useCallback(async (draft: QuestionDraft) => {
    const created = await createQuestionApi(draft)
    setQuestions((current) => [created, ...current])
    return created
  }, [])

  const updateQuestion = useCallback(async (question: Question) => {
    const updated = await updateQuestionApi(question)
    setQuestions((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }, [])

  const deleteQuestion = useCallback(async (questionId: string) => {
    await deleteQuestionApi(questionId)
    setQuestions((current) =>
      current.filter((question) => question.id !== questionId),
    )
  }, [])

  const addAttempt = useCallback(async (attempt: Attempt) => {
    const saved = await createAttemptApi(attempt)
    setAttempts((current) => [
      saved,
      ...current.filter((item) => item.id !== saved.id),
    ])
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
      recaps,
      classes,
      status,
      error,
      refresh,
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
      recaps,
      classes,
      status,
      error,
      refresh,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addAttempt,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
