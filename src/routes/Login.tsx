import { useState, type ComponentType, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  FileText,
  Loader2,
  type LucideProps,
  TrendingUp,
} from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'

interface FeatureRowProps {
  icon: ComponentType<LucideProps>
  title: string
  description: string
}

function FeatureRow({ icon: Icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
        <Icon className="size-5" />
      </div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

function translateAuthError(message: string | null, t: (k: string) => string): string | null {
  if (!message) return null
  const lower = message.toLowerCase()
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return t('auth.errors.invalidCredentials')
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return t('auth.errors.userExists')
  }
  if (lower.includes('password should be') || lower.includes('weak')) {
    return t('auth.errors.weakPassword')
  }
  return message
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(translateAuthError(error, t))
      return
    }
    navigate('/')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <button
              type="button"
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              onClick={() => setResetOpen(true)}
            >
              {t('auth.forgotPassword')}
            </button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
          {loading ? t('auth.signingIn') : t('auth.signIn')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            className="font-medium text-foreground underline-offset-2 hover:underline"
            onClick={onSwitch}
          >
            {t('auth.signUp')}
          </button>
        </p>
      </form>

      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} />
    </>
  )
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
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

function ResetPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setSent(true)
  }

  const close = () => {
    onOpenChange(false)
    setTimeout(() => {
      setSent(false)
      setEmail('')
      setError(null)
    }, 200)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (o ? onOpenChange(o) : close())}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.resetPasswordTitle')}</DialogTitle>
          <DialogDescription>{t('auth.resetPasswordDescription')}</DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
            {t('auth.resetEmailSent')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">{t('auth.email')}</Label>
              <Input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {t('auth.sendResetLink')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function Login() {
  const { t } = useTranslation()
  const [view, setView] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="relative grid min-h-screen w-full lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 lg:right-6 lg:top-6">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-emerald-500/10 via-background to-cyan-500/10" />
        <div className="absolute -left-32 -top-32 -z-10 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 -z-10 size-96 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="text-3xl font-bold tracking-tight">{t('appName')}</div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              {t('login.headline')}
            </h2>
            <p className="max-w-md text-pretty text-lg text-muted-foreground">
              {t('login.subheadline')}
            </p>
          </div>

          <div className="space-y-5">
            <FeatureRow
              icon={TrendingUp}
              title={t('login.features.evaluation.title')}
              description={t('login.features.evaluation.description')}
            />
            <FeatureRow
              icon={CalendarDays}
              title={t('login.features.schedule.title')}
              description={t('login.features.schedule.description')}
            />
            <FeatureRow
              icon={FileText}
              title={t('login.features.reports.title')}
              description={t('login.features.reports.description')}
            />
          </div>
        </div>

        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {t('login.tagline')}
        </div>
      </aside>

      <div className="flex items-center justify-center px-6 py-12 lg:p-12">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {view === 'signin' ? t('auth.loginTitle') : t('auth.signUpTitle')}
            </CardTitle>
            <CardDescription>
              {view === 'signin'
                ? t('auth.loginDescription')
                : t('auth.signUpDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === 'signin' ? (
              <SignInForm onSwitch={() => setView('signup')} />
            ) : (
              <SignUpForm onSwitch={() => setView('signin')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
