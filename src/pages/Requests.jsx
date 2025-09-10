import React from 'react'
import { useRealtimeRequests } from '../hooks/useRealtimeRequests'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { supabase } from '../services/supabaseClient'
import { useState, useRef } from 'react'
import { createTrackingSession, endTrackingSession, insertTrackingPoint } from '../services/tracking'
import { useAuth } from '../contexts/AuthContext'

export default function RequestsPage() {
  const { rows, loading, error, setRows } = useRealtimeRequests()

function RequestsPage() {
  const { user } = useAuth()
  const [activeSessionId, setActiveSessionId] = useState(null)
  const watchIdRef = useRef(null)
  const lastSentRef = useRef(0)

  const startSharing = async (request) => {
    try {
      const sessionId = await createTrackingSession({
        requestId: request.id,
        travelerId: user.id,
        shipperId: request.shipper_id
      })
      setActiveSessionId(sessionId)

      if (!('geolocation' in navigator)) {
        alert('Geolocation not supported')
        return
      }
      // request permission and start watching
      watchIdRef.current = navigator.geolocation.watchPosition(async (pos) => {
        const now = Date.now()
        // throttle to ~1 point / 10 seconds
        if (now - lastSentRef.current < 10_000) return
        lastSentRef.current = now

        const { latitude, longitude, accuracy, speed, heading } = pos.coords
        // basic sanity filter
        if (!latitude || !longitude) return

        await insertTrackingPoint(sessionId, {
          lat: latitude, lng: longitude,
          accuracy: accuracy ?? null,
          speed: speed ?? null,
          heading: heading ?? null
        })
      }, (err) => {
        console.error('geo error', err)
      }, {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 20_000
      })
    } catch (e) {
      console.error(e)
      alert(e.message || 'Failed to start sharing')
    }
  }

  const stopSharing = async () => {
    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      if (activeSessionId) {
        await endTrackingSession(activeSessionId)
        setActiveSessionId(null)
      }
    } catch (e) {
      console.error(e)
    }
  }
}

  const setStatus = (id, status) => async () => {
    const { error } = await supabase
      .from('shipment_requests')
      .update({ status })
      .eq('id', id)
    if (error) {
      alert(error.message || 'Failed to update status')
    }
    // No need to manually update state—Realtime UPDATE will arrive and refresh the row.
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>
          Shipment Requests (Realtime)
        </h2>

        {loading && <p className="mt-4 text-gray-600">Loading…</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 space-y-4">
          {rows.map(r => (
            <Card key={r.id}><CardBody>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Request #{r.id}</p>
                  <p className="text-sm text-gray-600">
                    Plan: {r.plan_id} • Status: <strong>{r.status}</strong>
                  </p>
                  {r.weight_kg && <p className="text-sm text-gray-600">Weight: {r.weight_kg} kg</p>}
                  {r.description && <p className="text-sm text-gray-600">“{r.description}”</p>}
                  <p className="text-xs text-gray-500 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={setStatus(r.id, 'accepted')}>Accept</Button>
                  <Button onClick={setStatus(r.id, 'rejected')} variant="secondary">Reject</Button>
                  <Button onClick={setStatus(r.id, 'in_transit')} variant="secondary">In transit</Button>
                  <Button onClick={setStatus(r.id, 'delivered')} variant="secondary">Delivered</Button>
                  // inside RequestsPage item renderer for a request r
                  // get travelerId=user.id and shipperId=r.shipper_id from your row
                  <Button onClick={() => startSharing(r)}>Start sharing</Button>
                  <Button variant="secondary" onClick={() => stopSharing()}>Stop sharing</Button>

                </div>
              </div>
            </CardBody></Card>
          ))}

          {!loading && !rows.length && !error && (
            <p className="text-gray-600">No requests yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}
