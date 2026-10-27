import { useEffect } from "react"
import { HashRouter, Route, Routes, useLocation } from "react-router-dom"
import { Toaster } from "sonner"
import { DatabaseGate } from "@/components/database-gate"
import { AppShell } from "@/components/layout/app-shell"
import { AppProvider } from "@/context/app-context"
import { useApp } from "@/context/use-app"
import { AnalyticsPage } from "@/pages/analytics"
import { DashboardPage } from "@/pages/dashboard"
import { ExamBriefPage } from "@/pages/exam-brief"
import { ExamListPage } from "@/pages/exam-list"
import { ExamRoomPage } from "@/pages/exam-room"
import { NotFoundPage } from "@/pages/not-found"
import { QuestionBankPage } from "@/pages/question-bank"
import { RekapPage } from "@/pages/rekap"
import { ResultDetailPage } from "@/pages/result-detail"
import { ResultsPage } from "@/pages/results"

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function AppToaster() {
  const { theme } = useApp()

  return (
    <Toaster
      position="top-center"
      theme={theme}
      richColors
      closeButton
      toastOptions={{
        className: "font-sans",
      }}
    />
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <DatabaseGate>
          <ScrollToTop />
          <Routes>
            <Route path="/ujian/:examId" element={<ExamRoomPage />} />
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="tryout" element={<ExamListPage />} />
              <Route path="tryout/:examId" element={<ExamBriefPage />} />
              <Route path="hasil" element={<ResultsPage />} />
              <Route path="hasil/:attemptId" element={<ResultDetailPage />} />
              <Route path="analisis" element={<AnalyticsPage />} />
              <Route path="bank-soal" element={<QuestionBankPage />} />
              <Route path="rekap" element={<RekapPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <AppToaster />
        </DatabaseGate>
      </HashRouter>
    </AppProvider>
  )
}
