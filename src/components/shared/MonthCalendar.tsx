import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Booking, Student } from '@/types'

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface CalendarCell {
  dateIso: string
  dayOfMonth: number
  inMonth: boolean
}

function generateCells(year: number, month: number): CalendarCell[] {
  const cells: CalendarCell[] = []
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()

  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    cells.push({ dateIso: toIso(d), dayOfMonth: d.getDate(), inMonth: false })
  }

  const lastDay = new Date(year, month + 1, 0).getDate()
  for (let i = 1; i <= lastDay; i++) {
    const d = new Date(year, month, i)
    cells.push({ dateIso: toIso(d), dayOfMonth: i, inMonth: true })
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!
    const d = new Date(last.dateIso + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    cells.push({ dateIso: toIso(d), dayOfMonth: d.getDate(), inMonth: false })
  }

  return cells
}

interface MonthCalendarProps {
  year: number
  month: number
  bookings: Booking[]
  students: Student[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onDayClick?: (dateIso: string) => void
  onEventClick?: (booking: Booking) => void
}

export default function MonthCalendar({
  year,
  month,
  bookings,
  students,
  onPrev,
  onNext,
  onToday,
  onDayClick,
  onEventClick,
}: MonthCalendarProps) {
  const { t } = useTranslation()
  const cells = generateCells(year, month)
  const todayIso = toIso(new Date())
  const months = t('months', { returnObjects: true }) as string[]
  const weekdays = t('weekdays', { returnObjects: true }) as string[]

  const byDate = new Map<string, Booking[]>()
  for (const b of bookings) {
    const list = byDate.get(b.date) ?? []
    list.push(b)
    byDate.set(b.date, list)
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => a.time.localeCompare(b.time))
  }

  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? '—'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrev} aria-label={t('schedule.previousMonth')}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNext} aria-label={t('schedule.nextMonth')}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday}>
            {t('common.today')}
          </Button>
        </div>
        <div className="text-lg font-semibold tracking-tight">
          {months[month]} {year}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
        {weekdays.map((d) => (
          <div
            key={d}
            className="bg-muted/40 px-2 py-1.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {cells.map((c) => {
          const events = byDate.get(c.dateIso) ?? []
          const isToday = c.dateIso === todayIso
          return (
            <div
              key={c.dateIso}
              className={cn(
                'group relative min-h-16 cursor-pointer bg-background p-1 transition-colors hover:bg-accent/30 sm:min-h-25 sm:p-1.5',
                !c.inMonth && 'bg-muted/20'
              )}
              onClick={() => onDayClick?.(c.dateIso)}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                    isToday && 'bg-primary text-primary-foreground font-semibold',
                    !isToday && c.inMonth && 'text-foreground',
                    !isToday && !c.inMonth && 'text-muted-foreground/50'
                  )}
                >
                  {c.dayOfMonth}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map((ev) => (
                  <button
                    type="button"
                    key={ev.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick?.(ev)
                    }}
                    className={cn(
                      'block w-full truncate rounded text-left transition-colors',
                      'h-1.5 sm:h-auto sm:px-1.5 sm:py-0.5 sm:text-[11px] sm:leading-tight',
                      ev.status === 'scheduled' &&
                        'bg-primary/40 sm:bg-primary/15 sm:text-primary sm:hover:bg-primary/25',
                      ev.status === 'completed' &&
                        'bg-emerald-500/50 sm:bg-emerald-500/15 sm:text-emerald-300 sm:hover:bg-emerald-500/25',
                      ev.status === 'cancelled' &&
                        'bg-muted sm:text-muted-foreground sm:line-through'
                    )}
                    aria-label={`${ev.time} ${studentName(ev.studentId)}`}
                  >
                    <span className="hidden sm:inline">
                      <span className="font-medium tabular-nums">{ev.time}</span>{' '}
                      {studentName(ev.studentId)}
                    </span>
                  </button>
                ))}
                {events.length > 3 && (
                  <div className="hidden px-1.5 text-[11px] text-muted-foreground sm:block">
                    {t('schedule.moreCount', { count: events.length - 3 })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
