import { TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const accent = {
  blue: {
    card: 'card-blue',
    icon: 'bg-brand-blue/15 text-brand-blue',
  },
  violet: {
    card: 'card-violet',
    icon: 'bg-brand-violet/15 text-brand-violet',
  },
  emerald: {
    card: 'card-emerald',
    icon: 'bg-brand-emerald/15 text-brand-emerald',
  },
  pink: {
    card: 'card-pink',
    icon: 'bg-brand-pink/15 text-brand-pink',
  },
}

export default function StatCard({ icon: Icon, label, value = 0, tone = 'blue', delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const numeric = Number(value) || 0
  const colors = accent[tone] || accent.blue

  useEffect(() => {
    let frame
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 700)
      setDisplay(Math.round(numeric * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [numeric])

  return (
    <div className={`glass fade-up rounded-2xl p-6 ${colors.card}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-5 flex items-center justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${colors.icon}`}>
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <span className="badge badge-green">
          <TrendingUp className="h-3 w-3" />
          Live
        </span>
      </div>
      <p className="font-display text-4xl font-bold text-white">{display}</p>
      <p className="mt-1 text-sm text-[var(--text-2)]">{label}</p>
    </div>
  )
}
