import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import EvolutionChart from '@/components/EvolutionChart'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { SKILLS, type Skill } from '@/types'

export default function StudentDashboard() {
  const { t } = useTranslation()
  const { profile } = useAuth()
  const { students, lessonsByStudent } = useData()
  const [filter, setFilter] = useState<Set<Skill>>(new Set(SKILLS))

  const student = profile ? students.find((s) => s.id === profile.id) : null
  const lessons = useMemo(
    () => (profile ? lessonsByStudent(profile.id) : []),
    [profile, lessonsByStudent]
  )

  if (!profile || profile.role !== 'student' || !student) return null

  const last = lessons.length > 0 ? lessons[lessons.length - 1]! : null
  const lastAvg = last
    ? last.evaluations.reduce((s, e) => s + e.score, 0) / last.evaluations.length
    : null

  const toggleSkill = (s: Skill) => {
    setFilter((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">
        {t('studentDashboard.greeting', { name: student.name.split(' ')[0] })}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">
              {t('studentDashboard.lessons')}
            </div>
            <div className="text-3xl font-bold">{lessons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">
              {t('studentDashboard.lastAverage')}
            </div>
            <div className="text-3xl font-bold">
              {lastAvg ? lastAvg.toFixed(1) : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('studentDashboard.yourEvolution')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map((s) => {
              const active = filter.has(s)
              return (
                <Badge
                  key={s}
                  variant={active ? 'default' : 'outline'}
                  className="cursor-pointer select-none"
                  onClick={() => toggleSkill(s)}
                >
                  {t(`skills.${s}`)}
                </Badge>
              )
            })}
          </div>
          <EvolutionChart lessons={lessons} visibleSkills={[...filter]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('studentDashboard.history')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {lessons.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('studentDashboard.noLessons')}
            </p>
          )}
          {[...lessons].reverse().map((lesson) => {
            const avg =
              lesson.evaluations.reduce((s, e) => s + e.score, 0) /
              lesson.evaluations.length
            return (
              <Card key={lesson.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm">{lesson.date}</strong>
                    <span className="text-xs text-muted-foreground">
                      {t('common.average')} {avg.toFixed(1)}
                    </span>
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
    </div>
  )
}
