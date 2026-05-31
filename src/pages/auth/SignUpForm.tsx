import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'
import { translateAuthError } from './auth-utils'

export default function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('teacher')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signUp({ email, password, name, role })
    setLoading(false)
    if (error) {
      setError(translateAuthError(error, t))
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-6 text-sm text-emerald-300">
          {t('auth.signUpSuccess')}
        </div>
        <Button variant="outline" onClick={onSwitch} className="w-full">
          {t('auth.signIn')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('auth.role')}</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            variant={role === 'teacher' ? 'default' : 'outline'}
            onClick={() => setRole('teacher')}
          >
            {t('roles.teacher')}
          </Button>
          <Button
            type="button"
            className="flex-1"
            variant={role === 'student' ? 'default' : 'outline'}
            onClick={() => setRole('student')}
          >
            {t('roles.student')}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-name">{t('auth.name')}</Label>
        <Input
          id="signup-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('auth.namePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">{t('auth.email')}</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">{t('auth.password')}</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="h-11 w-full text-base" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        {loading ? t('auth.signingUp') : t('auth.signUp')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.haveAccount')}{' '}
        <button
          type="button"
          className="font-medium text-foreground underline-offset-2 hover:underline"
          onClick={onSwitch}
        >
          {t('auth.signIn')}
        </button>
      </p>
    </form>
  )
}
