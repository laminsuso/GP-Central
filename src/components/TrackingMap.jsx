import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import TrackingMap from '../components/TrackingMap'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'

export default function TrackRequestPage() {
  const { requestId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load current active tracking session for this request
  const loadSession = async () => {
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase
        .from('tracking_sessions')
        .select('id, active, started_at, ended_at')
        .eq('request_id', requestId)
        .eq('active', true)               // only active session
        .single()
      if (error && error.code !== 'PGRST116') throw error  // PGRST116 = no rows
      setSession(data || null)
    } catch (e) {
      setError(e.message || 'Failed to load tracking session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()

    // Listen for session start/stop changes for this request
    const channel = supabase
      .channel(`track_req_${requestId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tracking_sessions', filter: `request_id=eq.${requestId}` },
        () => loadSession()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>
            Track Shipment
          </h2>
          <Button as={Link} to="/find" variant="secondary">Back</Button>
        </div>
        <Button as={Link} to={`/track/${request.id}`} variant="secondary">Track</Button>


        <Card className="mt-4">
          <CardBody>
            <p className="text-sm text-gray-600">
              Request ID: <span className="font-mono">{requestId}</span>
            </p>

            {loading && <p className="mt-3 text-gray-600">Loading current tracking session…</p>}
            {error && <p className="mt-3 text-red-600">{error}</p>}

            {!loading && !error && !session && (
              <div className="mt-4">
                <p className="text-gray-700">
                  No active tracking session yet. The traveler will start sharing location once the package is in transit.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This page will live-update automatically when tracking starts.
                </p>
              </div>
            )}

            {session && (
              <div className="mt-5">
                <TrackingMap sessionId={session.id} />
                <p className="text-xs text-gray-500 mt-2">
                  Started: {new Date(session.started_at).toLocaleString()}
                  {session.ended_at && <> • Ended: {new Date(session.ended_at).toLocaleString()}</>}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  )
}
