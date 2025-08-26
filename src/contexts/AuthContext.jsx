import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext({
  user: null, session: null,
  login: async ()=>{}, signup: async ()=>{}, fetchMe: async ()=>{}, logout: async ()=>{}
})
export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }){
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  async function buildUser(authUser){
    if (!authUser){ setUser(null); return }
    const { data: profile, error } = await supabase
      .from('profiles').select('*').eq('user_id', authUser.id).single()
    if (error) { console.warn('[Auth] profile load error', error); }
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

  useEffect(() => {
    let unsub = () => {}
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data?.session || null)
      await buildUser(data?.session?.user || null)

      const sub = supabase.auth.onAuthStateChange(async (_event, sess) => {
        setSession(sess || null)
        await buildUser(sess?.user || null)
      })
      // works for both shapes: { data: { subscription } } or { data: subObj }
      const subscription = sub?.data?.subscription || sub?.data || sub
      unsub = () => subscription?.unsubscribe?.()
    })()
    return () => unsub()
  }, [])

  const fetchMe = async ()=>{
    const { data } = await supabase.auth.getUser()
    await buildUser(data?.user || null)
  }

  const login = async (email, password)=>{
    console.log('[Auth] login', email)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('[Auth] login result', { error, data })
    if (error) throw error
    const dest = sessionStorage.getItem('post_login_redirect') || '/'
    sessionStorage.removeItem('post_login_redirect')
    navigate(dest, { replace: true })
  }

  const signup = async (name, email, password)=>{
    console.log('[Auth] signup', email)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name, role: 'shipper' } }
    })
    if (error) throw error
    navigate('/verify-identity', { replace: true })
  }

  const logout = async ()=>{
    await supabase.auth.signOut()
    setUser(null); setSession(null)
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, session, login, signup, fetchMe, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
