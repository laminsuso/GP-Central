import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'

export default function BecomeGPPage(){
  const { t } = useI18n()
  const { user } = useAuth() // comes from Supabase auth in AuthContext
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [capacityKg, setCapacityKg] = useState(1)
  const [priceMode, setPriceMode] = useState('per_kg')  // 'per_kg' | 'per_item'
  const [priceAmount, setPriceAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState('')

  const handle = async (e)=>{
    e.preventDefault()
    setError(''); setOk('')
    try {
      if (!user) throw new Error('You must be logged in.')
      setLoading(true)

      const { error: insertErr } = await supabase
        .from('travel_plans')
        .insert([{
          traveler_id: user.id,
          origin,
          destination,
          depart_date: departDate,     // DATE column
          capacity_kg: Number(capacityKg),
          price_mode: priceMode,
          price_amount: Number(priceAmount),
          notes
        }])

      if (insertErr) throw insertErr
      setOk('Travel plan published!')
      // reset minimal fields
      setNotes('')
    } catch (err) {
      setError(err.message || 'Failed to publish travel plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>
          {t('travelerTitle') || 'Earn on your travels'}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('travelerSubtitle') || 'Publish your route, set your price, and accept requests with built-in chat.'}
        </p>

        <Card className="max-w-3xl mx-auto">
          <CardBody>
            <form onSubmit={handle} className="grid grid-cols-1 md:grid-cols-6 gap-3" aria-label="Become a GP form">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('from') || 'From'}</label>
                <input required value={origin} onChange={(e)=>setOrigin(e.target.value)} type="text" placeholder="City / Country" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('to') || 'To'}</label>
                <input required value={destination} onChange={(e)=>setDestination(e.target.value)} type="text" placeholder="City / Country" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('date') || 'Date'}</label>
                <input required value={departDate} onChange={(e)=>setDepartDate(e.target.value)} type="date" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('capacity') || 'Capacity (kg)'}</label>
                <input required value={capacityKg} onChange={(e)=>setCapacityKg(e.target.value)} type="number" min={1} placeholder="e.g., 10" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">{t('yourPrice') || 'Your price'}</label>
                <div className="flex gap-2">
                  <select value={priceMode} onChange={(e)=>setPriceMode(e.target.value)} className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <option value="per_kg">€/kg</option>
                    <option value="per_item">per item</option>
                  </select>
                  <input required value={priceAmount} onChange={(e)=>setPriceAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="e.g., 5.00" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input value={notes} onChange={(e)=>setNotes(e.target.value)} type="text" placeholder="Anything the shipper should know?" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div className="md:col-span-6 flex items-end">
                <Button type="submit" className="w-full" disabled={loading}><Send className="h-4 w-4" /> {loading ? 'Publishing…' : (t('publishPlan') || 'Publish Travel Plan')}</Button>
              </div>

              <p className="md:col-span-6 text-xs text-gray-500">{t('youControlPrice') || 'You control your pricing. Shippers pay securely; funds release upon delivery.'}</p>
              {error && <p className="text-sm text-red-600 md:col-span-6">{error}</p>}
              {ok && <p className="text-sm text-emerald-600 md:col-span-6">{ok}</p>}
            </form>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}
