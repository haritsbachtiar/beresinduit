import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type MenuItemProps = {
  icon: ReactNode
  label: string
  onClick?: () => void
  danger?: boolean
}

function MenuItem({ icon, label, onClick, danger = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-3 w-full px-4 py-3.5 text-left transition-colors',
        danger
          ? 'text-red-400 hover:dark:bg-red-500/10 hover:bg-red-50'
          : 'dark:text-dark-text text-light-text hover:dark:bg-dark-surface hover:bg-light-surface',
      ].join(' ')}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight size={16} className="dark:text-dark-muted text-light-muted" />
    </button>
  )
}

export function Profil() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const rawName = user?.user_metadata?.['full_name']
  const displayName = typeof rawName === 'string' && rawName ? rawName : 'Pengguna'
  const email = user?.email ?? '—'
  const initial = displayName.charAt(0).toUpperCase()

  async function handleSignOut() {
    await signOut()
    navigate('/masuk', { replace: true })
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-extrabold">Profil</h1>

      <div className="rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          {initial !== 'P' || displayName !== 'Pengguna' ? (
            <span className="text-xl font-extrabold text-accent">{initial}</span>
          ) : (
            <User size={28} className="text-accent" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-base truncate">{displayName}</p>
          <p className="text-sm dark:text-dark-muted text-light-muted truncate">
            {email}
          </p>
        </div>
      </div>

      <div className="rounded-xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border overflow-hidden divide-y dark:divide-dark-border divide-light-border">
        <MenuItem
          icon={<LogOut size={18} />}
          label="Keluar"
          danger
          onClick={() => void handleSignOut()}
        />
      </div>
    </div>
  )
}
