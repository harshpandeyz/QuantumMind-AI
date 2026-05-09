import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar({ title }) {
  const { user } = useAuth()
  const initial = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'Q'

  return (
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
  )
}
