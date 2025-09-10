import React, { useState, useRef, useEffect } from 'react'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { useI18n } from '../contexts/I18nContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'
import { identityApi } from '../services/identityApi'

export default function IdentityPage(){
  const { t } = useI18n()
  const { fetchMe } = useAuth()

  const [status, setStatus] = useState('not_started') // not_started | started | uploaded | pending_review | verified | rejected
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const listRef = useRef(null)

  // ---- Helpers ----------------------------------------------------

  const withUi = async (fn) => {
    setLoading(true); setError(''); setOk('')
    try { await fn() } catch (e) {
      console.error('[identity] error:', e)
      setError(e?.response?.data?.message || e?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  // ---- Backend calls ----------------------------------------------

  const start = async () => withUi(async () => {
    console.log('[identity] POST /identity-start …')
    const { data } = await identityApi.post('/identity-start')
    console.log('[identity] start response:', data)
    setStatus(data?.status || 'started')
    setOk('Verification started.')
  })

  const upload = async () => withUi(async () => {
    if (!file) throw new Error('Please choose a file')
    const fd = new FormData()
    fd.append('document', file)
    console.log('[identity] POST /identity-upload (multipart)')
    const { data } = await identityApi.post('/identity-upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    console.log('[identity] upload response:', data)
    setStatus(data?.status || 'uploaded')
    setOk('Document uploaded.')
  })

  const submit = async () => withUi(async () => {
    console.log('[identity] POST /identity-submit …')
    const { data } = await identityApi.post('/identity-submit')
    console.log('[identity] submit response:', data)
    setStatus(data?.status || 'pending_review')
    setOk('Submitted for review.')
    // Immediately check persisted status (will flip to verified later when webhook runs)
    await checkStatus()
  })

  const checkStatus = async () => withUi(async () => {
    console.log('[identity] GET /identity-status …')
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${import.meta.env.VITE_SB_FUNCTIONS_BASE}/identity-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`
      }
    })
    const out = await res.json()
    console.log('[identity] status response:', out)
    if (!res.ok) throw new Error(out?.error || 'Status check failed')
    // prefer provider session status; fall back to profile flag
    const next = out?.status || (out?.identity_verified ? 'verified' : status)
    setStatus(next)
    if (out?.identity_verified) {
      await fetchMe()
      setOk('Identity verified. Thank you!')
    }
  })

  // ---- UI handlers ------------------------------------------------

  const onFileChange = async (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setOk(''); setError('')
    // If user picks a file before pressing Start, try to start automatically (dev-friendly)
    if (f && status === 'not_started') {
      try { await start() } catch(_) { setStatus('started') } // soft fallback so Upload is enabled
    }
  }

  const canUpload = !!file && ['started','uploaded','needs_document','reupload_requested'].includes(status)
  const canSubmit = ['uploaded'].includes(status)

  // Smooth scroll new messages (optional)
  useEffect(() => { listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight }) }, [status])

  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>
          {t('verifyIdentity') || 'Verify identity'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload a government ID and submit for review. We’ll notify you in the app and by email.
        </p>

        <Card className="mt-4">
          <CardBody>
            <ol ref={listRef} className="space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full brand-bg grid place-content-center text-white">1</span>
                <div>
                  <p className="font-semibold">Start verification</p>
                  <p>We’ll create a verification session.</p>
                  <Button className="mt-2" onClick={start} disabled={loading || status === 'started' || status === 'uploaded' || status === 'pending_review' || status === 'verified'}>
                    {loading ? 'Please wait…' : 'Start'}
                  </Button>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full brand-bg grid place-content-center text-white">2</span>
                <div>
                  <p className="font-semibold">Upload ID</p>
                  <p>Upload a passport or national ID (front/back if applicable).</p>
                  <input type="file" accept="image/*,application/pdf" onChange={onFileChange} className="mt-2" />
                  <Button className="mt-2" onClick={upload} disabled={loading || !canUpload}>
                    Upload
                  </Button>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full brand-bg grid place-content-center text-white">3</span>
                <div>
                  <p className="font-semibold">Submit for review</p>
                  <p>We’ll verify document authenticity and selfie match (if required).</p>
                  <Button className="mt-2" onClick={submit} disabled={loading || !canSubmit}>
                    Submit
                  </Button>
                </div>
              </li>
            </ol>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium brand-text">
                Status
              </span>
              <span className="text-gray-700">{status}</span>
              <Button variant="secondary" onClick={checkStatus} disabled={loading}>
                Refresh status
              </Button>
            </div>

            {ok && <p className="mt-3 text-sm text-emerald-600">{ok}</p>}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </CardBody>
        </Card>

        <p className="text-xs text-gray-500 mt-3">
          For identity, payments, and tracking, keep all communications and transactions within GP Central.
        </p>
      </div>
    </section>
  )
}
