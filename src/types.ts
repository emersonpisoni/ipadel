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
