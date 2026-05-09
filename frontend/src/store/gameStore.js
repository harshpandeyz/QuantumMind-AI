import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const RANKS = [
  { name: 'Cadet', minXP: 0 },
  { name: 'Analyst', minXP: 100 },
  { name: 'Researcher', minXP: 300 },
  { name: 'Scientist', minXP: 700 },
  { name: 'Quantum Sage', minXP: 1500 },
  { name: 'Singularity', minXP: 3000 },
]

const ACHIEVEMENTS = [
  { id: 'first_chat', label: 'First Contact', desc: 'Send your first message', xp: 25, icon: 'CHAT' },
  { id: 'first_doc', label: 'Document Acquired', desc: 'Upload your first document', xp: 50, icon: 'DOC' },
  { id: 'rag_master', label: 'RAG Master', desc: 'Use RAG context 10 times', xp: 100, icon: 'RAG' },
  { id: 'streak_7', label: 'Weekly Operative', desc: '7-day login streak', xp: 150, icon: 'FIRE' },
  { id: 'vision_run', label: 'Quantum Eye', desc: 'Analyze a circuit image', xp: 75, icon: 'EYE' },
  { id: 'sessions_10', label: 'Mission Veteran', desc: 'Complete 10 chat sessions', xp: 100, icon: 'VET' },
  { id: 'docs_5', label: 'Archivist', desc: 'Upload 5 documents', xp: 100, icon: 'LIB' },
]

export const useGameStore = create(
  persist(
    (set, get) => ({
      xp: 0,
      unlockedAchievements: [],
      dailyStreak: 0,
      lastSeen: null,
      pendingAchievement: null,

      getRank: () => {
        const { xp } = get()
        return [...RANKS].reverse().find((rank) => xp >= rank.minXP) || RANKS[0]
      },
      getNextRank: () => {
        const { xp } = get()
        return RANKS.find((rank) => rank.minXP > xp) || null
      },
      getXpToNextRank: () => {
        const next = get().getNextRank()
        return next ? next.minXP - get().xp : 0
      },
      getRankProgress: () => {
        const { xp } = get()
        const rank = get().getRank()
        const next = get().getNextRank()
        if (!next) return 100
        return Math.round(((xp - rank.minXP) / (next.minXP - rank.minXP)) * 100)
      },
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      unlockAchievement: (id) => {
        const { unlockedAchievements } = get()
        if (unlockedAchievements.includes(id)) return
        const achievement = ACHIEVEMENTS.find((item) => item.id === id)
        if (!achievement) return
        set((state) => ({
          unlockedAchievements: [...state.unlockedAchievements, id],
          xp: state.xp + achievement.xp,
          pendingAchievement: achievement,
        }))
      },
      clearPendingAchievement: () => set({ pendingAchievement: null }),
      checkStreak: () => {
        const today = new Date().toDateString()
        const { lastSeen, dailyStreak } = get()
        if (lastSeen === today) return
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const newStreak = lastSeen === yesterday ? dailyStreak + 1 : 1
        set({ lastSeen: today, dailyStreak: newStreak })
        if (newStreak >= 7) get().unlockAchievement('streak_7')
      },
      ACHIEVEMENTS,
    }),
    { name: 'qm-game-state' }
  )
)
