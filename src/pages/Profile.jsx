// import React, { useEffect, useState } from 'react'
// import Button from '../components/ui/Button'
// import { Card, CardBody } from '../components/ui/Card'
// import { useAuth } from '../contexts/AuthContext'
// import { supabase } from '../services/supabaseClient'

// export default function ProfilePage(){
//   const { user, fetchMe } = useAuth()
//   const [fullName, setFullName] = useState(user?.name || '')
//   const [role, setRole] = useState(user?.roles?.includes('traveler') && user?.roles?.includes('shipper') ? 'both' :
//                                    user?.roles?.[0] || 'shipper')
//   const [busy, setBusy] = useState(false)
//   const [msg, setMsg] = useState('')
//   const [err, setErr] = useState('')

//   useEffect(()=>{ setFullName(user?.name || '') }, [user])

//   const save = async ()=>{
//     if (!user) return
//     setBusy(true); setMsg(''); setErr('')
//     try{
//       const { error } = await supabase
//         .from('profiles')
//         .update({ full_name: fullName, role })
//         .eq('user_id', user.id)
//       if (error) throw error
//       await fetchMe()
//       setMsg('Profile updated')
//     }catch(e){
//       setErr(e.message || 'Failed to update profile')
//     }finally{
//       setBusy(false)
//     }
//   }

//   return (
//     <section className="py-16">
//       <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
//         <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{color:'var(--brand-ink)'}}>My Profile</h2>
//         <Card className="mt-6"><CardBody>
//           <div className="grid gap-4">
//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
//               <input
//                 value={fullName}
//                 onChange={(e)=>setFullName(e.target.value)}
//                 className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//                 placeholder="Your name"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
//               <select
//                 value={role}
//                 onChange={(e)=>setRole(e.target.value)}
//                 className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
//               >
//                 <option value="shipper">Shipper</option>
//                 <option value="traveler">Traveler</option>
//                 <option value="both">Both</option>
//               </select>
//               <p className="text-xs text-gray-500 mt-1">
//                 Travelers can publish travel plans. “Both” gives you shipper + traveler capabilities.
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
//             </div>

//             {msg && <p className="text-sm text-emerald-600">{msg}</p>}
//             {err && <p className="text-sm text-red-600">{err}</p>}
//           </div>
//         </CardBody></Card>
//       </div>
//     </section>
//   )
// }

// src/pages/Profile.jsx (fragment)
import { supabase } from '../services/supabaseClient'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function ProfilePage(){
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const promoteToTraveler = async () => {
    setBusy(true); setMsg('')
    try {
      // fetch current role
      const { data: me, error: e1 } = await supabase
        .from('profiles').select('role,identity_verified').eq('user_id', user.id).single()
      if (e1) throw e1

      // new role
      let newRole = 'traveler'
      if (me?.role === 'shipper') newRole = 'traveler'
      else if (me?.role === 'traveler') newRole = 'traveler'  // unchanged
      else if (me?.role === 'both') newRole = 'both'
      else if (me?.role === null) newRole = 'traveler'
      // if you want "both" when user is already shipper:
      if (me?.role === 'shipper') newRole = 'both'

      const { error: e2 } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', user.id)
      if (e2) throw e2

      setMsg(`Role updated to ${newRole}.`)
      // Optional: if identity is required to post plans
      if (!me?.identity_verified) {
        setMsg(prev => prev + ' Please verify your identity before publishing plans.')
      }
    } catch (e) {
      setMsg(e.message || 'Failed to update role')
    } finally { setBusy(false) }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      {/* ...existing profile form... */}
      <div className="mt-4 flex gap-3">
        <Button onClick={promoteToTraveler} disabled={busy}>
          {busy ? 'Updating…' : 'Become a GP'}
        </Button>
        <Button as={Link} to="/verify-identity" variant="secondary">
          Verify identity
        </Button>
      </div>
      {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
    </div>
  )
}
