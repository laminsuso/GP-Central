import React, { useState } from 'react'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function IdentityPage(){
  const { fetchMe } = useAuth()
  const [status, setStatus] = useState('not_started')
  const [file, setFile] = useState(null)
  const [emailCode, setEmailCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [loading, setLoading] = useState(false)

  const start = async ()=>{
    setLoading(true)
    try { await api.post('/identity/start'); setStatus('started') }
    finally { setLoading(false) }
  }

  const upload = async ()=>{
    if (!file) return alert('Please choose a file')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('document', file)
      await api.post('/identity/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStatus('uploaded')
    } finally { setLoading(false) }
  }

  const submit = async ()=>{
    setLoading(true)
    try { await api.post('/identity/submit'); setStatus('pending_review'); await fetchMe() }
    finally { setLoading(false) }
  }

  const checkStatus = async ()=>{
    const { data } = await api.get('/identity/status')
    setStatus(data?.status || status)
    await fetchMe()
  }

  const resendEmail = async ()=>{ await api.post('/identity/resend-email'); alert('Email sent') }
  const resendSMS   = async ()=>{ await api.post('/identity/resend-sms'); alert('SMS sent') }
  const verifyEmail = async ()=>{ await api.post('/identity/verify-email', { code: emailCode }); alert('Email verified'); await fetchMe() }
  const verifySMS   = async ()=>{ await api.post('/identity/verify-sms', { code: smsCode });   alert('Phone verified'); await fetchMe() }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>Verify identity</h2>

        <Card><CardBody>
          <ol className="space-y-4 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full brand-bg grid place-content-center text-white">1</span>
              <div>
                <p className="font-semibold">Start verification</p>
                <p>Create a verification session.</p>
                <Button className="mt-2" onClick={start} disabled={loading || !(status==='not_started' || status==='rejected')}>Start</Button>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full brand-bg grid place-content-center text-white">2</span>
              <div>
                <p className="font-semibold">Upload ID</p>
                <p>Upload a passport or national ID.</p>
                <input type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="mt-2" />
                <Button className="mt-2" onClick={upload} disabled={loading || !file || (status!=='started' && status!=='uploaded')}>Upload</Button>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="h-6 w-6 rounded-full brand-bg grid place-content-center text-white">3</span>
              <div>
                <p className="font-semibold">Submit for review</p>
                <p>We’ll verify the document and notify you.</p>
                <Button className="mt-2" onClick={submit} disabled={loading || status!=='uploaded'}>Submit</Button>
              </div>
            </li>
          </ol>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Email verification</h4>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resendEmail}>Resend verification email</Button>
                <input value={emailCode} onChange={(e)=>setEmailCode(e.target.value)} placeholder="Enter code" className="rounded-xl border px-3 py-2" />
                <Button onClick={verifyEmail}>Submit code</Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">SMS verification</h4>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resendSMS}>Resend SMS code</Button>
                <input value={smsCode} onChange={(e)=>setSmsCode(e.target.value)} placeholder="Enter code" className="rounded-xl border px-3 py-2" />
                <Button onClick={verifySMS}>Submit code</Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium brand-text">Status</span>
            <span className="text-gray-700">{status}</span>
            <Button variant="secondary" onClick={checkStatus}>Refresh status</Button>
          </div>
        </CardBody></Card>
      </div>
    </section>
  )
}
