import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FileText, Plus } from 'lucide-react'
import EvolutionChart from '@/components/EvolutionChart'
import IdeasButton, { type Idea } from '@/components/IdeasButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { SKILLS, type Evaluation, type Skill } from '@/types'

const IDEAS: Idea[] = [
  {
    title: 'Comparativo com aula anterior',
    description:
      'Mostrar setas ↑/↓ ao lado de cada nota indicando variação em relação à aula passada.',
  },
  {
    title: 'Radar chart por fundamento',
    description:
      'Visualização polar mostrando o perfil do aluno em todos os 10 fundamentos de uma vez.',
  },
  {
    title: 'Anexar vídeo',
    description:
      'Upload de vídeo da aula, ancorado a um fundamento, com timestamps comentados.',
  },
  {
    title: 'Plano de aula sugerido',
    description:
      'IA propõe drills da próxima aula com base nos fundamentos mais fracos do aluno.',
  },
  {
    title: 'Metas por fundamento',
    description:
      'Definir alvo (ex: víbora chegar a 7 até julho) e acompanhar progresso.',
  },
  {
    title: 'Compartilhar evolução',
    description:
      'Gerar card visual da evolução do aluno pra postar no Instagram (marketing orgânico).',
  },
  {
    title: 'Editar avaliação salva',
    description:
      'Permitir ajustar notas/comentários de uma aula já registrada (corrigir erros).',
  },
]

const today = () => new Date().toISOString().slice(0, 10)

const DEFAULT_SCORE = 5

const initialScores = (): Record<Skill, number> =>
  Object.fromEntries(SKILLS.map((s) => [s, DEFAULT_SCORE])) as Record<Skill, number>

const scoresFromLastLesson = (
  lessons: { evaluations: Evaluation[] }[]
): Record<Skill, number> => {
  const last = lessons[lessons.length - 1]
  if (!last) return initialScores()
  const map = initialScores()
  for (const ev of last.evaluations) {
    map[ev.skill] = ev.score
  }
  return map
}

export default function StudentDetail() {
  const { t } = useTranslation()
  const { studentId } = useParams<{ studentId: string }>()
  const { session } = useAuth()
  const { students, lessonsByStudent, recordLesson } = useData()

  const student = students.find((s) => s.id === studentId)
  const lessons = useMemo(
    () => (studentId ? lessonsByStudent(studentId) : []),
    [studentId, lessonsByStudent]
  )
  const lastLesson = lessons[lessons.length - 1]

  const [newLessonOpen, setNewLessonOpen] = useState(false)
  const [date, setDate] = useState(today)
  const [observations, setObservations] = useState('')
  const [scores, setScores] = useState<Record<Skill, number>>(() =>
    scoresFromLastLesson(lessons)
  )
  const [comments, setComments] = useState<Record<Skill, string>>(
    {} as Record<Skill, string>
  )

  if (!session || session.role !== 'teacher') return null
  if (!student || !studentId) {
    return (
      <div className="space-y-3">
        <p>{t('studentDetail.studentNotFound')}</p>
        <Link to="/teacher/students" className="text-sm text-primary underline">
          ← {t('common.back')}
        </Link>
      </div>
    )
  }

  const handleSave = () => {
    const evaluations: Evaluation[] = SKILLS.map((s) => ({
      skill: s,
      score: scores[s],
      comment: comments[s]?.trim() || undefined,
    }))
    recordLesson({
      studentId,
      teacherId: session.userId,
      date,
      observations: observations.trim() || undefined,
      evaluations,
    })
    setObservations('')
    setComments({} as Record<Skill, string>)
    setDate(today())
    setNewLessonOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          to="/teacher/students"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {t('common.back')}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">{student.name}</h2>
          <div className="flex items-center gap-2">
            <Button onClick={() => setNewLessonOpen(true)}>
              <Plus className="size-4" />
              {t('studentDetail.newLesson')}
            </Button>
            <IdeasButton ideas={IDEAS} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('studentDetail.evolution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <EvolutionChart lessons={lessons} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('studentDetail.lessonHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('studentDetail.noLessons')}
            </p>
          )}
          {[...lessons].reverse().map((lesson) => {
            const avg =
              lesson.evaluations.reduce((s, e) => s + e.score, 0) /
              lesson.evaluations.length
            return (
              <Card key={lesson.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{lesson.date}</strong>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t('common.average')} {avg.toFixed(1)}
                      </span>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                        <Link to={`/report/lesson/${lesson.id}`}>
                          <FileText className="size-3.5" />
                          {t('studentDetail.report')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                  {lesson.observations && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {lesson.observations}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      <Dialog open={newLessonOpen} onOpenChange={setNewLessonOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('studentDetail.newLessonTitle')}</DialogTitle>
            <DialogDescription>
              {lastLesson
                ? t('studentDetail.newLessonHint', { date: lastLesson.date })
                : t('studentDetail.newLessonHintFirst')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-4 sm:max-w-xs">
              <div className="space-y-2">
                <Label htmlFor="date">{t('studentDetail.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obs">{t('studentDetail.observations')}</Label>
              <Textarea
                id="obs"
                rows={2}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder={t('studentDetail.observationsPlaceholder')}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('studentDetail.skillEvaluation')}</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SKILLS.map((s) => (
                  <Card key={s} className="bg-muted/30">
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t(`skills.${s}`)}</span>
                        <span className="text-sm font-semibold tabular-nums text-primary">
                          {scores[s]}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        value={[scores[s]]}
                        onValueChange={(values) =>
                          setScores((prev) => ({ ...prev, [s]: values[0] ?? 0 }))
                        }
                      />
                      <Input
                        placeholder={t('studentDetail.commentPlaceholder')}
                        value={comments[s] ?? ''}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [s]: e.target.value }))
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewLessonOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('studentDetail.saveLesson')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
