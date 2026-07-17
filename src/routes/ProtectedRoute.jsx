import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

const dashboardPaths = {
  candidate: '/candidate/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPaths[user.role] ?? '/login'} replace />
  }

  return children
}
