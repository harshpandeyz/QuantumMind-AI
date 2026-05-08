import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listDocumentsApi } from '../api/documents'
import ChatWindow from '../components/chat/ChatWindow'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useChat } from '../hooks/useChat'
import { timeAgo } from '../utils/helpers'

export default function ChatPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { sessions, messages, isTyping, activeSessionId, loadSessions, createSession, loadMessages, sendMessage } = useChat()
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    loadSessions()
    listDocumentsApi().then(setDocuments).catch(() => setDocuments([]))
  }, []) // Remove loadSessions from deps - it's a stable zustand action
  useEffect(() => { if (sessionId) loadMessages(sessionId) }, [sessionId, loadMessages])

  const newChat = async () => {
    const session = await createSession()
    navigate(`/chat/${session.id}`)
  }
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
      <div className="flex gap-5">
        <aside className="h-[calc(100vh-7rem)] w-72 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3">
          <Button onClick={newChat} className="mb-3 w-full"><Plus className="h-4 w-4" /> New Chat</Button>
          <div className="scrollbar h-[calc(100%-3.5rem)] space-y-2 overflow-y-auto">
            {sessions.map((session) => (
              <button key={session.id} onClick={() => navigate(`/chat/${session.id}`)} className={`block w-full rounded-md p-3 text-left text-sm transition ${session.id === (sessionId || activeSessionId) ? 'bg-cyan-400/10 text-cyan-100' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                <span className="line-clamp-2 font-semibold">{session.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{timeAgo(session.updatedAt)}</span>
              </button>
            ))}
          </div>
        </aside>
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          onSend={send}
          documents={documents.filter((d) => d.processingStatus === 'COMPLETED')}
          activeSessionId={sessionId || activeSessionId}
          onMessagesRefresh={loadMessages}
        />
      </div>
    </Layout>
  )
}
