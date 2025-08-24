import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.gpcentral.example',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token')
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
  return config
})

let isRefreshing = false
let refreshPromise = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {}
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        if (!isRefreshing) {
          isRefreshing = true
          const refresh = localStorage.getItem('gp_refresh')
          if (!refresh) throw new Error('No refresh token')
          refreshPromise = api.post('/auth/refresh', { refresh })
            .then(({ data }) => {
              if (!data?.token) throw new Error('No access token in refresh')
              localStorage.setItem('gp_token', data.token)
              return data.token
            })
            .finally(() => { isRefreshing = false })
        }
        const newToken = await refreshPromise
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` }
        return api(original)
      } catch (e) {
        localStorage.removeItem('gp_token')
        localStorage.removeItem('gp_refresh')
        throw e
      }
    }
    throw error
  }
)
