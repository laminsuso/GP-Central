import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage(){
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // const handle = async (e)=>{
  //   e.preventDefault()
  //   try {
  //     setLoading(true)
  //     setError('')
  //     await login(email, password)
  //   } catch (err) {
  //     setError(err?.response?.data?.message || err?.message || 'Login failed')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

//   const handle = async (e)=>{
//   e.preventDefault()
//   try{
//     setLoading(true)
//     setError('')
//     await login(email, password)
// } catch (err) {
//   console.error('Login error ->', err)   // 👈 add this line
//   setError(err?.message || 'Login failed')
// } finally {
//     setLoading(false)
//   }
// }

const handle = async (e)=>{
  e.preventDefault()
  try{
    setLoading(true)
    setError('')
+   console.log('[Login.jsx] submitting', { email })
    await login(email, password)
+   console.log('[Login.jsx] login() resolved')
  }catch(err){
+   console.error('[Login.jsx] login error →', err)
    setError(err?.message || 'Login failed')
  }finally{
    setLoading(false)
  }
}


  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <Card><CardBody>
          <h2 className="text-2xl font-bold mb-2">Login</h2>
          <p className="text-sm text-gray-600 mb-4">Enter your email and password to continue.</p>

          <form onSubmit={handle} className="grid gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                required type="email" value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                required type="password" value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>{loading ? '...' : 'Login'}</Button>
              <Button as={Link} to="/signup" variant="secondary">Sign up</Button>
            </div>
          </form>
        </CardBody></Card>
      </div>
    </section>
  )
}
