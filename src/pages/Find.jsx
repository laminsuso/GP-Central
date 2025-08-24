import React, { useState } from 'react'
import { MapPin, Search, MessageCircle } from 'lucide-react'
import { api } from '../services/api'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'
import { Link } from 'react-router-dom'

export function FindForm(){
  const { t } = useI18n()
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [date, setDate] = useState(''), [error, setError] = useState('')
  const handle = async (e)=>{ e.preventDefault(); try{ setError(''); await api.post('/search', { from, to, date }); alert('Search submitted (API)') } catch(err){ setError(err?.response?.data?.message || err?.message || 'Error') } }
  return (
    <Card className="max-w-3xl mx-auto"><CardBody>
      <form onSubmit={handle} className="grid grid-cols-1 md:grid-cols-5 gap-3" aria-label="Find a GP form">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('from')}</label>
          <div className="relative">
            <input required value={from} onChange={(e)=>setFrom(e.target.value)} type="text" placeholder="City / Country" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" aria-label="Origin" />
            <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('to')}</label>
          <div className="relative">
            <input required value={to} onChange={(e)=>setTo(e.target.value)} type="text" placeholder="City / Country" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" aria-label="Destination" />
            <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('date')}</label>
          <input required value={date} onChange={(e)=>setDate(e.target.value)} type="date" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" aria-label="Date" />
        </div>
        <div className="md:col-span-5 flex items-center gap-3">
          <Button type="submit" className="flex-1"><Search className="h-4 w-4" /> {t('ctaFind')}</Button>
          <Button as={Link} to="/support" variant="secondary" className="flex-1"><MessageCircle className="h-4 w-4" /> {t('needHelp')}</Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <p className="mt-3 text-xs text-gray-500">{t('priceNote')}</p>
    </CardBody></Card>
  )
}

export default function FindPage(){
  const { t } = useI18n()
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>{t('findTitle')}</h2>
        <p className="text-gray-600 mb-6">{t('findBlurb')}</p>
        <FindForm />
      </div>
    </section>
  )
}
