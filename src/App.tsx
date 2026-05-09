import { Navigate, Route, Routes } from 'react-router-dom'
import { BarChart3, Dumbbell, Settings, Wallet } from 'lucide-react'
import Layout from '@/components/Layout'
import Placeholder from '@/components/Placeholder'
import TeacherShell from '@/components/TeacherShell'
import { useAuth } from '@/context/AuthContext'
import EvaluationsList from '@/routes/EvaluationsList'
import LessonReport from '@/routes/LessonReport'
import Login from '@/routes/Login'
import Schedule from '@/routes/Schedule'
import StudentDashboard from '@/routes/StudentDashboard'
import StudentDetail from '@/routes/StudentDetail'
import StudentsList from '@/routes/StudentsList'
import TeacherDashboard from '@/routes/TeacherDashboard'
import type { Role } from '@/types'
import type { ReactElement } from 'react'

function Protected({ children, role }: { children: ReactElement; role: Role }) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/" replace />
  if (session.role !== role) {
    return <Navigate to={session.role === 'teacher' ? '/teacher' : '/student'} replace />
  }
  return children
}

function StudentShell() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6 lg:px-8">
      <StudentDashboard />
    </main>
  )
}

export default function App() {
  const { session } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          session ? (
            <Navigate to={session.role === 'teacher' ? '/teacher' : '/student'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/report/lesson/:lessonId"
        element={
          <Protected role="teacher">
            <LessonReport />
          </Protected>
        }
      />
      <Route element={<Layout />}>
        <Route
          path="/teacher"
          element={
            <Protected role="teacher">
              <TeacherShell />
            </Protected>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="students" element={<StudentsList />} />
          <Route path="students/:studentId" element={<StudentDetail />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="evaluations" element={<EvaluationsList />} />
          <Route
            path="drills"
            element={
              <Placeholder
                titleKey="nav.drills"
                descriptionKey="placeholders.drills"
                icon={Dumbbell}
              />
            }
          />
          <Route
            path="finance"
            element={
              <Placeholder
                titleKey="nav.finance"
                descriptionKey="placeholders.finance"
                icon={Wallet}
              />
            }
          />
          <Route
            path="reports"
            element={
              <Placeholder
                titleKey="nav.reports"
                descriptionKey="placeholders.reports"
                icon={BarChart3}
              />
            }
          />
          <Route
            path="settings"
            element={
              <Placeholder
                titleKey="nav.settings"
                descriptionKey="placeholders.settings"
                icon={Settings}
              />
            }
          />
        </Route>

        <Route
          path="/student"
          element={
            <Protected role="student">
              <StudentShell />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
