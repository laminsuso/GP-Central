import React, { useState } from 'react'
import { MapPin, Search, MessageCircle } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function FindPage(){
  const { t } = useI18n()
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>{t('findTitle') || 'Find a GP'}</h2>
        <p className="text-gray-600 mb-6">{t('findBlurb') || 'Enter your route and dates to match with verified travelers.'}</p>
        <FindForm />
      </div>
    </section>
  )
}

function ResultCard({ plan, onRequest }){
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{plan.origin} → {plan.destination}</p>
            <p className="text-sm text-gray-600">Date: {plan.depart_date} • Capacity: {plan.capacity_kg}kg</p>
            <p className="text-sm text-gray-600">Price: {plan.price_mode === 'per_kg' ? '€/kg' : 'per item'} {Number(plan.price_amount).toFixed(2)}</p>
            {plan.notes && <p className="text-sm text-gray-600 mt-1">{plan.notes}</p>}
          </div>
          <Button onClick={onRequest}>Request</Button>
        </div>
      </CardBody>
    </Card>
  )
}

export function FindForm(){
  const { t } = useI18n()
  const { user } = useAuth()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [ok, setOk] = useState('')

  const handleSearch = async (e)=>{
    e.preventDefault()
    setError(''); setOk(''); setResults([])
    try{
      setLoading(true)
      let q = supabase.from('travel_plans').select('*').order('created_at', { ascending: false })
      if (from) q = q.ilike('origin', `%${from}%`)
      if (to) q = q.ilike('destination', `%${to}%`)
      if (date) q = q.gte('depart_date', date)

      const { data, error: err } = await q
      if (err) throw err
      setResults(data || [])
    } catch (err){
      setError(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const requestShipment = (planId)=> async ()=>{
    setOk(''); setError('')
    try{
      if (!user) throw new Error('Please login to request a shipment.')
      const { error: insErr } = await supabase.from('shipment_requests').insert([{
        shipper_id: user.id,
        plan_id: planId,
        // add optional fields below if you want a quick request:
        // weight_kg: 2, description: 'Documents'
      }])
      if (insErr) throw insErr
      setOk('Request sent to traveler!')
    } catch (err){
      setError(err.message || 'Could not send request')
    }
  }

  return (
    <>
      <Card className="max-w-3xl mx-auto">
        <CardBody>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3" aria-label="Find a GP form">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('from') || 'From'}</label>
              <div className="relative">
                <input required value={from} onChange={(e)=>setFrom(e.target.value)} type="text" placeholder="City / Country" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" aria-label="Origin" />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('to') || 'To'}</label>
              <div className="relative">
                <input required value={to} onChange={(e)=>setTo(e.target.value)} type="text" placeholder="City / Country" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" aria-label="Destination" />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">{t('date') || 'Date'}</label>
              <input value={date} onChange={(e)=>setDate(e.target.value)} type="date" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" aria-label="Date" />
            </div>

            <div className="md:col-span-5 flex items-center gap-3">
              <Button type="submit" className="flex-1" disabled={loading}><Search className="h-4 w-4" /> {loading ? 'Searching…' : (t('ctaFind') || 'Find a GP')}</Button>
              <Button as={Link} to="/support" variant="secondary" className="flex-1"><MessageCircle className="h-4 w-4" /> {t('needHelp') || 'Need help?'}</Button>
            </div>

            {error && <p className="text-sm text-red-600 md:col-span-5">{error}</p>}
            {ok && <p className="text-sm text-emerald-600 md:col-span-5">{ok}</p>}
          </form>
          <p className="mt-3 text-xs text-gray-500">{t('priceNote') || 'Pricing typically ranges 3–20 € / kg. Payments are released on delivery.'}</p>
        </CardBody>
      </Card>

      {/* Results */}
      {!!results.length && (
        <div className="max-w-3xl mx-auto mt-8 space-y-4">
          {results.map((plan)=>(
            <ResultCard
              key={plan.id}
              plan={plan}
              onRequest={requestShipment(plan.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}
