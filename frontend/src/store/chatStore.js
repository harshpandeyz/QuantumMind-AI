import { create } from 'zustand'
import { createSessionApi, listMessagesApi, listSessionsApi, sendMessageApi } from '../api/chat'

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
      const response = await sendMessageApi(sessionId, payload)
      const aiMessage = { id: response.messageId, role: 'assistant', content: response.response, createdAt: response.createdAt }
      set({ messages: [...get().messages, aiMessage], isTyping: false })
      await get().loadSessions()
      return sessionId
    } catch (error) {
      set({ isTyping: false })
      throw error
    }
  }
}))
