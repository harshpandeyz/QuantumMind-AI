import { BarChart3, Eye, FileText, LayoutDashboard, LogOut, MessageSquare, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cx } from '../../utils/helpers'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/vision', label: 'Vision AI', icon: Eye },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 }
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-60 flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="flex h-16 items-center gap-2 px-5">
        <Sparkles className="h-6 w-6 text-[var(--accent-primary)]" />
        <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-xl font-bold text-transparent">QuantumMind</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cx('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-cyan-400/10 text-cyan-200 shadow-[0_0_18px_rgba(0,212,255,.12)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-400/15 font-mono text-sm text-cyan-200">{user?.username?.[0]?.toUpperCase() || 'Q'}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.username || 'Researcher'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  )
}
