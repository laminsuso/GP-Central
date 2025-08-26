import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/**
 * Loads current shipment requests visible to the logged-in user (RLS)
 * and subscribes to realtime changes for INSERT/UPDATE/DELETE.
 *
 * If you’re a traveler, you’ll see requests for your plans.
 * If you’re a shipper, you’ll see your own requests (per your policy).
 */
export function useRealtimeRequests() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // initial load
  useEffect(() => {
    let cancel = false
    ;(async () => {
      setLoading(true); setError('')
      try {
        // RLS determines what you get back (traveler vs shipper)
        const { data, error } = await supabase
          .from('shipment_requests')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        if (!cancel) setRows(data || [])
      } catch (e) {
        if (!cancel) setError(e.message || 'Failed to load requests')
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => { cancel = true }
  }, [user?.id])

  // realtime subscription
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('shipment_requests_live')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipment_requests' },
        (payload) => {
          setRows(prev => {
            const next = [...prev]
            if (payload.eventType === 'INSERT') {
              // prepend latest
              return [payload.new, ...next]
            }
            if (payload.eventType === 'UPDATE') {
              return next.map(r => r.id === payload.new.id ? payload.new : r)
            }
            if (payload.eventType === 'DELETE') {
              return next.filter(r => r.id !== payload.old.id)
            }
            return next
          })
        }
      )
      .subscribe((status) => {
        // optional: console.log('realtime status', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  return { rows, loading, error, setRows }
}
