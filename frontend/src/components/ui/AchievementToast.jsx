import { useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export default function AchievementToast() {
  const achievement = useGameStore((state) => state.pendingAchievement)
  const clearPendingAchievement = useGameStore((state) => state.clearPendingAchievement)

  useEffect(() => {
    if (!achievement) return undefined
    const timer = window.setTimeout(clearPendingAchievement, 4000)
    return () => window.clearTimeout(timer)
  }, [achievement, clearPendingAchievement])

  if (!achievement) return null

  return (
    <div className="achievement-toast glass-bright fixed bottom-6 right-6 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-violet text-white">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-xs uppercase tracking-[0.18em] text-brand-blue">Achievement Unlocked</p>
          <h3 className="mt-1 font-semibold text-white">{achievement.label}</h3>
          <p className="text-sm text-slate-400">{achievement.desc}</p>
          <p className="mt-2 font-mono-hud text-xs text-brand-emerald">+{achievement.xp} XP</p>
        </div>
      </div>
    </div>
  )
}
