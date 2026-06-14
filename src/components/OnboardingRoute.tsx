import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingScreen } from './LoadingScreen'

export function OnboardingRoute() {
  const { user, loading, profile, profileLoading } = useAuth()
  if (loading || (user && profileLoading)) return <LoadingScreen />
  if (!user) return <Navigate to="/masuk" replace />
  if (profile?.onboarding_completed) return <Navigate to="/beranda" replace />
  return <Outlet />
}
