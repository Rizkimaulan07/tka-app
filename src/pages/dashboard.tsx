import { useApp } from "@/context/use-app"
import { StudentDashboard } from "@/pages/student-dashboard"
import { TeacherDashboard } from "@/pages/teacher-dashboard"

export function DashboardPage() {
  const { role } = useApp()

  return role === "guru" ? <TeacherDashboard /> : <StudentDashboard />
}
