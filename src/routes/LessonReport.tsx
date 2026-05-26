import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Printer } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'

function barColor(score: number) {
  if (score >= 7) return 'bg-emerald-600'
  if (score >= 4) return 'bg-amber-500'
  return 'bg-rose-600'
}

export default function LessonReport() {
  const { t } = useTranslation()
  const { lessonId } = useParams<{ lessonId: string }>()
  const { profile } = useAuth()
  const { lessons, students } = useData()
  const navigate = useNavigate()

  const lesson = lessons.find((l) => l.id === lessonId)
  const student = lesson ? students.find((s) => s.id === lesson.studentId) : null
  const teacher = profile

  if (!profile || profile.role !== 'teacher') return null
  if (!lesson || !student || !teacher) {
    return (
      <div className="min-h-screen bg-white p-8 text-zinc-900">
        <p>{t('report.lessonNotFound')}</p>
        <Link to="/teacher" className="mt-2 inline-block text-sm underline">
          ← {t('common.back')}
        </Link>
      </div>
    )
  }

  const avg = lesson.evaluations.reduce((s, e) => s + e.score, 0) / lesson.evaluations.length
  const sorted = [...lesson.evaluations].sort((a, b) => b.score - a.score)
  const best = sorted[0]!
  const worst = sorted[sorted.length - 1]!

  return (
    <div
      className="min-h-screen bg-white text-zinc-900 print:min-h-0"
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <ArrowLeft className="size-4" />
            {t('common.back')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Printer className="size-4" />
            {t('report.print')}
          </button>
        </div>

        <header className="border-b border-zinc-200 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">{t('appName')}</h1>
            <span className="text-xs uppercase tracking-wider text-zinc-500">
              {t('report.title')}
            </span>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {t('report.student')}
            </div>
            <div className="mt-0.5 font-medium">{student.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {t('report.teacher')}
            </div>
            <div className="mt-0.5 font-medium">{teacher.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {t('report.lessonDate')}
            </div>
            <div className="mt-0.5 font-medium">{lesson.date}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">
              {t('report.averageScore')}
            </div>
            <div className="mt-0.5 font-medium">{avg.toFixed(1)} / 10</div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-xs uppercase tracking-wider text-emerald-700">
              {t('report.highlight')}
            </div>
            <div className="mt-1 font-medium text-emerald-900">
              {t(`skills.${best.skill}`)} · {best.score}
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs uppercase tracking-wider text-amber-700">
              {t('report.needsWork')}
            </div>
            <div className="mt-1 font-medium text-amber-900">
              {t(`skills.${worst.skill}`)} · {worst.score}
            </div>
          </div>
        </section>

        {lesson.observations && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t('report.observations')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed">{lesson.observations}</p>
          </section>
        )}

        <section className="mt-6 break-inside-avoid">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {t('report.skillEvaluation')}
          </h2>
          <div className="mt-3 space-y-3">
            {lesson.evaluations.map((ev) => (
              <div key={ev.skill} className="break-inside-avoid">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{t(`skills.${ev.skill}`)}</span>
                  <span className="tabular-nums text-zinc-700">{ev.score}/10</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className={`h-full ${barColor(ev.score)}`}
                    style={{ width: `${(ev.score / 10) * 100}%` }}
                  />
                </div>
                {ev.comment && (
                  <div className="mt-1 text-xs text-zinc-600">{ev.comment}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-zinc-200 pt-4 text-xs text-zinc-500">
          {t('report.footer', { date: new Date().toISOString().slice(0, 10) })}
        </footer>
      </div>
    </div>
  )
}
