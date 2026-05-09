import { MessageSquare, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { listDocumentsApi } from '../api/documents'
import ChatWindow from '../components/chat/ChatWindow'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useChat } from '../hooks/useChat'
import { useChatStore } from '../store/chatStore'
import { timeAgo } from '../utils/helpers'

export default function ChatPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { sessions, messages, isTyping, activeSessionId, createSession, loadMessages, sendMessage } = useChat()
  const [documents, setDocuments] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    useChatStore.getState().loadSessions()
    listDocumentsApi().then(setDocuments).catch(() => setDocuments([]))
  }, [])

  useEffect(() => {
    if (sessionId) loadMessages(sessionId)
  }, [sessionId, loadMessages])

  const newChat = async () => {
    const session = await createSession()
    navigate(`/chat/${session.id}`)
  }

  useEffect(() => {
    const handleNewChat = () => newChat()
    window.addEventListener('chat:new', handleNewChat)
    return () => window.removeEventListener('chat:new', handleNewChat)
  })

  const filteredSessions = useMemo(() => (
    sessions.filter((session) => session.title?.toLowerCase().includes(query.toLowerCase()))
  ), [sessions, query])

  const send = async (payload) => {
    try {
      const nextSessionId = await sendMessage(payload)
      if (!sessionId && nextSessionId) navigate(`/chat/${nextSessionId}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Message failed')
    }
  }

  return (
    <Layout title="Chat">
      <div className="flex gap-6">
        <aside className="glass h-[calc(100vh-132px)] w-72 flex-shrink-0 rounded-2xl p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-white">Conversations</h2>
            <Button onClick={newChat} className="h-10 w-10 rounded-xl p-0"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input placeholder="Search sessions" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
          </div>
          <div className="scrollbar h-[calc(100%-112px)] space-y-2 overflow-y-auto">
            {filteredSessions.map((session) => {
              const active = session.id === (sessionId || activeSessionId)
              return (
                <button key={session.id} onClick={() => navigate(`/chat/${session.id}`)} className={`block w-full rounded-xl border-l-2 p-3 text-left transition ${active ? 'border-brand-blue bg-gradient-to-r from-brand-blue/15 to-brand-violet/10 text-white' : 'border-transparent text-slate-300 hover:bg-white/5'}`}>
                  <span className="line-clamp-2 text-sm font-semibold">{session.title}</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{timeAgo(session.updatedAt)}</span>
                    <span className="badge badge-violet">{session.messageCount || 0}</span>
                  </div>
                </button>
              )
            })}
            {filteredSessions.length === 0 && (
              <div className="grid place-items-center py-14 text-center text-slate-400">
                <MessageSquare className="mb-3 h-8 w-8" />
                <p>Start a new conversation</p>
              </div>
            )}
          </div>
        </aside>
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onSend={send}
          documents={documents.filter((document) => document.processingStatus === 'COMPLETED')}
          activeSessionId={sessionId || activeSessionId}
          onMessagesRefresh={loadMessages}
        />
      </div>
    </Layout>
  )
}
