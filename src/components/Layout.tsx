import { Outlet } from 'react-router-dom'
import { Sun, Moon, Plus } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { TransaksiForm } from './TransaksiForm'
import { FormProvider, useForm } from '../contexts/FormContext'
import { useTheme } from '../hooks/useTheme'

function LayoutContent() {
  const { theme, toggleTheme } = useTheme()
  const { isOpen, openForm, closeForm } = useForm()

  return (
    <div className="min-h-dvh flex flex-col dark:bg-dark-base bg-light-base dark:text-dark-text text-light-text font-sans">
      <header className="sticky top-0 z-40 dark:bg-dark-surface bg-light-card border-b dark:border-dark-border border-light-border">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          <span className="text-xl font-extrabold tracking-tight">
            Beresin<span className="text-accent">Duit</span>
          </span>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="p-2 rounded-xl dark:bg-dark-card bg-light-surface dark:text-dark-muted text-light-muted hover:text-accent transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-4 pb-24">
        <Outlet />
      </main>

      <button
        onClick={openForm}
        aria-label="Tambah transaksi baru"
        className="fixed bottom-[76px] right-4 z-40 w-14 h-14 rounded-full bg-accent hover:bg-accent-dark shadow-lg shadow-accent/30 flex items-center justify-center transition-all duration-200 active:scale-90"
      >
        <Plus size={26} strokeWidth={2.5} className="text-white" />
      </button>

      <BottomNav />

      <TransaksiForm isOpen={isOpen} onClose={closeForm} />
    </div>
  )
}

export function Layout() {
  return (
    <FormProvider>
      <LayoutContent />
    </FormProvider>
  )
}
