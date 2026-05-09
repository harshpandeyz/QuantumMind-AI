import React from 'react'
import { Bell, Search } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import AchievementToast from '../ui/AchievementToast'
import Sidebar from './Sidebar'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="max-w-lg rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <h2 className="mb-2 text-xl font-bold text-red-400">Page Error</h2>
            <pre className="max-h-48 overflow-auto text-left text-sm text-red-300">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-red-300 hover:bg-red-500/30"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Layout({ title, children }) {
  const { user } = useAuth()
  const initial = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'Q'

  return (
    <div className="aurora-bg min-h-screen">
      <Sidebar />
      <header className="fixed left-[240px] right-0 top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[rgba(8,13,31,0.72)] px-7 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        <div className="flex items-center gap-3">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <Search className="h-4 w-4" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-sm font-bold text-white">
            {initial}
          </div>
        </div>
      </header>
      <main className="ml-[240px] min-h-screen px-7 pb-7 pt-[88px]">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <AchievementToast />
      <Toaster position="top-right" toastOptions={{ style: { background: '#0f1734', border: '1px solid rgba(255,255,255,.08)', color: '#f0f4ff' } }} />
    </div>
  )
}
