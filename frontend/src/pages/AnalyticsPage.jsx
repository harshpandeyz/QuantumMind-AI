import { useEffect, useState } from 'react'
import { getAnalyticsApi } from '../api/documents'
import Layout from '../components/layout/Layout'

export default function AnalyticsPage() {
  const [data, setData] = useState({ documentsByStatus: {} })
  useEffect(() => { getAnalyticsApi().then(setData).catch(() => {}) }, [])
  const bars = [42, 58, 35, 76, 64, 81, data.queriesToday || 12]
  const statuses = data.documentsByStatus || {}
  const total = Math.max(1, Object.values(statuses).reduce((a, b) => a + b, 0))
  return (
    <Layout title="Analytics">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Documents', data.totalDocuments || 0],
          ['Sessions', data.chatSessions || 0],
          ['Queries', data.queriesToday || 0],
          ['Indexed Docs', data.knowledgeBaseSize || 0]
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 font-mono text-3xl text-cyan-200">{value}</p></div>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h2 className="mb-5 font-semibold">Queries per Day</h2>
          <div className="flex h-56 items-end gap-3">
            {bars.map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-cyan-300/80" style={{ height: `${value}%` }} /><span className="font-mono text-xs text-slate-500">D{index + 1}</span></div>)}
          </div>
        </section>
        <section className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <h2 className="mb-5 font-semibold">Documents by Status</h2>
          <div className="space-y-4">
            {Object.entries({ pending: 0, processing: 0, completed: 0, failed: 0, ...statuses }).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm"><span className="capitalize">{key}</span><span>{value}</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-black/30"><div className="h-full bg-violet-400" style={{ width: `${(value / total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
