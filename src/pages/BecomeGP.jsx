import React, { useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../services/api'
import { Card, CardBody } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useI18n } from '../contexts/I18nContext'

export default function BecomeGPPage(){
  const { t } = useI18n()
  const [origin,setOrigin]=useState(''), [destination,setDestination]=useState(''), [date,setDate]=useState(''), [capacity,setCapacity]=useState(1), [price,setPrice]=useState(''), [error,setError]=useState('')
  const handle = async (e)=>{ e.preventDefault(); try{ setError(''); await api.post('/travel-plans',{origin,destination,date,capacity,price}); alert('Travel plan saved (API)') }catch(err){ setError(err?.response?.data?.message || err?.message || 'Error') } }
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>{t('travelerTitle')}</h2>
        <p className="text-gray-600 mb-6">{t('travelerSubtitle')}</p>
        <Card className="max-w-3xl mx-auto"><CardBody>
          <form onSubmit={handle} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">{t('from')}</label><input required value={origin} onChange={(e)=>setOrigin(e.target.value)} type="text" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="City / Country" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">{t('to')}</label><input required value={destination} onChange={(e)=>setDestination(e.target.value)} type="text" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="City / Country" /></div>
            <div className="md:col-span-1"><label className="mb-1 block text-sm font-medium text-gray-700">{t('date')}</label><input required value={date} onChange={(e)=>setDate(e.target.value)} type="date" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" /></div>
            <div className="md:col-span-1"><label className="mb-1 block text-sm font-medium text-gray-700">{t('capacity')}</label><input required value={capacity} onChange={(e)=>setCapacity(parseInt(e.target.value||'1'))} type="number" min={1} className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="e.g., 10" /></div>
            <div className="md:col-span-3"><label className="mb-1 block text-sm font-medium text-gray-700">{t('yourPrice')}</label><input required value={price} onChange={(e)=>setPrice(e.target.value)} type="text" className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="€/kg or per item" /></div>
            <div className="md:col-span-3 flex items-end"><Button type="submit" className="w-full"><Send className="h-4 w-4" /> {t('publishPlan')}</Button></div>
            <p className="md:col-span-6 text-xs text-gray-500">{t('youControlPrice')}</p>
            {error && <p className="text-sm text-red-600 md:col-span-6">{error}</p>}
          </form>
        </CardBody></Card>
      </div>
    </section>
  )
}
