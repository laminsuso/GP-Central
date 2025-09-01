import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export function useSupportChat(limit = 200) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Initial load
  useEffect(() => {
    let cancel = false
    ;(async () => {
      setLoading(true); setError('')
      try {
        const { data, error } = await supabase
          .from('support_messages')
          .select('id,user_id,body,created_at')
          .order('created_at', { ascending: true })
          .limit(limit)
        if (error) throw error
        if (!cancel) setMessages(data || [])
      } catch (e) {
        if (!cancel) setError(e.message || 'Failed to load messages')
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => { cancel = true }
  }, [limit])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('support_messages_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, (payload) => {
        setMessages(prev => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new]
          if (payload.eventType === 'UPDATE') return prev.map(m => m.id === payload.new.id ? payload.new : m)
          if (payload.eventType === 'DELETE') return prev.filter(m => m.id !== payload.old.id)
          return prev
        })
      })
      .subscribe((status) => {
     console.log('[support realtime] status:', status)     // expect 'SUBSCRIBED'
  })
    return () => { supabase.removeChannel(channel) }
  }, [])

  const send = async (text) => {
    if (!user) throw new Error('You must be logged in.')
    const body = (text || '').trim()
    if (!body) return
    const { error } = await supabase.from('support_messages').insert([{ user_id: user.id, body }])
    if (error) throw error
  }

  const remove = async (id) => {
    const { error } = await supabase.from('support_messages').delete().eq('id', id)
    if (error) throw error
  }

  return { messages, loading, error, send, remove, user }
}
