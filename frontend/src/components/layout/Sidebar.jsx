import { BarChart2, FileText, LayoutDashboard, LogOut, MessageSquare, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cx } from '../../utils/helpers'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/vision', label: 'Vision AI', icon: Sparkles },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const initial = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'Q'

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-col border-r border-white/5 bg-[rgba(8,13,31,0.95)] backdrop-blur-xl">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-violet shadow-[var(--shadow-blue)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold gradient-text">QuantumMind</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.9)]" />
              AI Online
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cx(
              'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200',
              isActive
                ? 'bg-gradient-to-r from-brand-blue/25 to-brand-violet/25 text-white shadow-[var(--shadow-blue)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-3 h-7 w-[3px] rounded-r-full bg-gradient-to-b from-brand-blue to-brand-violet" />}
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-violet to-brand-pink text-sm font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.username || 'Researcher'}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition duration-200 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
