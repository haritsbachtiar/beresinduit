import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PublicRoute } from './components/PublicRoute'
import { OnboardingRoute } from './components/OnboardingRoute'
import { Layout } from './components/Layout'
import { Masuk } from './pages/Masuk'
import { Daftar } from './pages/Daftar'
import { Beranda } from './pages/Beranda'
import { Transaksi } from './pages/Transaksi'
import { Anggaran } from './pages/Anggaran'
import { Profil } from './pages/Profil'
import { Onboarding } from './pages/Onboarding'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Halaman publik — redirect ke /onboarding atau /beranda jika sudah login */}
          <Route element={<PublicRoute />}>
            <Route path="/masuk" element={<Masuk />} />
            <Route path="/daftar" element={<Daftar />} />
          </Route>

          {/* Onboarding — tanpa Layout, redirect ke /beranda jika sudah selesai */}
          <Route element={<OnboardingRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Halaman yang butuh login */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/beranda" replace />} />
              <Route path="beranda" element={<Beranda />} />
              <Route path="transaksi" element={<Transaksi />} />
              <Route path="anggaran" element={<Anggaran />} />
              <Route path="profil" element={<Profil />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
