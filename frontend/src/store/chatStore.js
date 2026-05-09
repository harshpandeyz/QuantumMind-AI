import { create } from 'zustand'
import { createSessionApi, listMessagesApi, listSessionsApi, sendMessageApi } from '../api/chat'
import { useGameStore } from './gameStore'

export const useChatStore = create((set, get) => ({
  sessions: [],
  messages: [],
  activeSessionId: null,
  isTyping: false,
  loadSessions: async () => set({ sessions: await listSessionsApi() }),
  createSession: async () => {
    const session = await createSessionApi()
    set({ activeSessionId: session.id, sessions: [session, ...get().sessions], messages: [] })
    return session
  },
  loadMessages: async (sessionId) => {
    set({ activeSessionId: sessionId, messages: await listMessagesApi(sessionId) })
  },
  sendMessage: async (payload) => {
    let sessionId = get().activeSessionId
    if (!sessionId) sessionId = (await get().createSession()).id
    const userMessage = { id: crypto.randomUUID(), role: 'user', content: payload.message, createdAt: new Date().toISOString() }
    set({ messages: [...get().messages, userMessage], isTyping: true })
    try {
      await sendMessageApi(sessionId, payload)
      await get().loadMessages(sessionId)
      set({ isTyping: false })
      await get().loadSessions()
      const sessions = get().sessions
      useGameStore.getState().addXP(10)
      useGameStore.getState().unlockAchievement('first_chat')
      if (payload.useRag) {
        const ragCount = Number(localStorage.getItem('qm_rag_count') || '0') + 1
        localStorage.setItem('qm_rag_count', String(ragCount))
        if (ragCount >= 10) useGameStore.getState().unlockAchievement('rag_master')
      }
      if (sessions.length >= 10) useGameStore.getState().unlockAchievement('sessions_10')
      return sessionId
    } catch (error) {
      set({ isTyping: false })
      throw error
    }
  }
}))
