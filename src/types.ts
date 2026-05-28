export const SKILLS = [
  'serve',
  'smash',
  'bandeja',
  'vibora',
  'volley',
  'globo',
  'wallDefense',
  'chiquita',
  'rulo',
  'positioning',
] as const

export type Skill = (typeof SKILLS)[number]

export type StudentStatus = 'active' | 'paused' | 'inactive'

export interface Teacher {
  id: string
  name: string
}

export interface Student {
  id: string
  name: string
  email?: string
  status: StudentStatus
  teacherId: string
  linkedProfileId?: string
}

export interface Evaluation {
  skill: Skill
  score: number
  comment?: string
}

export interface Lesson {
  id: string
  studentId: string
  teacherId: string
  date: string
  observations?: string
  evaluations: Evaluation[]
}

export type BookingStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  studentId: string
  teacherId: string
  date: string
  time: string
  duration: number
  status: BookingStatus
  observations?: string
}

export const DURATIONS = [30, 45, 60, 90] as const

export type Role = 'teacher' | 'student'

export type TacticTeam = 'A' | 'B'
export type TacticArrowKind = 'movement' | 'ball'

export interface TacticPlayer {
  id: string
  x: number
  y: number
  team: TacticTeam
  label?: string
}

export interface TacticArrow {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  kind: TacticArrowKind
}

export interface TacticStroke {
  id: string
  points: { x: number; y: number }[]
  color?: string
  width?: number
}

export interface TacticScene {
  players: TacticPlayer[]
  arrows: TacticArrow[]
  strokes: TacticStroke[]
}

export interface TacticBoard {
  id: string
  teacherId: string
  title: string
  notes?: string
  scene: TacticScene
}

export const EMPTY_TACTIC_SCENE: TacticScene = {
  players: [],
  arrows: [],
  strokes: [],
}

export const INITIAL_PLAYERS: TacticPlayer[] = [
  { id: 'a1', x: 50, y: 30, team: 'A' },
  { id: 'a2', x: 50, y: 70, team: 'A' },
  { id: 'b1', x: 150, y: 30, team: 'B' },
  { id: 'b2', x: 150, y: 70, team: 'B' },
]

export const INITIAL_TACTIC_SCENE: TacticScene = {
  players: INITIAL_PLAYERS,
  arrows: [],
  strokes: [],
}
