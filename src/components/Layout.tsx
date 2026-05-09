import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'

export default function Layout() {
  const { t } = useTranslation()
  const { session, signOut } = useAuth()
  const { students, teachers } = useData()
  const navigate = useNavigate()

  const name = session
    ? session.role === 'teacher'
      ? teachers.find((p) => p.id === session.userId)?.name
      : students.find((s) => s.id === session.userId)?.name
    : null

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link to={session ? (session.role === 'teacher' ? '/teacher' : '/student') : '/'}>
            <h1 className="text-lg font-semibold tracking-tight">{t('appName')}</h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {session && (
              <span className="hidden text-sm text-muted-foreground md:inline">
                {name} · {t(`roles.${session.role}`)}
              </span>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            {session && (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                {t('auth.signOut')}
              </Button>
            )}
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <Outlet />
      </div>
    </div>
  )
}
