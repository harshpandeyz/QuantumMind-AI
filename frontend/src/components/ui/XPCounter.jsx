import { useGameStore } from '../../store/gameStore'
import { cx } from '../../utils/helpers'

export default function XPCounter({ compact = false }) {
  const xp = useGameStore((state) => state.xp)
  const rank = useGameStore((state) => state.getRank())
  const progress = useGameStore((state) => state.getRankProgress())
  const toNext = useGameStore((state) => state.getXpToNextRank())

  return (
    <div className={cx('min-w-0', compact ? 'w-40' : 'w-full')}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-display text-[11px] uppercase tracking-[0.18em] text-cyan-200">{rank.name}</span>
        <span className="font-mono-hud text-[10px] text-slate-400">{xp} XP</span>
      </div>
      <div className="xp-bar">
        <div className="xp-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      {!compact && (
        <p className="mt-1 font-mono-hud text-[10px] uppercase text-slate-500">
          {toNext ? `${toNext} XP to next rank` : 'Max rank reached'}
        </p>
      )}
    </div>
  )
}
