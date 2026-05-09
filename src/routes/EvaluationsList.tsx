import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, FileText } from 'lucide-react'
import IdeasButton, { type Idea } from '@/components/IdeasButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { type Evaluation } from '@/types'

const ALL = 'all'

const IDEAS: Idea[] = [
  {
    title: 'Filtro por período',
    description: 'Filtrar por mês, trimestre ou intervalo customizado de datas.',
  },
  {
    title: 'Filtro por fundamento',
    description:
      'Mostrar só aulas em que um fundamento específico ficou abaixo de N (foco em pontos fracos).',
  },
  {
    title: 'Busca por texto',
    description: 'Buscar dentro das observações da aula e comentários por fundamento.',
  },
  {
    title: 'Ordenação configurável',
    description: 'Ordenar por data, média (asc/desc), aluno, etc.',
  },
  {
    title: 'Editar avaliação',
    description: 'Corrigir notas/comentários de uma aula já registrada.',
  },
  {
    title: 'Exportar em massa',
    description: 'Exportar todas as avaliações filtradas em CSV ou PDF consolidado.',
  },
]

function colorForScore(score: number) {
  if (score >= 7) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
  if (score >= 4) return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
  return 'bg-rose-500/15 text-rose-300 border-rose-500/30'
}

function highlights(evaluations: Evaluation[]) {
  if (evaluations.length === 0) return null
  const sorted = [...evaluations].sort((a, b) => b.score - a.score)
  return {
    best: sorted[0]!,
    worst: sorted[sorted.length - 1]!,
  }
}

export default function EvaluationsList() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const { lessons, students, studentsByTeacher } = useData()
  const [studentFilter, setStudentFilter] = useState<string>(ALL)

  const myStudents = session ? studentsByTeacher(session.userId) : []

  const filtered = useMemo(() => {
    if (!session) return []
    return lessons
      .filter((l) => l.teacherId === session.userId)
      .filter((l) => studentFilter === ALL || l.studentId === studentFilter)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [lessons, session, studentFilter])

  if (!session || session.role !== 'teacher') return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('evaluations.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('evaluations.subtitle')}</p>
        </div>
        <IdeasButton ideas={IDEAS} />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs">{t('evaluations.filterStudent')}</Label>
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t('evaluations.allStudents')}</SelectItem>
              {myStudents.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pb-1 text-sm text-muted-foreground">
          {t('evaluations.evaluationCount', { count: filtered.length })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t('evaluations.noResults')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lesson) => {
            const student = students.find((s) => s.id === lesson.studentId)
            const avg =
              lesson.evaluations.reduce((s, e) => s + e.score, 0) /
              lesson.evaluations.length
            const hl = highlights(lesson.evaluations)
            return (
              <Card key={lesson.id}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">{lesson.date}</div>
                      <div className="font-medium">{student?.name ?? '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tabular-nums">{avg.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">{t('common.average')}</div>
                    </div>
                  </div>

                  {lesson.observations && (
                    <p className="text-sm text-muted-foreground">{lesson.observations}</p>
                  )}

                  {hl && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full border px-2 py-0.5 ${colorForScore(hl.best.score)}`}
                      >
                        ↑ {t(`skills.${hl.best.skill}`)} {hl.best.score}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 ${colorForScore(hl.worst.score)}`}
                      >
                        ↓ {t(`skills.${hl.worst.skill}`)} {hl.worst.score}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1">
                    <Button asChild variant="ghost" size="sm" className="-ml-2">
                      <Link to={`/teacher/students/${lesson.studentId}`}>
                        {t('evaluations.viewStudent')} <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/report/lesson/${lesson.id}`}>
                        <FileText className="size-3.5" /> {t('studentDetail.report')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
