import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import type {
  BookingRow,
  EvaluationRow,
  LessonRow,
  StudentRow,
} from '@/lib/database'
import { supabase } from '@/lib/supabase'
import {
  EMPTY_TACTIC_SCENE,
  INITIAL_TACTIC_SCENE,
  type Booking,
  type BookingStatus,
  type Evaluation,
  type Lesson,
  type Student,
  type StudentStatus,
  type TacticBoard,
  type TacticScene,
} from '@/types'

interface NewStudent {
  name: string
  email?: string
}

interface StudentPatch {
  name?: string
  email?: string | null
  status?: StudentStatus
}

interface RecordLessonInput {
  studentId: string
  teacherId: string
  date: string
  observations?: string
  evaluations: Evaluation[]
}

interface NewBooking {
  studentId: string
  teacherId: string
  date: string
  time: string
  duration: number
  observations?: string
}

interface NewTacticBoard {
  title: string
  notes?: string
  scene?: TacticScene
}

interface TacticBoardPatch {
  title?: string
  notes?: string | null
  scene?: TacticScene
}

interface Result {
  error: string | null
}

interface TacticBoardCreateResult extends Result {
  id?: string
}

interface DataValue {
  students: Student[]
  lessons: Lesson[]
  bookings: Booking[]
  tacticBoards: TacticBoard[]
  loading: boolean
  error: string | null
  lessonsByStudent: (studentId: string) => Lesson[]
  refetch: () => Promise<void>
  createStudent: (input: NewStudent) => Promise<Result>
  updateStudent: (id: string, patch: StudentPatch) => Promise<Result>
  removeStudent: (id: string) => Promise<Result>
  recordLesson: (input: RecordLessonInput) => Promise<Result>
  createBooking: (input: NewBooking) => Promise<Result>
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<Result>
  removeBooking: (id: string) => Promise<Result>
  createTacticBoard: (input: NewTacticBoard) => Promise<TacticBoardCreateResult>
  updateTacticBoard: (id: string, patch: TacticBoardPatch) => Promise<Result>
  removeTacticBoard: (id: string) => Promise<Result>
}

const DataContext = createContext<DataValue | null>(null)

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    status: row.status,
    teacherId: row.teacher_id,
    linkedProfileId: row.linked_profile_id ?? undefined,
  }
}

function mapEvaluation(row: Pick<EvaluationRow, 'skill' | 'score' | 'comment'>): Evaluation {
  return {
    skill: row.skill,
    score: row.score,
    comment: row.comment ?? undefined,
  }
}

function mapLesson(
  row: LessonRow & { evaluations: Pick<EvaluationRow, 'skill' | 'score' | 'comment'>[] }
): Lesson {
  return {
    id: row.id,
    studentId: row.student_id,
    teacherId: row.teacher_id,
    date: row.date,
    observations: row.observations ?? undefined,
    evaluations: (row.evaluations ?? []).map(mapEvaluation),
  }
}

function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    studentId: row.student_id,
    teacherId: row.teacher_id,
    date: row.date,
    time: row.time,
    duration: row.duration,
    status: row.status,
    observations: row.observations ?? undefined,
  }
}

interface TacticBoardRow {
  id: string
  teacher_id: string
  title: string
  notes: string | null
  scene: TacticScene | null
  created_at: string
  updated_at: string
}

