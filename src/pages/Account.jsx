// src/pages/Account.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function AccountPage(){
  const { logout, user, fetchMe } = useAuth()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const updateRole = (role) => async () => {
    if (!user) return
    setBusy(true); setMsg(''); setErr('')
    try{
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', user.id)
      if (error) throw error
      await fetchMe()
      setMsg(`Role updated to ${role}`)
    }catch(e){
      setErr(e.message || 'Failed to update role')
    }finally{
      setBusy(false)
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>Account</h2>
        <Card><CardBody>
          <p className="text-gray-700 mb-2"><strong>Name:</strong> {user?.name || '—'}</p>
          <p className="text-gray-700 mb-2"><strong>Email:</strong> {user?.email || '—'}</p>
          <p className="text-gray-700 mb-2"><strong>Roles:</strong> {Array.isArray(user?.roles) ? user.roles.join(', ') : '—'}</p>
          <p className="text-gray-700 mb-4"><strong>Identity verified:</strong> {user?.identityVerified ? 'Yes' : 'No'}</p>

          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/profile" variant="secondary">My Profile</Button>
            <Button as={Link} to="/verify-identity" variant="secondary">Verify identity</Button>
            <Button as={Link} to="/requests" variant="secondary">My Requests</Button>
            <Button onClick={updateRole('traveler')} disabled={busy}>Become traveler</Button>
            <Button onClick={updateRole('both')} variant="secondary" disabled={busy}>Become both</Button>
            <Button onClick={logout} variant="secondary">Logout</Button>
          </div>

          {msg && <p className="text-sm text-emerald-600 mt-3">{msg}</p>}
          {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
        </CardBody></Card>
      </div>
    </section>
  )
}
