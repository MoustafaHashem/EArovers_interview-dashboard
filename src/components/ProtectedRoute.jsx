import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-brand-700">
        <Loader2 className="animate-spin" size={24} />
        <span>جارِ التحميل...</span>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (!profile.is_approved) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && profile.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  return children
}
