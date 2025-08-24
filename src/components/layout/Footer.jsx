import React from 'react'
import { Link } from 'react-router-dom'
export default function Footer(){
  return (
    <footer className="border-t border-gray-200 bg-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2"><div className="h-9 w-9 rounded-xl brand-bg grid place-content-center text-white">GP</div><p className="font-extrabold">GP Central</p></div>
            <p className="mt-3 text-gray-600">Affordable, reliable international parcel delivery.</p>
          </div>
          <div>
            <p className="font-semibold" style={{color:'var(--brand-ink)'}}>Navigation</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li><a className="hover:brand-text" href="#home">Accueil</a></li>
              <li><Link className="hover:brand-text" to="/find">Gp disponibles</Link></li>
              <li><Link className="hover:brand-text" to="/devenir-gp">Devenir GP?</Link></li>
              <li><a className="hover:brand-text" href="#how">Comment ça marche</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold" style={{color:'var(--brand-ink)'}}>Legal</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li><a className="hover:brand-text" href="#">Privacy Policy</a></li>
              <li><a className="hover:brand-text" href="#">CGU</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold" style={{color:'var(--brand-ink)'}}>Follow</p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li><a className="hover:brand-text" href="#">Facebook</a></li>
              <li><a className="hover:brand-text" href="#">Twitter</a></li>
              <li><a className="hover:brand-text" href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-500">
          <p>© 2025 Entreprise Yonebi. Tous droits réservés.</p>
          <div className="flex items-center gap-3"><span>EN</span><span className="opacity-40">/</span><span>FR</span></div>
        </div>
      </div>
    </footer>
  )
}
