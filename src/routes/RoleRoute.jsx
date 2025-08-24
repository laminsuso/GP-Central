import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'

export default function RoleRoute({ roles = [], requireIdentity = false, children }) {
  const { user } = useAuth()
  const { t } = useI18n()
  if (!user) return <div className="mx-auto max-w-md p-8"><p className="text-gray-700">{t('accessDenied')}</p></div>
  const hasRole = Array.isArray(user.roles) && user.roles.some(r => roles.includes(r))
  if (!hasRole) return <div className="mx-auto max-w-md p-8"><p className="text-gray-700">{t('accessDenied')}</p></div>
  if (requireIdentity && !user.identityVerified) return <Navigate to="/verify-identity" replace />
  return <>{children}</>
}
