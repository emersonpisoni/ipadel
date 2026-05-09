import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  initialBookings,
  initialLessons,
  students as studentsMock,
  teachers,
} from '../data/mock'
import type {
  Booking,
  BookingStatus,
  Evaluation,
  Lesson,
  Student,
  Teacher,
} from '../types'

interface NewBooking {
  studentId: string
  teacherId: string
  date: string
  time: string
  duration: number
  observations?: string
}

interface DataValue {
  teachers: Teacher[]
  students: Student[]
  lessons: Lesson[]
  bookings: Booking[]
  lessonsByStudent: (studentId: string) => Lesson[]
  studentsByTeacher: (teacherId: string) => Student[]
  bookingsByTeacher: (teacherId: string) => Booking[]
  recordLesson: (input: {
    studentId: string
    teacherId: string
    date: string
    observations?: string
    evaluations: Evaluation[]
  }) => void
  createBooking: (input: NewBooking) => void
  updateBookingStatus: (id: string, status: BookingStatus) => void
  removeBooking: (id: string) => void
}

const DataContext = createContext<DataValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)

  const value = useMemo<DataValue>(
    () => ({
      teachers,
      students: studentsMock,
      lessons,
      bookings,
      lessonsByStudent: (studentId) =>
        lessons
          .filter((l) => l.studentId === studentId)
          .sort((a, b) => a.date.localeCompare(b.date)),
      studentsByTeacher: (teacherId) =>
        studentsMock.filter((s) => s.teacherId === teacherId),
      bookingsByTeacher: (teacherId) =>
        bookings.filter((b) => b.teacherId === teacherId),
      recordLesson: (input) => {
        setLessons((prev) => [...prev, { id: `au_${Date.now()}`, ...input }])
      },
      createBooking: (input) => {
        setBookings((prev) => [
          ...prev,
          { id: `ag_${Date.now()}`, status: 'scheduled', ...input },
        ])
      },
      updateBookingStatus: (id, status) => {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        )
      },
      removeBooking: (id) => {
        setBookings((prev) => prev.filter((b) => b.id !== id))
      },
    }),
    [lessons, bookings]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
