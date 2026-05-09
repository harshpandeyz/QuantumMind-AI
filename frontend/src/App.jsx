import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useGameStore } from './store/gameStore'
import AnalyticsPage from './pages/AnalyticsPage'
import ChatPage from './pages/ChatPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VisionPage from './pages/VisionPage'

function AuthEvents() {
  const navigate = useNavigate()
  const logout = useAuth().logout

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [logout, navigate])

  return null
}

function Protected({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="quantum-grid grid min-h-screen place-items-center">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent mx-auto" />
          <p className="text-slate-400 text-sm">Authenticating...</p>
        </div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { isAuthenticated, loadUser, isLoading } = useAuth()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    useGameStore.getState().checkStreak()
    loadUser().finally(() => setInitialized(true))
  }, [loadUser])

  if (!initialized) {
    return (
      <div className="quantum-grid grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AuthEvents />
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
        <Route path="/chat/:sessionId" element={<Protected><ChatPage /></Protected>} />
        <Route path="/documents" element={<Protected><DocumentsPage /></Protected>} />
        <Route path="/vision" element={<Protected><VisionPage /></Protected>} />
        <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}
