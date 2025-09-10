import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'

const VISIBLE_STATUSES = ['pending', 'accepted', 'in_transit', 'delivered'] // hide 'cancelled' by default

export default function MyShipmentsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [plansById, setPlansById] = useState({})
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = async () => {
    if (!user) return
    setLoading(true); setErr('')
    try {
      // 1) Fetch my shipment requests (shipper_id = me)
      const { data: reqs, error: e1 } = await supabase
        .from('shipment_requests')
        .select('id, plan_id, status, weight_kg, description, created_at')
        .eq('shipper_id', user.id)
        .in('status', VISIBLE_STATUSES)
        .order('created_at', { ascending: false })

      if (e1) throw e1

      setRows(reqs || [])

      // 2) Fetch plan details for all plan_ids
      const planIds = Array.from(new Set((reqs || []).map(r => r.plan_id))).filter(Boolean)
      if (planIds.length) {
        const { data: plans, error: e2 } = await supabase
          .from('travel_plans')
          .select('id, origin, destination, depart_date')
          .in('id', planIds)
        if (e2) throw e2
        const map = {}
        ;(plans || []).forEach(p => { map[p.id] = p })
        setPlansById(map)
      } else {
        setPlansById({})
      }
    } catch (e) {
      setErr(e.message || 'Failed to load shipments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    if (!user) return
    // Realtime: refresh when my requests change
    const ch = supabase
      .channel(`shipper_requests_${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipment_requests', filter: `shipper_id=eq.${user.id}` },
        () => load()
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const cancel = (id) => async () => {
    try {
      // allowed by policy: shipper can update their own pending to cancelled
      const { error } = await supabase
        .from('shipment_requests')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('status', 'pending')
      if (error) throw error
      // No manual state update needed; realtime will refresh. As a UX nicety:
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    } catch (e) {
      alert(e.message || 'Failed to cancel')
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--brand-ink)' }}>
            My Shipments
          </h2>
          <Button as={Link} to="/find" variant="secondary">Find GPs</Button>
        </div>

        {loading && <p className="mt-4 text-gray-600">Loading…</p>}
        {err && <p className="mt-4 text-red-600">{err}</p>}

        {!loading && !err && (
          <>
            <p className="mt-3 text-sm text-gray-600">
              {rows.filter(r => VISIBLE_STATUSES.includes(r.status)).length} active request{rows.length !== 1 ? 's' : ''}.
            </p>

            <div className="mt-4 space-y-4">
              {rows
                .filter(r => VISIBLE_STATUSES.includes(r.status))
                .map(r => {
                  const plan = plansById[r.plan_id]
                  return (
                    <Card key={r.id}>
                      <CardBody>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--brand-ink)' }}>
                              {plan ? `${plan.origin} → ${plan.destination}` : 'Route info'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: <strong>{r.status}</strong>
                              {plan && <> • Depart: {new Date(plan.depart_date).toLocaleDateString()}</>}
                            </p>
                            {r.weight_kg != null && (
                              <p className="text-sm text-gray-600">Weight: {r.weight_kg} kg</p>
                            )}
                            {r.description && (
                              <p className="text-sm text-gray-600">“{r.description}”</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Requested: {new Date(r.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {/* Track button goes to /track/:requestId */}
                            <Button as={Link} to={`/track/${r.id}`} variant="secondary">
                              Track
                            </Button>

                            {/* Allow cancel only while pending */}
                            {r.status === 'pending' && (
                              <Button onClick={cancel(r.id)} variant="secondary">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  )
                })}

              {rows.filter(r => VISIBLE_STATUSES.includes(r.status)).length === 0 && (
                <p className="text-gray-600">No shipments yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
