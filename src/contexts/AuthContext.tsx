import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthState = {
  user: User | null
  session: Session | null
  loading: boolean
}

type AuthActions = {
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, fullName: string) => Promise<string | null>
  signOut: () => Promise<void>
}

type AuthContextValue = AuthState & AuthActions

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return translateAuthError(error.message)
    return null
  }

  async function signUp(email: string, password: string, fullName: string): Promise<string | null> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return translateAuthError(error.message)
    return null
  }

  async function signOut(): Promise<void> {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return ctx
}

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email atau password salah.'
  if (message.includes('Email not confirmed')) return 'Email belum dikonfirmasi. Cek inbox kamu.'
  if (message.includes('User already registered')) return 'Email sudah terdaftar. Silakan masuk.'
  if (message.includes('Password should be at least')) return 'Password minimal 6 karakter.'
  if (message.includes('email_address_invalid') || message.includes('is invalid') || message.includes('Unable to validate email')) return 'Alamat email tidak valid. Gunakan email yang aktif (misal: gmail.com, yahoo.com).'
  if (message.includes('rate limit')) return 'Terlalu banyak percobaan. Coba lagi nanti.'
  if (message.includes('signup_disabled')) return 'Pendaftaran sementara dinonaktifkan.'
  return 'Terjadi kesalahan. Silakan coba lagi.'
}
