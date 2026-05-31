import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { SKILLS, type Lesson, type Skill } from '@/types'

const COLORS: Record<Skill, string> = {
  serve: '#4ade80',
  smash: '#f87171',
  bandeja: '#60a5fa',
  vibora: '#fbbf24',
  volley: '#c084fc',
  globo: '#34d399',
  wallDefense: '#f472b6',
  chiquita: '#fb923c',
  rulo: '#a3e635',
  positioning: '#22d3ee',
}

interface EvolutionChartProps {
  lessons: Lesson[]
  visibleSkills?: Skill[]
}

export default function EvolutionChart({ lessons, visibleSkills }: EvolutionChartProps) {
  const { t } = useTranslation()

  if (lessons.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('studentDetail.noLessons')}</p>
  }

  const data = lessons.map((lesson) => {
    const point: Record<string, string | number> = { date: lesson.date }
    for (const ev of lesson.evaluations) {
      point[ev.skill] = ev.score
    }
    return point
  })

  const skills = visibleSkills ?? [...SKILLS]

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#2a313d" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#98a2b3" fontSize={12} />
          <YAxis domain={[0, 10]} stroke="#98a2b3" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: '#1f2530',
              border: '1px solid #2a313d',
              borderRadius: 8,
            }}
            labelStyle={{ color: '#e6e9ef' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {skills.map((s) => (
            <Line
              key={s}
              type="monotone"
              dataKey={s}
              name={t(`skills.${s}`)}
              stroke={COLORS[s]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
