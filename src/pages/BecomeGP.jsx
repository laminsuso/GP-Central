import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function BecomeGPPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  // form fields
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [priceType, setPriceType] = useState('per_kg') // 'per_kg' | 'per_item'
  const [price, setPrice] = useState('5.00')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  // Load my profile (role + identity)
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        setLoadingProfile(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, identity_verified')
          .eq('user_id', user.id)
          .single()
        if (error) throw error
        if (!ignore) setProfile(data)
      } catch (e) {
        if (!ignore) setErr(e.message || 'Failed to load profile')
      } finally {
        if (!ignore) setLoadingProfile(false)
      }
    })()
    return () => { ignore = true }
  }, [user?.id])

  const promoteToTraveler = async () => {
    setErr(''); setMsg('')
    try {
      const current = profile?.role || 'shipper'
      const newRole = current === 'shipper' ? 'both' : current // keep 'traveler'/'both' as-is, upgrade shipper→both
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', user.id)
      if (error) throw error
      setProfile(p => ({ ...p, role: newRole }))
      setMsg(`Role updated to “${newRole}”.`)
    } catch (e) {
      setErr(e.message || 'Could not update role')
    }
  }

  const submitPlan = async (e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    // Basic validation
    if (!origin || !destination || !departDate) {
      setErr('Please fill origin, destination and date.')
      return
    }
    if (new Date(departDate) < new Date(new Date().toDateString())) {
      setErr('Choose a future departure date.')
      return
    }
    if (Number(price) < 0 || Number(capacity) < 0) {
      setErr('Price and capacity must be positive.')
      return
    }

    setBusy(true)
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .insert([{
          traveler_id: user.id,
          origin,
          destination,
          depart_date: departDate,
          capacity_kg: Number(capacity),
          price_type: priceType,
          price: Number(price),
          notes: notes || null
        }])
        .select('id')
        .single()
      if (error) throw error
      setMsg(`Travel plan published (ID ${data.id}).`)
      // optional: reset form
      // setOrigin(''); setDestination(''); setDepartDate(''); setCapacity(10); setPriceType('per_kg'); setPrice('5.00'); setNotes('')
    } catch (e) {
      setErr(e.message || 'Failed to publish plan')
    } finally {
      setBusy(false)
    }
  }

  const isTraveler = profile?.role === 'traveler' || profile?.role === 'both'
  const needsIdentity = !profile?.identity_verified

  return (
    <section className="py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--brand-ink)' }}>
          Publish a Travel Plan
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Earn by carrying parcels on your route. Set your price and capacity, and manage requests in real-time.
        </p>

        {/* Status / requirements */}
        <div className="mt-4 rounded-xl border border-gray-100 bg-white/80 p-4 text-sm">
          {loadingProfile ? (
            <p className="text-gray-600">Loading your profile…</p>
          ) : (
            <>
              <p className="text-gray-700">
                <strong>Role:</strong> {profile?.role ?? '—'} &nbsp;•&nbsp; 
                <strong>Identity verified:</strong> {profile?.identity_verified ? 'Yes' : 'No'}
              </p>
              {!isTraveler && (
                <div className="mt-2">
                  <p className="text-amber-700">
                    You need the <strong>traveler</strong> role to publish plans.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button onClick={promoteToTraveler}>Become a GP</Button>
                    <Button as={Link} to="/profile" variant="secondary">Edit profile</Button>
                  </div>
                </div>
              )}
              {isTraveler && needsIdentity && (
                <div className="mt-2">
                  <p className="text-amber-700">
                    Identity verification is required before your plan can go live.
                  </p>
                  <div className="mt-2">
                    <Button as={Link} to="/verify-identity" variant="secondary">
                      Verify identity
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={submitPlan} className="mt-6 grid gap-4 rounded-xl border border-gray-100 bg-white/80 p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">From</label>
              <input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="City / Country"
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">To</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="City / Country"
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Departure date</label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Capacity (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
              <div className="flex gap-2">
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="per_kg">€/kg</option>
                  <option value="per_item">per item</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra details or constraints…"
              className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy || !isTraveler || needsIdentity}>
              {busy ? 'Publishing…' : 'Publish Travel Plan'}
            </Button>
            <Button as={Link} to="/requests" variant="secondary">Go to Requests</Button>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-emerald-600">{msg}</p>}
        </form>
      </div>
    </section>
  )
}
