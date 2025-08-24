import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Globe2, Search, Briefcase, ShieldCheck, Star, Clock, Leaf,
  Plane, CreditCard, MessageCircle, CheckCircle2, ChevronDown, MapPin
} from 'lucide-react'
import AnimatedWorld from '../components/AnimatedWorld'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { useI18n } from '../contexts/I18nContext'

function Section({ id, className = '', children }) {
  return <section id={id} className={`scroll-mt-24 ${className}`}>{children}</section>
}
function SectionHeader({ eyebrow, title, subtitle, center }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && <div className="mb-3"><Badge>{eyebrow}</Badge></div>}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--brand-ink)' }}>{title}</h2>
      {subtitle && <p className={`mt-3 text-gray-600 max-w-2xl ${center ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
  )
}

export default function Home() {
  const { t } = useI18n()
  const [mode, setMode] = useState('shipper') // 'shipper' | 'traveler'

  const howData = mode === 'shipper'
    ? [
        { icon: <Search className="h-6 w-6 brand-text" />, title: 'Search Travelers', desc: 'Enter departure/arrival cities and dates to see matching GPs.' },
        { icon: <Plane className="h-6 w-6 brand-text" />, title: 'Plan your shipment', desc: 'Specify weight, contents, recipient; choose your traveler.' },
        { icon: <ShieldCheck className="h-6 w-6 brand-text" />, title: 'Track & receive', desc: 'Follow in real time until confirmed delivery.' },
      ]
    : [
        { icon: <Plane className="h-6 w-6 brand-text" />, title: 'Add travel plans', desc: 'Origin, destination, dates, and available capacity.' },
        { icon: <CreditCard className="h-6 w-6 brand-text" />, title: 'Set your price', desc: '€/kg or per item — you control your rate.' },
        { icon: <MessageCircle className="h-6 w-6 brand-text" />, title: 'Manage requests', desc: 'Accept shipments and chat to coordinate hand-off.' },
      ]

  const featuresGroups = [
    {
      header: 'For Shippers',
      items: [
        'Real-time tracking from reservation to delivery.',
        'Transparent pricing (avg. 3–20 €/kg) with secure, escrowed payments.',
        'Wide destination coverage beyond major routes.',
        'Ratings/reviews and reimbursement policy for covered issues.'
      ]
    },
    {
      header: 'For Travelers (GPs)',
      items: [
        'Amortize travel costs by selling luggage space.',
        'Flexible pricing: set €/kg or per item.',
        'Manage requests and communicate in-app.',
        'Maintain a profile with routes and capacity.'
      ]
    },
    {
      header: 'For Everyone',
      items: [
        'Accounts with robust identity verification.',
        'Secure payments (Stripe/PayPal ready).',
        '24/7 support via chat, email, phone, or WhatsApp.',
        'Real-time updates via web sockets.'
      ]
    }
  ]

  return (
    <>
      {/* Hero */}
      <Section id="home" className="relative">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4"><Globe2 className="h-3.5 w-3.5" /> America • Europe • Africa</Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--brand-ink)' }}>
                Your Parcels Beyond Borders: <span className="brand-text">Simple, Fast, Affordable.</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-xl">
                Connect with a global network of verified travelers to deliver your packages safely.
                Leverage unused luggage space for <strong>cost-effective</strong> international shipping with real-time tracking.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button as={Link} to="/find" className="min-w-[160px]"><Search className="h-4 w-4" /> {t('ctaFind') || 'Find a GP'}</Button>
                <Button as={Link} to="/devenir-gp" variant="secondary" className="min-w-[160px]"><Briefcase className="h-4 w-4" /> {t('ctaBecome') || 'Become a GP'}</Button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ShieldCheck className="h-4 w-4 brand-text" /> Identity verification • Escrow payments
                </div>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> 4.9/5 avg. rating</div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 brand-text" /> 24/7 support</div>
                <div className="flex items-center gap-2"><Leaf className="h-4 w-4 brand-text" /> Lower carbon footprint</div>
              </div>
            </div>
            <div><AnimatedWorld /></div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(59,130,246,0.08),transparent),radial-gradient(50%_50%_at_80%_10%,rgba(16,185,129,0.08),transparent)]" />
      </Section>

      {/* How it works */}
      <Section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Guided process"
            title="How it works"
            subtitle="Clear, transparent steps for shippers and travelers (GPs)."
            center
          />
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-center justify-center gap-2">
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold border ${mode==='shipper' ? 'brand-bg border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                onClick={()=>setMode('shipper')}
              >For Shippers</button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-semibold border ${mode==='traveler' ? 'brand-bg border-transparent' : 'bg-white text-gray-700 border-gray-200'}`}
                onClick={()=>setMode('traveler')}
              >For Travelers (GPs)</button>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {howData.map((s, i) => (
                <Card key={i}><CardBody>
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 grid place-content-center">{s.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{s.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                    </div>
                  </div>
                </CardBody></Card>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Key Features */}
      <Section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Capabilities"
            title="Key Features"
            subtitle="Built for affordability, reliability, and a trusted global community."
            center
          />
          <div className="grid lg:grid-cols-3 gap-6">
            {featuresGroups.map((g) => (
              <Card key={g.header}><CardBody>
                <h3 className="text-xl font-bold" style={{ color: 'var(--brand-ink)' }}>{g.header}</h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-700">
                  {g.items.map((txt, idx) => (
                    <li key={idx} className="flex gap-3"><CheckCircle2 className="h-5 w-5 brand-text" /> {txt}</li>
                  ))}
                </ul>
              </CardBody></Card>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Questions" title="Frequently asked questions" center />
          <div className="mx-auto max-w-4xl divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white/70">
            {[
              { q: 'How does GP Central work?', a: 'Shippers find verified travelers (GPs) by route and date, book a carry, then track delivery in-app. Travelers publish routes and accept requests to monetize luggage space.' },
              { q: 'Is it secure?', a: 'Yes—identity verification, ratings/reviews, and escrowed payments protect both sides. Keep communication and transactions in-app.' },
              { q: 'What can I send?', a: 'Gifts, documents, clothing, and small personal items that comply with regulations. Prohibited/illegal goods are not allowed.' },
              { q: 'How are costs determined?', a: 'By destination, weight, and parcel nature. Community averages range roughly 3–20 €/kg.' },
              { q: 'What if there’s a problem?', a: 'We offer 24/7 support. A reimbursement mechanism may apply to covered cases per the Terms.' },
              { q: 'How do I become a GP?', a: 'Create an account, verify your identity, publish your travel plans, and set your price. You’ll receive payment upon confirmed delivery.' },
            ].map((item, i) => (
              <details key={i} className="group open:bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4">
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400 transition group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-gray-700 text-sm">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Support / Contact */}
      <Section id="contact" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="We’re here 24/7"
            title="Contact & Support"
            subtitle="Reach us by in-app chat, email, phone, or WhatsApp."
            center
          />
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card><CardBody>
              <h3 className="font-semibold" style={{ color: 'var(--brand-ink)' }}>Message us</h3>
              <p className="text-sm text-gray-600 mt-1">Start a new conversation and we’ll reply quickly.</p>
              <div className="mt-4 flex gap-3">
                <Button className="flex-1"><MessageCircle className="h-4 w-4" /> In-app chat</Button>
                <Button variant="secondary" className="flex-1">Email</Button>
              </div>
            </CardBody></Card>
            <Card><CardBody>
              <h3 className="font-semibold" style={{ color: 'var(--brand-ink)' }}>Call or WhatsApp</h3>
              <p className="text-sm text-gray-600 mt-1">Prefer to talk? We’re available around the clock.</p>
              <div className="mt-4 flex gap-3">
                <Button className="flex-1" variant="secondary">Phone</Button>
                <Button className="flex-1" variant="secondary">WhatsApp</Button>
              </div>
            </CardBody></Card>
          </div>
          <p className="mt-8 text-center text-xs text-gray-500">
            For identity verification, payments, and tracking, keep all communications and transactions within GP Central.
          </p>
        </div>
      </Section>
    </>
  )
}
