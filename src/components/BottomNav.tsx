import { NavLink } from 'react-router-dom'
import { Home, ArrowLeftRight, PieChart, User } from 'lucide-react'

type NavItem = {
  path: string
  label: string
  Icon: typeof Home
}

const navItems: NavItem[] = [
  { path: '/beranda', label: 'Beranda', Icon: Home },
  { path: '/transaksi', label: 'Transaksi', Icon: ArrowLeftRight },
  { path: '/anggaran', label: 'Anggaran', Icon: PieChart },
  { path: '/profil', label: 'Profil', Icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 dark:bg-dark-surface bg-light-card border-t dark:border-dark-border border-light-border">
      <div className="max-w-md mx-auto flex items-stretch">
        {navItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-1 flex-1 py-3 text-xs font-semibold transition-colors',
                isActive
                  ? 'text-accent'
                  : 'dark:text-dark-muted text-light-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
