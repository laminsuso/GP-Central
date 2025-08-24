import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'

export default function AccountPage(){
  const { logout, user } = useAuth()

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>Account</h2>

        <Card><CardBody>
          <p className="text-gray-700 mb-2"><strong>Name:</strong> {user?.name || '—'}</p>
          <p className="text-gray-700 mb-2"><strong>Roles:</strong> {Array.isArray(user?.roles) ? user.roles.join(', ') : '—'}</p>
          <p className="text-gray-700 mb-4"><strong>Identity verified:</strong> {user?.identityVerified ? 'Yes' : 'No'}</p>

          <div className="flex gap-3">
            <Button onClick={logout}>Logout</Button>
            <Button as={Link} to="/verify-identity" variant="secondary">Go to identity</Button>
          </div>
        </CardBody></Card>
      </div>
    </section>
  )
}