function mapTacticBoard(row: TacticBoardRow): TacticBoard {
  const rawScene = row.scene ?? EMPTY_TACTIC_SCENE
  return {
    id: row.id,
    teacherId: row.teacher_id,
    title: row.title,
    notes: row.notes ?? undefined,
    scene: {
      players: rawScene.players ?? [],
      arrows: rawScene.arrows ?? [],
      strokes: rawScene.strokes ?? [],
    },
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tacticBoards, setTacticBoards] = useState<TacticBoard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!profile) {
      setStudents([])
      setLessons([])
      setBookings([])
      setTacticBoards([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [studentsRes, lessonsRes, bookingsRes, boardsRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase
          .from('lessons')
          .select('*, evaluations(skill, score, comment)')
          .order('date'),
        supabase.from('bookings').select('*'),
        supabase.from('tactic_boards').select('*').order('updated_at', { ascending: false }),
      ])
      if (studentsRes.error) throw studentsRes.error
      if (lessonsRes.error) throw lessonsRes.error
      if (bookingsRes.error) throw bookingsRes.error
      if (boardsRes.error) throw boardsRes.error

      setStudents((studentsRes.data ?? []).map(mapStudent))
      setLessons(
        ((lessonsRes.data ?? []) as (LessonRow & {
          evaluations: Pick<EvaluationRow, 'skill' | 'score' | 'comment'>[]
        })[]).map(mapLesson)
      )
      setBookings((bookingsRes.data ?? []).map(mapBooking))
      setTacticBoards((boardsRes.data ?? []).map(mapTacticBoard))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load data'
      console.error('data fetch error', e)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    refetch()
  }, [refetch])

  const createStudent = useCallback(
    async (input: NewStudent): Promise<Result> => {
      if (!profile) return { error: 'Not authenticated' }
      const { data, error } = await supabase
        .from('students')
        .insert({
          teacher_id: profile.id,
          name: input.name.trim(),
          email: input.email?.trim() || null,
        })
        .select()
        .single()
      if (error) return { error: error.message }
      setStudents((prev) => [...prev, mapStudent(data)].sort((a, b) => a.name.localeCompare(b.name)))
      return { error: null }
    },
    [profile]
  )

  const updateStudent = useCallback(
    async (id: string, patch: StudentPatch): Promise<Result> => {
      const { data, error } = await supabase
        .from('students')
        .update({
          ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
          ...(patch.email !== undefined ? { email: patch.email?.trim() || null } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) return { error: error.message }
      setStudents((prev) =>
        prev
          .map((s) => (s.id === id ? mapStudent(data) : s))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      return { error: null }
    },
    []
  )

  const removeStudent = useCallback(async (id: string): Promise<Result> => {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) return { error: error.message }
    setStudents((prev) => prev.filter((s) => s.id !== id))
    setLessons((prev) => prev.filter((l) => l.studentId !== id))
    setBookings((prev) => prev.filter((b) => b.studentId !== id))
    return { error: null }
  }, [])

  const recordLesson = useCallback(
    async (input: RecordLessonInput): Promise<Result> => {
      const { data: lessonRow, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          student_id: input.studentId,
          teacher_id: input.teacherId,
          date: input.date,
          observations: input.observations ?? null,
        })
        .select()
        .single()
      if (lessonError) return { error: lessonError.message }

      const evalRows = input.evaluations.map((e) => ({
        lesson_id: lessonRow.id,
        skill: e.skill,
        score: e.score,
        comment: e.comment ?? null,
      }))
      const { error: evalError } = await supabase.from('evaluations').insert(evalRows)
      if (evalError) {
        await supabase.from('lessons').delete().eq('id', lessonRow.id)
        return { error: evalError.message }
      }

      setLessons((prev) =>
        [...prev, mapLesson({ ...lessonRow, evaluations: evalRows.map(r => ({
          skill: r.skill, score: r.score, comment: r.comment
        })) })]
          .sort((a, b) => a.date.localeCompare(b.date))
      )
      return { error: null }
    },
    []
  )

  const createBooking = useCallback(
    async (input: NewBooking): Promise<Result> => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: input.studentId,
          teacher_id: input.teacherId,
          date: input.date,
          time: input.time,
          duration: input.duration,
          observations: input.observations ?? null,
        })
        .select()
        .single()
      if (error) return { error: error.message }
      setBookings((prev) => [...prev, mapBooking(data)])
      return { error: null }
    },
    []
  )

  const updateBookingStatus = useCallback(
    async (id: string, status: BookingStatus): Promise<Result> => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
      if (error) return { error: error.message }
      setBookings((prev) => prev.map((b) => (b.id === id ? mapBooking(data) : b)))
      return { error: null }
    },
    []
  )

  const removeBooking = useCallback(async (id: string): Promise<Result> => {
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) return { error: error.message }
    setBookings((prev) => prev.filter((b) => b.id !== id))
    return { error: null }
  }, [])

  const createTacticBoard = useCallback(
    async (input: NewTacticBoard): Promise<TacticBoardCreateResult> => {
      if (!profile) return { error: 'Not authenticated' }
      const { data, error } = await supabase
        .from('tactic_boards')
        .insert({
          teacher_id: profile.id,
          title: input.title.trim(),
          notes: input.notes?.trim() || null,
          scene: input.scene ?? INITIAL_TACTIC_SCENE,
        })
        .select()
        .single()
      if (error) return { error: error.message }
      const board = mapTacticBoard(data as TacticBoardRow)
      setTacticBoards((prev) => [board, ...prev])
      return { error: null, id: board.id }
    },
    [profile]
  )

  const updateTacticBoard = useCallback(
    async (id: string, patch: TacticBoardPatch): Promise<Result> => {
      const { data, error } = await supabase
        .from('tactic_boards')
        .update({
          ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
          ...(patch.notes !== undefined
            ? { notes: patch.notes ? patch.notes.trim() : null }
            : {}),
          ...(patch.scene !== undefined ? { scene: patch.scene } : {}),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) return { error: error.message }
      const board = mapTacticBoard(data as TacticBoardRow)
      setTacticBoards((prev) => {
        const next = prev.map((b) => (b.id === id ? board : b))
        return [...next].sort((a, b) => a.title.localeCompare(b.title))
      })
      return { error: null }
    },
    []
  )

  const removeTacticBoard = useCallback(async (id: string): Promise<Result> => {
    const { error } = await supabase.from('tactic_boards').delete().eq('id', id)
    if (error) return { error: error.message }
    setTacticBoards((prev) => prev.filter((b) => b.id !== id))
    return { error: null }
  }, [])

  const value = useMemo<DataValue>(
    () => ({
      students,
      lessons,
      bookings,
      tacticBoards,
      loading,
      error,
      lessonsByStudent: (studentId) =>
        lessons
          .filter((l) => l.studentId === studentId)
          .sort((a, b) => a.date.localeCompare(b.date)),
      refetch,
      createStudent,
      updateStudent,
      removeStudent,
      recordLesson,
      createBooking,
      updateBookingStatus,
      removeBooking,
      createTacticBoard,
      updateTacticBoard,
      removeTacticBoard,
    }),
    [
      students,
      lessons,
      bookings,
      tacticBoards,
      loading,
      error,
      refetch,
      createStudent,
      updateStudent,
      removeStudent,
      recordLesson,
      createBooking,
      updateBookingStatus,
      removeBooking,
      createTacticBoard,
      updateTacticBoard,
      removeTacticBoard,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
