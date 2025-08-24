import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const AuthContext = createContext({
  token:'', refresh:'', user:null,
  setToken:()=>{}, setRefresh:()=>{}, setUser:()=>{},
  login:async()=>{}, signup:async()=>{}, fetchMe:async()=>{}, logout:()=>{}
})
export const useAuth = ()=> useContext(AuthContext)

export default function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('gp_token') || '')
  const [refresh, setRefresh] = useState(localStorage.getItem('gp_refresh') || '')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const fetchMe = async ()=> {
    const { data } = await api.get('/auth/me')
    setUser(data)
  }

  const login = async (email, password)=> {
    const { data } = await api.post('/auth/login', { email, password })
    if (!data?.token || !data?.refresh) throw new Error('Missing token(s)')
    setToken(data.token); setRefresh(data.refresh)
    localStorage.setItem('gp_token', data.token)
    localStorage.setItem('gp_refresh', data.refresh)
    await fetchMe()
    const dest = sessionStorage.getItem('post_login_redirect') || '/'
    sessionStorage.removeItem('post_login_redirect')
    navigate(dest, { replace: true })
  }

  const signup = async (name, email, password)=> {
    const { data } = await api.post('/auth/signup', { name, email, password })
    if (!data?.token || !data?.refresh) throw new Error('Missing token(s)')
    setToken(data.token); setRefresh(data.refresh)
    localStorage.setItem('gp_token', data.token)
    localStorage.setItem('gp_refresh', data.refresh)
    await fetchMe()
    navigate('/verify-identity', { replace: true })
  }

  const logout = ()=> {
    setToken(''); setRefresh(''); setUser(null)
    localStorage.removeItem('gp_token'); localStorage.removeItem('gp_refresh')
    navigate('/', { replace: true })
  }

  useEffect(()=>{ if (token) fetchMe().catch(()=>{}) }, [token])

  return <AuthContext.Provider value={{ token, refresh, user, setToken, setRefresh, setUser, login, signup, fetchMe, logout }}>{children}</AuthContext.Provider>
}
