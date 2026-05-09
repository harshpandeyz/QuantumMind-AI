const statusClass = {
  online: 'bg-[var(--neon-green)] shadow-[0_0_14px_rgba(57,255,20,0.6)]',
  degraded: 'bg-[var(--neon-amber)] shadow-[0_0_14px_rgba(255,183,0,0.6)]',
  offline: 'bg-[var(--neon-pink)] shadow-[0_0_14px_rgba(255,45,120,0.6)]',
}

export default function HealthIndicator({ status = 'online', label }) {
  const normalizedStatus = statusClass[status] ? status : 'online'
  return (
    <div className="glass-panel flex items-center gap-3 rounded-md px-4 py-3">
      <span className="relative flex h-3 w-3">
        <span className={`pulse-ring absolute inline-flex h-full w-full rounded-full ${statusClass[normalizedStatus]}`} />
        <span className={`relative inline-flex h-3 w-3 rounded-full ${statusClass[normalizedStatus]}`} />
      </span>
      <div>
        <p className="font-display text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <p className="text-sm font-semibold uppercase text-slate-200">{normalizedStatus}</p>
      </div>
    </div>
  )
}
