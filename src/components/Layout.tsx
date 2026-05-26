import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export default function Layout() {
  const { t } = useTranslation()
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link to={profile ? (profile.role === 'teacher' ? '/teacher' : '/student') : '/'}>
            <h1 className="text-lg font-semibold tracking-tight">{t('appName')}</h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {profile && (
              <span className="hidden text-sm text-muted-foreground md:inline">
                {profile.name} · {t(`roles.${profile.role}`)}
              </span>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            {profile && (
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
