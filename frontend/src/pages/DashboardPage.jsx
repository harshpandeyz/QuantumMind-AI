import { FileUp, MessageSquarePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listDocumentsApi, getAnalyticsApi } from '../api/documents'
import { listSessionsApi } from '../api/chat'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { timeAgo } from '../utils/helpers'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState({})
  const [sessions, setSessions] = useState([])
  const [documents, setDocuments] = useState([])
  useEffect(() => {
    getAnalyticsApi().then(setAnalytics).catch(() => setAnalytics({}))
    listSessionsApi().then(setSessions).catch(() => setSessions([]))
    listDocumentsApi().then(setDocuments).catch(() => setDocuments([]))
  }, [])
  const stats = [
    ['Total Documents', analytics.totalDocuments || 0],
    ['Chat Sessions', analytics.chatSessions || 0],
    ['Queries Today', analytics.queriesToday || 0],
    ['Knowledge Base Size', analytics.knowledgeBaseSize || 0]
  ]
  return (
    <Layout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 font-mono text-3xl text-cyan-200">{value}</p></div>)}
      </div>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => navigate('/chat')}><MessageSquarePlus className="h-4 w-4" /> New Chat</Button>
        <Button variant="secondary" onClick={() => navigate('/documents')}><FileUp className="h-4 w-4" /> Upload Document</Button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h2 className="mb-4 font-semibold">Recent Chat Sessions</h2>
          <div className="space-y-2">{sessions.slice(0, 6).map((s) => <button key={s.id} onClick={() => navigate(`/chat/${s.id}`)} className="block w-full rounded-md bg-white/5 p-3 text-left hover:bg-white/10"><span>{s.title}</span><span className="float-right text-xs text-slate-500">{timeAgo(s.updatedAt)}</span></button>)}</div>
        </section>
        <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h2 className="mb-4 font-semibold">Recent Documents</h2>
          <div className="space-y-2">{documents.slice(0, 6).map((d) => <div key={d.id} className="rounded-md bg-white/5 p-3"><span>{d.originalFilename}</span><span className="float-right text-xs text-cyan-200">{d.processingStatus}</span></div>)}</div>
        </section>
      </div>
    </Layout>
  )
}
