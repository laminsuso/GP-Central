import React, { useState } from 'react'
import Button from '../components/ui/Button'
import { Card, CardBody } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'

export default function SignupPage(){
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e)=>{
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      await signup(name, email, password)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <Card><CardBody>
          <h2 className="text-2xl font-bold mb-2">Sign up</h2>
          <p className="text-sm text-gray-600 mb-4">Create your account to send or carry parcels.</p>

          <form onSubmit={handle} className="grid gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
              <input
                required type="text" value={name}
                onChange={(e)=>setName(e.target.value)}
                className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Jane Doe"
              />
            </div>
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
            <Button type="submit" disabled={loading}>{loading ? '...' : 'Sign up'}</Button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            Identity verification is required for travelers.
          </p>
        </CardBody></Card>
      </div>
    </section>
  )
}
