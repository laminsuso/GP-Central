import React, { createContext, useContext, useState } from 'react'

const copy = {
  en: {
    appName:'GP Central', ctaFind:'Find a GP', ctaBecome:'Become a GP',
    heroH1:'Your Parcels Beyond Borders: Simple, Fast, Affordable.',
    heroSub:'Connect with a global network of verified travelers to deliver your packages safely. Leverage unused luggage space for cost-effective international shipping with real-time tracking.',
    trustRow:'Identity verification • Escrow payments', rating:'avg. rating', support247:'24/7 support', eco:'Lower carbon footprint',
    shipperEyebrow:'For Shippers', shipperTitle:'Send your parcel in 3 easy steps', shipperSubtitle:'Search trusted travelers (GPs), plan your shipment, then track and receive.',
    from:'From', to:'To', date:'Date', needHelp:'Need help?', priceNote:'Pricing typically ranges 3–20 € / kg. Secure in-app payment is held in escrow and released on delivery.',
    travelerEyebrow:'For Travelers', travelerTitle:'Earn on your travels', travelerSubtitle:'Publish your route, set your price, and accept requests with built-in chat.',
    capacity:'Capacity (kg)', yourPrice:'Your price', publishPlan:'Publish Travel Plan', youControlPrice:'You control your pricing. Shippers pay securely in-app; funds release upon delivery.',
    accessDenied:'Access denied for your role.',
  },
  fr: {
    appName:'GP Central', ctaFind:'Trouver un GP', ctaBecome:'Devenir GP',
    heroH1:'Vos colis sans frontières : simple, rapide, abordable.',
    heroSub:'Connectez-vous à un réseau mondial de voyageurs vérifiés...',
    trustRow:"Vérification d’identité • Paiements sous séquestre", rating:'note moy.', support247:'Support 24/7', eco:'Empreinte carbone réduite',
    shipperEyebrow:'Pour les expéditeurs', shipperTitle:'Envoyez en 3 étapes', shipperSubtitle:'Cherchez des voyageurs de confiance...',
    from:'Départ', to:'Arrivée', date:'Date', needHelp:'Besoin d’aide ?', priceNote:'Les tarifs varient généralement de 3 à 20 € / kg...',
    travelerEyebrow:'Pour les voyageurs', travelerTitle:'Gagnez pendant vos trajets', travelerSubtitle:'Publiez votre itinéraire...',
    capacity:'Capacité (kg)', yourPrice:'Votre prix', publishPlan:'Publier l’itinéraire', youControlPrice:'Vous contrôlez vos tarifs.',
    accessDenied:'Accès refusé pour votre rôle.',
  }
}

const I18nContext = createContext({ lang:'en', setLang:()=>{}, t:(k)=>k })
export const useI18n = () => useContext(I18nContext)

export default function I18nProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = (k) => (copy[lang] && copy[lang][k]) || k
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}
