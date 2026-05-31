import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ClipboardList, Plus, Users } from 'lucide-react'
import IdeasButton, { type Idea } from '@/components/shared/IdeasButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'

interface Metric {
  labelKey: string
  value: string
  hintKey?: string
}

const IDEAS: Idea[] = [
  {
    title: 'Comparativo entre alunos',
    description:
      'Radar chart lado a lado pra montar duplas equilibradas ou organizar torneio interno.',
  },
  {
    title: 'Resumo automático com IA',
    description:
      'Síntese da última semana: alunos que evoluíram, estagnaram, e sugestões de foco.',
  },
  {
    title: 'Predição de plateau',
    description:
      'Detectar alunos estagnados em algum fundamento por mais de N aulas e sugerir mudança de abordagem.',
  },
  {
    title: 'Heat map por aluno',
    description:
      'Visualização rápida de quais fundamentos cada aluno é mais forte ou mais fraco.',
  },
  {
    title: 'Comparativo mensal',
    description:
      'Comparar mês atual com o anterior: total de aulas, média geral, alunos ativos.',
  },
  {
    title: 'Ações rápidas configuráveis',
    description:
      'Permitir ao professor escolher quais atalhos aparecem no card de ações rápidas.',
  },
]

export default function TeacherDashboard() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { lessons, students } = useData()

  if (!profile || profile.role !== 'teacher') return null

  const myStudents = students
  const myLessons = lessons

  const today = new Date()
  const lessonsThisMonth = myLessons.filter((l) => {
    const d = new Date(l.date)
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  })

  const allScores = myLessons.flatMap((l) => l.evaluations.map((e) => e.score))
  const overallAverage = allScores.length
    ? allScores.reduce((s, n) => s + n, 0) / allScores.length
    : null

  const metrics: Metric[] = [
    { labelKey: 'dashboard.metrics.activeStudents', value: String(myStudents.length) },
    {
      labelKey: 'dashboard.metrics.lessonsThisMonth',
      value: String(lessonsThisMonth.length),
      hintKey: 'dashboard.metrics.lessonsThisMonthHint',
    },
    {
      labelKey: 'dashboard.metrics.averageScore',
      value: overallAverage ? overallAverage.toFixed(1) : '—',
      hintKey: 'dashboard.metrics.averageScoreHint',
    },
    {
      labelKey: 'dashboard.metrics.nextLesson',
      value: '—',
      hintKey: 'dashboard.metrics.nextLessonHint',
    },
  ]

  const recent = [...myLessons]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <IdeasButton ideas={IDEAS} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.labelKey}>
            <CardContent className="py-4">
              <div className="text-xs text-muted-foreground">{t(m.labelKey)}</div>
              <div className="mt-1 text-3xl font-bold tabular-nums">{m.value}</div>
              {m.hintKey && (
                <div className="mt-1 text-xs text-muted-foreground">{t(m.hintKey)}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/teacher/evaluations">
                {t('dashboard.viewAll')} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('dashboard.noRecentActivity')}</p>
            )}
            {recent.map((lesson) => {
              const student = students.find((s) => s.id === lesson.studentId)
              const avg =
                lesson.evaluations.reduce((s, e) => s + e.score, 0) /
                lesson.evaluations.length
              return (
                <Link
                  key={lesson.id}
                  to={`/teacher/students/${lesson.studentId}`}
                  className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent/40"
                >
                  <div>
                    <div className="font-medium">{student?.name ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{lesson.date}</div>
                  </div>
                  <div className="text-sm tabular-nums text-muted-foreground">
                    {t('common.average')}{' '}
                    <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/teacher/students">
                <Plus className="size-4" />
                {t('dashboard.newLesson')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/teacher/students">
                <Users className="size-4" />
                {t('dashboard.viewAllStudents')}
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/teacher/evaluations">
                <ClipboardList className="size-4" />
                {t('dashboard.evaluationHistory')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
