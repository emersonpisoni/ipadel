import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Dumbbell,
  Home,
  Menu,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/teacher', labelKey: 'nav.overview', icon: Home, end: true },
  { to: '/teacher/students', labelKey: 'nav.students', icon: Users },
  { to: '/teacher/schedule', labelKey: 'nav.schedule', icon: Calendar },
  { to: '/teacher/evaluations', labelKey: 'nav.evaluations', icon: ClipboardList },
  { to: '/teacher/drills', labelKey: 'nav.drills', icon: Dumbbell },
  { to: '/teacher/finance', labelKey: 'nav.finance', icon: Wallet },
  { to: '/teacher/reports', labelKey: 'nav.reports', icon: BarChart3 },
  { to: '/teacher/settings', labelKey: 'nav.settings', icon: Settings },
]

interface NavListProps {
  onNavigate?: () => void
}

function NavList({ onNavigate }: NavListProps) {
  const { t } = useTranslation()
  return (
    <nav className="space-y-1 p-3">
      {navItems.map(({ to, labelKey, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )
          }
        >
          <Icon className="size-4" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}

export default function TeacherShell() {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="flex items-center gap-2 border-b px-3 py-2 lg:hidden">
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="border-b p-3 text-left">
              <SheetTitle>{t('appName')}</SheetTitle>
            </SheetHeader>
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-60 shrink-0 border-r bg-muted/20 lg:block">
        <NavList />
      </aside>

      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
