import { supabase } from '../services/supabaseClient'

export async function createTrackingSession({ requestId, travelerId, shipperId }) {
  // close any existing active session for this requestId & traveler
  await supabase.from('tracking_sessions')
    .update({ active: false, ended_at: new Date().toISOString() })
    .eq('request_id', requestId)
    .eq('traveler_id', travelerId)
    .eq('active', true)

  const { data, error } = await supabase
    .from('tracking_sessions')
    .insert([{ request_id: requestId, traveler_id: travelerId, shipper_id: shipperId, active: true }])
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function endTrackingSession(sessionId) {
  await supabase.from('tracking_sessions')
    .update({ active: false, ended_at: new Date().toISOString() })
    .eq('id', sessionId)
}

export async function insertTrackingPoint(sessionId, point) {
  // point: { lat, lng, speed, heading, accuracy }
  const { error } = await supabase.from('tracking_points').insert([{ session_id: sessionId, ...point }])
  if (error) throw error
}
