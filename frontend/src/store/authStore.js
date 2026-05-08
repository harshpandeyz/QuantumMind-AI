import { create } from 'zustand'
import toast from 'react-hot-toast'
import { loginApi, meApi, registerApi } from '../api/auth'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('qm_token'),
  isAuthenticated: Boolean(localStorage.getItem('qm_token')),
  isLoading: false,
  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const data = await loginApi(credentials)
      localStorage.setItem('qm_token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return data
    } catch (error) {
      set({ isLoading: false })
      toast.error(error.response?.data?.message || 'Sign in failed')
      throw error
    }
  },
  register: async (payload) => {
    set({ isLoading: true })
    try {
      const data = await registerApi(payload)
      localStorage.setItem('qm_token', data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false })
      return data
    } catch (error) {
      set({ isLoading: false })
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  },
  loadUser: async () => {
    if (!localStorage.getItem('qm_token')) {
      set({ isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      const user = await meApi()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('qm_token')
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },
  logout: () => {
    localStorage.removeItem('qm_token')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))
