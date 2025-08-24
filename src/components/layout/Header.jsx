import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Search, Briefcase, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import { useTheme } from '../../contexts/ThemeContext'
import { useI18n } from '../../contexts/I18nContext'
import { useAuth } from '../../contexts/AuthContext'

export default function Header(){
  const { theme, setTheme } = useTheme()
  const { t, lang, setLang } = useI18n()
  const { token, logout, user } = useAuth()
  const links = [{to:'/#how',label:'How it works'},{to:'/#features',label:'Features'},{to:'/#faq',label:'FAQ'},{to:'/#contact',label:'Support'}]
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><div className="h-9 w-9 rounded-xl brand-bg grid place-content-center"><Package size={18} /></div><p className="font-extrabold tracking-tight text-lg">GP Central</p></Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">{links.map(l => (<a key={l.label} href={l.to} className="hover:brand-text">{l.label}</a>))}</nav>
          <div className="hidden md:flex items-center gap-3">
            <Button as={Link} to="/find" variant="secondary"><Search className="h-4 w-4" /> {t('ctaFind')}</Button>
            <Button as={Link} to="/devenir-gp"><Briefcase className="h-4 w-4" /> {t('ctaBecome')}</Button>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Theme:</span>
              <select className="border rounded-xl px-2 py-1" value={theme} onChange={(e)=>setTheme(e.target.value)}>
                <option value="ocean">Ocean</option><option value="forest">Forest</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Lang:</span>
              <button className={`px-2 py-1 rounded ${lang==='en'?'brand-bg':''}`} onClick={()=>setLang('en')}>EN</button>
              <button className={`px-2 py-1 rounded ${lang==='fr'?'brand-bg':''}`} onClick={()=>setLang('fr')}>FR</button>
            </div>
            {token ? (
              <>
                <Button as={Link} to="/account" variant="secondary">{user?.name ? user.name.split(' ')[0] : 'Account'}</Button>
                <Button variant="secondary" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="secondary">Login</Button>
                <Button as={Link} to="/signup" variant="secondary">Sign up</Button>
              </>
            )}
          </div>
          <button className="md:hidden rounded-xl p-2 hover:bg-gray-100" aria-label="Toggle menu" onClick={()=>setOpen(v=>!v)}><ChevronDown className={`h-5 w-5 transition ${open?'rotate-180':''}`} /></button>
        </div>
        {open && (<div className="md:hidden pb-4 grid gap-2 text-sm">
          {links.map(l => (<a key={l.label} className="px-2 py-2 rounded-lg hover:bg-gray-50" href={l.to} onClick={()=>setOpen(false)}>{l.label}</a>))}
        </div>)}
      </div>
    </header>
  )
}
