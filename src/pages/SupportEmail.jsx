import React, { useState } from 'react'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function SupportEmailPage(){
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [ok, setOk] = useState('')
  const [err, setErr] = useState('')

const onSubmit = async (e) => {
  e.preventDefault()
  setBusy(true); setOk(''); setErr('')

  try {
    // Pick the correct base URL
    let base;
    if (import.meta.env.DEV) {
      // when running locally with `supabase start`
      base = 'http://localhost:54321/functions/v1'
    } else if (import.meta.env.VITE_SB_FUNCTIONS_BASE) {
      // production: from your .env.local
      base = import.meta.env.VITE_SB_FUNCTIONS_BASE
    } else {
      // derive from VITE_SUPABASE_URL if you didn’t set VITE_SB_FUNCTIONS_BASE
      const m = (import.meta.env.VITE_SUPABASE_URL || '').match(/^https:\/\/([^.]+)\.supabase\.co$/)
      if (!m) throw new Error('Unable to derive Functions URL. Set VITE_SB_FUNCTIONS_BASE in your env.')
      base = `https://${m[1]}.functions.supabase.co`
    }

    // Call the function — no auth header needed (we deployed with --no-verify-jwt)
    const res = await fetch(`${base}/send-support-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, subject, message,
        user_id: user?.id || null
      }),
    })

    // Read the body safely
    const text = await res.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { /* ignore parse errors */ }

    if (!res.ok || (data && data.ok === false)) {
      throw new Error((data && data.error) || text || `HTTP ${res.status}`)
    }

    setOk('Message sent! We will reply to your email.')
    setMessage('')
  } catch (e) {
    console.error('[support email] error', e)
    setErr(e.message || 'Failed to send')
  } finally {
    setBusy(false)
  }
}
}
