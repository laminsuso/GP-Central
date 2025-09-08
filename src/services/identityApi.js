import axios from 'axios'

const base =
  import.meta.env.VITE_SB_FUNCTIONS_BASE ||
  (() => {
    const m = (import.meta.env.VITE_SUPABASE_URL || '').match(/^https:\/\/([^.]+)\.supabase\.co$/);
    if (!m) throw new Error('Set VITE_SB_FUNCTIONS_BASE or VITE_SUPABASE_URL');
    return `https://${m[1]}.functions.supabase.co`;
  })();

export const identityApi = axios.create({ baseURL: base });

