import { useAuthStore } from '../store/authStore'

export const useAuth = () => ({
  user: useAuthStore((state) => state.user),
  token: useAuthStore((state) => state.token),
  isAuthenticated: useAuthStore((state) => state.isAuthenticated),
  isLoading: useAuthStore((state) => state.isLoading),
  login: useAuthStore((state) => state.login),
  register: useAuthStore((state) => state.register),
  loadUser: useAuthStore((state) => state.loadUser),
  logout: useAuthStore((state) => state.logout),
})
