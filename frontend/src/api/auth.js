import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qm_token')
      if (!window.location.pathname.includes('/login')) window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const loginApi = (credentials) => api.post('/api/auth/login', credentials).then((r) => r.data)
export const registerApi = (data) => api.post('/api/auth/register', data).then((r) => r.data)
export const meApi = () => api.get('/api/auth/me').then((r) => r.data)
