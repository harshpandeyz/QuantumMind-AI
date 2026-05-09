import { useChatStore } from '../store/chatStore'

export const useChat = () => ({
  sessions: useChatStore((state) => state.sessions),
  messages: useChatStore((state) => state.messages),
  activeSessionId: useChatStore((state) => state.activeSessionId),
  isTyping: useChatStore((state) => state.isTyping),
  loadSessions: useChatStore((state) => state.loadSessions),
  createSession: useChatStore((state) => state.createSession),
  loadMessages: useChatStore((state) => state.loadMessages),
  sendMessage: useChatStore((state) => state.sendMessage),
})
