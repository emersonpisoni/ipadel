import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarPlus, Check, Trash2, X } from 'lucide-react'
import IdeasButton, { type Idea } from '@/components/IdeasButton'
import MonthCalendar from '@/components/MonthCalendar'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { DURATIONS } from '@/types'

const IDEAS: Idea[] = [
  {
    title: 'Editar agendamento existente',
    description:
      'Reabrir o dialog com dados pré-preenchidos para alterar aluno, data, horário, duração ou observações.',
  },
  {
    title: 'Aulas recorrentes',
    description:
      'Marcar agendamentos repetidos com regra simples (ex: toda terça às 19h por 8 semanas).',
  },
  {
    title: 'Conflito de horário',
    description:
      'Alertar quando o agendamento criado/editado sobrepõe outro existente do mesmo professor.',
  },
  {
    title: 'Lembrete via WhatsApp',
    description:
      'Botão "Enviar lembrete" que abre wa.me com mensagem pronta para enviar ao aluno.',
  },
  {
    title: 'Visão semanal',
    description: 'Alternar entre mensal e semanal, com slots de hora visíveis.',
  },
  {
    title: 'Vincular agendamento → aula',
    description:
      'Ao salvar uma avaliação na data de um agendamento, marcar automaticamente como realizada e linkar à aula.',
  },
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso: string, locale: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y!, m! - 1, d!).toLocaleDateString(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export default function Schedule() {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const {
    students,
    bookings,
    createBooking,
    updateBookingStatus,
    removeBooking,
  } = useData()
  const navigate = useNavigate()

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [newOpen, setNewOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const [formDate, setFormDate] = useState(todayIso())
  const [formStudentId, setFormStudentId] = useState<string>('')
  const [formTime, setFormTime] = useState('19:00')
  const [formDuration, setFormDuration] = useState<number>(60)
  const [formObs, setFormObs] = useState('')

  const myBookings = bookings
  const myStudents = students

  if (!profile || profile.role !== 'teacher') return null

  const upcoming = [...myBookings]
    .filter((b) => b.status === 'scheduled' && b.date >= todayIso())
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)
    )
    .slice(0, 5)

  const goTo = (delta: number) => {
    let nextMonth = month + delta
    let nextYear = year
    if (nextMonth < 0) {
      nextMonth = 11
      nextYear -= 1
    } else if (nextMonth > 11) {
      nextMonth = 0
      nextYear += 1
    }
    setMonth(nextMonth)
    setYear(nextYear)
  }

  const goToToday = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  const openNew = (dateIso?: string) => {
    setFormDate(dateIso ?? todayIso())
    setFormStudentId(myStudents[0]?.id ?? '')
    setFormTime('19:00')
    setFormDuration(60)
    setFormObs('')
    setNewOpen(true)
  }

  const handleSave = async () => {
    if (!formStudentId) return
    const result = await createBooking({
      studentId: formStudentId,
      teacherId: profile.id,
      date: formDate,
      time: formTime,
      duration: formDuration,
      observations: formObs.trim() || undefined,
    })
    if (result.error) {
      console.error('createBooking failed', result.error)
      return
    }
    setNewOpen(false)
  }

  const detail = myBookings.find((b) => b.id === detailId) ?? null
  const detailStudent = detail
    ? students.find((s) => s.id === detail.studentId)
    : null

  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : i18n.resolvedLanguage === 'es' ? 'es-ES' : 'pt-BR'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('schedule.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('schedule.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <IdeasButton ideas={IDEAS} />
          <Button onClick={() => openNew()}>
            <CalendarPlus className="size-4" />
            {t('schedule.newBooking')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <MonthCalendar
          year={year}
          month={month}
          bookings={myBookings}
          students={students}
          onPrev={() => goTo(-1)}
          onNext={() => goTo(1)}
          onToday={goToToday}
          onDayClick={openNew}
          onEventClick={(b) => setDetailId(b.id)}
        />

        <aside className="space-y-3">
          <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {t('schedule.upcoming')}
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              {t('schedule.noUpcoming')}
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((b) => {
                const s = students.find((x) => x.id === b.studentId)
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setDetailId(b.id)}
                    className="block w-full rounded-md border p-2.5 text-left transition-colors hover:bg-accent/40"
                  >
                    <div className="text-xs text-muted-foreground">
                      {formatDate(b.date, locale)} · {b.time} · {b.duration}{t('schedule.minutesShort')}
                    </div>
                    <div className="mt-0.5 text-sm font-medium">{s?.name ?? '—'}</div>
                    {b.observations && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{b.observations}</div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </aside>
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('schedule.newBooking')}</DialogTitle>
            <DialogDescription>{t('schedule.newBookingDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="b-student">{t('roles.student')}</Label>
              <Select value={formStudentId} onValueChange={setFormStudentId}>
                <SelectTrigger id="b-student" className="w-full">
                  <SelectValue placeholder={t('schedule.selectStudent')} />
                </SelectTrigger>
                <SelectContent>
                  {myStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="b-date">{t('schedule.date')}</Label>
                <Input
                  id="b-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-time">{t('schedule.time')}</Label>
                <Input
                  id="b-time"
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-duration">{t('schedule.duration')}</Label>
              <Select
                value={String(formDuration)}
                onValueChange={(v) => setFormDuration(Number(v))}
              >
                <SelectTrigger id="b-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {t('schedule.minutes', { count: d })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-obs">{t('schedule.observations')}</Label>
              <Textarea
                id="b-obs"
                rows={2}
                value={formObs}
                onChange={(e) => setFormObs(e.target.value)}
                placeholder={t('schedule.observationsPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!formStudentId}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detail !== null}
        onOpenChange={(open) => !open && setDetailId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailStudent?.name ?? '—'}</DialogTitle>
            <DialogDescription>
              {detail &&
                `${formatDate(detail.date, locale)} · ${detail.time} · ${detail.duration}${t('schedule.minutesShort')} · ${t(`bookingStatus.${detail.status}`)}`}
            </DialogDescription>
          </DialogHeader>
          {detail?.observations && (
            <p className="text-sm text-muted-foreground">{detail.observations}</p>
          )}
          <Separator />
          <div className="space-y-1">
            {detail?.status === 'scheduled' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={async () => {
                    if (!detail) return
                    await updateBookingStatus(detail.id, 'completed')
                    setDetailId(null)
                    navigate(`/teacher/students/${detail.studentId}`)
                  }}
                >
                  <Check className="size-4" />
                  {t('schedule.markCompleted')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={async () => {
                    if (!detail) return
                    await updateBookingStatus(detail.id, 'cancelled')
                    setDetailId(null)
                  }}
                >
                  <X className="size-4" />
                  {t('schedule.cancelBooking')}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={async () => {
                if (!detail) return
                await removeBooking(detail.id)
                setDetailId(null)
              }}
            >
              <Trash2 className="size-4" />
              {t('common.delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
