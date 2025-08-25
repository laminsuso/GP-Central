// import React, { createContext, useContext, useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { api } from '../services/api'

// const AuthContext = createContext({
//   token:'', refresh:'', user:null,
//   setToken:()=>{}, setRefresh:()=>{}, setUser:()=>{},
//   login:async()=>{}, signup:async()=>{}, fetchMe:async()=>{}, logout:()=>{}
// })
// export const useAuth = ()=> useContext(AuthContext)

// export default function AuthProvider({ children }){
//   const [token, setToken] = useState(localStorage.getItem('gp_token') || '')
//   const [refresh, setRefresh] = useState(localStorage.getItem('gp_refresh') || '')
//   const [user, setUser] = useState(null)
//   const navigate = useNavigate()

//   const fetchMe = async ()=> {
//     const { data } = await api.get('/auth/me')
//     setUser(data)
//   }

//   const login = async (email, password)=> {
//     const { data } = await api.post('/auth/login', { email, password })
//     if (!data?.token || !data?.refresh) throw new Error('Missing token(s)')
//     setToken(data.token); setRefresh(data.refresh)
//     localStorage.setItem('gp_token', data.token)
//     localStorage.setItem('gp_refresh', data.refresh)
//     await fetchMe()
//     const dest = sessionStorage.getItem('post_login_redirect') || '/'
//     sessionStorage.removeItem('post_login_redirect')
//     navigate(dest, { replace: true })
//   }

//   const signup = async (name, email, password)=> {
//     const { data } = await api.post('/auth/signup', { name, email, password })
//     if (!data?.token || !data?.refresh) throw new Error('Missing token(s)')
//     setToken(data.token); setRefresh(data.refresh)
//     localStorage.setItem('gp_token', data.token)
//     localStorage.setItem('gp_refresh', data.refresh)
//     await fetchMe()
//     navigate('/verify-identity', { replace: true })
//   }

//   const logout = ()=> {
//     setToken(''); setRefresh(''); setUser(null)
//     localStorage.removeItem('gp_token'); localStorage.removeItem('gp_refresh')
//     navigate('/', { replace: true })
//   }

//   useEffect(()=>{ if (token) fetchMe().catch(()=>{}) }, [token])

//   return <AuthContext.Provider value={{ token, refresh, user, setToken, setRefresh, setUser, login, signup, fetchMe, logout }}>{children}</AuthContext.Provider>
// }

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

// Profile shape in DB: profiles.user_id (uuid), full_name, role, identity_verified, email_verified, phone_verified
const AuthContext = createContext({
  user: null,
  session: null,
  login: async ()=>{},
  signup: async ()=>{},
  fetchMe: async ()=>{},
  logout: async ()=>{},
})

export const useAuth = ()=> useContext(AuthContext)

export default function AuthProvider({ children }){
  const [user, setUser] = useState(null)     // merged user+profile info for your UI
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  // Build a UI-friendly user object from Supabase auth + profile row
  const loadUser = async (authUser) => {
    if (!authUser) { setUser(null); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    setUser({
      id: authUser.id,
      email: authUser.email,
      name: profile?.full_name || '',
      roles: profile?.role === 'both' ? ['shipper','traveler'] : [profile?.role || 'shipper'],
      identityVerified: !!profile?.identity_verified,
      emailVerified: !!profile?.email_verified,
      phoneVerified: !!profile?.phone_verified,
    })
  }

  // On mount: read existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      loadUser(data.session?.user || null)
    })
    // listen to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess || null)
      loadUser(sess?.user || null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const fetchMe = async ()=> {
    const { data } = await supabase.auth.getUser()
    await loadUser(data.user || null)
  }

  const login = async (email, password)=> {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // session + user listeners will update state
    const dest = sessionStorage.getItem('post_login_redirect') || '/'
    sessionStorage.removeItem('post_login_redirect')
    navigate(dest, { replace: true })
  }

  const signup = async (name, email, password)=> {
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // Create profile row after signup
    const userId = data?.user?.id
    if (userId) {
      await supabase.from('profiles').upsert({
        user_id: userId,
        full_name: name,
        role: 'shipper',           // default; you can let user pick later
        identity_verified: false,
        email_verified: false,
        phone_verified: false,
      })
    }
    // After email confirm (if enabled), user will be logged in; for dev you can auto navigate:
    navigate('/verify-identity', { replace: true })
  }

  const logout = async ()=> {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, session, login, signup, fetchMe, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
