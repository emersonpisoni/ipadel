import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role, Session } from '../types'

interface AuthValue {
  session: Session | null
  signIn: (role: Role, userId: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  const value = useMemo<AuthValue>(
    () => ({
      session,
      signIn: (role, userId) => setSession({ role, userId }),
      signOut: () => setSession(null),
    }),
    [session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
