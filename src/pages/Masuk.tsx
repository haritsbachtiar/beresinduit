import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Masuk() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const err = await signIn(email, password)
    if (err) {
      setError(err)
      setLoading(false)
      return
    }

    navigate('/beranda', { replace: true })
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 dark:bg-dark-base bg-light-base">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-dark-text text-light-text">
            Beresin<span className="text-accent">Duit</span>
          </h1>
          <p className="mt-1 text-sm dark:text-dark-muted text-light-muted font-semibold">
            Kelola keuangan kamu dengan mudah
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-6 flex flex-col gap-5">
          <h2 className="text-lg font-extrabold dark:text-dark-text text-light-text">
            Masuk
          </h2>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold dark:text-dark-muted text-light-muted uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                required
                autoComplete="email"
                className="rounded-xl px-3.5 py-3 text-sm font-semibold dark:bg-dark-surface bg-light-surface dark:text-dark-text text-light-text dark:border-dark-border border-light-border border outline-none focus:border-accent transition-colors placeholder:dark:text-dark-muted placeholder:text-light-muted"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold dark:text-dark-muted text-light-muted uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl px-3.5 py-3 pr-11 text-sm font-semibold dark:bg-dark-surface bg-light-surface dark:text-dark-text text-light-text dark:border-dark-border border-light-border border outline-none focus:border-accent transition-colors placeholder:dark:text-dark-muted placeholder:text-light-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-dark-muted text-light-muted hover:text-accent transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-bold text-white bg-accent hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm dark:text-dark-muted text-light-muted font-semibold">
          Belum punya akun?{' '}
          <Link to="/daftar" className="text-accent hover:underline font-bold">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
