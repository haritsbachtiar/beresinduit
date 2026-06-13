import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Daftar() {
  const { signUp } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    const err = await signUp(email, password, fullName.trim())
    setLoading(false)

    if (err) {
      setError(err)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 dark:bg-dark-base bg-light-base">
        <div className="w-full max-w-sm rounded-2xl dark:bg-dark-card bg-light-card border dark:border-dark-border border-light-border p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-accent" />
          </div>
          <h2 className="text-xl font-extrabold dark:text-dark-text text-light-text">
            Akun berhasil dibuat!
          </h2>
          <p className="text-sm dark:text-dark-muted text-light-muted font-semibold leading-relaxed">
            Cek inbox email kamu dan klik link konfirmasi untuk mengaktifkan akun.
          </p>
          <Link
            to="/masuk"
            className="mt-2 w-full flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white bg-accent hover:bg-accent-dark transition-colors"
          >
            Ke halaman masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 dark:bg-dark-base bg-light-base">
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
            Buat Akun
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
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmad Harits"
                required
                autoComplete="name"
                className="rounded-xl px-3.5 py-3 text-sm font-semibold dark:bg-dark-surface bg-light-surface dark:text-dark-text text-light-text dark:border-dark-border border-light-border border outline-none focus:border-accent transition-colors placeholder:dark:text-dark-muted placeholder:text-light-muted"
              />
            </div>

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
                  placeholder="Min. 6 karakter"
                  required
                  autoComplete="new-password"
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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold dark:text-dark-muted text-light-muted uppercase tracking-wide">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl px-3.5 py-3 pr-11 text-sm font-semibold dark:bg-dark-surface bg-light-surface dark:text-dark-text text-light-text dark:border-dark-border border-light-border border outline-none focus:border-accent transition-colors placeholder:dark:text-dark-muted placeholder:text-light-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-dark-muted text-light-muted hover:text-accent transition-colors"
                  aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-bold text-white bg-accent hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm dark:text-dark-muted text-light-muted font-semibold">
          Sudah punya akun?{' '}
          <Link to="/masuk" className="text-accent hover:underline font-bold">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
