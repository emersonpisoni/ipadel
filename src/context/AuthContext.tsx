import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import i18n from '@/i18n'
import type { ProfileRow } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types'

export type Profile = ProfileRow

interface SignUpInput {
  email: string
  password: string
  name: string
  role: Role
}

interface AuthValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) {
    console.error('profile fetch error', error)
    return null
  }
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user) {
        const p = await fetchProfile(data.session.user.id)
        if (mounted) setProfile(p)
      }
      if (mounted) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      // Defer DB query to avoid deadlock with Supabase auth lock
      setTimeout(() => {
        if (!mounted) return
        if (newSession?.user) {
          fetchProfile(newSession.user.id).then((p) => {
            if (mounted) setProfile(p)
          })
        } else {
          setProfile(null)
        }
      }, 0)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (profile?.preferred_language) {
      i18n.changeLanguage(profile.preferred_language)
    }
  }, [profile?.preferred_language])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      signUp: async ({ email, password, name, role }) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, role },
            emailRedirectTo: `${window.location.origin}/`,
          },
        })
        return { error: error?.message ?? null }
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        })
        return { error: error?.message ?? null }
      },
      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password })
        return { error: error?.message ?? null }
      },
      refreshProfile: async () => {
        if (session?.user) {
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        }
      },
    }),
    [session, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
