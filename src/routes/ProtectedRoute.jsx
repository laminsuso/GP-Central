import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) {
    sessionStorage.setItem('post_login_redirect', location.pathname + location.search)
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
