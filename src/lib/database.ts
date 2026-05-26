import type { BookingStatus, Role, Skill } from '@/types'

export type StudentStatus = 'active' | 'paused' | 'inactive'

export type SupportedLanguage = 'pt' | 'en' | 'es'

export interface ProfileRow {
  id: string
  role: Role
  name: string
  preferred_language: SupportedLanguage
  created_at: string
  updated_at: string
}

export interface StudentRow {
  id: string
  teacher_id: string
  name: string
  email: string | null
  linked_profile_id: string | null
  status: StudentStatus
  created_at: string
  updated_at: string
}

export interface LessonRow {
  id: string
  student_id: string
  teacher_id: string
  date: string
  observations: string | null
  created_at: string
}

export interface EvaluationRow {
  id: string
  lesson_id: string
  skill: Skill
  score: number
  comment: string | null
  created_at: string
}

export interface BookingRow {
  id: string
  student_id: string
  teacher_id: string
  date: string
  time: string
  duration: number
  status: BookingStatus
  observations: string | null
  linked_lesson_id: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id: string
          role: Role
          name?: string
          preferred_language?: SupportedLanguage
          created_at?: string
          updated_at?: string
        }
        Update: Partial<ProfileRow>
        Relationships: []
      }
      students: {
        Row: StudentRow
        Insert: {
          id?: string
          teacher_id: string
          name: string
          email?: string | null
          linked_profile_id?: string | null
          status?: StudentStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          name: string
          email: string | null
          linked_profile_id: string | null
          status: StudentStatus
        }>
        Relationships: []
      }
      lessons: {
        Row: LessonRow
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          date: string
          observations?: string | null
          created_at?: string
        }
        Update: Partial<LessonRow>
        Relationships: []
      }
      evaluations: {
        Row: EvaluationRow
        Insert: {
          id?: string
          lesson_id: string
          skill: Skill
          score: number
          comment?: string | null
          created_at?: string
        }
        Update: Partial<EvaluationRow>
        Relationships: []
      }
      bookings: {
        Row: BookingRow
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          date: string
          time: string
          duration?: number
          status?: BookingStatus
          observations?: string | null
          linked_lesson_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<{
          student_id: string
          teacher_id: string
          date: string
          time: string
          duration: number
          status: BookingStatus
          observations: string | null
          linked_lesson_id: string | null
        }>
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
