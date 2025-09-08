import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useI18n } from '../contexts/I18nContext'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'

export default function FindPage() {
  const { user, session } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  // Search filters
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')

  // Data
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Request dialog state
  const [requestingPlan, setRequestingPlan] = useState(null) // holds a plan object
  const [weight, setWeight] = useState('') // optional
  const [description, setDescription] = useState('')
  const [reqBusy, setReqBusy] = useState(false)
  const [reqError, setReqError] = useState('')
  const [reqOk, setReqOk] = useState('')

  // Load plans (optionally with filters)
  const loadPlans = async () => {
    setLoading(true); setError('')
    try {
      let q = supabase
        .from('travel_plans')
        .select('id, traveler_id, origin, destination, depart_date, capacity_kg, price_type, price, notes, created_at')
        .order('depart_date', { ascending: true })

      // Apply filters if provided
      if (from.trim()) q = q.ilike('origin', `%${from.trim()}%`)
      if (to.trim()) q = q.ilike('destination', `%${to.trim()}%`)
      if (date) q = q.gte('depart_date', date) // show plans departing on/after selected date

      const { data, error } = await q
      if (error) throw error
      setPlans(data || [])
    } catch (e) {
      setError(e.message || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  // initial load: upcoming plans
  useEffect(() => {
    loadPlans()
    // Optional: subscribe to realtime inserts/updates to refresh automatically
    const channel = supabase
      .channel('travel_plans_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'travel_plans' }, () => {
        // re-run current query when something changes
        loadPlans()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    loadPlans()
  }

  // Open request dialog
  const openRequest = (plan) => {
    if (!session) {
      // Save redirect and send user to login
      sessionStorage.setItem('post_login_redirect', '/find')
      navigate('/login')
      return
    }
    setRequestingPlan(plan)
    setWeight('')
    setDescription('')
    setReqError('')
    setReqOk('')
  }

  // Create shipment request (shipper action)
  const sendRequest = async (e) => {
    e.preventDefault()
    setReqBusy(true); setReqError(''); setReqOk('')
    try {
      if (!user) throw new Error('Please log in first.')
      if (!requestingPlan) throw new Error('No plan selected.')

      const payload = {
        plan_id: requestingPlan.id,
        shipper_id: user.id,
        weight_kg: weight ? Number(weight) : null,
        description: description || null,
      }
      const { error } = await supabase.from('shipment_requests').insert([payload])
      if (error) throw error

      setReqOk('Request sent!')
      // Close dialog after a short delay
      setTimeout(() => setRequestingPlan(null), 700)
    } catch (e) {
      setReqError(e.message || 'Failed to send request')
    } finally {
      setReqBusy(false)
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--brand-ink)' }}>
          {t('findTitle') || 'Find a GP'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {t('findBlurb') || 'Enter your route and dates to match with verified travelers.'}
        </p>

        {/* Search form */}
        <Card className="mt-4">
          <CardBody>
            <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('from') || 'From'}</label>
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="City / Country"
                  className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('to') || 'To'}</label>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="City / Country"
                  className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('date') || 'Date'}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button type="submit" className="w-full">{t('ctaFind') || 'Find a GP'}</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Results */}
        <div className="mt-6">
          {loading && <p className="text-gray-600">Loading…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && (
            <>
              <p className="text-sm text-gray-600 mb-3">
                {plans.length} result{plans.length !== 1 ? 's' : ''}
              </p>

              <div className="grid gap-4">
                {plans.map((p) => (
                  <Card key={p.id}>
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--brand-ink)' }}>
                            {p.origin} → {p.destination}
                          </p>
                          <p className="text-sm text-gray-600">
                            Depart: {new Date(p.depart_date).toLocaleDateString()} • Capacity: {p.capacity_kg} kg
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: {p.price_type === 'per_kg' ? `${p.price} €/kg` : `${p.price} per item`}
                          </p>
                          {p.notes && <p className="text-xs text-gray-500 mt-1">“{p.notes}”</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => openRequest(p)}>
                            Request carry
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              {!plans.length && <p className="text-gray-600">No plans found. Try adjusting filters.</p>}
            </>
          )}
        </div>

        {/* Request modal (simple inline panel) */}
        {requestingPlan && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-lg">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--brand-ink)' }}>
                  Request carry: {requestingPlan.origin} → {requestingPlan.destination}
                </h3>
                <p className="text-sm text-gray-600">
                  Depart {new Date(requestingPlan.depart_date).toLocaleDateString()}
                </p>
              </div>
              <form onSubmit={sendRequest} className="p-5 grid gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Weight (kg) <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="What are you sending? (e.g., documents, gifts)"
                    required
                  />
                </div>
                {reqError && <p className="text-sm text-red-600">{reqError}</p>}
                {reqOk && <p className="text-sm text-emerald-600">{reqOk}</p>}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="secondary" onClick={() => setRequestingPlan(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={reqBusy}>
                    {reqBusy ? 'Sending…' : 'Send request'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
