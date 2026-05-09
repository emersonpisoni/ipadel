import { useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, FileText, type LucideProps, TrendingUp } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
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

function LoginForm() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const { teachers, students } = useData()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('teacher')
  const [userId, setUserId] = useState(teachers[0]?.id ?? '')

  const list = role === 'teacher' ? teachers : students

  const handleRole = (next: Role) => {
    setRole(next)
    const first = (next === 'teacher' ? teachers : students)[0]?.id ?? ''
    setUserId(first)
  }

  const handleSignIn = () => {
    if (!userId) return
    signIn(role, userId)
    navigate(role === 'teacher' ? '/teacher' : '/student')
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
        <CardDescription>{t('auth.loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>{t('auth.role')}</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              variant={role === 'teacher' ? 'default' : 'outline'}
              onClick={() => handleRole('teacher')}
            >
              {t('roles.teacher')}
            </Button>
            <Button
              type="button"
              className="flex-1"
              variant={role === 'student' ? 'default' : 'outline'}
              onClick={() => handleRole('student')}
            >
              {t('roles.student')}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user">{t('auth.user')}</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger id="user" className="w-full">
              <SelectValue placeholder={t('auth.selectUser')} />
            </SelectTrigger>
            <SelectContent>
              {list.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="h-11 w-full text-base" onClick={handleSignIn} disabled={!userId}>
          {t('auth.signIn')}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function Login() {
  const { t } = useTranslation()

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
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
