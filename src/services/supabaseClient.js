import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: {
//     persistSession: true,
//     autoRefreshToken: true,
//   },
// })

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})
console.log('[SB] URL:', supabaseUrl)

console.log('[SB] URL:', supabaseUrl)  // should print your https://xxxx.supabase.co
