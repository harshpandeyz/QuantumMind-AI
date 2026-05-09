import { Brain, FileText, FileUp, MessageCircle, MessageSquare, MessageSquarePlus, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listSessionsApi } from '../api/chat'
import { getAnalyticsApi, listDocumentsApi } from '../api/documents'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import { useAuth } from '../hooks/useAuth'
import { timeAgo } from '../utils/helpers'

const statusBadge = (status) => ({
  COMPLETED: 'badge-green',
  PROCESSING: 'badge-amber',
  PENDING: 'badge-amber',
  FAILED: 'badge-pink',
}[status] || 'badge-blue')

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({})
  const [sessions, setSessions] = useState([])
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    getAnalyticsApi().then(setAnalytics).catch(() => setAnalytics({}))
    listSessionsApi().then(setSessions).catch(() => setSessions([]))
    listDocumentsApi().then(setDocuments).catch(() => setDocuments([]))
  }, [])

  return (
    <Layout title="Dashboard">
      <div className="fade-up mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-4xl font-bold text-white">Good morning, {user?.username || 'Researcher'}</h2>
          <p className="mt-2 text-[var(--text-2)]">Here's your research overview</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/chat')}><MessageSquarePlus className="h-4 w-4" /> New Chat</Button>
          <Button variant="secondary" onClick={() => navigate('/documents')}><FileUp className="h-4 w-4" /> Upload Doc</Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total Documents" value={analytics.totalDocuments || 0} tone="blue" delay={0} />
        <StatCard icon={MessageSquare} label="Chat Sessions" value={analytics.chatSessions || 0} tone="violet" delay={70} />
        <StatCard icon={Zap} label="Queries Today" value={analytics.queriesToday || 0} tone="emerald" delay={140} />
        <StatCard icon={Brain} label="Knowledge Base" value={analytics.knowledgeBaseSize || 0} tone="pink" delay={210} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="glass rounded-2xl p-6">
          <h3 className="font-display mb-4 text-xl font-bold text-white">Recent Chats</h3>
          <div className="space-y-2">
            {sessions.slice(0, 6).map((session) => (
              <button key={session.id} onClick={() => navigate(`/chat/${session.id}`)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-blue/15 text-brand-blue">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{session.title}</p>
                  <span className="badge badge-blue mt-1">{timeAgo(session.updatedAt)}</span>
                </div>
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="grid place-items-center py-12 text-center text-slate-400">
                <MessageCircle className="mb-3 h-8 w-8" />
                <p>No chats yet</p>
              </div>
            )}
          </div>
        </section>

        <section className="glass rounded-2xl p-6">
          <h3 className="font-display mb-4 text-xl font-bold text-white">Recent Documents</h3>
          <div className="space-y-2">
            {documents.slice(0, 6).map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-violet/15 text-brand-violet">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{doc.originalFilename}</p>
                  <p className="text-xs text-slate-400">{timeAgo(doc.uploadedAt)}</p>
                </div>
                <span className={`badge ${statusBadge(doc.processingStatus)}`}>{doc.processingStatus}</span>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="grid place-items-center py-12 text-center text-slate-400">
                <FileText className="mb-3 h-8 w-8" />
                <p>No documents yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}
